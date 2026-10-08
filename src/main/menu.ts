import { BrowserWindow, Menu, app } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'
import { homedir } from 'os'
import { basename, dirname } from 'path'
import { tr } from './messages'
import { clearRecent, recentFiles } from './recent'

/** Commands sent to the renderer, which owns the project state. */
export type MenuCommand =
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

function send(cmd: MenuCommand, path?: string): void {
  const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  win?.webContents.send('menu:command', { cmd, path })
}

/** "progetto.emvproj — ~/Documents/carte" */
export function recentLabel(path: string): string {
  const home = homedir()
  const dir = dirname(path)
  return `${basename(path)} — ${dir.startsWith(home) ? '~' + dir.slice(home.length) : dir}`
}

function recentSubmenu(): MenuItemConstructorOptions[] {
  const m = tr()
  const files = recentFiles()
  if (files.length === 0) return [{ label: m.noRecent, enabled: false }]
  return [
    ...files.map((path, i): MenuItemConstructorOptions => ({
      label: recentLabel(path),
      accelerator: i < 9 ? `CmdOrCtrl+Alt+${i + 1}` : undefined,
      click: () => send('openRecent', path)
    })),
    { type: 'separator' },
    { label: m.clearRecent, click: () => clearRecent() }
  ]
}

/** Builds (or rebuilds, after a language or recent list change) the application menu. */
export function buildMenu(): void {
  const m = tr()
  const mac = process.platform === 'darwin'
  const template: MenuItemConstructorOptions[] = [
    ...(mac ? [{ role: 'appMenu' as const }] : []),
    {
      label: m.file,
      submenu: [
        { label: m.newProject, accelerator: 'CmdOrCtrl+N', click: () => send('new') },
        { label: m.open, accelerator: 'CmdOrCtrl+O', click: () => send('open') },
        { label: m.openRecent, submenu: recentSubmenu() },
        { type: 'separator' },
        { label: m.save, accelerator: 'CmdOrCtrl+S', click: () => send('save') },
        { label: m.saveAs, accelerator: 'Shift+CmdOrCtrl+S', click: () => send('saveAs') },
        { type: 'separator' },
        { label: m.importHex, accelerator: 'CmdOrCtrl+I', click: () => send('importHex') },
        { label: m.exportDoc, accelerator: 'CmdOrCtrl+E', click: () => send('exportDoc') },
        { type: 'separator' },
        mac ? { label: m.close, role: 'close' } : { label: m.quit, role: 'quit' }
      ]
    },
    {
      label: m.edit,
      submenu: [
        // Undo/redo go to the renderer: inside text fields they act on the field,
        // elsewhere on the project history.
        { label: m.undo, accelerator: 'CmdOrCtrl+Z', click: () => send('undo') },
        { label: m.redo, accelerator: 'Shift+CmdOrCtrl+Z', click: () => send('redo') },
        { type: 'separator' },
        { label: m.cut, role: 'cut' },
        { label: m.copy, role: 'copy' },
        { label: m.paste, role: 'paste' },
        { label: m.selectAll, role: 'selectAll' }
      ]
    },
    {
      label: m.view,
      submenu: [
        { label: m.toggleHelp, accelerator: 'F1', click: () => send('toggleHelp') },
        { type: 'separator' },
        ...(app.isPackaged
          ? []
          : [
              { label: m.reload, role: 'reload' as const },
              { label: m.devTools, role: 'toggleDevTools' as const },
              { type: 'separator' as const }
            ]),
        { label: m.resetZoom, role: 'resetZoom' },
        { label: m.zoomIn, role: 'zoomIn' },
        { label: m.zoomOut, role: 'zoomOut' },
        { type: 'separator' },
        { label: m.fullScreen, role: 'togglefullscreen' }
      ]
    },
    { label: m.window, role: 'windowMenu' }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
