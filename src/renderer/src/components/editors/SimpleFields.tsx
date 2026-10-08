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
import { t } from '../../i18n'

interface Props {
  def: TagDef
  value: string
  onChange: (hex: string) => void
}

interface TextFieldProps extends Props {
  /** Field label, defaults to "Testo (format)". */
  label?: string
  placeholder?: string
  /** Converts the input to uppercase while typing (e.g. BIC). */
  uppercase?: boolean
}

export function TextField({
  def,
  value,
  onChange,
  label,
  placeholder,
  uppercase
}: TextFieldProps): React.JSX.Element {
  const [text, setText] = useSynced(value, hexToText, textToHex)
  const max = def.max
  const nonPrintable = value !== '' && !isPrintableHex(value)
  return (
    <label className="field">
      <span className="field-label">{label ?? `${t('Testo')} (${def.format})`}</span>
      <div className="field-row">
        <input
          className={`input ${uppercase ? 'mono' : ''}`}
          value={nonPrintable ? '' : text}
          placeholder={
            nonPrintable
              ? t('Valore non stampabile: modificalo in hex')
              : (placeholder ?? t('Scrivi il testo…'))
          }
          maxLength={max}
          spellCheck={false}
          onChange={(e) => {
            const v = uppercase ? e.target.value.toUpperCase() : e.target.value
            setText(v)
            onChange(textToHex(v))
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
      <span className="field-label">
        {t('Numerico (n{d}) – padding a sinistra con 0', { d: digits ?? '' })}
      </span>
      <input
        className="input mono"
        value={text}
        inputMode="numeric"
        placeholder={t('Solo cifre 0–9')}
        onChange={(e) => {
          setText(e.target.value)
          const h = toHex(e.target.value)
          if (h !== null) onChange(h)
        }}
      />
      {!/^\d*$/.test(text) && <span className="field-error">{t('Ammesse solo cifre')}</span>}
    </label>
  )
}

export function CompressedField({ value, onChange }: Props): React.JSX.Element {
  const toHex = (t: string): string | null => (/^\d*$/.test(t) ? compressedToHex(t) : null)
  const [text, setText] = useSynced(value, hexToCompressed, toHex)
  return (
    <label className="field">
      <span className="field-label">{t('Numerico compresso (cn) – padding F automatico')}</span>
      <input
        className="input mono"
        value={text}
        inputMode="numeric"
        placeholder={t('Solo cifre 0–9')}
        onChange={(e) => {
          setText(e.target.value)
          const h = toHex(e.target.value)
          if (h !== null) onChange(h)
        }}
      />
      {!/^\d*$/.test(text) && <span className="field-error">{t('Ammesse solo cifre')}</span>}
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
      <span className="field-label">{t('Data (YYMMDD)')}</span>
      <div className="field-row">
        <input
          type="date"
          className="input"
          value={iso}
          onChange={(e) => onChange(isoToYymmdd(e.target.value))}
        />
        <button className="btn small" onClick={() => onChange(today())}>
          {t('Oggi')}
        </button>
        <button className="btn small" onClick={() => onChange(endOfMonth(3))}>
          {t('+3 anni (fine mese)')}
        </button>
        <button className="btn small" onClick={() => onChange(endOfMonth(-1))}>
          {t('Scaduta')}
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
      <span className="field-label">{t('Valori noti')}</span>
      <select
        className="input"
        value={known ? value : ''}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      >
        <option value="">{value ? t('— personalizzato —') : t('— scegli —')}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)} ({o.value})
          </option>
        ))}
      </select>
    </label>
  )
}
