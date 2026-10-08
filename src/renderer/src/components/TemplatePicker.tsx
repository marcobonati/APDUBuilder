import { useState } from 'react'
import { TEMPLATES, TEMPLATE_GROUPS, commandOf } from '../emv/templates'
import type { Iface, ResponseTemplate } from '../emv/templates'
import { t } from '../i18n'

interface Props {
  onSelect: (tpl: ResponseTemplate) => void
}

const COLLAPSED_KEY = 'emv-apdu-builder:collapsed-template-groups'

const IFACE_LABEL: Record<Iface, string> = {
  contact: 'contact',
  contactless: 'contactless',
  both: 'contact + contactless'
}

function loadCollapsed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function matches(tpl: ResponseTemplate, q: string): boolean {
  if (!q) return true
  const hay = [
    t(tpl.name),
    t(tpl.description),
    t(tpl.group),
    tpl.command.apdu,
    commandOf(tpl)?.name ?? '',
    tpl.scheme ?? '',
    tpl.iface ? IFACE_LABEL[tpl.iface] : ''
  ]
    .join(' ')
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w))
}

export default function TemplatePicker({ onSelect }: Props): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed)
  const q = query.trim()

  const toggle = (id: string): void => {
    const next = new Set(collapsed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCollapsed(next)
    try {
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]))
    } catch {
      // Only a preference.
    }
  }

  const groups = TEMPLATE_GROUPS.map((g) => ({
    ...g,
    items: TEMPLATES.filter((tpl) => tpl.group === g.id && matches(tpl, q))
  })).filter((g) => g.items.length > 0)

  return (
    <div className="tpl-picker">
      <input
        className="input small tpl-search"
        placeholder={t('Cerca template (nome, comando, circuito…)')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
      />
      {groups.length === 0 && (
        <div className="muted small tpl-empty">
          {t('Nessun template corrisponde alla ricerca.')}
        </div>
      )}
      {groups.map((g) => {
        // While searching every group with results is shown expanded.
        const open = q !== '' || !collapsed.has(g.id)
        return (
          <div key={g.id} className={`tpl-card ${open ? 'open' : ''}`}>
            <button className="tpl-card-head" onClick={() => toggle(g.id)} title={t(g.desc)}>
              <span className={`tpl-step ${g.step ? '' : 'util'}`}>{g.step ?? '·'}</span>
              <span className="tpl-card-title">
                <span className="tpl-card-name">{t(g.id)}</span>
                <span className="tpl-card-desc">{t(g.desc)}</span>
              </span>
              <span className="tpl-count">{g.items.length}</span>
              <span className="tpl-caret">{open ? '▾' : '▸'}</span>
            </button>
            {open && (
              <div className="tpl-items">
                {g.items.map((tpl) => {
                  const cmd = commandOf(tpl)
                  return (
                    <button
                      key={tpl.id}
                      className="tpl"
                      onClick={() => onSelect(tpl)}
                      title={t(tpl.description)}
                    >
                      <span className="tpl-name">{t(tpl.name)}</span>
                      <span className="tpl-meta">
                        {cmd && (
                          <span className="tpl-ins mono" title={cmd.name}>
                            {cmd.ins} {cmd.name}
                          </span>
                        )}
                        {tpl.iface && (
                          <span className={`tpl-iface ${tpl.iface}`}>{IFACE_LABEL[tpl.iface]}</span>
                        )}
                        {tpl.scheme && <span className="tpl-scheme">{tpl.scheme}</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
