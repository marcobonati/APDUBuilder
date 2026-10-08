import { useEffect, useRef, useState } from 'react'
import type { TlvNode } from '../emv/types'
import { t } from '../i18n'
import { useEditor } from '../state/context'
import { newLabel } from '../state/labels'
import { LABEL_COLORS } from '../state/store'
import type { LabelDef } from '../state/store'

export function LabelChip({
  label,
  onRemove
}: {
  label: LabelDef
  onRemove?: () => void
}): React.JSX.Element {
  return (
    <span className="label-chip" style={{ '--lc': label.color } as React.CSSProperties}>
      {label.name}
      {onRemove && (
        <button
          className="label-chip-x"
          title={t('Rimuovi label')}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          ×
        </button>
      )}
    </span>
  )
}

/** Button + popover to toggle the project labels on a node, or create a new one. */
export function LabelPicker({ node }: { node: TlvNode }): React.JSX.Element {
  const { dispatch, labels } = useEditor()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const q = query.trim()
  const shown = labels.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()))
  const exact = labels.some((l) => l.name.toLowerCase() === q.toLowerCase())
  const create = (): void => {
    if (!q || exact) return
    dispatch({ type: 'addLabel', label: newLabel(q, labels), applyTo: node.id })
    setQuery('')
  }

  return (
    <span className="label-picker" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        className={`icon-btn ${node.labels?.length ? 'on' : ''}`}
        title={t('Label')}
        onClick={() => setOpen(!open)}
      >
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
          <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="label-pop">
          <input
            autoFocus
            className="input small"
            placeholder={t('Cerca o crea una label…')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
              if (e.key === 'Enter') {
                if (shown.length === 1 && (exact || !q)) {
                  dispatch({ type: 'toggleLabel', nodeId: node.id, labelId: shown[0].id })
                } else create()
              }
            }}
          />
          <div className="label-pop-list">
            {shown.map((l) => (
              <label key={l.id} className="label-pop-item">
                <input
                  type="checkbox"
                  checked={!!node.labels?.includes(l.id)}
                  onChange={() => dispatch({ type: 'toggleLabel', nodeId: node.id, labelId: l.id })}
                />
                <LabelChip label={l} />
              </label>
            ))}
            {labels.length === 0 && !q && (
              <div className="muted small">
                {t('Nessuna label nel progetto: scrivi un nome per crearne una.')}
              </div>
            )}
          </div>
          {q && !exact && (
            <button className="btn small" onClick={create}>
              + {t('Crea "{name}"', { name: q })}
            </button>
          )}
        </div>
      )}
    </span>
  )
}

function LabelRow({ label, count }: { label: LabelDef; count: number }): React.JSX.Element {
  const { dispatch } = useEditor()
  const [editing, setEditing] = useState(false)
  const next = (): string =>
    LABEL_COLORS[(LABEL_COLORS.indexOf(label.color) + 1) % LABEL_COLORS.length]

  return (
    <div className="label-row">
      <button
        className="label-swatch"
        style={{ background: label.color }}
        title={t('Cambia colore')}
        onClick={() => dispatch({ type: 'updateLabel', id: label.id, patch: { color: next() } })}
      />
      {editing ? (
        <input
          autoFocus
          className="input small label-name-input"
          defaultValue={label.name}
          onBlur={(e) => {
            const name = e.target.value.trim()
            if (name && name !== label.name) {
              dispatch({ type: 'updateLabel', id: label.id, patch: { name } })
            }
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') setEditing(false)
          }}
        />
      ) : (
        <span
          className="label-row-name"
          title={t('Doppio clic per rinominare')}
          onDoubleClick={() => setEditing(true)}
        >
          <LabelChip label={label} />
        </span>
      )}
      <span className="label-row-count muted small" title={t('Tag con questa label')}>
        {count}
      </span>
      <span className="label-actions">
        <button className="icon-btn" title={t('Rinomina')} onClick={() => setEditing(true)}>
          ✎
        </button>
        <button
          className="icon-btn danger"
          title={t('Elimina')}
          onClick={() => {
            if (
              count === 0 ||
              window.confirm(
                t('Eliminare la label "{name}"? Verrà rimossa da {n} tag.', {
                  name: label.name,
                  n: count
                })
              )
            ) {
              dispatch({ type: 'deleteLabel', id: label.id })
            }
          }}
        >
          ×
        </button>
      </span>
    </div>
  )
}

/** Project label list in the sidebar: create, rename, recolor, delete. */
export function LabelManager({ usage }: { usage: Map<string, number> }): React.JSX.Element {
  const { dispatch, labels } = useEditor()
  const [draft, setDraft] = useState('')
  const name = draft.trim()
  const duplicate = labels.some((l) => l.name.toLowerCase() === name.toLowerCase())
  const add = (): void => {
    if (!name || duplicate) return
    dispatch({ type: 'addLabel', label: newLabel(name, labels) })
    setDraft('')
  }

  return (
    <>
      {labels.length === 0 && (
        <div className="muted small tpl-help">
          {t(
            'Le label classificano i tag (es. Dynamic, Static) e compaiono nella documentazione esportata.'
          )}
        </div>
      )}
      {labels.map((l) => (
        <LabelRow key={l.id} label={l} count={usage.get(l.id) ?? 0} />
      ))}
      <div className="label-add">
        <input
          className={`input small ${duplicate ? 'invalid' : ''}`}
          placeholder={t('Nuova label…')}
          value={draft}
          title={duplicate ? t('Esiste già una label con questo nome') : ''}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
        />
        <button className="btn small" disabled={!name || duplicate} onClick={add}>
          {t('Aggiungi')}
        </button>
      </div>
    </>
  )
}
