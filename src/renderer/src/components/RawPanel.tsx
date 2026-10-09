import { memo, useMemo, useState } from 'react'
import { describeValue } from '../emv/formats'
import { normalizeHex, splitBytes } from '../emv/hex'
import { STATUS_WORDS, describeSw, tagDef } from '../emv/tags'
import { encodeLength, hasChildren, isOmitted, valueHex } from '../emv/tlv'
import type { Encoded, Segment } from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import type { Issue } from '../emv/validate'
import { useEditor, useViewState } from '../state/context'
import { t } from '../i18n'

interface Props {
  nodes: TlvNode[]
  encoded: Encoded
  sw: string
  issues: Issue[]
}

type CopyFormat = 'hex' | 'spaced' | 'c' | 'java' | 'kotlin' | 'swift' | 'python'

const FORMATS: { id: CopyFormat; label: string }[] = [
  { id: 'hex', label: 'Hex' },
  { id: 'spaced', label: 'Hex spaziato' },
  { id: 'c', label: 'C array' },
  { id: 'java', label: 'Java' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'swift', label: 'Swift' },
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
    case 'kotlin':
      // Kotlin Byte is signed: values above 0x7F need an explicit conversion.
      return `val response = byteArrayOf(\n${lines(
        bytes.map((b) => (parseInt(b, 16) > 0x7f ? `0x${b}.toByte()` : `0x${b}`)),
        8
      )}\n)`
    case 'swift':
      return `let response: [UInt8] = [\n${lines(bytes.map((b) => `0x${b}`))}\n]`
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
  if (n.raw) return t('Dati raw')
  const what =
    seg.kind === 'tag'
      ? 'tag'
      : seg.kind === 'len'
        ? seg.autoLength
          ? t('lunghezza (auto)')
          : t('lunghezza forzata')
        : t('valore')
  return `${n.tag} ${tagDef(n.tag).name} – ${what}`
}

interface HexByte {
  b: string
  seg: Segment
  /** Node the byte belongs to, '' for the status word. */
  owner: string
  title: string
  cls: string
}

/**
 * Hex dump of the response. The only part of the panel that follows the
 * pointer: the bytes are prepared once per content change, and hovering
 * just toggles the highlight class. Events are delegated to the container.
 */
const HexView = memo(function HexView({ rows }: { rows: HexByte[][] }): React.JSX.Element {
  const { setHovered, reveal } = useEditor()
  const hovered = useViewState((s) => s.hovered)
  const byteAt = (e: React.MouseEvent): HexByte | null => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-i]')
    if (!el) return null
    const i = Number(el.dataset.i)
    return rows[i >> 4]?.[i & 15] ?? null
  }

  return (
    <div
      className="hexview"
      onMouseLeave={() => setHovered(null)}
      onMouseOver={(e) => {
        const x = byteAt(e)
        if (x) setHovered(x.owner || null)
      }}
      onClick={(e) => {
        const x = byteAt(e)
        if (x?.owner) reveal(x.owner)
      }}
    >
      {rows.length === 0 && <div className="muted">{t('Nessun dato')}</div>}
      {rows.map((row, ri) => (
        <div className="hexrow" key={ri}>
          <span className="offset">{(ri * 16).toString(16).toUpperCase().padStart(4, '0')}</span>
          <span className="hexbytes">
            {row.map((x, bi) => (
              <span
                key={bi}
                data-i={ri * 16 + bi}
                className={hovered !== null && x.seg.path.includes(hovered) ? `${x.cls} hl` : x.cls}
                title={x.title}
              >
                {x.b}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
})

export default memo(function RawPanel({ nodes, encoded, sw, issues }: Props): React.JSX.Element {
  const { dispatch, setHovered, reveal, lang } = useEditor()
  const [includeSw, setIncludeSw] = useState(true)
  const [format, setFormat] = useState<CopyFormat>('spaced')
  const [copied, setCopied] = useState<string | null>(null)
  const [showDump, setShowDump] = useState(true)

  const map = useMemo(() => indexNodes(nodes), [nodes])
  const swValid = /^[0-9A-F]{4}$/.test(sw)
  const fullHex = encoded.hex + (includeSw && swValid ? sw : '')
  const formatted = useMemo(() => formatAs(fullHex, format), [fullHex, format])
  const dataLen = encoded.hex.length / 2

  // lang: byte titles are translated.
  const rows = useMemo(() => {
    const segs: Segment[] = [...encoded.segments]
    if (includeSw && swValid) segs.push({ path: ['__sw'], kind: 'sw', hex: sw, depth: 0 })
    const bytes = segs.flatMap((seg) => {
      const title = segLabel(seg, map)
      const cls = [
        'byte',
        `k-${seg.kind}`,
        seg.kind === 'len' && !seg.autoLength ? 'forced' : '',
        `d-${seg.depth % 4}`
      ].join(' ')
      const owner = seg.kind === 'sw' ? '' : seg.path[seg.path.length - 1]
      return splitBytes(seg.hex).map((b): HexByte => ({ b, seg, owner, title, cls }))
    })
    const out: HexByte[][] = []
    for (let i = 0; i < bytes.length; i += 16) out.push(bytes.slice(i, i + 16))
    return out
  }, [encoded, sw, includeSw, swValid, map, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const doCopy = async (text: string, key: string): Promise<void> => {
    if (await copy(text)) {
      setCopied(key)
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200)
    }
  }

  // lang: the dump contains translated descriptions.
  const dump = useMemo(() => tlvDump(nodes).join('\n'), [nodes, lang]) // eslint-disable-line react-hooks/exhaustive-deps
  const errors = issues.filter((i) => i.level === 'error').length
  const warnings = issues.filter((i) => i.level === 'warning').length
  const swKnown = STATUS_WORDS.some((s) => s.sw === sw)

  return (
    <aside className="raw-panel">
      <section className="panel-section">
        <div className="section-head">
          <h2>{t('Risposta RAW')}</h2>
          <span className="muted small">
            {t('{n} byte dati', { n: dataLen })}
            {includeSw && swValid ? ' + 2 SW' : ''}
          </span>
        </div>

        <div className="legend">
          <span className="k-tag">Tag</span>
          <span className="k-len">{t('Lunghezza auto')}</span>
          <span className="k-val">{t('Valore')}</span>
          <span className="k-sw">SW</span>
          <label className="small">
            <input
              type="checkbox"
              checked={includeSw}
              onChange={(e) => setIncludeSw(e.target.checked)}
            />{' '}
            {t('Includi SW')}
          </label>
        </div>

        <HexView rows={rows} />

        <div className="copy-bar">
          <select
            className="input small"
            value={format}
            onChange={(e) => setFormat(e.target.value as CopyFormat)}
          >
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {t(f.label)}
              </option>
            ))}
          </select>
          <button className="btn primary small" onClick={() => doCopy(formatted, 'raw')}>
            {copied === 'raw' ? `✓ ${t('Copiato')}` : t('Copia')}
          </button>
        </div>
        <pre className={`raw-text ${format === 'hex' || format === 'spaced' ? '' : 'code'}`}>
          {formatted}
        </pre>
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
            {!swKnown && <option value="">{t('— personalizzata —')}</option>}
            {STATUS_WORDS.map((s) => (
              <option key={s.sw} value={s.sw}>
                {s.sw} – {t(s.label)}
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
          {swValid ? describeSw(sw) : t('Inserisci 4 cifre esadecimali')}
        </div>
      </section>

      <section className="panel-section">
        <div className="section-head">
          <h2>{t('Verifica')}</h2>
          <span className="small">
            {errors > 0 && <span className="count error">{t('{n} errori', { n: errors })}</span>}
            {warnings > 0 && (
              <span className="count warning">{t('{n} avvisi', { n: warnings })}</span>
            )}
            {errors + warnings === 0 && <span className="count ok">✓ {t('Nessun problema')}</span>}
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
              {showDump ? '▾' : '▸'} {t('Struttura TLV')}
            </button>
          </h2>
          <button className="btn small" onClick={() => doCopy(dump, 'dump')}>
            {copied === 'dump' ? `✓ ${t('Copiato')}` : t('Copia')}
          </button>
        </div>
        {showDump && <pre className="dump">{dump || '—'}</pre>}
      </section>
    </aside>
  )
})
