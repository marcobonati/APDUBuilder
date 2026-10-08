import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import AddTagMenu from './components/AddTagMenu'
import ImportDialog from './components/ImportDialog'
import NodeCard from './components/NodeCard'
import RawPanel from './components/RawPanel'
import Sidebar from './components/Sidebar'
import { TEMPLATES, buildNodes } from './emv/templates'
import type { ResponseTemplate } from './emv/templates'
import { encodeNodes } from './emv/tlv'
import { progress, validate } from './emv/validate'
import type { Issue } from './emv/validate'
import { EditorContext } from './state/context'
import type { EditorCtx } from './state/context'
import { loadSaved, reducer, saveDoc } from './state/store'
import type { Doc, State } from './state/store'

function docFromTemplate(t: ResponseTemplate): Doc {
  return { templateId: t.id, nodes: buildNodes(t.root), sw: t.sw ?? '9000' }
}

function init(): State {
  const doc = loadSaved() ?? docFromTemplate(TEMPLATES[0])
  return { ...doc, past: [], future: [], lastEdit: null }
}

function App(): React.JSX.Element {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [scrollTarget, setScrollTarget] = useState<{
    id: string
    n: number
  } | null>(null)
  const [importing, setImporting] = useState(false)

  const encoded = useMemo(() => encodeNodes(state.nodes), [state.nodes])
  const issues = useMemo(
    () => validate(state.nodes, state.sw, encoded.hex.length / 2),
    [state.nodes, state.sw, encoded]
  )
  const issuesByNode = useMemo(() => {
    const m = new Map<string, Issue[]>()
    for (const i of issues) if (i.nodeId) m.set(i.nodeId, [...(m.get(i.nodeId) ?? []), i])
    return m
  }, [issues])
  const prog = useMemo(() => progress(state.nodes), [state.nodes])

  useEffect(() => {
    const t = setTimeout(
      () =>
        saveDoc({
          templateId: state.templateId,
          nodes: state.nodes,
          sw: state.sw
        }),
      300
    )
    return () => clearTimeout(t)
  }, [state.templateId, state.nodes, state.sw])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
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
      issuesByNode
    }),
    [hovered, selected, scrollTarget, reveal, issuesByNode]
  )

  const template = TEMPLATES.find((t) => t.id === state.templateId)
  const pct = prog.total ? Math.round((prog.filled / prog.total) * 100) : 100

  return (
    <EditorContext.Provider value={ctx}>
      <div className="app">
        <Sidebar
          current={state.templateId}
          onSelect={(t) => dispatch({ type: 'load', doc: docFromTemplate(t) })}
          onImport={() => setImporting(true)}
        />

        <main className="editor">
          <header className="editor-head">
            <div className="editor-title">
              <h1>{template ? `${template.name} – response` : 'Response importata'}</h1>
              <p className="muted">
                {template?.description ??
                  'Response ricostruita da dati esadecimali. Puoi modificare, aggiungere o rimuovere tag.'}
              </p>
              {template && template.command.apdu && (
                <div className="command">
                  <span className="muted small">
                    Comando di riferimento · {template.command.name}
                  </span>
                  <code className="mono">{template.command.apdu}</code>
                  {template.command.note && (
                    <span className="muted small">{template.command.note}</span>
                  )}
                </div>
              )}
            </div>
            <div className="toolbar">
              <div className="progress" title="Campi obbligatori compilati">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="small">
                  {prog.total > 0 && `${prog.filled}/${prog.total} obbligatori · `}
                  {prog.optionalFilled} opzionali compilati
                </span>
              </div>
              <div className="toolbar-buttons">
                <button
                  className="btn small"
                  onClick={() => dispatch({ type: 'fillExamples' })}
                  title="Riempie i campi vuoti con valori di esempio"
                >
                  ✨ Compila con esempi
                </button>
                <button className="btn small" onClick={() => dispatch({ type: 'clearValues' })}>
                  Svuota valori
                </button>
                <button
                  className="btn small"
                  onClick={() => dispatch({ type: 'setCollapsed', collapsed: false })}
                >
                  Espandi
                </button>
                <button
                  className="btn small"
                  onClick={() => dispatch({ type: 'setCollapsed', collapsed: true })}
                >
                  Comprimi
                </button>
                <button
                  className="btn small"
                  disabled={!state.past.length}
                  title="Annulla (⌘Z)"
                  onClick={() => dispatch({ type: 'undo' })}
                >
                  ↶
                </button>
                <button
                  className="btn small"
                  disabled={!state.future.length}
                  title="Ripeti (⇧⌘Z)"
                  onClick={() => dispatch({ type: 'redo' })}
                >
                  ↷
                </button>
              </div>
            </div>
          </header>

          <div className="tree" onMouseLeave={() => setHovered(null)}>
            {state.nodes.length === 0 && (
              <div className="empty-state">
                {state.sw !== '9000'
                  ? `Response senza dati: verrà inviata solo la Status Word ${state.sw}.`
                  : 'Nessun tag. Aggiungi un template radice (es. 6F, 70, 77) o importa una response.'}
              </div>
            )}
            {state.nodes.map((n, i) => (
              <NodeCard
                key={n.id}
                node={n}
                parent={null}
                index={i}
                count={state.nodes.length}
                depth={0}
              />
            ))}
            <AddTagMenu
              parent={null}
              onAdd={(node) => dispatch({ type: 'add', parentId: null, node })}
            />
          </div>
        </main>

        <RawPanel nodes={state.nodes} encoded={encoded} sw={state.sw} issues={issues} />
      </div>

      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onImport={(nodes, sw) => {
            dispatch({
              type: 'load',
              doc: { templateId: 'import', nodes, sw }
            })
            setImporting(false)
          }}
        />
      )}
    </EditorContext.Provider>
  )
}

export default App
