import { useMemo, useState } from 'react'
import { TEMPLATES } from '../emv/templates'
import type { ResponseTemplate } from '../emv/templates'
import { encodeNodes } from '../emv/tlv'
import { LANGS, t } from '../i18n'
import type { Lang } from '../i18n'
import { useEditor } from '../state/context'
import { baseName } from '../state/projectFile'
import type { Project, ResponseDoc } from '../state/store'

interface Props {
  project: Project
  filePath: string | null
  dirty: boolean
  onSelectTemplate: (t: ResponseTemplate) => void
  onImport: () => void
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
  onLang: (lang: Lang) => void
}

function ResponseItem({
  r,
  active,
  index,
  count
}: {
  r: ResponseDoc
  active: boolean
  index: number
  count: number
}): React.JSX.Element {
  const { dispatch } = useEditor()
  const [editing, setEditing] = useState(false)
  const bytes = useMemo(() => encodeNodes(r.nodes).hex.length / 2, [r.nodes])

  return (
    <div
      className={`resp ${active ? 'active' : ''}`}
      onClick={() => dispatch({ type: 'selectResponse', id: r.id })}
      onDoubleClick={() => setEditing(true)}
    >
      {editing ? (
        <input
          autoFocus
          className="input small resp-name-input"
          defaultValue={r.name}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => {
            const name = e.target.value.trim()
            if (name && name !== r.name) dispatch({ type: 'renameResponse', id: r.id, name })
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') setEditing(false)
          }}
        />
      ) : (
        <span className="resp-name" title={t('Doppio clic per rinominare')}>
          {r.name}
        </span>
      )}
      <span className="resp-meta mono">
        {bytes} B · {r.sw}
      </span>
      <span className="resp-actions" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" title={t('Rinomina')} onClick={() => setEditing(true)}>
          ✎
        </button>
        <button
          className="icon-btn"
          title={t('Sposta su')}
          disabled={index === 0}
          onClick={() => dispatch({ type: 'moveResponse', id: r.id, dir: -1 })}
        >
          ↑
        </button>
        <button
          className="icon-btn"
          title={t('Sposta giù')}
          disabled={index === count - 1}
          onClick={() => dispatch({ type: 'moveResponse', id: r.id, dir: 1 })}
        >
          ↓
        </button>
        <button
          className="icon-btn"
          title={t('Duplica')}
          onClick={() => dispatch({ type: 'duplicateResponse', id: r.id })}
        >
          ⧉
        </button>
        <button
          className="icon-btn danger"
          title={t('Elimina')}
          disabled={count <= 1}
          onClick={() => {
            if (window.confirm(t('Eliminare la response "{name}"?', { name: r.name }))) {
              dispatch({ type: 'deleteResponse', id: r.id })
            }
          }}
        >
          ×
        </button>
      </span>
    </div>
  )
}

export default function Sidebar(props: Props): React.JSX.Element {
  const { project, filePath, dirty } = props
  const { dispatch, lang } = useEditor()
  const [showTemplates, setShowTemplates] = useState(true)
  const groups = [...new Set(TEMPLATES.map((tpl) => tpl.group))]

  return (
    <nav className="sidebar">
      <div className="project">
        <div className="brand-row">
          <span className="brand-title">EMV APDU Builder</span>
          <span className="lang-switch" role="group" aria-label={t('Lingua')}>
            {LANGS.map((l) => (
              <button
                key={l.id}
                className={l.id === lang ? 'active' : ''}
                onClick={() => props.onLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </span>
        </div>
        <input
          className="project-name"
          value={project.name}
          title={t('Nome del progetto')}
          spellCheck={false}
          onChange={(e) => dispatch({ type: 'renameProject', name: e.target.value })}
        />
        <div className="project-file small" title={filePath ?? ''}>
          {dirty && <span className="dirty-dot" title={t('Modifiche non salvate')} />}
          {filePath ? `${baseName(filePath)}.emvproj` : t('Non ancora salvato')}
          {dirty && <span className="muted"> · {t('modificato')}</span>}
        </div>
        <div className="project-actions">
          <button className="btn small" onClick={props.onNew} title={`${t('Nuovo progetto')} (⌘N)`}>
            {t('Nuovo')}
          </button>
          <button className="btn small" onClick={props.onOpen} title={`${t('Apri progetto')} (⌘O)`}>
            {t('Apri…')}
          </button>
          <button
            className={`btn small ${dirty ? 'primary' : ''}`}
            onClick={props.onSave}
            title={`${t('Salva')} (⌘S)`}
          >
            {t('Salva')}
          </button>
          <button className="btn small" onClick={props.onSaveAs} title={`${t('Salva come')} (⇧⌘S)`}>
            {t('Salva come…')}
          </button>
        </div>
      </div>

      <div className="sidebar-scroll">
        <div className="tpl-group">
          <div className="tpl-group-title">
            {t('Response del progetto ({n})', { n: project.responses.length })}
          </div>
          {project.responses.map((r, i) => (
            <ResponseItem
              key={r.id}
              r={r}
              active={r.id === project.activeId}
              index={i}
              count={project.responses.length}
            />
          ))}
        </div>

        <div className="tpl-section">
          <button className="tpl-section-head" onClick={() => setShowTemplates(!showTemplates)}>
            {showTemplates ? '▾' : '▸'} {t('Nuova response da template')}
          </button>
          {showTemplates && (
            <>
              <div className="muted small tpl-help">
                {t(
                  'Aggiunge una response al progetto (sostituisce quella attiva se non è ancora stata modificata).'
                )}
              </div>
              {groups.map((g) => (
                <div key={g} className="tpl-group">
                  <div className="tpl-group-title">{t(g)}</div>
                  {TEMPLATES.filter((tpl) => tpl.group === g).map((tpl) => (
                    <button
                      key={tpl.id}
                      className="tpl"
                      onClick={() => props.onSelectTemplate(tpl)}
                    >
                      <span className="tpl-name">{t(tpl.name)}</span>
                      {tpl.command.apdu && (
                        <span className="tpl-cmd mono">{tpl.command.apdu.substr(0, 8)}…</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="sidebar-foot">
        <button className="btn wide" onClick={props.onImport}>
          ⤓ {t('Importa response da hex')}
        </button>
      </div>
    </nav>
  )
}
