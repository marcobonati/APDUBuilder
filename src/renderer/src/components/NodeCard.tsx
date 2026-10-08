import { useEffect, useRef, useState } from 'react'
import { describeValue } from '../emv/formats'
import { normalizeHex } from '../emv/hex'
import { tagDef } from '../emv/tags'
import {
  encodeLength,
  hasChildren,
  isConstructedTag,
  isOmitted,
  tagError,
  valueHex
} from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import { t } from '../i18n'
import { useEditor } from '../state/context'
import AddTagMenu from './AddTagMenu'
import ValueEditor from './editors/ValueEditor'

interface Props {
  node: TlvNode
  parent: TlvNode | null
  index: number
  count: number
  depth: number
}

function TagBadge({ node }: { node: TlvNode }): React.JSX.Element {
  const { dispatch } = useEditor()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(node.tag)

  if (node.raw) return <span className="tag-badge raw">RAW</span>
  if (!editing) {
    return (
      <button
        className="tag-badge"
        title={t('Clicca per cambiare il tag')}
        onClick={(e) => {
          e.stopPropagation()
          setDraft(node.tag)
          setEditing(true)
        }}
      >
        {node.tag}
      </button>
    )
  }
  const err = tagError(draft)
  const commit = (): void => {
    if (!err && draft !== node.tag) {
      // Switching between primitive and constructed resets the content.
      const sameKind = isConstructedTag(draft) === isConstructedTag(node.tag)
      dispatch({
        type: 'update',
        id: node.id,
        patch: sameKind ? { tag: draft } : { tag: draft, value: '', children: [] }
      })
    }
    setEditing(false)
  }
  return (
    <input
      autoFocus
      className={`input small mono tag-edit ${err ? 'invalid' : ''}`}
      value={draft}
      title={err ?? ''}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(normalizeHex(e.target.value))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') setEditing(false)
      }}
    />
  )
}

export default function NodeCard({ node, parent, index, count, depth }: Props): React.JSX.Element {
  const { dispatch, hovered, setHovered, selected, setSelected, scrollTarget, issuesByNode } =
    useEditor()
  const ref = useRef<HTMLDivElement>(null)
  const def = tagDef(node.tag)
  const container = hasChildren(node)
  const inFormat1 = parent?.concat === true
  const vhex = valueHex(node)
  const len = vhex.length / 2
  const issues = issuesByNode.get(node.id) ?? []
  const worst = issues.some((i) => i.level === 'error')
    ? 'error'
    : issues.some((i) => i.level === 'warning')
      ? 'warning'
      : null
  const summary = container ? '' : describeValue(def, node.value)
  const empty = !container && !node.value
  const omitted = !inFormat1 && isOmitted(node)

  useEffect(() => {
    if (scrollTarget?.id === node.id)
      ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [scrollTarget, node.id])

  const update = (patch: Partial<TlvNode>): void => dispatch({ type: 'update', id: node.id, patch })
  const [showLen, setShowLen] = useState(!!node.lengthOverride)

  return (
    <div
      ref={ref}
      className={[
        'node',
        container ? 'container' : 'primitive',
        `depth-${Math.min(depth, 5)}`,
        hovered === node.id ? 'hl' : '',
        selected === node.id ? 'sel' : '',
        worst ? `has-${worst}` : '',
        empty && node.required ? 'todo' : '',
        omitted ? 'omitted' : ''
      ].join(' ')}
      onMouseOver={(e) => {
        e.stopPropagation()
        if (hovered !== node.id) setHovered(node.id)
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (selected !== node.id) setSelected(node.id)
      }}
    >
      <div className="node-head">
        {container && (
          <button
            className="caret"
            title={node.collapsed ? t('Espandi') : t('Comprimi')}
            onClick={(e) => {
              e.stopPropagation()
              update({ collapsed: !node.collapsed })
            }}
          >
            {node.collapsed ? '▸' : '▾'}
          </button>
        )}
        <TagBadge node={node} />
        <div className="node-title">
          <div className="node-name">
            {node.raw ? t('Dati raw (senza tag)') : def.name}
            {node.required ? (
              <span className="pill req">{t('obbligatorio')}</span>
            ) : (
              !node.raw && <span className="pill opt">{t('opzionale')}</span>
            )}
            {node.fixed && <span className="pill fixed">{t('valore da specifica')}</span>}
            {node.concat && <span className="pill f1">{t('formato 1 · valori concatenati')}</span>}
            {inFormat1 && <span className="pill f1">{t('senza tag/lunghezza')}</span>}
          </div>
          {summary && <div className="node-summary">{summary}</div>}
        </div>
        <div className="node-meta">
          {omitted && <span className="pill omit">{t("vuoto · escluso dall'output")}</span>}
          {!node.raw && !inFormat1 && !omitted && (
            <button
              className={`len-badge ${node.lengthOverride ? 'forced' : ''}`}
              title={t('Lunghezza calcolata automaticamente. Clicca per forzarla (test negativi).')}
              onClick={(e) => {
                e.stopPropagation()
                setShowLen(!showLen)
              }}
            >
              L {node.lengthOverride ?? encodeLength(len)}
              <span className="muted"> · {len} B</span>
            </button>
          )}
          {(node.raw || inFormat1) && <span className="len-badge static">{len} B</span>}
          <div className="node-actions">
            <button
              className="icon-btn"
              title={t('Sposta su')}
              disabled={index === 0}
              onClick={() => dispatch({ type: 'move', id: node.id, dir: -1 })}
            >
              ↑
            </button>
            <button
              className="icon-btn"
              title={t('Sposta giù')}
              disabled={index === count - 1}
              onClick={() => dispatch({ type: 'move', id: node.id, dir: 1 })}
            >
              ↓
            </button>
            <button
              className="icon-btn"
              title={t('Duplica')}
              onClick={() => dispatch({ type: 'duplicate', id: node.id })}
            >
              ⧉
            </button>
            <button
              className="icon-btn danger"
              title={t('Rimuovi')}
              onClick={() => dispatch({ type: 'remove', id: node.id })}
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {!node.collapsed && (
        <>
          {(def.desc || node.hint) && (
            <div className="node-desc">
              {node.hint && <span className="hint">💡 {t(node.hint)}. </span>}
              {!node.raw && t(def.desc)}
            </div>
          )}

          {showLen && !node.raw && !inFormat1 && (
            <div className="len-override" onClick={(e) => e.stopPropagation()}>
              <label>
                <input
                  type="checkbox"
                  checked={!!node.lengthOverride}
                  onChange={(e) =>
                    update({
                      lengthOverride: e.target.checked ? encodeLength(len) : null
                    })
                  }
                />
                {t('Forza lunghezza manuale')}
              </label>
              {node.lengthOverride != null && (
                <input
                  className="input small mono"
                  value={node.lengthOverride}
                  onChange={(e) => update({ lengthOverride: normalizeHex(e.target.value) })}
                />
              )}
              <span className="muted small">
                {t('Automatica: {hex} ({n} byte). Utile solo per test negativi.', {
                  hex: encodeLength(len),
                  n: len
                })}
              </span>
            </div>
          )}

          {issues.length > 0 && (
            <ul className="node-issues">
              {issues.map((i, k) => (
                <li key={k} className={i.level}>
                  {i.message}
                </li>
              ))}
            </ul>
          )}

          {container ? (
            <div className="node-children">
              {node.children.length === 0 && (
                <div className="empty-children">{t('Template vuoto')}</div>
              )}
              {node.children.map((c, i) => (
                <NodeCard
                  key={c.id}
                  node={c}
                  parent={node}
                  index={i}
                  count={node.children.length}
                  depth={depth + 1}
                />
              ))}
              <AddTagMenu
                parent={node}
                onAdd={(child) => dispatch({ type: 'add', parentId: node.id, node: child })}
              />
            </div>
          ) : (
            <ValueEditor
              def={def}
              value={node.value}
              example={node.example}
              raw={node.raw}
              onChange={(value) => update({ value })}
            />
          )}
        </>
      )}
    </div>
  )
}
