import { useEffect, useMemo, useRef, useState } from 'react'
import { ROOT_TAGS, TAGS, tagDef } from '../emv/tags'
import { newId, tagError } from '../emv/tlv'
import { normalizeHex } from '../emv/hex'
import type { TlvNode } from '../emv/types'

const FORMAT1_TAGS = ['82', '94', '9F27', '9F36', '9F26', '9F10', '9F4B']

interface Props {
  parent: TlvNode | null
  onAdd: (node: TlvNode) => void
  label?: string
}

export default function AddTagMenu({ parent, onAdd, label }: Props): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const suggested = useMemo(() => {
    if (!parent) return ROOT_TAGS
    if (parent.concat) return FORMAT1_TAGS
    const present = new Set(parent.children.map((c) => c.tag))
    return (tagDef(parent.tag).children ?? []).filter(
      (t) => !present.has(t) || tagDef(t).repeatable
    )
  }, [parent])

  const q = query.trim().toUpperCase()
  const matches = (t: string): boolean =>
    !q || t.includes(q) || tagDef(t).name.toUpperCase().includes(q)
  const others = Object.values(TAGS)
    .filter((d) => d.source !== 'terminal' && !suggested.includes(d.tag) && matches(d.tag))
    .map((d) => d.tag)
  const custom = normalizeHex(query)
  const customValid = custom.length > 0 && !tagError(custom)

  const add = (tag: string, raw = false): void => {
    onAdd({
      id: newId(),
      tag: raw ? '' : tag,
      value: '',
      children: [],
      raw,
      example: raw ? undefined : tagDef(tag).example
    })
    setOpen(false)
    setQuery('')
  }

  const item = (t: string): React.JSX.Element => (
    <button key={t} className="menu-item" onClick={() => add(t)}>
      <span className="tag-badge small">{t}</span>
      <span>{tagDef(t).name}</span>
    </button>
  )

  return (
    <div className="add-menu" ref={ref}>
      <button className="btn ghost small" onClick={() => setOpen(!open)}>
        + {label ?? (parent ? `Aggiungi tag in ${parent.tag}` : 'Aggiungi tag radice')}
      </button>
      {open && (
        <div className="menu">
          <input
            autoFocus
            className="input small"
            placeholder="Cerca per tag o nome, o digita un tag hex…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customValid) add(custom)
              if (e.key === 'Escape') setOpen(false)
            }}
          />
          <div className="menu-list">
            {customValid && !TAGS[custom] && (
              <button className="menu-item" onClick={() => add(custom)}>
                <span className="tag-badge small">{custom}</span>
                <span>Tag personalizzato</span>
              </button>
            )}
            {suggested.filter(matches).length > 0 && (
              <div className="menu-group">Suggeriti{parent ? ` per ${parent.tag}` : ''}</div>
            )}
            {suggested.filter(matches).map(item)}
            {!parent && (
              <button className="menu-item" onClick={() => add('', true)}>
                <span className="tag-badge small raw">RAW</span>
                <span>Dati non TLV (es. GET CHALLENGE)</span>
              </button>
            )}
            {others.length > 0 && <div className="menu-group">Altri tag</div>}
            {others.map(item)}
          </div>
        </div>
      )}
    </div>
  )
}
