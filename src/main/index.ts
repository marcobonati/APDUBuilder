import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { buildMenu, recentLabel } from './menu'
import { setLang, tr } from './messages'
import {
  addRecent,
  clearRecent,
  loadRecent,
  onRecentChange,
  recentFiles,
  removeRecent
} from './recent'

const isDev = !app.isPackaged

/**
 * DevTools on F12 in development; in production the reload shortcuts are
 * disabled, so a stray Cmd/Ctrl+R cannot discard the open project.
 */
function watchShortcuts(win: BrowserWindow): void {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    if (isDev) {
      if (input.code === 'F12') {
        win.webContents.toggleDevTools()
        event.preventDefault()
      }
    } else if (input.code === 'KeyR' && (input.control || input.meta)) {
      event.preventDefault()
    }
  })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1100,
    minHeight: 600,
    title: 'EMV APDU Builder',
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  const contentsId = mainWindow.webContents.id
  mainWindow.on('close', (e) => {
    if (!dirtyWindows.has(contentsId)) return
    const m = tr()
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      buttons: [m.cancel, m.closeWithoutSaving],
      defaultId: 0,
      cancelId: 0,
      message: m.unsavedTitle,
      detail: m.unsavedDetail
    })
    if (choice === 0) e.preventDefault()
    else dirtyWindows.delete(contentsId)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ---------------- Documentation export ----------------

interface ExportArgs {
  format: 'md' | 'pdf'
  /** Markdown text, or the HTML page to print for PDF. */
  content: string
  suggestedName: string
  title: string
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_') || 'documentazione'
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Prints the generated HTML to an A4 PDF in a hidden, script-less window. */
async function renderPdf(html: string, title: string): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { javascript: false, sandbox: true }
  })
  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    const footer =
      `<div style="font-size:8px;width:100%;padding:0 12mm;color:#8a91a0;display:flex;` +
      `justify-content:space-between;font-family:sans-serif"><span>${escapeHtml(title)}</span>` +
      `<span>${tr().page} <span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`
    return await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: { top: 0.5, bottom: 0.6, left: 0.4, right: 0.4 },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: footer
    })
  } finally {
    win.destroy()
  }
}

// ---------------- Project files ----------------

function projectFilters(): Electron.FileFilter[] {
  return [
    { name: tr().fileType, extensions: ['emvproj'] },
    { name: 'JSON', extensions: ['json'] }
  ]
}

/** WebContents ids of windows whose project has unsaved changes. */
const dirtyWindows = new Set<number>()

function registerProjectIpc(): void {
  ipcMain.handle('project:open', async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const options = {
      title: tr().openTitle,
      filters: projectFilters(),
      properties: ['openFile' as const]
    }
    const r = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
    if (r.canceled || !r.filePaths[0]) return null
    const path = r.filePaths[0]
    const content = await readFile(path, 'utf8')
    addRecent(path)
    return { path, content }
  })

  // Opens a known path (recent files). A missing file is dropped from the list.
  ipcMain.handle('project:openPath', async (_e, path: string) => {
    try {
      const content = await readFile(path, 'utf8')
      addRecent(path)
      return { path, content }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        removeRecent(path)
        throw new Error(tr().fileNotFound)
      }
      throw err
    }
  })

  ipcMain.handle('recent:list', () =>
    recentFiles().map((path) => ({ path, label: recentLabel(path) }))
  )
  ipcMain.handle('recent:clear', () => clearRecent())

  ipcMain.handle(
    'project:save',
    async (e, args: { content: string; path: string | null; suggestedName: string }) => {
      let target = args.path
      if (!target) {
        const win = BrowserWindow.fromWebContents(e.sender)
        const options = {
          title: tr().saveTitle,
          defaultPath: `${safeFileName(args.suggestedName)}.emvproj`,
          filters: projectFilters()
        }
        const r = win
          ? await dialog.showSaveDialog(win, options)
          : await dialog.showSaveDialog(options)
        if (r.canceled || !r.filePath) return null
        target = r.filePath
      }
      await writeFile(target, args.content, 'utf8')
      addRecent(target)
      return target
    }
  )

  ipcMain.handle('doc:export', async (e, args: ExportArgs) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const m = tr()
    const ext = args.format === 'pdf' ? 'pdf' : 'md'
    const options = {
      title: m.exportTitle,
      defaultPath: `${safeFileName(args.suggestedName)}.${ext}`,
      filters: [{ name: args.format === 'pdf' ? m.pdf : m.markdown, extensions: [ext] }]
    }
    const r = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
    if (r.canceled || !r.filePath) return null
    if (args.format === 'pdf')
      await writeFile(r.filePath, await renderPdf(args.content, args.title))
    else await writeFile(r.filePath, args.content, 'utf8')
    return r.filePath
  })

  ipcMain.on('app:lang', (_e, l: string) => {
    if (l !== 'it' && l !== 'en') return
    setLang(l)
    buildMenu()
  })

  ipcMain.on('project:dirty', (e, dirty: boolean) => {
    if (dirty) dirtyWindows.add(e.sender.id)
    else dirtyWindows.delete(e.sender.id)
    BrowserWindow.fromWebContents(e.sender)?.setDocumentEdited(dirty)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Windows: groups the taskbar entries and notifications under the app id.
  if (process.platform === 'win32') {
    app.setAppUserModelId(isDev ? process.execPath : 'com.fabrick.emvapdubuilder')
  }
  app.on('browser-window-created', (_, window) => watchShortcuts(window))

  loadRecent()
  onRecentChange(() => {
    buildMenu()
    const list = recentFiles().map((path) => ({ path, label: recentLabel(path) }))
    BrowserWindow.getAllWindows().forEach((w) => w.webContents.send('recent:changed', list))
  })
  registerProjectIpc()
  buildMenu()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
