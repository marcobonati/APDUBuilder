import { newId } from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import { t } from '../i18n'

/** Content of a single response being designed. */
export interface Doc {
  templateId: string
  nodes: TlvNode[]
  sw: string
}

export interface ResponseDoc extends Doc {
  id: string
  name: string
  /** False until the user edits it: an untouched response is replaced by a new template. */
  touched?: boolean
}

/** Custom label that can be applied to tags (e.g. Dynamic, Static). */
export interface LabelDef {
  id: string
  name: string
  color: string
}

/** Colors offered to new labels, in order. Readable on both themes. */
export const LABEL_COLORS = [
  '#3d7be0',
  '#2e9e5b',
  '#d08a1c',
  '#cf4a4a',
  '#8e5cd9',
  '#1fa3a3',
  '#d4549b',
  '#7a8394'
]

export interface Project {
  name: string
  responses: ResponseDoc[]
  activeId: string
  labels: LabelDef[]
}

export interface State {
  project: Project
  /** File the project was loaded from / saved to. */
  filePath: string | null
  /** Project as last saved or opened; null when it was never saved. */
  savedProject: Project | null
  past: Project[]
  future: Project[]
  /** Id of the node edited by the last update, to merge keystrokes in one undo step. */
  lastEdit: string | null
}

export type Action =
  // Active response content
  | { type: 'load'; doc: Doc; name: string }
  | { type: 'update'; id: string; patch: Partial<TlvNode> }
  | { type: 'add'; parentId: string | null; node: TlvNode }
  | { type: 'remove'; id: string }
  | { type: 'move'; id: string; dir: -1 | 1 }
  | { type: 'duplicate'; id: string }
  | { type: 'setSw'; sw: string }
  | { type: 'fillExamples' }
  | { type: 'clearValues' }
  | { type: 'setCollapsed'; collapsed: boolean }
  | { type: 'reveal'; id: string }
  // Project
  | { type: 'addResponse'; doc: Doc; name: string }
  | { type: 'selectResponse'; id: string }
  | { type: 'renameResponse'; id: string; name: string }
  | { type: 'duplicateResponse'; id: string }
  | { type: 'deleteResponse'; id: string }
  | { type: 'moveResponse'; id: string; dir: -1 | 1 }
  | { type: 'renameProject'; name: string }
  // Labels
  | { type: 'addLabel'; label: LabelDef; applyTo?: string }
  | { type: 'updateLabel'; id: string; patch: Partial<Omit<LabelDef, 'id'>> }
  | { type: 'deleteLabel'; id: string }
  | { type: 'toggleLabel'; nodeId: string; labelId: string }
  | { type: 'openProject'; project: Project; filePath: string | null }
  | { type: 'saved'; filePath: string | null }
  | { type: 'undo' }
  | { type: 'redo' }

const HISTORY = 100

/**
 * Maps every node of the tree. Nodes (and lists) left unchanged by fn keep
 * their identity, which lets memoized components skip untouched subtrees.
 */
export function mapTree(list: TlvNode[], fn: (n: TlvNode) => TlvNode): TlvNode[] {
  let changed = false
  const out = list.map((n) => {
    let m = fn(n)
    if (m.children.length) {
      const children = mapTree(m.children, fn)
      if (children !== m.children) m = { ...m, children }
    }
    if (m !== n) changed = true
    return m
  })
  return changed ? out : list
}

export function findNode(list: TlvNode[], id: string): TlvNode | null {
  for (const n of list) {
    if (n.id === id) return n
    const f = findNode(n.children, id)
    if (f) return f
  }
  return null
}

/** Applies fn to the sibling list that contains id. */
function editSiblings<T extends { id: string; children?: T[] }>(
  list: T[],
  id: string,
  fn: (siblings: T[], i: number) => T[]
): T[] {
  const i = list.findIndex((n) => n.id === id)
  if (i >= 0) return fn(list, i)
  let changed = false
  const out = list.map((n) => {
    if (!n.children?.length) return n
    const children = editSiblings(n.children, id, fn)
    if (children === n.children) return n
    changed = true
    return { ...n, children }
  })
  return changed ? out : list
}

function swap<T>(l: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir
  if (j < 0 || j >= l.length) return l
  const out = [...l]
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}

function cloneWithNewIds(n: TlvNode): TlvNode {
  return { ...n, id: newId(), children: n.children.map(cloneWithNewIds) }
}

export function activeResponse(p: Project): ResponseDoc {
  return p.responses.find((r) => r.id === p.activeId) ?? p.responses[0]
}

export function newResponse(doc: Doc, name: string): ResponseDoc {
  return { ...doc, id: newId(), name }
}

export function newProject(doc: Doc, name: string): Project {
  const r = newResponse(doc, name)
  return { name: t('Nuovo progetto'), responses: [r], activeId: r.id, labels: [] }
}

export function isDirty(s: State): boolean {
  return s.project !== s.savedProject
}

function commit(s: State, project: Project, lastEdit: string | null = null): State {
  const merge = lastEdit !== null && lastEdit === s.lastEdit
  return {
    ...s,
    project,
    past: merge ? s.past : [...s.past.slice(-HISTORY + 1), s.project],
    future: [],
    lastEdit
  }
}

/** Commits a change to the content of the active response. */
function editActive(
  s: State,
  fn: (r: ResponseDoc) => Partial<ResponseDoc>,
  lastEdit: string | null = null
): State {
  const p = s.project
  const active = activeResponse(p)
  const responses = p.responses.map((r) =>
    r.id === active.id ? { ...r, ...fn(r), touched: true } : r
  )
  return commit(s, { ...p, responses }, lastEdit ? `${active.id}:${lastEdit}` : null)
}

/** View-only changes (collapse state) that do not deserve an undo step. */
function viewActive(s: State, fn: (nodes: TlvNode[]) => TlvNode[]): State {
  const p = s.project
  const active = activeResponse(p)
  const responses = p.responses.map((r) => (r.id === active.id ? { ...r, nodes: fn(r.nodes) } : r))
  // Keep the saved reference in sync so that folding does not mark the project dirty.
  const clean = s.savedProject === p
  const project = { ...p, responses }
  return { ...s, project, savedProject: clean ? project : s.savedProject }
}

export function reducer(s: State, a: Action): State {
  const p = s.project
  switch (a.type) {
    case 'load': {
      // Replaces the active response when it is still untouched, otherwise adds a new one.
      const active = activeResponse(p)
      if (!active.touched) {
        const responses = p.responses.map((r) =>
          r.id === active.id ? { ...r, ...a.doc, name: a.name } : r
        )
        return commit(s, { ...p, responses })
      }
      return reducer(s, { type: 'addResponse', doc: a.doc, name: a.name })
    }
    case 'update':
      return editActive(
        s,
        (r) => ({ nodes: mapTree(r.nodes, (n) => (n.id === a.id ? { ...n, ...a.patch } : n)) }),
        a.id
      )
    case 'add':
      return editActive(s, (r) => ({
        nodes:
          a.parentId === null
            ? [...r.nodes, a.node]
            : mapTree(r.nodes, (n) =>
                n.id === a.parentId
                  ? { ...n, collapsed: false, children: [...n.children, a.node] }
                  : n
              )
      }))
    case 'remove':
      return editActive(s, (r) => ({
        nodes: editSiblings(r.nodes, a.id, (l, i) => l.filter((_, j) => j !== i))
      }))
    case 'move':
      return editActive(s, (r) => ({
        nodes: editSiblings(r.nodes, a.id, (l, i) => swap(l, i, a.dir))
      }))
    case 'duplicate':
      return editActive(s, (r) => ({
        nodes: editSiblings(r.nodes, a.id, (l, i) => [
          ...l.slice(0, i + 1),
          cloneWithNewIds(l[i]),
          ...l.slice(i + 1)
        ])
      }))
    case 'setSw':
      return editActive(s, () => ({ sw: a.sw }), 'sw')
    case 'fillExamples':
      return editActive(s, (r) => ({
        nodes: mapTree(r.nodes, (n) => (!n.value && n.example ? { ...n, value: n.example } : n))
      }))
    case 'clearValues':
      return editActive(s, (r) => ({
        nodes: mapTree(r.nodes, (n) => (n.fixed || !n.value ? n : { ...n, value: '' }))
      }))
    case 'setCollapsed':
      return viewActive(s, (nodes) =>
        mapTree(nodes, (n) =>
          n.children.length && !!n.collapsed !== a.collapsed ? { ...n, collapsed: a.collapsed } : n
        )
      )
    case 'reveal':
      return viewActive(s, (nodes) =>
        mapTree(nodes, (n) =>
          n.collapsed && n.id !== a.id && findNode(n.children, a.id)
            ? { ...n, collapsed: false }
            : n
        )
      )

    case 'addResponse': {
      const r = newResponse(a.doc, a.name)
      const i = p.responses.findIndex((x) => x.id === p.activeId)
      const responses = [...p.responses.slice(0, i + 1), r, ...p.responses.slice(i + 1)]
      return commit(s, { ...p, responses, activeId: r.id })
    }
    case 'selectResponse': {
      if (a.id === p.activeId) return s
      // Switching is not an edit: keep the saved reference when the project was clean.
      const project = { ...p, activeId: a.id }
      return {
        ...s,
        project,
        savedProject: s.savedProject === p ? project : s.savedProject,
        lastEdit: null
      }
    }
    case 'renameResponse':
      return commit(
        s,
        {
          ...p,
          responses: p.responses.map((r) =>
            r.id === a.id ? { ...r, name: a.name, touched: true } : r
          )
        },
        `name:${a.id}`
      )
    case 'duplicateResponse': {
      const i = p.responses.findIndex((r) => r.id === a.id)
      if (i < 0) return s
      const src = p.responses[i]
      const copy: ResponseDoc = {
        ...src,
        id: newId(),
        name: `${src.name} (${t('copia')})`,
        nodes: src.nodes.map(cloneWithNewIds),
        touched: true
      }
      const responses = [...p.responses.slice(0, i + 1), copy, ...p.responses.slice(i + 1)]
      return commit(s, { ...p, responses, activeId: copy.id })
    }
    case 'deleteResponse': {
      if (p.responses.length <= 1) return s
      const i = p.responses.findIndex((r) => r.id === a.id)
      const responses = p.responses.filter((r) => r.id !== a.id)
      const activeId =
        p.activeId === a.id ? responses[Math.min(i, responses.length - 1)].id : p.activeId
      return commit(s, { ...p, responses, activeId })
    }
    case 'moveResponse':
      return commit(s, {
        ...p,
        responses: editSiblings(p.responses, a.id, (l, i) => swap(l, i, a.dir))
      })
    case 'renameProject':
      return commit(s, { ...p, name: a.name }, 'project-name')

    case 'addLabel': {
      // Optionally applied right away to the node it was created from (one undo step).
      const responses = !a.applyTo
        ? p.responses
        : p.responses.map((r) =>
            r.id === p.activeId
              ? {
                  ...r,
                  touched: true,
                  nodes: mapTree(r.nodes, (n) =>
                    n.id === a.applyTo ? { ...n, labels: [...(n.labels ?? []), a.label.id] } : n
                  )
                }
              : r
          )
      return commit(s, { ...p, labels: [...p.labels, a.label], responses })
    }
    case 'updateLabel':
      return commit(
        s,
        { ...p, labels: p.labels.map((l) => (l.id === a.id ? { ...l, ...a.patch } : l)) },
        `label:${a.id}`
      )
    case 'deleteLabel': {
      // Also removed from every node of every response.
      const strip = (n: TlvNode): TlvNode =>
        n.labels?.includes(a.id) ? { ...n, labels: n.labels.filter((l) => l !== a.id) } : n
      return commit(s, {
        ...p,
        labels: p.labels.filter((l) => l.id !== a.id),
        responses: p.responses.map((r) => ({ ...r, nodes: mapTree(r.nodes, strip) }))
      })
    }
    case 'toggleLabel':
      return editActive(s, (r) => ({
        nodes: mapTree(r.nodes, (n) => {
          if (n.id !== a.nodeId) return n
          const has = n.labels?.includes(a.labelId)
          const labels = has
            ? n.labels!.filter((l) => l !== a.labelId)
            : [...(n.labels ?? []), a.labelId]
          return { ...n, labels: labels.length ? labels : undefined }
        })
      }))
    case 'openProject':
      return {
        project: a.project,
        filePath: a.filePath,
        savedProject: a.project,
        past: [],
        future: [],
        lastEdit: null
      }
    case 'saved':
      return { ...s, filePath: a.filePath, savedProject: p, lastEdit: null }

    case 'undo': {
      const prev = s.past[s.past.length - 1]
      if (!prev) return s
      return {
        ...s,
        project: prev,
        past: s.past.slice(0, -1),
        future: [p, ...s.future],
        lastEdit: null
      }
    }
    case 'redo': {
      const next = s.future[0]
      if (!next) return s
      return {
        ...s,
        project: next,
        past: [...s.past, p],
        future: s.future.slice(1),
        lastEdit: null
      }
    }
  }
}

// ---------------- Session autosave ----------------

const STORAGE_KEY = 'emv-apdu-builder:session:v2'
const LEGACY_KEY = 'emv-apdu-builder:doc:v1'

interface Session {
  project: Project
  filePath: string | null
  dirty: boolean
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Session
      // Sessions saved before labels existed.
      if (s.project?.responses?.length)
        return { ...s, project: { ...s.project, labels: s.project.labels ?? [] } }
    }
    // Single document saved by the previous version.
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const doc = JSON.parse(legacy) as Doc
      if (Array.isArray(doc.nodes) && typeof doc.sw === 'string') {
        return { project: newProject(doc, 'Response'), filePath: null, dirty: true }
      }
    }
  } catch {
    // Corrupted or unavailable storage: start from scratch.
  }
  return null
}

export function saveSession(s: Session): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // Storage not available: autosave is only a convenience.
  }
}
