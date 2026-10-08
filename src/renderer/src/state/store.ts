import { newId } from '../emv/tlv'
import type { TlvNode } from '../emv/types'

export interface Doc {
  templateId: string
  nodes: TlvNode[]
  sw: string
}

export interface State extends Doc {
  past: Doc[]
  future: Doc[]
  /** Id of the node edited by the last update, to merge keystrokes in one undo step. */
  lastEdit: string | null
}

export type Action =
  | { type: 'load'; doc: Doc }
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
  | { type: 'undo' }
  | { type: 'redo' }

const HISTORY = 100

export function mapTree(list: TlvNode[], fn: (n: TlvNode) => TlvNode): TlvNode[] {
  return list.map((n) => {
    const m = fn(n)
    return m.children.length ? { ...m, children: mapTree(m.children, fn) } : m
  })
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
function editSiblings(
  list: TlvNode[],
  id: string,
  fn: (siblings: TlvNode[], i: number) => TlvNode[]
): TlvNode[] {
  const i = list.findIndex((n) => n.id === id)
  if (i >= 0) return fn(list, i)
  return list.map((n) =>
    n.children.length ? { ...n, children: editSiblings(n.children, id, fn) } : n
  )
}

function cloneWithNewIds(n: TlvNode): TlvNode {
  return { ...n, id: newId(), children: n.children.map(cloneWithNewIds) }
}

function snapshot(s: State): Doc {
  return { templateId: s.templateId, nodes: s.nodes, sw: s.sw }
}

function commit(s: State, doc: Partial<Doc>, lastEdit: string | null = null): State {
  const merge = lastEdit !== null && lastEdit === s.lastEdit
  return {
    ...s,
    ...doc,
    past: merge ? s.past : [...s.past.slice(-HISTORY + 1), snapshot(s)],
    future: [],
    lastEdit
  }
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'load':
      return commit(s, a.doc)
    case 'update':
      return commit(
        s,
        {
          nodes: mapTree(s.nodes, (n) => (n.id === a.id ? { ...n, ...a.patch } : n))
        },
        a.id
      )
    case 'add':
      if (a.parentId === null) return commit(s, { nodes: [...s.nodes, a.node] })
      return commit(s, {
        nodes: mapTree(s.nodes, (n) =>
          n.id === a.parentId ? { ...n, collapsed: false, children: [...n.children, a.node] } : n
        )
      })
    case 'remove':
      return commit(s, {
        nodes: editSiblings(s.nodes, a.id, (l, i) => l.filter((_, j) => j !== i))
      })
    case 'move':
      return commit(s, {
        nodes: editSiblings(s.nodes, a.id, (l, i) => {
          const j = i + a.dir
          if (j < 0 || j >= l.length) return l
          const out = [...l]
          ;[out[i], out[j]] = [out[j], out[i]]
          return out
        })
      })
    case 'duplicate':
      return commit(s, {
        nodes: editSiblings(s.nodes, a.id, (l, i) => [
          ...l.slice(0, i + 1),
          cloneWithNewIds(l[i]),
          ...l.slice(i + 1)
        ])
      })
    case 'setSw':
      return commit(s, { sw: a.sw }, 'sw')
    case 'fillExamples':
      return commit(s, {
        nodes: mapTree(s.nodes, (n) => (!n.value && n.example ? { ...n, value: n.example } : n))
      })
    case 'clearValues':
      return commit(s, {
        nodes: mapTree(s.nodes, (n) => (n.fixed ? n : { ...n, value: '' }))
      })
    case 'setCollapsed':
      return {
        ...s,
        nodes: mapTree(s.nodes, (n) => (n.children.length ? { ...n, collapsed: a.collapsed } : n))
      }
    case 'reveal':
      return {
        ...s,
        nodes: mapTree(s.nodes, (n) =>
          n.collapsed && n.id !== a.id && findNode(n.children, a.id)
            ? { ...n, collapsed: false }
            : n
        )
      }
    case 'undo': {
      const prev = s.past[s.past.length - 1]
      if (!prev) return s
      return {
        ...s,
        ...prev,
        past: s.past.slice(0, -1),
        future: [snapshot(s), ...s.future],
        lastEdit: null
      }
    }
    case 'redo': {
      const next = s.future[0]
      if (!next) return s
      return {
        ...s,
        ...next,
        past: [...s.past, snapshot(s)],
        future: s.future.slice(1),
        lastEdit: null
      }
    }
  }
}

const STORAGE_KEY = 'emv-apdu-builder:doc:v1'

export function loadSaved(): Doc | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const doc = JSON.parse(raw) as Doc
    return Array.isArray(doc.nodes) && typeof doc.sw === 'string' ? doc : null
  } catch {
    return null
  }
}

export function saveDoc(doc: Doc): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
  } catch {
    // Storage not available: autosave is only a convenience.
  }
}
