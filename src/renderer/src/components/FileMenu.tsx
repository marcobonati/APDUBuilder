import { useEffect, useRef, useState } from 'react'
import type { MenuCommandEvent, RecentFile } from '../../../preload/index.d'
import { t } from '../i18n'

type Command = MenuCommandEvent['cmd']

interface Props {
  recent: RecentFile[]
  onCommand: (cmd: Command, path?: string) => void
}

const MAC = navigator.platform.toUpperCase().includes('MAC')

/** Shortcut label in the platform convention: ⇧⌘S on macOS, Ctrl+Shift+S elsewhere. */
function shortcut(key: string, shift = false): string {
  if (MAC) return `${shift ? '⇧' : ''}⌘${key}`
  return `Ctrl+${shift ? 'Shift+' : ''}${key}`
}

interface Item {
  cmd: Command
  label: string
  keys?: string
}

export default function FileMenu({ recent, onCommand }: Props): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  // Recent files exist only in the desktop app (they are real file system paths).
  const hasRecent = window.api !== undefined

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = (cmd: Command, path?: string): void => {
    setOpen(false)
    setRecentOpen(false)
    onCommand(cmd, path)
  }

  const groups: Item[][] = [
    [
      { cmd: 'new', label: t('Nuovo progetto'), keys: shortcut('N') },
      { cmd: 'open', label: t('Apri…'), keys: shortcut('O') }
    ],
    [
      { cmd: 'save', label: t('Salva'), keys: shortcut('S') },
      { cmd: 'saveAs', label: t('Salva come…'), keys: shortcut('S', true) }
    ],
    [
      { cmd: 'importHex', label: t('Importa response da hex…'), keys: shortcut('I') },
      { cmd: 'exportDoc', label: t('Esporta documentazione…'), keys: shortcut('E') }
    ]
  ]

  const item = (it: Item): React.JSX.Element => (
    <button
      key={it.cmd}
      className="fm-item"
      role="menuitem"
      onClick={() => run(it.cmd)}
      onMouseEnter={() => setRecentOpen(false)}
    >
      <span>{it.label}</span>
      {it.keys && <span className="fm-keys">{it.keys}</span>}
    </button>
  )

  return (
    <div className="file-menu" ref={ref}>
      <button
        className={`fm-trigger ${open ? 'active' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {t('File')} <span className="fm-caret">▾</span>
      </button>
      {open && (
        <div className="fm-panel" role="menu">
          {item(groups[0][0])}
          {item(groups[0][1])}
          {hasRecent && (
            <div
              className="fm-sub"
              onMouseEnter={() => setRecentOpen(true)}
              onMouseLeave={() => setRecentOpen(false)}
            >
              <button
                className={`fm-item ${recentOpen ? 'hover' : ''}`}
                role="menuitem"
                aria-haspopup="menu"
                onClick={() => setRecentOpen(!recentOpen)}
              >
                <span>{t('Apri recenti')}</span>
                <span className="fm-keys">▸</span>
              </button>
              {recentOpen && (
                <div className="fm-panel fm-flyout" role="menu">
                  {recent.length === 0 && (
                    <div className="fm-empty">{t('Nessun file recente')}</div>
                  )}
                  {recent.map((f, i) => (
                    <button
                      key={f.path}
                      className="fm-item fm-recent"
                      role="menuitem"
                      title={f.path}
                      onClick={() => run('openRecent', f.path)}
                    >
                      <span className="fm-recent-text">
                        <span className="fm-recent-name">{f.label.split(' — ')[0]}</span>
                        <span className="fm-recent-dir">{f.label.split(' — ')[1] ?? ''}</span>
                      </span>
                      {i < 9 && (
                        <span className="fm-keys">{MAC ? `⌥⌘${i + 1}` : `Ctrl+Alt+${i + 1}`}</span>
                      )}
                    </button>
                  ))}
                  {recent.length > 0 && (
                    <>
                      <div className="fm-sep" />
                      <button
                        className="fm-item"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false)
                          void window.api?.clearRecent()
                        }}
                      >
                        <span>{t('Cancella elenco')}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="fm-sep" />
          {groups[1].map(item)}
          <div className="fm-sep" />
          {groups[2].map(item)}
        </div>
      )}
    </div>
  )
}
