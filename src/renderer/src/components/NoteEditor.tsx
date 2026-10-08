import { useMemo, useState } from 'react'
import { renderMarkdown } from '../docs/markdown'
import { t } from '../i18n'

/** Rendered Markdown note (the HTML is produced from escaped text, see renderMarkdown). */
export function NoteView({ note }: { note: string }): React.JSX.Element {
  const html = useMemo(() => renderMarkdown(note), [note])
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}

interface Props {
  note: string
  onChange: (note: string) => void
  onDone: () => void
}

/** Markdown note editor with a write / preview switch. */
export default function NoteEditor({ note, onChange, onDone }: Props): React.JSX.Element {
  const [preview, setPreview] = useState(false)

  return (
    <div className="note-editor" onClick={(e) => e.stopPropagation()}>
      <div className="note-editor-head">
        <div className="export-tabs">
          <button className={!preview ? 'active' : ''} onClick={() => setPreview(false)}>
            {t('Scrivi')}
          </button>
          <button className={preview ? 'active' : ''} onClick={() => setPreview(true)}>
            {t('Anteprima')}
          </button>
        </div>
        <span className="muted small">{t('Markdown supportato')}</span>
        <button className="btn small" onClick={onDone}>
          {t('Fatto')}
        </button>
      </div>
      {preview ? (
        <div className="note-preview">
          {note.trim() ? (
            <NoteView note={note} />
          ) : (
            <span className="muted small">{t('Nessuna nota.')}</span>
          )}
        </div>
      ) : (
        <textarea
          autoFocus
          className="input note-input"
          rows={Math.min(14, Math.max(4, note.split('\n').length + 1))}
          spellCheck
          placeholder={t(
            'Note sul tag in Markdown: **grassetto**, _corsivo_, `codice`, elenchi, tabelle, link…'
          )}
          value={note}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
              e.preventDefault()
              onDone()
            }
          }}
        />
      )}
    </div>
  )
}
