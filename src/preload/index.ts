import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'

interface RecentFile {
  path: string
  label: string
}

// Custom APIs for renderer
const api = {
  openProject: (): Promise<{ path: string; content: string } | null> =>
    ipcRenderer.invoke('project:open'),
  saveProject: (
    content: string,
    path: string | null,
    suggestedName: string
  ): Promise<string | null> => ipcRenderer.invoke('project:save', { content, path, suggestedName }),
  setDirty: (dirty: boolean): void => ipcRenderer.send('project:dirty', dirty),
  setLang: (lang: 'it' | 'en'): void => ipcRenderer.send('app:lang', lang),
  exportDoc: (args: {
    format: 'md' | 'pdf'
    content: string
    suggestedName: string
    title: string
  }): Promise<string | null> => ipcRenderer.invoke('doc:export', args),
  openProjectPath: (path: string): Promise<{ path: string; content: string }> =>
    ipcRenderer.invoke('project:openPath', path),
  recentFiles: (): Promise<RecentFile[]> => ipcRenderer.invoke('recent:list'),
  clearRecent: (): Promise<void> => ipcRenderer.invoke('recent:clear'),
  onRecentChanged: (cb: (files: RecentFile[]) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, files: RecentFile[]): void => cb(files)
    ipcRenderer.on('recent:changed', listener)
    return () => ipcRenderer.removeListener('recent:changed', listener)
  },
  onMenuCommand: (cb: (cmd: { cmd: string; path?: string }) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, cmd: { cmd: string; path?: string }): void => cb(cmd)
    ipcRenderer.on('menu:command', listener)
    return () => ipcRenderer.removeListener('menu:command', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
