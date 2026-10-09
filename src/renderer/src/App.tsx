import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import AddTagMenu from './components/AddTagMenu'
import ExportDocDialog from './components/ExportDocDialog'
import HelpPanel from './components/HelpPanel'
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
import { createViewStore } from './state/viewStore'
import type { HelpTarget } from './state/viewStore'
import { baseName, parseProject, serializeProject } from './state/projectFile'
import { notifyDirty, openProjectFile, openProjectPath, saveProjectFile } from './state/projectIO'
import {
  activeResponse,
  isDirty,
  loadSession,
  newProject,
  reducer,
  saveSession
} from './state/store'
import type { Doc, State } from './state/store'
import type { MenuCommandEvent, RecentFile } from '../../preload/index.d'

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

const HELP_KEY = 'emv-apdu-builder:help-open'
/** Delay before the help follows the pointer, so crossing other tags does not flicker. */
const HELP_DELAY = 120

function initialHelpOpen(): boolean {
  try {
    return localStorage.getItem(HELP_KEY) !== '0'
  } catch {
    return true
  }
}

type Command = MenuCommandEvent['cmd']

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
  const [view] = useState(createViewStore)
  const [helpOpen, setHelpOpen] = useState(initialHelpOpen)
  const [helpLocked, setHelpLocked] = useState(false)
  const helpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const helpLockedRef = useRef(helpLocked)
  useEffect(() => {
    helpLockedRef.current = helpLocked
  }, [helpLocked])

  // Every hover source (tree, RAW bytes, issue list) also drives the help panel.
  const showHelp = useCallback(
    (target: HelpTarget) => {
      if (helpLockedRef.current) return
      if (helpTimer.current) clearTimeout(helpTimer.current)
      helpTimer.current = setTimeout(() => view.set({ helpTarget: target }), HELP_DELAY)
    },
    [view]
  )
  const setHovered = useCallback(
    (id: string | null) => {
      if (view.get().hovered === id) return
      view.set({ hovered: id })
      if (id) showHelp({ tag: '', nodeId: id })
    },
    [view, showHelp]
  )
  const setSelected = useCallback((id: string | null) => view.set({ selected: id }), [view])
  const toggleHelp = useCallback(() => {
    setHelpOpen((open) => {
      try {
        localStorage.setItem(HELP_KEY, open ? '0' : '1')
      } catch {
        // Only a preference.
      }
      return !open
    })
  }, [])
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
  // Published before paint, so cards never show issues of the previous edit.
  useLayoutEffect(() => view.set({ issuesByNode }), [view, issuesByNode])
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

  const openFile = useCallback(
    async (path?: string): Promise<void> => {
      if (!confirmDiscard()) return
      try {
        const file = path ? await openProjectPath(path) : await openProjectFile()
        if (!file) return
        const project = parseProject(file.content)
        dispatch({ type: 'openProject', project, filePath: file.path })
        showToast(
          t('Aperto "{name}" ({n} response)', { name: project.name, n: project.responses.length })
        )
      } catch (e) {
        showToast(`${t('Impossibile aprire il progetto')}: ${(e as Error).message}`, 'error')
      }
    },
    [confirmDiscard, showToast]
  )

  const createNew = useCallback((): void => {
    if (!confirmDiscard()) return
    dispatch({ type: 'openProject', project: freshProject(), filePath: null })
  }, [confirmDiscard])

  /** Inside a text field undo/redo act on the field, elsewhere on the project history. */
  const undoRedo = useCallback((redo: boolean): void => {
    const el = document.activeElement as HTMLElement | null
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      document.execCommand(redo ? 'redo' : 'undo')
    } else {
      dispatch({ type: redo ? 'redo' : 'undo' })
    }
  }, [])

  const runCommand = useCallback(
    (cmd: Command, path?: string): void => {
      switch (cmd) {
        case 'new':
          return createNew()
        case 'open':
          void openFile()
          return
        case 'openRecent':
          if (path) void openFile(path)
          return
        case 'save':
        case 'saveAs':
          void save(cmd === 'saveAs')
          return
        case 'importHex':
          return setImporting(true)
        case 'exportDoc':
          return setExporting(true)
        case 'toggleHelp':
          return toggleHelp()
        case 'undo':
        case 'redo':
          return undoRedo(cmd === 'redo')
      }
    },
    [createNew, openFile, save, toggleHelp, undoRedo]
  )

  // Native menu, in-app menu and shortcuts all go through fire(). On Windows/Linux a
  // shortcut can reach both the page and the menu accelerator: the same command
  // repeated within a few milliseconds is ignored.
  const commandRef = useRef(runCommand)
  const lastFired = useRef({ key: '', time: 0 })
  useEffect(() => {
    commandRef.current = runCommand
  }, [runCommand])
  const fire = useCallback((cmd: Command, path?: string): void => {
    const key = `${cmd}:${path ?? ''}`
    const now = performance.now()
    if (lastFired.current.key === key && now - lastFired.current.time < 250) return
    lastFired.current = { key, time: now }
    commandRef.current(cmd, path)
  }, [])

  useEffect(() => window.api?.onMenuCommand((e) => fire(e.cmd, e.path)), [fire])

  const [recent, setRecent] = useState<RecentFile[]>([])
  useEffect(() => {
    if (!window.api) return
    window.api.recentFiles().then(setRecent, () => setRecent([]))
    return window.api.onRecentChanged(setRecent)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      let cmd: Command | null = null
      if (e.key === 'F1' || (mod && e.key === '/')) cmd = 'toggleHelp'
      else if (mod && key === 's') cmd = e.shiftKey ? 'saveAs' : 'save'
      else if (mod && key === 'o') cmd = 'open'
      else if (mod && key === 'n') cmd = 'new'
      else if (mod && key === 'e') cmd = 'exportDoc'
      else if (mod && key === 'i') cmd = 'importHex'
      else if (mod && key === 'z') cmd = e.shiftKey ? 'redo' : 'undo'
      else if (mod && key === 'y') cmd = 'redo'
      if (!cmd) return
      e.preventDefault()
      fire(cmd)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fire])

  const reveal = useCallback(
    (id: string) => {
      dispatch({ type: 'reveal', id })
      const n = (view.get().scrollTarget?.n ?? 0) + 1
      view.set({ selected: id, scrollTarget: { id, n } })
    },
    [view]
  )

  const selectTemplate = useCallback(
    (tpl: ResponseTemplate) =>
      dispatch({ type: 'load', doc: docFromTemplate(tpl), name: t(tpl.name) }),
    []
  )
  const changeLang = useCallback((l: Lang) => {
    setLang(l)
    setLangState(l)
  }, [])
  const toggleLock = useCallback(() => setHelpLocked((l) => !l), [])

  const labels = state.project.labels
  const ctx: EditorCtx = useMemo(
    () => ({ dispatch, view, setHovered, setSelected, reveal, lang, labels, showHelp }),
    [view, setHovered, setSelected, reveal, lang, labels, showHelp]
  )

  const template = TEMPLATES.find((tpl) => tpl.id === active.templateId)
  const pct = prog.total ? Math.round((prog.filled / prog.total) * 100) : 100

  return (
    <EditorContext.Provider value={ctx}>
      <div className={`app ${helpOpen ? 'with-help' : ''}`}>
        <Sidebar
          project={state.project}
          filePath={state.filePath}
          dirty={dirty}
          onSelectTemplate={selectTemplate}
          onCommand={fire}
          recent={recent}
          onLang={changeLang}
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
                  className={`btn small ${helpOpen ? 'primary' : ''}`}
                  onClick={toggleHelp}
                  title={`${t('Mostra o nascondi la guida in linea')} (F1)`}
                >
                  ? {t('Guida')}
                </button>
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
                inFormat1={false}
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

        {helpOpen && (
          <HelpPanel
            nodes={active.nodes}
            locked={helpLocked}
            onToggleLock={toggleLock}
            onClose={toggleHelp}
          />
        )}
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
