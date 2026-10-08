import { app } from 'electron'
import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import { join } from 'path'

/** Most recently used project files, newest first. */
const MAX_RECENT = 10

let items: string[] = []
const listeners = new Set<() => void>()

function storePath(): string {
  return join(app.getPath('userData'), 'recent-projects.json')
}

export function loadRecent(): void {
  try {
    const data = JSON.parse(readFileSync(storePath(), 'utf8'))
    if (Array.isArray(data)) {
      items = data.filter((p): p is string => typeof p === 'string').slice(0, MAX_RECENT)
    }
  } catch {
    items = []
  }
}

export function recentFiles(): string[] {
  return [...items]
}

export function onRecentChange(listener: () => void): void {
  listeners.add(listener)
}

function changed(): void {
  writeFile(storePath(), JSON.stringify(items, null, 2)).catch(() => {
    // The list is a convenience: failing to persist it is not an error for the user.
  })
  listeners.forEach((l) => l())
}

/** Moves the file to the top of the list (LRU), dropping the oldest entries. */
export function addRecent(path: string): void {
  items = [path, ...items.filter((p) => p !== path)].slice(0, MAX_RECENT)
  app.addRecentDocument(path)
  changed()
}

export function removeRecent(path: string): void {
  if (!items.includes(path)) return
  items = items.filter((p) => p !== path)
  changed()
}

export function clearRecent(): void {
  items = []
  app.clearRecentDocuments()
  changed()
}
