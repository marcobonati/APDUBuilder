import { useMemo, useState } from 'react'
import type { ResponseTemplate } from '../emv/templates'
import { encodeNodes } from '../emv/tlv'
import FileMenu from './FileMenu'
import TemplatePicker from './TemplatePicker'
import type { MenuCommandEvent, RecentFile } from '../../../preload/index.d'
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
  onLang: (lang: Lang) => void
  /** File menu commands (same as the native application menu). */
  onCommand: (cmd: MenuCommandEvent['cmd'], path?: string) => void
  recent: RecentFile[]
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
  const [showResponses, setShowResponses] = useState(true)
  const [showTemplates, setShowTemplates] = useState(true)

  return (
    <nav className="sidebar">
      <div className="project">
        <div className="brand-row">
          <FileMenu recent={props.recent} onCommand={props.onCommand} />
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
      </div>

      <div className="sidebar-scroll">
        <section className="side-section">
          <button className="side-section-head" onClick={() => setShowResponses(!showResponses)}>
            <span className="tpl-caret">{showResponses ? '▾' : '▸'}</span>
            <span className="side-section-title">{t('Response del progetto')}</span>
            <span className="tpl-count">{project.responses.length}</span>
          </button>
          {showResponses && (
            <div className="side-section-body">
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
          )}
        </section>

        <section className="side-section">
          <button className="side-section-head" onClick={() => setShowTemplates(!showTemplates)}>
            <span className="tpl-caret">{showTemplates ? '▾' : '▸'}</span>
            <span className="side-section-title">{t('Template di risposta')}</span>
          </button>
          {showTemplates && (
            <div className="side-section-body">
              <div className="muted small tpl-help">
                {t(
                  'Aggiunge una response al progetto (sostituisce quella attiva se non è ancora stata modificata).'
                )}
              </div>
              <TemplatePicker onSelect={props.onSelectTemplate} />
            </div>
          )}
        </section>
      </div>
    </nav>
  )
}
