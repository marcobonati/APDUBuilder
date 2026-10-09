import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { Action, LabelDef } from './store'
import type { Lang } from '../i18n'
import type { HelpTarget, ViewState, ViewStore } from './viewStore'
import { useView } from './viewStore'

export type { HelpTarget }

/**
 * Editor services shared by the tree. Everything here is stable or changes
 * rarely (language, labels): pointer and selection state is read through
 * useViewState so that hovering does not re-render every consumer.
 */
export interface EditorCtx {
  dispatch: Dispatch<Action>
  view: ViewStore
  setHovered: (id: string | null) => void
  setSelected: (id: string | null) => void
  reveal: (id: string) => void
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

export function useViewState<T>(select: (s: ViewState) => T): T {
  return useView(useEditor().view, select)
}
