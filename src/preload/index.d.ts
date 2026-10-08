import { ElectronAPI } from '@electron-toolkit/preload'

export interface Api {
  /** Shows the open dialog and returns the selected project file, or null if cancelled. */
  openProject: () => Promise<{ path: string; content: string } | null>
  /** Writes the project to path, asking for a location when path is null. Returns the path used. */
  saveProject: (
    content: string,
    path: string | null,
    suggestedName: string
  ) => Promise<string | null>
  setDirty: (dirty: boolean) => void
  /** Language used by native dialogs. */
  setLang: (lang: 'it' | 'en') => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    /** Missing when the renderer runs outside Electron (plain browser). */
    api?: Api
  }
}
