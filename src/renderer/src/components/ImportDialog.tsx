import { useState } from 'react'
import { cleanPastedHex, isHexBytes } from '../emv/hex'
import { parseTlv } from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import { t } from '../i18n'

interface Props {
  onClose: () => void
  onImport: (nodes: TlvNode[], sw: string) => void
}

function looksLikeSw(hex: string): boolean {
  return /^(9[0-9A-F]|6[1-9A-F])[0-9A-F]{2}$/.test(hex.substr(-4))
}

export default function ImportDialog({ onClose, onImport }: Props): React.JSX.Element {
  const [text, setText] = useState('')
  const [hasSw, setHasSw] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hex = cleanPastedHex(text)
  const swOn = hasSw ?? looksLikeSw(hex)

  const run = (): void => {
    if (!isHexBytes(hex)) {
      setError(
        t('Il testo non è esadecimale valido (numero di cifre dispari o caratteri non hex).')
      )
      return
    }
    const data = swOn && hex.length >= 4 ? hex.slice(0, -4) : hex
    const sw = swOn && hex.length >= 4 ? hex.slice(-4) : '9000'
    try {
      const { nodes } = parseTlv(data)
      onImport(nodes, sw)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{t('Importa response da hex')}</h2>
        <p className="muted small">
          {t(
            "Incolla una response esistente (spazi, 0x e virgole vengono ignorati). Verrà scomposta in TLV e potrai modificarla con l'editor guidato."
          )}
        </p>
        <textarea
          autoFocus
          className="input mono"
          rows={8}
          value={text}
          placeholder="6F 23 84 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 A5 11 BF 0C 0E 61 0C 4F 07 A0 00 00 00 03 10 10 87 01 01 90 00"
          onChange={(e) => {
            setText(e.target.value)
            setError(null)
          }}
        />
        <label className="small">
          <input type="checkbox" checked={swOn} onChange={(e) => setHasSw(e.target.checked)} />{' '}
          {t('Gli ultimi 2 byte sono la Status Word')}{' '}
          {hex.length >= 4 && swOn && <span className="mono">({hex.slice(-4)})</span>}
        </label>
        {error && <div className="field-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            {t('Annulla')}
          </button>
          <button className="btn primary" disabled={!hex} onClick={run}>
            {t('Importa')}
          </button>
        </div>
      </div>
    </div>
  )
}
