import { useSyncExternalStore } from 'react'
import type { Issue } from '../emv/validate'

/** What the help panel documents: a node of the tree, or just a tag (DOL entries, menus). */
export interface HelpTarget {
  tag: string
  nodeId?: string
}

/**
 * Volatile view state (pointer, selection, help target, issues). It changes on
 * every mouse move, so it lives outside React state: each component subscribes
 * only to the slice it shows, and hovering a tag re-renders just the cards
 * whose highlight actually changes instead of the whole editor.
 */
export interface ViewState {
  hovered: string | null
  selected: string | null
  /** Last node requested to be scrolled into view (from the raw panel / issue list). */
  scrollTarget: { id: string; n: number } | null
  helpTarget: HelpTarget | null
  issuesByNode: Map<string, Issue[]>
}

export interface ViewStore {
  get: () => ViewState
  set: (patch: Partial<ViewState>) => void
  subscribe: (fn: () => void) => () => void
}

export function createViewStore(): ViewStore {
  let state: ViewState = {
    hovered: null,
    selected: null,
    scrollTarget: null,
    helpTarget: null,
    issuesByNode: new Map()
  }
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set: (patch) => {
      let changed = false
      for (const k in patch) {
        if (patch[k as keyof ViewState] !== state[k as keyof ViewState]) changed = true
      }
      if (!changed) return
      state = { ...state, ...patch }
      listeners.forEach((fn) => fn())
    },
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    }
  }
}

/** Subscribes to a slice of the view state; re-renders only when the slice changes. */
export function useView<T>(store: ViewStore, select: (s: ViewState) => T): T {
  return useSyncExternalStore(store.subscribe, () => select(store.get()))
}
