import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

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
    const tr = MESSAGES[lang]
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      buttons: [tr.cancel, tr.closeWithoutSaving],
      defaultId: 0,
      cancelId: 0,
      message: tr.unsavedTitle,
      detail: tr.unsavedDetail
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
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ---------------- Project files ----------------

const MESSAGES = {
  it: {
    cancel: 'Annulla',
    closeWithoutSaving: 'Chiudi senza salvare',
    unsavedTitle: 'Il progetto ha modifiche non salvate',
    unsavedDetail:
      'Le modifiche restano nella sessione, ma non sono state salvate nel file del progetto.',
    openTitle: 'Apri progetto',
    saveTitle: 'Salva progetto',
    fileType: 'Progetto EMV APDU Builder'
  },
  en: {
    cancel: 'Cancel',
    closeWithoutSaving: 'Close without saving',
    unsavedTitle: 'The project has unsaved changes',
    unsavedDetail:
      'Changes are kept in the session, but they have not been saved to the project file.',
    openTitle: 'Open project',
    saveTitle: 'Save project',
    fileType: 'EMV APDU Builder project'
  }
}

/** Language chosen in the renderer, used for native dialogs. */
let lang: keyof typeof MESSAGES = 'it'

function projectFilters(): Electron.FileFilter[] {
  return [
    { name: MESSAGES[lang].fileType, extensions: ['emvproj'] },
    { name: 'JSON', extensions: ['json'] }
  ]
}

/** WebContents ids of windows whose project has unsaved changes. */
const dirtyWindows = new Set<number>()

function registerProjectIpc(): void {
  ipcMain.handle('project:open', async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const options = {
      title: MESSAGES[lang].openTitle,
      filters: projectFilters(),
      properties: ['openFile' as const]
    }
    const r = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
    if (r.canceled || !r.filePaths[0]) return null
    const path = r.filePaths[0]
    return { path, content: await readFile(path, 'utf8') }
  })

  ipcMain.handle(
    'project:save',
    async (e, args: { content: string; path: string | null; suggestedName: string }) => {
      let target = args.path
      if (!target) {
        const win = BrowserWindow.fromWebContents(e.sender)
        const options = {
          title: MESSAGES[lang].saveTitle,
          defaultPath: `${args.suggestedName.replace(/[\\/:*?"<>|]/g, '_')}.emvproj`,
          filters: projectFilters()
        }
        const r = win
          ? await dialog.showSaveDialog(win, options)
          : await dialog.showSaveDialog(options)
        if (r.canceled || !r.filePath) return null
        target = r.filePath
      }
      await writeFile(target, args.content, 'utf8')
      return target
    }
  )

  ipcMain.on('app:lang', (_e, l: string) => {
    if (l === 'it' || l === 'en') lang = l
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
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.fabrick.emvapdubuilder')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerProjectIpc()
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
