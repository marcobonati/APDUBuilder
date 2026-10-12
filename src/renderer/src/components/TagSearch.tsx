import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { tagDef } from '../emv/tags'
import { t } from '../i18n'
import { useEditor } from '../state/context'
import { searchTags } from '../state/search'
import type { Project } from '../state/store'

const PREVIEW = 24

/** Search box over the tags of every response; a result opens its response and reveals the tag. */
export default memo(function TagSearch({
  project,
  onQuery
}: {
  project: Project
  /** Called when the search becomes active or inactive. */
  onQuery: (active: boolean) => void
}): React.JSX.Element {
  const { dispatch, reveal, labels } = useEditor()
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const input = useRef<HTMLInputElement>(null)
  const hits = useMemo(
    () => searchTags(project, deferred, labels),
    [project.responses, deferred, labels] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const active = !!query.trim()

  useEffect(() => onQuery(active), [active, onQuery])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        input.current?.focus()
        input.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="tag-search">
      <div className="tag-search-box">
        <input
          ref={input}
          className="input small"
          value={query}
          placeholder={`${t('Cerca tag')}…`}
          title={`${t('Cerca tag per codice, nome, valore, nota o label')} (⌘F)`}
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('')
          }}
        />
        {query && (
          <button className="icon-btn" title={t('Cancella')} onClick={() => setQuery('')}>
            ×
          </button>
        )}
      </div>
      {active && (
        <div className="search-hits">
          <div className="muted small">
            {hits.length ? t('{n} risultati', { n: hits.length }) : t('Nessun tag trovato')}
          </div>
          {hits.map((h) => (
            <button
              key={`${h.responseId}:${h.node.id}`}
              className={`search-hit ${h.responseId === project.activeId ? 'current' : ''}`}
              onClick={() => {
                dispatch({ type: 'selectResponse', id: h.responseId })
                reveal(h.node.id)
              }}
            >
              <span className="tag-badge small">{h.node.tag || 'RAW'}</span>
              <span className="search-hit-name">
                {h.node.tag ? tagDef(h.node.tag).name : t('Dati raw (senza tag)')}
              </span>
              <span className="search-hit-where small mono">
                {[h.responseName, ...h.path].join(' › ')}
              </span>
              {h.field === 'value' && (
                <span className="search-hit-value small mono">
                  {h.node.value.length > PREVIEW
                    ? `${h.node.value.slice(0, PREVIEW)}…`
                    : h.node.value}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
