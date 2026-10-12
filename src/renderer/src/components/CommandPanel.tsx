import { memo, useState } from 'react'
import type { CommandApdu, DolItem, DolSource } from '../emv/command'
import { describeValue } from '../emv/formats'
import { cleanPastedHex, isHexBytes, spaced, toHexByte } from '../emv/hex'
import { tagDef } from '../emv/tags'
import { useEditor } from '../state/context'
import { t } from '../i18n'

interface Props {
  responseId: string
  cmd: CommandApdu | null
}

const SOURCES: Record<DolSource, { label: string; title: string }> = {
  project: { label: 'progetto', title: 'Valore impostato nel progetto' },
  card: { label: 'carta', title: 'Valore restituito da una response precedente' },
  default: { label: 'default', title: 'Valore di default del terminale' },
  zero: { label: 'zeri', title: 'Dato non disponibile: riempito con zeri' }
}

function lcOf(cmd: CommandApdu): string {
  const n = cmd.data.length / 2
  return !cmd.data
    ? ''
    : n <= 0xff
      ? toHexByte(n)
      : '00' + n.toString(16).toUpperCase().padStart(4, '0')
}

/** Header, Lc, data and Le with the same colors used for tag, length and value in the RAW panel. */
function ColoredApdu({ cmd }: { cmd: CommandApdu }): React.JSX.Element {
  if (!cmd.ins) return <code className="mono">{spaced(cmd.hex)}</code>
  return (
    <code className="mono cmd-hex">
      <span className="k-tag">{spaced(cmd.cla + cmd.ins + cmd.p1 + cmd.p2)}</span>{' '}
      {cmd.data && (
        <>
          <span className="k-len">{spaced(lcOf(cmd))}</span>{' '}
          <span className="k-val">{spaced(cmd.data)}</span>{' '}
        </>
      )}
      {cmd.le && <span className="k-sw">{spaced(cmd.le)}</span>}
    </code>
  )
}

function DolValue({ item }: { item: DolItem }): React.JSX.Element {
  const { dispatch } = useEditor()
  const [draft, setDraft] = useState<string | null>(null)
  const valid = draft === null || isHexBytes(draft)
  const commit = (): void => {
    if (draft === null) return
    if (isHexBytes(draft) && draft !== item.value) {
      dispatch({ type: 'setTerminalValue', tag: item.tag, value: draft })
    }
    setDraft(null)
  }
  return (
    <input
      className={`input small mono ${valid ? '' : 'invalid'}`}
      value={draft ?? item.value}
      spellCheck={false}
      onChange={(e) => setDraft(cleanPastedHex(e.target.value))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') setDraft(null)
      }}
    />
  )
}

export default memo(function CommandPanel({ responseId, cmd }: Props): React.JSX.Element {
  const { dispatch } = useEditor()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const save = (): void => {
    if (draft === null) return
    const hex = cleanPastedHex(draft)
    // Invalid input is discarded; an empty field goes back to the generated command.
    const valid = hex === '' || (isHexBytes(hex) && hex.length >= 8)
    if (valid && hex !== (cmd?.hex ?? '') && (hex || cmd?.manual)) {
      dispatch({ type: 'setCommand', id: responseId, command: hex || null })
    }
    setDraft(null)
  }
  const copy = async (): Promise<void> => {
    if (!cmd) return
    try {
      await navigator.clipboard.writeText(cmd.hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // Clipboard not available.
    }
  }

  const fields = cmd?.ins
    ? [
        {
          k: 'CLA',
          hex: cmd.cla,
          desc: cmd.cla === '80' ? t('Classe proprietaria EMV') : t('Classe interindustry ISO 7816')
        },
        { k: 'INS', hex: cmd.ins, desc: cmd.name.split(' (')[0] || '—' },
        { k: 'P1', hex: cmd.p1, desc: cmd.p1Desc ?? '' },
        { k: 'P2', hex: cmd.p2, desc: cmd.p2Desc ?? '' },
        ...(cmd.data
          ? [
              { k: 'Lc', hex: lcOf(cmd), desc: t('{n} byte di dati', { n: cmd.data.length / 2 }) },
              { k: t('Dati'), hex: cmd.data, desc: cmd.dataDesc ?? '' }
            ]
          : []),
        ...(cmd.le ? [{ k: 'Le', hex: cmd.le, desc: t('Tutti i byte disponibili') }] : [])
      ]
    : []

  return (
    <div className="command">
      <div className="command-row">
        <span className="muted small">C-APDU{cmd?.name ? ` · ${cmd.name}` : ''}</span>
        {cmd && (
          <span
            className={`pill ${cmd.manual ? 'req' : 'fixed'}`}
            title={
              cmd.manual
                ? t('Comando inserito manualmente')
                : t('Comando generato dalle response precedenti del progetto')
            }
          >
            {cmd.manual ? t('manuale') : 'auto'}
          </span>
        )}
        {draft !== null ? (
          <input
            autoFocus
            className="input small mono cmd-input"
            value={draft}
            spellCheck={false}
            placeholder={t('Hex della C-APDU (vuoto = automatica)')}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') setDraft(null)
            }}
          />
        ) : cmd ? (
          <ColoredApdu cmd={cmd} />
        ) : (
          <span className="muted small">{t('Nessun comando ricavabile da questa response')}</span>
        )}
        <span className="command-actions">
          {cmd && draft === null && (
            <button className="btn small" onClick={copy}>
              {copied ? `✓ ${t('Copiato')}` : t('Copia')}
            </button>
          )}
          {draft === null && (
            <button
              className="btn small"
              title={t('Sostituisci la C-APDU generata con una inserita a mano')}
              onClick={() => setDraft(cmd ? spaced(cmd.hex) : '')}
            >
              ✎
            </button>
          )}
          {cmd?.manual && (
            <button
              className="btn small"
              title={cmd.auto ? `${t('Torna alla C-APDU generata')}: ${cmd.auto}` : ''}
              onClick={() => dispatch({ type: 'setCommand', id: responseId, command: null })}
            >
              ↺ auto
            </button>
          )}
          {cmd && (
            <button className="link-btn small" onClick={() => setOpen(!open)}>
              {open ? '▾' : '▸'} {t('Dettagli')}
            </button>
          )}
        </span>
      </div>

      {cmd && cmd.warnings.length > 0 && (
        <ul className="issue-list cmd-warnings">
          {cmd.warnings.map((w, i) => (
            <li key={i} className="warning">
              {w}
            </li>
          ))}
        </ul>
      )}

      {cmd && open && (
        <div className="command-details">
          {cmd.notes.length > 0 && (
            <ul className="cmd-notes small muted">
              {cmd.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
          {fields.length > 0 && (
            <table className="cmd-table">
              <tbody>
                {fields.map((f) => (
                  <tr key={f.k}>
                    <td className="small muted">{f.k}</td>
                    <td className="mono">{spaced(f.hex)}</td>
                    <td className="small">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {cmd.dol && (
            <>
              <div className="small cmd-dol-title">
                {cmd.dol.name} ({cmd.dol.tag}){' '}
                <span className="mono muted">{spaced(cmd.dol.hex)}</span>
                {cmd.dol.from && (
                  <span className="muted"> · {t('da «{name}»', { name: cmd.dol.from })}</span>
                )}
              </div>
              <table className="cmd-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>{t('Nome')}</th>
                    <th>L</th>
                    <th>{t('Valore')}</th>
                    <th>{t('Origine')}</th>
                  </tr>
                </thead>
                <tbody>
                  {cmd.dol.items.map((it, i) => {
                    const def = tagDef(it.tag)
                    const decoded = describeValue(def, it.value)
                    return (
                      <tr key={`${it.tag}-${i}`}>
                        <td className="mono k-tag-text">{it.tag}</td>
                        <td className="small" title={decoded}>
                          {def.name}
                          {decoded && <div className="cmd-decoded">{decoded}</div>}
                        </td>
                        <td className="small">{it.len}</td>
                        <td>
                          <DolValue key={it.value} item={it} />
                        </td>
                        <td className="small nowrap">
                          <span
                            className={`src src-${it.source}`}
                            title={t(SOURCES[it.source].title)}
                          >
                            {t(SOURCES[it.source].label)}
                          </span>
                          {it.source === 'project' && (
                            <button
                              className="icon-btn"
                              title={t('Ripristina il valore automatico')}
                              onClick={() =>
                                dispatch({ type: 'setTerminalValue', tag: it.tag, value: null })
                              }
                            >
                              ↺
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="muted small">
                {t(
                  'I valori modificati valgono per tutto il progetto: lo stesso tag (es. 9F37) resta coerente tra GPO e GENERATE AC.'
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})
