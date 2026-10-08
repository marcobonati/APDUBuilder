import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { Action, LabelDef } from './store'
import type { Issue } from '../emv/validate'
import type { Lang } from '../i18n'

/** What the help panel documents: a node of the tree, or just a tag (DOL entries, menus). */
export interface HelpTarget {
  tag: string
  nodeId?: string
}

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
  lang: Lang
  /** Labels defined in the project. */
  labels: LabelDef[]
  /** Shows a tag in the help panel (when it follows the pointer). */
  showHelp: (target: HelpTarget) => void
}

export const EditorContext = createContext<EditorCtx | null>(null)

export function useEditor(): EditorCtx {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('EditorContext mancante')
  return ctx
}
