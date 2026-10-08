import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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
  }): Promise<string | null> => ipcRenderer.invoke('doc:export', args)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
