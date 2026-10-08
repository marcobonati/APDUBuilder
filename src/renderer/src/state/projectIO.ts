import { PROJECT_EXTENSION } from './projectFile'

/**
 * File access for projects. In Electron it goes through the preload bridge
 * (native dialogs, real paths); in a plain browser it falls back to a file
 * picker and a download.
 */

export async function openProjectFile(): Promise<{ path: string | null; content: string } | null> {
  if (window.api) return window.api.openProject()
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = `.${PROJECT_EXTENSION},.json`
    input.onchange = async () => {
      const file = input.files?.[0]
      resolve(file ? { path: null, content: await file.text() } : null)
    }
    input.click()
  })
}

/** Opens a project from a known path (recent files). Electron only. */
export async function openProjectPath(path: string): Promise<{ path: string; content: string }> {
  if (!window.api) throw new Error('Not available outside the desktop app')
  try {
    return await window.api.openProjectPath(path)
  } catch (e) {
    // Electron wraps errors thrown in the main process: keep only the message.
    const msg = (e as Error).message.replace(
      /^Error invoking remote method '[^']+': (Error: )?/,
      ''
    )
    throw new Error(msg)
  }
}

/** Returns the path written, '' when downloaded in a browser, null when cancelled. */
export async function saveProjectFile(
  content: string,
  path: string | null,
  suggestedName: string
): Promise<string | null> {
  if (window.api) return window.api.saveProject(content, path, suggestedName)
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${suggestedName}.${PROJECT_EXTENSION}`
  a.click()
  URL.revokeObjectURL(url)
  return ''
}

export function notifyDirty(dirty: boolean): void {
  window.api?.setDirty(dirty)
}
