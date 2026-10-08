import { fieldMask, getField, setField } from '../../emv/bitfields'
import type { BitDef, BitfieldDef } from '../../emv/bitfields'
import { bytesToHex, hexToBytes, isHexBytes, toHexByte } from '../../emv/hex'

interface Props {
  def: BitfieldDef
  value: string
  onChange: (hex: string) => void
}

function fieldFor(def: BitfieldDef, byte: number, b: number): BitDef | undefined {
  return def.fields.find((f) => f.byte === byte && b <= f.hi && b >= f.lo)
}

export default function BitfieldEditor({ def, value, onChange }: Props): React.JSX.Element {
  const src = isHexBytes(value) ? hexToBytes(value) : []
  const bytes = Array.from({ length: def.bytes }, (_, i) => src[i] ?? 0)
  const emit = (b: number[]): void => onChange(bytesToHex(b))

  return (
    <div className="bitfield">
      {bytes.map((byte, bi) => {
        const fields = def.fields.filter((f) => f.byte === bi)
        return (
          <div className="bf-byte" key={bi}>
            <div className="bf-head">
              <span className="bf-title">Byte {bi + 1}</span>
              <span className="mono muted">
                {toHexByte(byte)} · {byte.toString(2).padStart(8, '0')}
              </span>
            </div>
            <div className="bf-bits">
              {[8, 7, 6, 5, 4, 3, 2, 1].map((b) => {
                const on = (byte & (1 << (b - 1))) !== 0
                const f = fieldFor(def, bi, b)
                return (
                  <button
                    key={b}
                    className={`bf-bit ${on ? 'on' : ''} ${f ? '' : 'rfu'}`}
                    title={f ? f.label : 'RFU'}
                    onClick={() => {
                      const out = [...bytes]
                      out[bi] = byte ^ (1 << (b - 1))
                      emit(out)
                    }}
                  >
                    <span className="bf-bitn">b{b}</span>
                    <span>{on ? 1 : 0}</span>
                  </button>
                )
              })}
            </div>
            <div className="bf-fields">
              {fields.map((f) => {
                const v = getField(bytes, f)
                const range = f.hi === f.lo ? `b${f.hi}` : `b${f.hi}–b${f.lo}`
                if (f.hi === f.lo) {
                  return (
                    <label key={range} className={`bf-field ${v ? 'on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={v === 1}
                        onChange={(e) => emit(setField(bytes, f, e.target.checked ? 1 : 0))}
                      />
                      <span className="bf-range mono">{range}</span>
                      <span>{f.label}</span>
                    </label>
                  )
                }
                const maxV = fieldMask(f) >> (f.lo - 1)
                return (
                  <label key={range} className="bf-field multi">
                    <span className="bf-range mono">{range}</span>
                    <span>{f.label}</span>
                    {f.options ? (
                      <select
                        className="input small"
                        value={v}
                        onChange={(e) => emit(setField(bytes, f, Number(e.target.value)))}
                      >
                        {Array.from({ length: maxV + 1 }, (_, i) => {
                          const o = f.options?.find((x) => x.value === i)
                          return (
                            <option key={i} value={i}>
                              {i.toString(2).padStart(f.hi - f.lo + 1, '0')} – {o?.label ?? 'RFU'}
                            </option>
                          )
                        })}
                      </select>
                    ) : (
                      <input
                        type="number"
                        className="input small num"
                        min={0}
                        max={maxV}
                        value={v}
                        onChange={(e) =>
                          emit(
                            setField(
                              bytes,
                              f,
                              Math.min(maxV, Math.max(0, Number(e.target.value) || 0))
                            )
                          )
                        }
                      />
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
