import { BITFIELDS } from '../../emv/bitfields'
import { byteLength, isHexBytes, normalizeHex, randomHex } from '../../emv/hex'
import type { TagDef } from '../../emv/types'
import BitfieldEditor from './BitfieldEditor'
import { CompressedField, DateField, NumericField, OptionPicker, TextField } from './SimpleFields'
import { AflEditor, CvmEditor, DolEditor, Track2Editor } from './StructuredEditors'

interface Props {
  def: TagDef
  value: string
  example?: string
  /** Raw (untagged) data: no structured editor. */
  raw?: boolean
  onChange: (hex: string) => void
}

function lengthHint(def: TagDef): string {
  if (def.min !== undefined && def.min === def.max) return `${def.min} byte`
  if (def.min !== undefined && def.max !== undefined) return `${def.min}–${def.max} byte`
  if (def.max !== undefined) return `max ${def.max} byte`
  if (def.min !== undefined) return `min ${def.min} byte`
  return 'lunghezza variabile'
}

function StructuredEditor({ def, value, onChange }: Props): React.JSX.Element | null {
  if (def.bitfield && BITFIELDS[def.bitfield]) {
    return <BitfieldEditor def={BITFIELDS[def.bitfield]} value={value} onChange={onChange} />
  }
  switch (def.format) {
    case 'an':
    case 'ans':
      return <TextField def={def} value={value} onChange={onChange} />
    case 'n':
      return <NumericField def={def} value={value} onChange={onChange} />
    case 'cn':
      return <CompressedField def={def} value={value} onChange={onChange} />
    case 'date':
      return <DateField def={def} value={value} onChange={onChange} />
    case 'dol':
      return <DolEditor value={value} onChange={onChange} />
    case 'afl':
      return <AflEditor value={value} onChange={onChange} />
    case 'cvm':
      return <CvmEditor value={value} onChange={onChange} />
    case 'track2':
      return <Track2Editor value={value} onChange={onChange} />
  }
  return null
}

export default function ValueEditor(props: Props): React.JSX.Element {
  const { def, value, example, raw, onChange } = props
  const fixedLen = def.min !== undefined && def.min === def.max ? def.min : undefined
  const canRandom = raw || (def.format === 'b' && !def.bitfield && !def.options)
  const long = value.length > 64
  const valid = isHexBytes(value)

  return (
    <div className="value-editor">
      {def.options && !raw && (
        <OptionPicker options={def.options} value={value} onChange={onChange} />
      )}
      {!raw && <StructuredEditor {...props} />}
      <div className="field">
        <span className="field-label">
          Valore HEX <span className="muted">· {lengthHint(def)}</span>
        </span>
        <div className="field-row">
          {long ? (
            <textarea
              className={`input mono hex ${valid ? '' : 'invalid'}`}
              value={value}
              rows={Math.min(8, Math.ceil(value.length / 64))}
              spellCheck={false}
              onChange={(e) => onChange(normalizeHex(e.target.value))}
            />
          ) : (
            <input
              className={`input mono hex ${valid ? '' : 'invalid'}`}
              value={value}
              placeholder={example ? `es. ${example}` : 'Valore esadecimale'}
              spellCheck={false}
              onChange={(e) => onChange(normalizeHex(e.target.value))}
            />
          )}
          <span className={`counter ${valid ? '' : 'bad'}`}>
            {valid ? `${byteLength(value)} B` : 'hex?'}
          </span>
        </div>
        <div className="field-actions">
          {example && example !== value && (
            <button className="link-btn" onClick={() => onChange(example)}>
              Usa esempio
            </button>
          )}
          {canRandom && (
            <button
              className="link-btn"
              onClick={() => onChange(randomHex(fixedLen ?? Math.max(1, byteLength(value) || 8)))}
            >
              Casuale
              {fixedLen
                ? ` (${fixedLen} B)`
                : byteLength(value)
                  ? ` (${byteLength(value)} B)`
                  : ' (8 B)'}
            </button>
          )}
          {value && (
            <button className="link-btn" onClick={() => onChange('')}>
              Svuota
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
