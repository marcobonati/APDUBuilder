import { useMemo, useState } from 'react'
import { describeValue } from '../emv/formats'
import { normalizeHex, splitBytes } from '../emv/hex'
import { STATUS_WORDS, describeSw, tagDef } from '../emv/tags'
import { encodeLength, hasChildren, isOmitted, valueHex } from '../emv/tlv'
import type { Encoded, Segment } from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import type { Issue } from '../emv/validate'
import { useEditor } from '../state/context'

interface Props {
  nodes: TlvNode[]
  encoded: Encoded
  sw: string
  issues: Issue[]
}

type CopyFormat = 'hex' | 'spaced' | 'c' | 'java' | 'python'

const FORMATS: { id: CopyFormat; label: string }[] = [
  { id: 'hex', label: 'Hex' },
  { id: 'spaced', label: 'Hex spaziato' },
  { id: 'c', label: 'C array' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' }
]

function formatAs(hex: string, f: CopyFormat): string {
  const bytes = splitBytes(hex)
  const lines = (items: string[], per = 16): string =>
    Array.from(
      { length: Math.ceil(items.length / per) },
      (_, i) => '  ' + items.slice(i * per, i * per + per).join(', ')
    ).join(',\n')
  switch (f) {
    case 'hex':
      return hex
    case 'spaced':
      return bytes.join(' ')
    case 'c':
      return `const uint8_t response[${bytes.length}] = {\n${lines(bytes.map((b) => `0x${b}`))}\n};`
    case 'java':
      return `byte[] response = new byte[] {\n${lines(
        bytes.map((b) => `(byte) 0x${b}`),
        8
      )}\n};`
    case 'python':
      return `response = bytes.fromhex("${hex}")`
  }
}

function indexNodes(nodes: TlvNode[], map = new Map<string, TlvNode>()): Map<string, TlvNode> {
  for (const n of nodes) {
    map.set(n.id, n)
    indexNodes(n.children, map)
  }
  return map
}

function tlvDump(nodes: TlvNode[], depth = 0, concat = false): string[] {
  const out: string[] = []
  const pad = '  '.repeat(depth)
  for (const n of nodes) {
    if (!concat && isOmitted(n)) continue
    const def = tagDef(n.tag)
    const v = valueHex(n)
    if (n.raw) {
      out.push(`${pad}[RAW] ${splitBytes(v).join(' ')}`)
      continue
    }
    const head = concat
      ? `${pad}(${n.tag})`
      : `${pad}${n.tag} ${n.lengthOverride ?? encodeLength(v.length / 2)}`
    out.push(`${head}  ${def.name}`)
    if (hasChildren(n)) out.push(...tlvDump(n.children, depth + 1, n.concat))
    else if (v) {
      const d = describeValue(def, v)
      out.push(`${pad}   ${splitBytes(v).join(' ')}${d ? `   → ${d}` : ''}`)
    }
  }
  return out
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function segLabel(seg: Segment, map: Map<string, TlvNode>): string {
  const n = map.get(seg.path[seg.path.length - 1])
  if (seg.kind === 'sw') return 'Status Word'
  if (!n) return ''
  if (n.raw) return 'Dati raw'
  const what =
    seg.kind === 'tag'
      ? 'tag'
      : seg.kind === 'len'
        ? seg.autoLength
          ? 'lunghezza (auto)'
          : 'lunghezza forzata'
        : 'valore'
  return `${n.tag} ${tagDef(n.tag).name} – ${what}`
}

export default function RawPanel({ nodes, encoded, sw, issues }: Props): React.JSX.Element {
  const { dispatch, hovered, setHovered, reveal } = useEditor()
  const [includeSw, setIncludeSw] = useState(true)
  const [format, setFormat] = useState<CopyFormat>('spaced')
  const [copied, setCopied] = useState<string | null>(null)
  const [showDump, setShowDump] = useState(true)

  const map = useMemo(() => indexNodes(nodes), [nodes])
  const swValid = /^[0-9A-F]{4}$/.test(sw)
  const fullHex = encoded.hex + (includeSw && swValid ? sw : '')
  const dataLen = encoded.hex.length / 2

  const bytes = useMemo(() => {
    const segs: Segment[] = [...encoded.segments]
    if (includeSw && swValid) segs.push({ path: ['__sw'], kind: 'sw', hex: sw, depth: 0 })
    return segs.flatMap((seg) => splitBytes(seg.hex).map((b) => ({ b, seg })))
  }, [encoded, sw, includeSw, swValid])

  const rows: (typeof bytes)[] = []
  for (let i = 0; i < bytes.length; i += 16) rows.push(bytes.slice(i, i + 16))

  const doCopy = async (text: string, key: string): Promise<void> => {
    if (await copy(text)) {
      setCopied(key)
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200)
    }
  }

  const dump = useMemo(() => tlvDump(nodes).join('\n'), [nodes])
  const errors = issues.filter((i) => i.level === 'error').length
  const warnings = issues.filter((i) => i.level === 'warning').length
  const swKnown = STATUS_WORDS.some((s) => s.sw === sw)

  return (
    <aside className="raw-panel">
      <section className="panel-section">
        <div className="section-head">
          <h2>Risposta RAW</h2>
          <span className="muted small">
            {dataLen} byte dati{includeSw && swValid ? ' + 2 SW' : ''}
          </span>
        </div>

        <div className="legend">
          <span className="k-tag">Tag</span>
          <span className="k-len">Lunghezza auto</span>
          <span className="k-val">Valore</span>
          <span className="k-sw">SW</span>
          <label className="small">
            <input
              type="checkbox"
              checked={includeSw}
              onChange={(e) => setIncludeSw(e.target.checked)}
            />{' '}
            Includi SW
          </label>
        </div>

        <div className="hexview" onMouseLeave={() => setHovered(null)}>
          {rows.length === 0 && <div className="muted">Nessun dato</div>}
          {rows.map((row, ri) => (
            <div className="hexrow" key={ri}>
              <span className="offset">
                {(ri * 16).toString(16).toUpperCase().padStart(4, '0')}
              </span>
              <span className="hexbytes">
                {row.map(({ b, seg }, bi) => {
                  const owner = seg.path[seg.path.length - 1]
                  const hl = hovered !== null && seg.path.includes(hovered)
                  return (
                    <span
                      key={bi}
                      className={[
                        'byte',
                        `k-${seg.kind}`,
                        seg.kind === 'len' && !seg.autoLength ? 'forced' : '',
                        `d-${seg.depth % 4}`,
                        hl ? 'hl' : ''
                      ].join(' ')}
                      title={segLabel(seg, map)}
                      onMouseEnter={() => setHovered(seg.kind === 'sw' ? null : owner)}
                      onClick={() => seg.kind !== 'sw' && reveal(owner)}
                    >
                      {b}
                    </span>
                  )
                })}
              </span>
            </div>
          ))}
        </div>

        <div className="copy-bar">
          <select
            className="input small"
            value={format}
            onChange={(e) => setFormat(e.target.value as CopyFormat)}
          >
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            className="btn primary small"
            onClick={() => doCopy(formatAs(fullHex, format), 'raw')}
          >
            {copied === 'raw' ? '✓ Copiato' : 'Copia'}
          </button>
        </div>
        <pre className="raw-text">{formatAs(fullHex, format)}</pre>
      </section>

      <section className="panel-section">
        <div className="section-head">
          <h2>Status Word</h2>
          <span className={`sw-badge ${sw === '9000' ? 'ok' : 'err'}`}>{sw}</span>
        </div>
        <div className="field-row">
          <select
            className="input small grow"
            value={swKnown ? sw : ''}
            onChange={(e) => e.target.value && dispatch({ type: 'setSw', sw: e.target.value })}
          >
            {!swKnown && <option value="">— personalizzata —</option>}
            {STATUS_WORDS.map((s) => (
              <option key={s.sw} value={s.sw}>
                {s.sw} – {s.label}
              </option>
            ))}
          </select>
          <input
            className={`input small mono sw-input ${swValid ? '' : 'invalid'}`}
            value={sw}
            maxLength={4}
            onChange={(e) => dispatch({ type: 'setSw', sw: normalizeHex(e.target.value) })}
          />
        </div>
        <div className="muted small">
          {swValid ? describeSw(sw) : 'Inserisci 4 cifre esadecimali'}
        </div>
      </section>

      <section className="panel-section">
        <div className="section-head">
          <h2>Verifica</h2>
          <span className="small">
            {errors > 0 && <span className="count error">{errors} errori</span>}
            {warnings > 0 && <span className="count warning">{warnings} avvisi</span>}
            {errors + warnings === 0 && <span className="count ok">✓ Nessun problema</span>}
          </span>
        </div>
        {issues.length > 0 && (
          <ul className="issue-list">
            {issues.map((i, k) => (
              <li
                key={k}
                className={`${i.level} ${i.nodeId ? 'clickable' : ''}`}
                onClick={() => i.nodeId && reveal(i.nodeId)}
                onMouseEnter={() => i.nodeId && setHovered(i.nodeId)}
              >
                {i.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-section">
        <div className="section-head">
          <h2>
            <button className="link-btn" onClick={() => setShowDump(!showDump)}>
              {showDump ? '▾' : '▸'} Struttura TLV
            </button>
          </h2>
          <button className="btn small" onClick={() => doCopy(dump, 'dump')}>
            {copied === 'dump' ? '✓ Copiato' : 'Copia'}
          </button>
        </div>
        {showDump && <pre className="dump">{dump || '—'}</pre>}
      </section>
    </aside>
  )
}
