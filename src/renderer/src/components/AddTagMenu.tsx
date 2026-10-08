import { useEffect, useMemo, useRef, useState } from 'react'
import { ROOT_TAGS, TAGS, tagDef } from '../emv/tags'
import { newId, tagError } from '../emv/tlv'
import { normalizeHex } from '../emv/hex'
import type { TlvNode } from '../emv/types'
import { t } from '../i18n'
import { useEditor } from '../state/context'

const FORMAT1_TAGS = ['82', '94', '9F27', '9F36', '9F26', '9F10', '9F4B']

const MENU_WIDTH = 420
const MENU_MAX_HEIGHT = 400
/** Below this height the menu opens upwards when there is more room above. */
const MENU_MIN_HEIGHT = 260
const GAP = 4
const MARGIN = 8

interface MenuPos {
  left: number
  width: number
  maxHeight: number
  top?: number
  bottom?: number
}

/**
 * The menu uses fixed positioning so it is not clipped by the scrolling editor,
 * and opens upwards when there is not enough room below the button.
 */
function placeMenu(anchor: DOMRect): MenuPos {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(MENU_WIDTH, vw - 2 * MARGIN)
  const left = Math.min(Math.max(anchor.left, MARGIN), vw - width - MARGIN)
  const below = vh - anchor.bottom - GAP - MARGIN
  const above = anchor.top - GAP - MARGIN
  if (below >= MENU_MIN_HEIGHT || below >= above) {
    return { left, width, top: anchor.bottom + GAP, maxHeight: Math.min(MENU_MAX_HEIGHT, below) }
  }
  return { left, width, bottom: vh - anchor.top + GAP, maxHeight: Math.min(MENU_MAX_HEIGHT, above) }
}

interface Props {
  parent: TlvNode | null
  onAdd: (node: TlvNode) => void
  label?: string
}

export default function AddTagMenu({ parent, onAdd, label }: Props): React.JSX.Element {
  const { showHelp } = useEditor()
  const [pos, setPos] = useState<MenuPos | null>(null)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const open = pos !== null

  useEffect(() => {
    if (!open) return
    const close = (): void => setPos(null)
    const onMouseDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    // A fixed menu would drift away from its button: close it when the page scrolls.
    const onScroll = (e: Event): void => {
      if (!menuRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onMouseDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', close)
    }
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
    setPos(null)
    setQuery('')
  }

  const item = (tag: string): React.JSX.Element => (
    <button
      key={tag}
      className="menu-item"
      onClick={() => add(tag)}
      onMouseOver={(e) => {
        e.stopPropagation()
        showHelp({ tag })
      }}
    >
      <span className="tag-badge small">{tag}</span>
      <span>{tagDef(tag).name}</span>
    </button>
  )

  return (
    <div className="add-menu" ref={ref}>
      <button
        className="btn ghost small"
        onClick={(e) => setPos(open ? null : placeMenu(e.currentTarget.getBoundingClientRect()))}
      >
        +{' '}
        {label ??
          (parent ? t('Aggiungi tag in {tag}', { tag: parent.tag }) : t('Aggiungi tag radice'))}
      </button>
      {pos && (
        <div
          ref={menuRef}
          className={`menu ${pos.bottom !== undefined ? 'up' : ''}`}
          style={{
            left: pos.left,
            width: pos.width,
            top: pos.top,
            bottom: pos.bottom,
            maxHeight: pos.maxHeight
          }}
        >
          <input
            autoFocus
            className="input small"
            placeholder={t('Cerca per tag o nome, o digita un tag hex…')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customValid) add(custom)
              if (e.key === 'Escape') setPos(null)
            }}
          />
          <div className="menu-list">
            {customValid && !TAGS[custom] && (
              <button className="menu-item" onClick={() => add(custom)}>
                <span className="tag-badge small">{custom}</span>
                <span>{t('Tag personalizzato')}</span>
              </button>
            )}
            {suggested.filter(matches).length > 0 && (
              <div className="menu-group">
                {parent ? t('Suggeriti per {tag}', { tag: parent.tag }) : t('Suggeriti')}
              </div>
            )}
            {suggested.filter(matches).map(item)}
            {!parent && (
              <button className="menu-item" onClick={() => add('', true)}>
                <span className="tag-badge small raw">RAW</span>
                <span>{t('Dati non TLV (es. GET CHALLENGE)')}</span>
              </button>
            )}
            {others.length > 0 && <div className="menu-group">{t('Altri tag')}</div>}
            {others.map(item)}
          </div>
        </div>
      )}
    </div>
  )
}
