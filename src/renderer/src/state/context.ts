import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { Action } from './store'
import type { Issue } from '../emv/validate'

export interface EditorCtx {
  dispatch: Dispatch<Action>
  hovered: string | null
  setHovered: (id: string | null) => void
  selected: string | null
  setSelected: (id: string | null) => void
  /** Last node requested to be scrolled into view (from the raw panel / issue list). */
  scrollTarget: { id: string; n: number } | null
  reveal: (id: string) => void
  issuesByNode: Map<string, Issue[]>
}

export const EditorContext = createContext<EditorCtx | null>(null)

export function useEditor(): EditorCtx {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('EditorContext mancante')
  return ctx
}
