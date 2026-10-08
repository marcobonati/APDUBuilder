import { BITFIELDS, getField } from '../emv/bitfields'
import {
  CVM_CONDITIONS,
  CVM_METHODS,
  describeValue,
  hexToCompressed,
  luhn,
  parseAfl,
  parseCvm,
  parseTrack2
} from '../emv/formats'
import { PHASES, TAG_HELP } from '../emv/help'
import { hexToBytes, isHexBytes, splitBytes, toHexByte } from '../emv/hex'
import { TAGS, tagDef } from '../emv/tags'
import { TEMPLATES } from '../emv/templates'
import { hasChildren, isConstructedTag, parseDol, tagError, valueHex } from '../emv/tlv'
import type { TagDef, TlvNode } from '../emv/types'
import { t } from '../i18n'
import type { HelpTarget } from '../state/context'
import { FORMAT_HELP, TAG_CLASSES } from '../emv/helpFormats'

interface Props {
  target: HelpTarget | null
  nodes: TlvNode[]
  locked: boolean
  onToggleLock: () => void
  onClose: () => void
}

function findWithParent(
  list: TlvNode[],
  id: string,
  parent: TlvNode | null = null
): { node: TlvNode; parent: TlvNode | null } | null {
  for (const n of list) {
    if (n.id === id) return { node: n, parent }
    const f = findWithParent(n.children, id, n)
    if (f) return f
  }
  return null
}

/** BER-TLV structure of the tag: class, primitive/constructed, tag number. */
function tagStructure(tag: string): { cls: string; constructed: boolean; number: number } | null {
  if (tagError(tag)) return null
  const b = hexToBytes(tag)
  let number = b[0] & 0x1f
  if (number === 0x1f) {
    number = 0
    for (let i = 1; i < b.length; i++) number = number * 128 + (b[i] & 0x7f)
  }
  return { cls: TAG_CLASSES[b[0] >> 6], constructed: (b[0] & 0x20) !== 0, number }
}

interface TemplateUse {
  name: string
  command: string
}

/** Templates (and their commands) whose structure includes the tag. */
function templateUses(tag: string): TemplateUse[] {
  type S = { tag: string; children?: S[] }
  const has = (specs: S[]): boolean => specs.some((s) => s.tag === tag || has(s.children ?? []))
  return TEMPLATES.filter((tpl) => has(tpl.root as S[])).map((tpl) => ({
    name: t(tpl.name),
    command: tpl.command.apdu ? t(tpl.command.name) : ''
  }))
}

/** Tags carrying a PAN, for which the help explains the Luhn check. */
const LUHN_TAGS = ['5A', '57', '9F6B']

function panOf(tag: string, value: string): string {
  if (!value || !isHexBytes(value)) return ''
  return tag === '5A' ? hexToCompressed(value) : parseTrack2(value).pan
}

/** Explanation of the Luhn check, with the computation on the current PAN. */
function LuhnSection({ pan }: { pan: string }): React.JSX.Element {
  const usable = /^\d{2,19}$/.test(pan)
  const r = usable ? luhn(pan) : null
  return (
    <section className="help-section">
      <h3>{t('Controllo Luhn')}</h3>
      <p>
        {t(
          'Il controllo Luhn (algoritmo "mod 10", ISO/IEC 7812-1) verifica la cifra di controllo del PAN: l\'ultima cifra è scelta dall\'issuer in modo che la somma calcolata sulle cifre sia un multiplo di 10.'
        )}
      </p>
      <p>
        {t(
          'Serve a intercettare errori di digitazione o trascrizione: rileva qualsiasi cifra singola sbagliata e quasi tutti gli scambi tra due cifre adiacenti. Non è un controllo di sicurezza: chiunque può calcolare un PAN che lo supera.'
        )}
      </p>
      <ol className="help-list">
        <li>
          {t(
            "Partendo dall'ultima cifra (la cifra di controllo) e procedendo verso sinistra, raddoppia una cifra sì e una no: la seconda da destra, la quarta, e così via."
          )}
        </li>
        <li>
          {t(
            'Se un raddoppio supera 9, sottrai 9 (equivale a sommare le due cifre del risultato).'
          )}
        </li>
        <li>{t('Somma tutti i valori ottenuti, compresa la cifra di controllo.')}</li>
        <li>{t('Il PAN è valido se la somma è un multiplo di 10.')}</li>
      </ol>
      <p className="muted small">
        {t(
          'EMV non chiede al terminale di verificarlo sui dati letti dal chip, ma acquirer e sistemi di autorizzazione scartano i PAN non validi: per questo anche i PAN usati nei test devono superarlo.'
        )}
      </p>
      {r && (
        <>
          <div className="muted small">{t('Calcolo sul PAN corrente:')}</div>
          <div
            className="luhn-grid"
            style={{ gridTemplateColumns: `repeat(${r.steps.length}, 1fr)` }}
          >
            {r.steps.map((st, i) => (
              <span key={`d${i}`} className={`luhn-digit ${st.doubled ? 'doubled' : ''}`}>
                {st.digit}
              </span>
            ))}
            {r.steps.map((st, i) => (
              <span
                key={`v${i}`}
                className={`luhn-value ${st.doubled ? 'doubled' : ''} ${i === r.steps.length - 1 ? 'check' : ''}`}
              >
                {st.value}
              </span>
            ))}
          </div>
          <div className="muted small">
            {t(
              'Riga sopra: cifre del PAN (evidenziate quelle raddoppiate). Riga sotto: valore sommato.'
            )}
          </div>
          <div className={r.valid ? 'help-decoded' : 'luhn-bad'}>
            {t('Somma = {sum}', { sum: r.sum })} →{' '}
            {r.valid
              ? t('multiplo di 10: PAN valido ✓')
              : t(
                  'non multiplo di 10: PAN non valido. Cifra di controllo attesa {exp} (presente {cur}).',
                  {
                    exp: r.expectedCheckDigit,
                    cur: r.steps[r.steps.length - 1].digit
                  }
                )}
          </div>
        </>
      )}
    </section>
  )
}

function safeParseDol(hex: string): { tag: string; len: number }[] | null {
  try {
    return parseDol(hex)
  } catch {
    return null
  }
}

function lengthText(def: TagDef): string {
  if (def.min !== undefined && def.min === def.max) return t('{n} byte', { n: def.min })
  if (def.min !== undefined && def.max !== undefined)
    return t('{min}–{max} byte', { min: def.min, max: def.max })
  if (def.max !== undefined) return t('max {n} byte', { n: def.max })
  return t('lunghezza variabile')
}

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="help-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

/** Detailed breakdown of the current value according to the tag format. */
function ValueDetails({ def, value }: { def: TagDef; value: string }): React.JSX.Element | null {
  if (!value || !isHexBytes(value)) return null
  const bf = def.bitfield ? BITFIELDS[def.bitfield] : undefined
  if (bf) {
    const bytes = hexToBytes(value)
    return (
      <table className="help-table">
        <tbody>
          {bf.fields.map((f) => {
            const v = getField(bytes, f)
            const range =
              f.hi === f.lo ? `B${f.byte + 1} b${f.hi}` : `B${f.byte + 1} b${f.hi}–${f.lo}`
            const opt = f.options?.find((o) => o.value === v)
            return (
              <tr key={range} className={v ? 'on' : ''}>
                <td className="mono">{range}</td>
                <td>{t(f.label)}</td>
                <td className="mono">{f.hi === f.lo ? (v ? '✓' : '—') : opt ? t(opt.label) : v}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
  switch (def.format) {
    case 'dol': {
      const entries = safeParseDol(value)
      if (!entries) return null
      return (
        <table className="help-table">
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td className="mono">{e.tag}</td>
                <td>{tagDef(e.tag).name}</td>
                <td className="mono">{t('{n} byte', { n: e.len })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    case 'afl':
      return (
        <ul className="help-list">
          {parseAfl(value).map((e, i) => (
            <li key={i}>
              {t('SFI {sfi}: record da {first} a {last}, {oda} per ODA', {
                sfi: e.sfi,
                first: e.first,
                last: e.last,
                oda: e.oda
              })}{' '}
              <span className="mono muted">
                00B2{toHexByte(e.first)}
                {toHexByte((e.sfi << 3) | 4)}00
              </span>
            </li>
          ))}
        </ul>
      )
    case 'cvm': {
      const c = parseCvm(value.padEnd(16, '0'))
      return (
        <>
          <div className="small muted">
            X = {c.x} · Y = {c.y}
          </div>
          <ol className="help-list">
            {c.rules.map((r, i) => (
              <li key={i}>
                <strong>
                  {t(CVM_METHODS.find((m) => m.value === r.method)?.label ?? '') ||
                    `CVM ${toHexByte(r.method)}`}
                </strong>{' '}
                —{' '}
                {t(CVM_CONDITIONS.find((x) => x.value === r.condition)?.label ?? '') ||
                  toHexByte(r.condition)}
                {r.applyNext ? ` · ${t('se fallisce prova la successiva')}` : ''}
              </li>
            ))}
          </ol>
        </>
      )
    }
    case 'track2': {
      const tk = parseTrack2(value)
      const rows: [string, string][] = [
        ['PAN', tk.pan],
        [t('Scadenza (YYMM)'), tk.expiry],
        ['Service code', tk.serviceCode],
        [t('Dati discrezionali'), tk.discretionary]
      ]
      return (
        <table className="help-table">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td className="mono">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
  }
  return null
}

export default function HelpPanel({
  target,
  nodes,
  locked,
  onToggleLock,
  onClose
}: Props): React.JSX.Element {
  const found = target?.nodeId ? findWithParent(nodes, target.nodeId) : null
  const node = found?.node ?? null
  const tag = node ? node.tag : (target?.tag ?? '')
  const raw = node?.raw === true
  const def = tagDef(tag)
  const known = TAGS[tag] !== undefined
  const help = TAG_HELP[tag]
  const structure = tagStructure(tag)
  const uses = tag ? templateUses(tag) : []
  const parents = Object.values(TAGS).filter((d) => d.children?.includes(tag))
  const value = node && !hasChildren(node) ? node.value : ''
  const decoded = value ? describeValue(def, value) : ''
  const inFormat1 = found?.parent?.concat === true

  const header = (
    <div className="help-head">
      <h2>{t('Guida in linea')}</h2>
      <div className="help-head-actions">
        <button
          className={`icon-btn ${locked ? 'active' : ''}`}
          title={locked ? t('Sgancia: segui il puntatore') : t('Fissa su questo tag')}
          onClick={onToggleLock}
        >
          <svg
            className={`pin-icon ${locked ? 'pinned' : ''}`}
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill={locked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 17v5" />
            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
          </svg>
        </button>
        <button className="icon-btn" title={t('Chiudi guida')} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )

  if (!target || (!tag && !raw)) {
    return (
      <aside className="help-panel">
        {header}
        <div className="help-empty">
          {t(
            'Passa il mouse su un tag, su un byte della risposta RAW o su una voce di un DOL per vederne qui la documentazione.'
          )}
        </div>
      </aside>
    )
  }

  if (raw) {
    return (
      <aside className="help-panel">
        {header}
        <div className="help-body">
          <div className="help-title">
            <span className="tag-badge raw">RAW</span>
            <span>{t('Dati raw (senza tag)')}</span>
          </div>
          <p>
            {t(
              'Byte inviati così come sono, senza struttura TLV: è il caso ad esempio della risposta a GET CHALLENGE, che restituisce 8 byte casuali.'
            )}
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="help-panel">
      {header}
      <div className="help-body">
        <div className="help-title">
          <span className="tag-badge">{tag}</span>
          <span>{def.name}</span>
        </div>
        <div className="help-pills">
          {def.source === 'terminal' ? (
            <span className="pill">{t('dato del terminale')}</span>
          ) : known ? (
            <span className="pill">{t('dato della carta')}</span>
          ) : (
            <span className="pill">{t('tag non nel dizionario')}</span>
          )}
          <span className="pill">{isConstructedTag(tag) ? t('costruito') : t('primitivo')}</span>
          {node?.required && <span className="pill req">{t('obbligatorio')}</span>}
          {inFormat1 && <span className="pill f1">{t('senza tag/lunghezza')}</span>}
        </div>

        {def.desc && <p className="help-lead">{t(def.desc)}</p>}
        {node?.hint && <p className="hint">💡 {t(node.hint)}</p>}

        {help && (
          <Section title={t('Utilizzo')}>
            <p>{t(help.usage)}</p>
          </Section>
        )}

        {help && (
          <Section title={t('Nel flusso di pagamento')}>
            <p>{t(help.flow)}</p>
            <ol className="help-flow">
              {PHASES.map((p) => {
                const on = help.phases.includes(p.id)
                return (
                  <li key={p.id} className={on ? 'on' : ''} title={t(p.desc)}>
                    <span className="help-flow-dot" />
                    <span className="help-flow-name">{t(p.name)}</span>
                    {on && <span className="help-flow-desc">{t(p.desc)}</span>}
                  </li>
                )
              })}
            </ol>
          </Section>
        )}

        {node && !hasChildren(node) && (
          <Section title={t('Valore corrente')}>
            {value ? (
              <>
                <div className="help-hex mono">{splitBytes(value).join(' ')}</div>
                {decoded && <div className="help-decoded">{decoded}</div>}
                <ValueDetails def={def} value={value} />
              </>
            ) : (
              <p className="muted">{t('Nessun valore inserito.')}</p>
            )}
          </Section>
        )}

        {LUHN_TAGS.includes(tag) && <LuhnSection pan={panOf(tag, value)} />}

        {node && hasChildren(node) && (
          <Section title={t('Contenuto')}>
            <p className="muted small">
              {t('{n} elementi, {len} byte di valore', {
                n: node.children.length,
                len: valueHex(node).length / 2
              })}
            </p>
            <ul className="help-list">
              {node.children.map((c) => (
                <li key={c.id}>
                  <span className="mono">{c.raw ? 'RAW' : c.tag}</span>{' '}
                  {c.raw ? t('Dati raw') : tagDef(c.tag).name}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {def.options && (
          <Section title={t('Valori noti')}>
            <table className="help-table">
              <tbody>
                {def.options.map((o) => (
                  <tr key={o.value} className={o.value === value ? 'on' : ''}>
                    <td className="mono">{o.value}</td>
                    <td>{t(o.label)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        <Section title={t('Formato')}>
          <table className="help-table">
            <tbody>
              <tr>
                <td>{t('Formato')}</td>
                <td>
                  <span className="mono">{def.format}</span> —{' '}
                  {t(FORMAT_HELP[def.format] ?? FORMAT_HELP.b)}
                </td>
              </tr>
              {!isConstructedTag(tag) && (
                <tr>
                  <td>{t('Lunghezza')}</td>
                  <td>{lengthText(def)}</td>
                </tr>
              )}
              {structure && (
                <tr>
                  <td>{t('Tag BER')}</td>
                  <td>
                    {t('classe {cls}, {kind}, numero {n}', {
                      cls: t(structure.cls),
                      kind: structure.constructed ? t('costruito') : t('primitivo'),
                      n: structure.number
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>

        {(parents.length > 0 || (def.children?.length ?? 0) > 0 || uses.length > 0) && (
          <Section title={t('Contesto')}>
            {parents.length > 0 && (
              <p>
                <span className="muted">{t('Si trova in:')}</span>{' '}
                {parents.map((p) => (
                  <span key={p.tag} className="help-chip" title={p.name}>
                    {p.tag}
                  </span>
                ))}
              </p>
            )}
            {def.children && def.children.length > 0 && (
              <p>
                <span className="muted">{t('Può contenere:')}</span>{' '}
                {def.children.map((c) => (
                  <span key={c} className="help-chip" title={tagDef(c).name}>
                    {c}
                  </span>
                ))}
              </p>
            )}
            {uses.length > 0 && (
              <>
                <div className="muted small">{t('Presente nei template:')}</div>
                <ul className="help-list">
                  {uses.map((u) => (
                    <li key={u.name}>
                      {u.name}
                      {u.command && <span className="muted"> · {u.command}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Section>
        )}

        {help && (
          <Section title={t('Riferimenti')}>
            <p className="mono small">{help.spec}</p>
          </Section>
        )}
      </div>
    </aside>
  )
}
