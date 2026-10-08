// Texts of native dialogs and menus, in the language chosen in the renderer.

const IT = {
  cancel: 'Annulla',
  closeWithoutSaving: 'Chiudi senza salvare',
  unsavedTitle: 'Il progetto ha modifiche non salvate',
  unsavedDetail:
    'Le modifiche restano nella sessione, ma non sono state salvate nel file del progetto.',
  openTitle: 'Apri progetto',
  saveTitle: 'Salva progetto',
  fileType: 'Progetto EMV APDU Builder',
  exportTitle: 'Esporta documentazione',
  markdown: 'Documento Markdown',
  pdf: 'Documento PDF',
  page: 'Pagina',
  fileNotFound: 'Il file non esiste più ed è stato rimosso dai recenti',
  // Menu
  file: 'File',
  newProject: 'Nuovo progetto',
  open: 'Apri…',
  openRecent: 'Apri recenti',
  noRecent: 'Nessun file recente',
  clearRecent: 'Cancella elenco',
  save: 'Salva',
  saveAs: 'Salva come…',
  importHex: 'Importa response da hex…',
  exportDoc: 'Esporta documentazione…',
  close: 'Chiudi finestra',
  quit: 'Esci',
  edit: 'Modifica',
  undo: 'Annulla',
  redo: 'Ripeti',
  cut: 'Taglia',
  copy: 'Copia',
  paste: 'Incolla',
  selectAll: 'Seleziona tutto',
  view: 'Vista',
  toggleHelp: 'Guida in linea',
  reload: 'Ricarica',
  devTools: 'Strumenti per sviluppatori',
  resetZoom: 'Dimensione reale',
  zoomIn: 'Ingrandisci',
  zoomOut: 'Riduci',
  fullScreen: 'Schermo intero',
  window: 'Finestra'
}

type Messages = typeof IT

const EN: Messages = {
  cancel: 'Cancel',
  closeWithoutSaving: 'Close without saving',
  unsavedTitle: 'The project has unsaved changes',
  unsavedDetail:
    'Changes are kept in the session, but they have not been saved to the project file.',
  openTitle: 'Open project',
  saveTitle: 'Save project',
  fileType: 'EMV APDU Builder project',
  exportTitle: 'Export documentation',
  markdown: 'Markdown document',
  pdf: 'PDF document',
  page: 'Page',
  fileNotFound: 'The file no longer exists and was removed from the recent list',
  file: 'File',
  newProject: 'New project',
  open: 'Open…',
  openRecent: 'Open recent',
  noRecent: 'No recent files',
  clearRecent: 'Clear list',
  save: 'Save',
  saveAs: 'Save as…',
  importHex: 'Import response from hex…',
  exportDoc: 'Export documentation…',
  close: 'Close window',
  quit: 'Quit',
  edit: 'Edit',
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  selectAll: 'Select all',
  view: 'View',
  toggleHelp: 'Online help',
  reload: 'Reload',
  devTools: 'Developer tools',
  resetZoom: 'Actual size',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fullScreen: 'Full screen',
  window: 'Window'
}

export type Lang = 'it' | 'en'

let lang: Lang = 'it'

export function setLang(l: Lang): void {
  lang = l
}

export function tr(): Messages {
  return lang === 'en' ? EN : IT
}
