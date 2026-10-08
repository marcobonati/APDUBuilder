import {
  compressedToHex,
  hexToCompressed,
  isoToYymmdd,
  numericToHex,
  yymmddToIso
} from '../../emv/formats'
import { hexToText, isPrintableHex, textToHex } from '../../emv/hex'
import type { EnumOption, TagDef } from '../../emv/types'
import { useSynced } from '../../hooks/useSynced'

interface Props {
  def: TagDef
  value: string
  onChange: (hex: string) => void
}

export function TextField({ def, value, onChange }: Props): React.JSX.Element {
  const [text, setText] = useSynced(value, hexToText, textToHex)
  const max = def.max
  const nonPrintable = value !== '' && !isPrintableHex(value)
  return (
    <label className="field">
      <span className="field-label">Testo ({def.format})</span>
      <div className="field-row">
        <input
          className="input"
          value={nonPrintable ? '' : text}
          placeholder={
            nonPrintable ? 'Valore non stampabile: modificalo in hex' : 'Scrivi il testo…'
          }
          maxLength={max}
          spellCheck={false}
          onChange={(e) => {
            setText(e.target.value)
            onChange(textToHex(e.target.value))
          }}
        />
        {max !== undefined && (
          <span className={`counter ${text.length > max ? 'bad' : ''}`}>
            {text.length}/{max}
          </span>
        )}
      </div>
    </label>
  )
}

export function NumericField({ def, value, onChange }: Props): React.JSX.Element {
  const toHex = (t: string): string | null =>
    /^\d*$/.test(t) ? (t === '' ? '' : numericToHex(t, def)) : null
  const [text, setText] = useSynced(value, (h) => h, toHex)
  const digits = def.max !== undefined ? def.max * 2 : undefined
  return (
    <label className="field">
      <span className="field-label">Numerico (n{digits ?? ''}) – padding a sinistra con 0</span>
      <input
        className="input mono"
        value={text}
        inputMode="numeric"
        placeholder="Solo cifre 0–9"
        onChange={(e) => {
          setText(e.target.value)
          const h = toHex(e.target.value)
          if (h !== null) onChange(h)
        }}
      />
      {!/^\d*$/.test(text) && <span className="field-error">Ammesse solo cifre</span>}
    </label>
  )
}

export function CompressedField({ value, onChange }: Props): React.JSX.Element {
  const toHex = (t: string): string | null => (/^\d*$/.test(t) ? compressedToHex(t) : null)
  const [text, setText] = useSynced(value, hexToCompressed, toHex)
  return (
    <label className="field">
      <span className="field-label">Numerico compresso (cn) – padding F automatico</span>
      <input
        className="input mono"
        value={text}
        inputMode="numeric"
        placeholder="Solo cifre 0–9"
        onChange={(e) => {
          setText(e.target.value)
          const h = toHex(e.target.value)
          if (h !== null) onChange(h)
        }}
      />
      {!/^\d*$/.test(text) && <span className="field-error">Ammesse solo cifre</span>}
    </label>
  )
}

export function DateField({ value, onChange }: Props): React.JSX.Element {
  const iso = yymmddToIso(value)
  const endOfMonth = (years: number): string => {
    const d = new Date()
    const last = new Date(d.getFullYear() + years, d.getMonth() + 1, 0)
    const p = (n: number): string => String(n).padStart(2, '0')
    return `${String(last.getFullYear()).substr(2)}${p(last.getMonth() + 1)}${p(last.getDate())}`
  }
  const today = (): string => isoToYymmdd(new Date().toISOString().substr(0, 10))
  return (
    <div className="field">
      <span className="field-label">Data (YYMMDD)</span>
      <div className="field-row">
        <input
          type="date"
          className="input"
          value={iso}
          onChange={(e) => onChange(isoToYymmdd(e.target.value))}
        />
        <button className="btn small" onClick={() => onChange(today())}>
          Oggi
        </button>
        <button className="btn small" onClick={() => onChange(endOfMonth(3))}>
          +3 anni (fine mese)
        </button>
        <button className="btn small" onClick={() => onChange(endOfMonth(-1))}>
          Scaduta
        </button>
      </div>
    </div>
  )
}

interface OptionsProps {
  options: EnumOption[]
  value: string
  onChange: (hex: string) => void
}

export function OptionPicker({ options, value, onChange }: OptionsProps): React.JSX.Element {
  const known = options.some((o) => o.value === value)
  return (
    <label className="field">
      <span className="field-label">Valori noti</span>
      <select
        className="input"
        value={known ? value : ''}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      >
        <option value="">{value ? '— personalizzato —' : '— scegli —'}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.value})
          </option>
        ))}
      </select>
    </label>
  )
}
