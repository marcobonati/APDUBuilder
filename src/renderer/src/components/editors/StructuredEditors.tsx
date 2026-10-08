import {
  CVM_CONDITIONS,
  CVM_METHODS,
  aflEntryError,
  encodeAfl,
  encodeCvm,
  encodeTrack2,
  luhnValid,
  parseAfl,
  parseCvm,
  parseTrack2
} from '../../emv/formats'
import type { AflEntry, CvmRule, Track2 } from '../../emv/formats'
import { DOL_TAGS, TAGS, tagDef } from '../../emv/tags'
import { encodeDol, parseDol, tagError } from '../../emv/tlv'
import { normalizeHex, toHexByte } from '../../emv/hex'
import { useSynced } from '../../hooks/useSynced'
import { t } from '../../i18n'
import { useEditor } from '../../state/context'

interface Props {
  value: string
  onChange: (hex: string) => void
}

const num = (s: string, max = 255): number => Math.min(max, Math.max(0, parseInt(s, 10) || 0))

// ---------------- DOL ----------------

interface DolRow {
  tag: string
  len: number
}

function defaultLen(tag: string): number {
  const d = tagDef(tag)
  return d.max ?? d.min ?? 1
}

export function DolEditor({ value, onChange }: Props): React.JSX.Element {
  const { showHelp } = useEditor()
  const toRows = (h: string): DolRow[] | null => {
    try {
      return parseDol(h)
    } catch {
      return null
    }
  }
  const fromRows = (rows: DolRow[] | null): string | null =>
    rows && rows.every((r) => !tagError(r.tag)) ? encodeDol(rows) : null
  const [rows, setRows] = useSynced<DolRow[] | null>(value, toRows, fromRows)

  if (rows === null) {
    return (
      <div className="field-error">{t('DOL non interpretabile: correggi il valore in hex.')}</div>
    )
  }
  const update = (next: DolRow[]): void => {
    setRows(next)
    const h = fromRows(next)
    if (h !== null) onChange(h)
  }
  const total = rows.reduce((n, r) => n + r.len, 0)

  return (
    <div className="struct">
      <datalist id="dol-tags">
        {DOL_TAGS.map((d) => (
          <option key={d.tag} value={d.tag}>
            {d.name}
          </option>
        ))}
      </datalist>
      <table className="struct-table">
        <thead>
          <tr>
            <th>Tag</th>
            <th>{t('Nome')}</th>
            <th>{t('Lungh.')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const err = tagError(r.tag)
            return (
              <tr
                key={i}
                onMouseOver={(e) => {
                  // Document the referenced data object instead of the DOL itself.
                  e.stopPropagation()
                  showHelp({ tag: r.tag })
                }}
              >
                <td>
                  <input
                    className={`input small mono tag-input ${err ? 'invalid' : ''}`}
                    list="dol-tags"
                    value={r.tag}
                    title={err ?? ''}
                    onChange={(e) => {
                      const tag = normalizeHex(e.target.value)
                      const known = TAGS[tag] !== undefined
                      update(
                        rows.map((x, j) =>
                          j === i ? { tag, len: known ? defaultLen(tag) : x.len } : x
                        )
                      )
                    }}
                  />
                </td>
                <td className="muted">{err ? err : tagDef(r.tag).name}</td>
                <td>
                  <input
                    type="number"
                    className="input small num"
                    min={0}
                    max={255}
                    value={r.len}
                    onChange={(e) =>
                      update(rows.map((x, j) => (j === i ? { ...x, len: num(e.target.value) } : x)))
                    }
                  />
                </td>
                <td>
                  <button
                    className="icon-btn"
                    title={t('Rimuovi')}
                    onClick={() => update(rows.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="field-row">
        <select
          className="input small"
          value=""
          onChange={(e) => {
            const tag = e.target.value
            if (tag) update([...rows, { tag, len: defaultLen(tag) }])
          }}
        >
          <option value="">{t('+ Aggiungi data object…')}</option>
          {DOL_TAGS.map((d) => (
            <option key={d.tag} value={d.tag}>
              {d.tag} – {d.name}
              {d.source === 'terminal' ? ` (${t('terminale')})` : ''}
            </option>
          ))}
        </select>
        <span className="muted small">
          {t('Dati richiesti al terminale: {n} byte', { n: total })}
        </span>
      </div>
    </div>
  )
}

// ---------------- AFL ----------------

export function AflEditor({ value, onChange }: Props): React.JSX.Element {
  const entries = parseAfl(value)
  const emit = (e: AflEntry[]): void => onChange(encodeAfl(e))
  const set = (i: number, patch: Partial<AflEntry>): void =>
    emit(entries.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const totalRecords = entries.reduce((n, e) => n + Math.max(0, e.last - e.first + 1), 0)

  return (
    <div className="struct">
      <table className="struct-table">
        <thead>
          <tr>
            <th>SFI</th>
            <th>{t('Primo rec.')}</th>
            <th>{t('Ultimo rec.')}</th>
            <th>{t('Rec. per ODA')}</th>
            <th>READ RECORD</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const err = aflEntryError(e)
            return (
              <tr key={i} className={err ? 'row-bad' : ''} title={err ?? ''}>
                <td>
                  <input
                    type="number"
                    className="input small num"
                    min={1}
                    max={30}
                    value={e.sfi}
                    onChange={(ev) => set(i, { sfi: num(ev.target.value, 31) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input small num"
                    min={1}
                    value={e.first}
                    onChange={(ev) => set(i, { first: num(ev.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input small num"
                    min={1}
                    value={e.last}
                    onChange={(ev) => set(i, { last: num(ev.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input small num"
                    min={0}
                    value={e.oda}
                    onChange={(ev) => set(i, { oda: num(ev.target.value) })}
                  />
                </td>
                <td className="mono muted small">
                  00B2{toHexByte(e.first)}
                  {toHexByte((e.sfi << 3) | 4)}00
                </td>
                <td>
                  <button
                    className="icon-btn"
                    title={t('Rimuovi')}
                    onClick={() => emit(entries.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="field-row">
        <button
          className="btn small"
          onClick={() => {
            const nextSfi = entries.length ? Math.min(30, entries[entries.length - 1].sfi + 1) : 1
            emit([...entries, { sfi: nextSfi, first: 1, last: 1, oda: 0 }])
          }}
        >
          {t('+ Aggiungi gruppo di record')}
        </button>
        <span className="muted small">
          {t('Record totali da leggere: {n}', { n: totalRecords })}
        </span>
      </div>
    </div>
  )
}

// ---------------- CVM List ----------------

export function CvmEditor({ value, onChange }: Props): React.JSX.Element {
  const cvm = parseCvm(value.padEnd(16, '0'))
  const emit = (patch: Partial<typeof cvm>): void => onChange(encodeCvm({ ...cvm, ...patch }))
  const setRule = (i: number, patch: Partial<CvmRule>): void =>
    emit({
      rules: cvm.rules.map((r, j) => (j === i ? { ...r, ...patch } : r))
    })

  return (
    <div className="struct">
      <div className="field-row">
        <label className="field inline">
          <span className="field-label">{t('Importo X')}</span>
          <input
            type="number"
            className="input small num wide"
            min={0}
            value={cvm.x}
            onChange={(e) => emit({ x: Math.max(0, parseInt(e.target.value, 10) || 0) })}
          />
        </label>
        <label className="field inline">
          <span className="field-label">{t('Importo Y')}</span>
          <input
            type="number"
            className="input small num wide"
            min={0}
            value={cvm.y}
            onChange={(e) => emit({ y: Math.max(0, parseInt(e.target.value, 10) || 0) })}
          />
        </label>
        <span className="muted small">{t('in unità minime della valuta applicazione')}</span>
      </div>
      <table className="struct-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('Metodo CVM')}</th>
            <th>{t('Se fallisce, prova la successiva')}</th>
            <th>{t('Condizione')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cvm.rules.map((r, i) => (
            <tr key={i}>
              <td className="muted">{i + 1}</td>
              <td>
                <select
                  className="input small"
                  value={r.method}
                  onChange={(e) => setRule(i, { method: Number(e.target.value) })}
                >
                  {!CVM_METHODS.some((m) => m.value === r.method) && (
                    <option value={r.method}>
                      {toHexByte(r.method)} – {t('proprietario/RFU')}
                    </option>
                  )}
                  {CVM_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {toHexByte(m.value)} – {t(m.label)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="center">
                <input
                  type="checkbox"
                  checked={r.applyNext}
                  onChange={(e) => setRule(i, { applyNext: e.target.checked })}
                />
              </td>
              <td>
                <select
                  className="input small"
                  value={r.condition}
                  onChange={(e) => setRule(i, { condition: Number(e.target.value) })}
                >
                  {!CVM_CONDITIONS.some((c) => c.value === r.condition) && (
                    <option value={r.condition}>
                      {toHexByte(r.condition)} – {t('proprietaria/RFU')}
                    </option>
                  )}
                  {CVM_CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {toHexByte(c.value)} – {t(c.label)}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  className="icon-btn"
                  title={t('Rimuovi')}
                  onClick={() => emit({ rules: cvm.rules.filter((_, j) => j !== i) })}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn small"
        onClick={() =>
          emit({
            rules: [...cvm.rules, { method: 0x1f, applyNext: false, condition: 0x03 }]
          })
        }
      >
        {t('+ Aggiungi regola CVM')}
      </button>
    </div>
  )
}

// ---------------- Track 2 ----------------

export function Track2Editor({ value, onChange }: Props): React.JSX.Element {
  const fromLocal = (tk: Track2): string | null =>
    /^\d*$/.test(tk.pan + tk.expiry + tk.serviceCode + tk.discretionary) ? encodeTrack2(tk) : null
  const [tk, setTk] = useSynced<Track2>(value, parseTrack2, fromLocal)
  const set = (patch: Partial<Track2>): void => {
    const next = { ...tk, ...patch }
    setTk(next)
    const h = fromLocal(next)
    if (h !== null) onChange(h)
  }
  const panOk = tk.pan === '' || luhnValid(tk.pan)

  return (
    <div className="struct track2">
      <label className="field">
        <span className="field-label">PAN</span>
        <input
          className={`input mono ${panOk ? '' : 'invalid'}`}
          value={tk.pan}
          maxLength={19}
          onChange={(e) => set({ pan: e.target.value })}
        />
        {!panOk && <span className="field-error">{t('Controllo Luhn fallito')}</span>}
      </label>
      <label className="field">
        <span className="field-label">{t('Scadenza (YYMM)')}</span>
        <input
          className="input mono"
          value={tk.expiry}
          maxLength={4}
          placeholder="2712"
          onChange={(e) => set({ expiry: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-label">Service code</span>
        <input
          className="input mono"
          value={tk.serviceCode}
          maxLength={3}
          placeholder="201"
          onChange={(e) => set({ serviceCode: e.target.value })}
        />
      </label>
      <label className="field grow">
        <span className="field-label">{t('Dati discrezionali')}</span>
        <input
          className="input mono"
          value={tk.discretionary}
          onChange={(e) => set({ discretionary: e.target.value })}
        />
      </label>
    </div>
  )
}
