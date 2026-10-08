import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import AddTagMenu from './components/AddTagMenu'
import ExportDocDialog from './components/ExportDocDialog'
import ImportDialog from './components/ImportDialog'
import NodeCard from './components/NodeCard'
import RawPanel from './components/RawPanel'
import Sidebar from './components/Sidebar'
import { TEMPLATES, buildNodes } from './emv/templates'
import type { ResponseTemplate } from './emv/templates'
import { encodeNodes } from './emv/tlv'
import { progress, validate } from './emv/validate'
import type { Issue } from './emv/validate'
import { initialLang, setLang, t } from './i18n'
import type { Lang } from './i18n'
import { EditorContext } from './state/context'
import type { EditorCtx } from './state/context'
import { baseName, parseProject, serializeProject } from './state/projectFile'
import { notifyDirty, openProjectFile, saveProjectFile } from './state/projectIO'
import {
  activeResponse,
  isDirty,
  loadSession,
  newProject,
  reducer,
  saveSession
} from './state/store'
import type { Doc, State } from './state/store'

function docFromTemplate(tpl: ResponseTemplate): Doc {
  return { templateId: tpl.id, nodes: buildNodes(tpl.root), sw: tpl.sw ?? '9000' }
}

function freshProject(): ReturnType<typeof newProject> {
  return newProject(docFromTemplate(TEMPLATES[0]), t(TEMPLATES[0].name))
}

function init(): State {
  const session = loadSession()
  const project = session?.project ?? freshProject()
  return {
    project,
    filePath: session?.filePath ?? null,
    savedProject: session?.dirty ? null : project,
    past: [],
    future: [],
    lastEdit: null
  }
}

interface Toast {
  text: string
  kind: 'ok' | 'error'
}

function App(): React.JSX.Element {
  // Set before the reducer initializer, which may create a project with translated names.
  const [lang, setLangState] = useState<Lang>(() => {
    const l = initialLang()
    setLang(l)
    return l
  })
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [scrollTarget, setScrollTarget] = useState<{ id: string; n: number } | null>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const active = activeResponse(state.project)
  const dirty = isDirty(state)

  const encoded = useMemo(() => encodeNodes(active.nodes), [active.nodes])
  const issues = useMemo(
    () => validate(active.nodes, active.sw, encoded.hex.length / 2),
    // lang: issue messages are translated when generated.
    [active.nodes, active.sw, encoded, lang] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const issuesByNode = useMemo(() => {
    const m = new Map<string, Issue[]>()
    for (const i of issues) if (i.nodeId) m.set(i.nodeId, [...(m.get(i.nodeId) ?? []), i])
    return m
  }, [issues])
  const prog = useMemo(() => progress(active.nodes), [active.nodes])

  useEffect(() => {
    const t = setTimeout(
      () => saveSession({ project: state.project, filePath: state.filePath, dirty }),
      300
    )
    return () => clearTimeout(t)
  }, [state.project, state.filePath, dirty])

  useEffect(() => {
    notifyDirty(dirty)
    const file = state.filePath ? ` — ${baseName(state.filePath)}.emvproj` : ''
    document.title = `${dirty ? '• ' : ''}${state.project.name}${file} · EMV APDU Builder`
  }, [dirty, state.project.name, state.filePath])

  const showToast = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    setToast({ text, kind })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), toast.kind === 'error' ? 6000 : 2500)
    return () => clearTimeout(t)
  }, [toast])

  // ---------------- Project commands ----------------

  const confirmDiscard = useCallback(
    (): boolean =>
      !dirty ||
      window.confirm(
        t('Il progetto corrente ha modifiche non salvate. Vuoi continuare e perderle?')
      ),
    [dirty]
  )

  const save = useCallback(
    async (saveAs: boolean): Promise<void> => {
      try {
        const path = await saveProjectFile(
          serializeProject(state.project),
          saveAs ? null : state.filePath,
          state.filePath ? baseName(state.filePath) : state.project.name || t('progetto')
        )
        if (path === null) return
        dispatch({ type: 'saved', filePath: path || state.filePath })
        showToast(path ? t('Progetto salvato in {path}', { path }) : t('Progetto scaricato'))
      } catch (e) {
        showToast(`${t('Salvataggio non riuscito')}: ${(e as Error).message}`, 'error')
      }
    },
    [state.project, state.filePath, showToast]
  )

  const open = useCallback(async (): Promise<void> => {
    if (!confirmDiscard()) return
    try {
      const file = await openProjectFile()
      if (!file) return
      const project = parseProject(file.content)
      dispatch({ type: 'openProject', project, filePath: file.path })
      showToast(
        t('Aperto "{name}" ({n} response)', { name: project.name, n: project.responses.length })
      )
    } catch (e) {
      showToast(`${t('Impossibile aprire il progetto')}: ${(e as Error).message}`, 'error')
    }
  }, [confirmDiscard, showToast])

  const createNew = useCallback((): void => {
    if (!confirmDiscard()) return
    dispatch({ type: 'openProject', project: freshProject(), filePath: null })
  }, [confirmDiscard])

  // Latest commands for the global key handler, registered once.
  const exportDoc = useCallback(() => setExporting(true), [])
  const commands = useRef({ save, open, createNew, exportDoc })
  useEffect(() => {
    commands.current = { save, open, createNew, exportDoc }
  }, [save, open, createNew, exportDoc])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      const key = e.key.toLowerCase()
      if (key === 's') {
        e.preventDefault()
        commands.current.save(e.shiftKey)
        return
      }
      if (key === 'o') {
        e.preventDefault()
        commands.current.open()
        return
      }
      if (key === 'e') {
        e.preventDefault()
        commands.current.exportDoc()
        return
      }
      if (key === 'n') {
        e.preventDefault()
        commands.current.createNew()
        return
      }
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (key === 'z') {
        e.preventDefault()
        dispatch({ type: e.shiftKey ? 'redo' : 'undo' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const reveal = useCallback((id: string) => {
    dispatch({ type: 'reveal', id })
    setSelected(id)
    setScrollTarget((s) => ({ id, n: (s?.n ?? 0) + 1 }))
  }, [])

  const ctx: EditorCtx = useMemo(
    () => ({
      dispatch,
      hovered,
      setHovered,
      selected,
      setSelected,
      scrollTarget,
      reveal,
      issuesByNode,
      lang
    }),
    [hovered, selected, scrollTarget, reveal, issuesByNode, lang]
  )

  const template = TEMPLATES.find((tpl) => tpl.id === active.templateId)
  const pct = prog.total ? Math.round((prog.filled / prog.total) * 100) : 100

  return (
    <EditorContext.Provider value={ctx}>
      <div className="app">
        <Sidebar
          project={state.project}
          filePath={state.filePath}
          dirty={dirty}
          onSelectTemplate={(tpl) =>
            dispatch({ type: 'load', doc: docFromTemplate(tpl), name: t(tpl.name) })
          }
          onImport={() => setImporting(true)}
          onNew={createNew}
          onOpen={open}
          onSave={() => save(false)}
          onSaveAs={() => save(true)}
          onExportDoc={exportDoc}
          onLang={(l) => {
            setLang(l)
            setLangState(l)
          }}
        />

        <main className="editor">
          <header className="editor-head">
            <div className="editor-title">
              <h1>{active.name}</h1>
              <p className="muted">
                <span className="pill">
                  {template ? `Template: ${t(template.name)}` : t('Response importata')}
                </span>{' '}
                {template
                  ? t(template.description)
                  : t(
                      'Response ricostruita da dati esadecimali. Puoi modificare, aggiungere o rimuovere tag.'
                    )}
              </p>
              {template && template.command.apdu && (
                <div className="command">
                  <span className="muted small">
                    {t('Comando di riferimento')} · {t(template.command.name)}
                  </span>
                  <code className="mono">{template.command.apdu}</code>
                  {template.command.note && (
                    <span className="muted small">{t(template.command.note)}</span>
                  )}
                </div>
              )}
            </div>
            <div className="toolbar">
              <div className="progress" title={t('Campi obbligatori compilati')}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="small">
                  {prog.total > 0 &&
                    `${t('{n}/{total} obbligatori', { n: prog.filled, total: prog.total })} · `}
                  {t('{n} opzionali compilati', { n: prog.optionalFilled })}
                </span>
              </div>
              <div className="toolbar-buttons">
                <button
                  className="btn small"
                  onClick={() => dispatch({ type: 'fillExamples' })}
                  title={t('Riempie i campi vuoti con valori di esempio')}
                >
                  ✨ {t('Compila con esempi')}
                </button>
                <button className="btn small" onClick={() => dispatch({ type: 'clearValues' })}>
                  {t('Svuota valori')}
                </button>
                <button
                  className="btn small"
                  onClick={() => dispatch({ type: 'setCollapsed', collapsed: false })}
                >
                  {t('Espandi')}
                </button>
                <button
                  className="btn small"
                  onClick={() => dispatch({ type: 'setCollapsed', collapsed: true })}
                >
                  {t('Comprimi')}
                </button>
                <button
                  className="btn small"
                  disabled={!state.past.length}
                  title={`${t('Annulla')} (⌘Z)`}
                  onClick={() => dispatch({ type: 'undo' })}
                >
                  ↶
                </button>
                <button
                  className="btn small"
                  disabled={!state.future.length}
                  title={`${t('Ripeti')} (⇧⌘Z)`}
                  onClick={() => dispatch({ type: 'redo' })}
                >
                  ↷
                </button>
              </div>
            </div>
          </header>

          <div className="tree" onMouseLeave={() => setHovered(null)}>
            {active.nodes.length === 0 && (
              <div className="empty-state">
                {active.sw !== '9000'
                  ? t('Response senza dati: verrà inviata solo la Status Word {sw}.', {
                      sw: active.sw
                    })
                  : t(
                      'Nessun tag. Aggiungi un template radice (es. 6F, 70, 77) o importa una response.'
                    )}
              </div>
            )}
            {active.nodes.map((n, i) => (
              <NodeCard
                key={n.id}
                node={n}
                parent={null}
                index={i}
                count={active.nodes.length}
                depth={0}
              />
            ))}
            <AddTagMenu
              parent={null}
              onAdd={(node) => dispatch({ type: 'add', parentId: null, node })}
            />
          </div>
        </main>

        <RawPanel nodes={active.nodes} encoded={encoded} sw={active.sw} issues={issues} />
      </div>

      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onImport={(nodes, sw) => {
            dispatch({
              type: 'addResponse',
              doc: { templateId: 'import', nodes, sw },
              name: t('Response importata')
            })
            setImporting(false)
          }}
        />
      )}

      {exporting && (
        <ExportDocDialog
          project={state.project}
          onClose={() => setExporting(false)}
          onDone={showToast}
        />
      )}

      {toast && (
        <div className={`toast ${toast.kind}`} onClick={() => setToast(null)}>
          {toast.text}
        </div>
      )}
    </EditorContext.Provider>
  )
}

export default App
