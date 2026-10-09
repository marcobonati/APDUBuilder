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
  /**
   * Asks where to save and writes the documentation: Markdown as is, or the
   * HTML content printed to PDF. Returns the path, or null when cancelled.
   */
  exportDoc: (args: {
    format: 'md' | 'pdf'
    content: string
    suggestedName: string
    title: string
  }) => Promise<string | null>
  /** Reads a project from a known path (recent files); rejects if the file is missing. */
  openProjectPath: (path: string) => Promise<{ path: string; content: string }>
  /** Most recently used project files, newest first. */
  recentFiles: () => Promise<RecentFile[]>
  clearRecent: () => Promise<void>
  /** Subscribes to changes of the recent list; returns the unsubscribe function. */
  onRecentChanged: (cb: (files: RecentFile[]) => void) => () => void
  /** Commands chosen in the native application menu. */
  onMenuCommand: (cb: (cmd: MenuCommandEvent) => void) => () => void
}

export interface RecentFile {
  path: string
  /** "file.emvproj — ~/folder" */
  label: string
}

export interface MenuCommandEvent {
  cmd:
    | 'new'
    | 'open'
    | 'openRecent'
    | 'save'
    | 'saveAs'
    | 'importHex'
    | 'exportDoc'
    | 'toggleHelp'
    | 'undo'
    | 'redo'
  path?: string
}

declare global {
  interface Window {
    /** Missing when the renderer runs outside Electron (plain browser). */
    api?: Api
  }
}
