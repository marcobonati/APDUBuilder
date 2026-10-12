import { tagDef } from '../emv/tags'
import type { TlvNode } from '../emv/types'
import type { LabelDef, Project } from './store'

export interface TagMatch {
  responseId: string
  responseName: string
  node: TlvNode
  /** Tags of the ancestors, outermost first. */
  path: string[]
  /** What matched the query. */
  field: 'tag' | 'name' | 'value' | 'note' | 'label'
}

const MAX_RESULTS = 300

/**
 * Finds the tags of every response matching the query by tag (prefix), name,
 * hex value, note or label. Results are in project order.
 */
export function searchTags(project: Project, query: string, labels: LabelDef[]): TagMatch[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hex = q.replace(/\s+/g, '').toUpperCase()
  const isHex = /^[0-9A-F]+$/.test(hex)
  const labelIds = new Set(labels.filter((l) => l.name.toLowerCase().includes(q)).map((l) => l.id))
  const out: TagMatch[] = []

  const match = (n: TlvNode): TagMatch['field'] | null => {
    if (isHex && n.tag && n.tag.toUpperCase().startsWith(hex)) return 'tag'
    if (n.tag && tagDef(n.tag).name.toLowerCase().includes(q)) return 'name'
    if (isHex && hex.length >= 2 && n.value.toUpperCase().includes(hex)) return 'value'
    if (n.note?.toLowerCase().includes(q)) return 'note'
    if (n.labels?.some((l) => labelIds.has(l))) return 'label'
    return null
  }

  for (const r of project.responses) {
    const walk = (nodes: TlvNode[], path: string[]): void => {
      for (const n of nodes) {
        if (out.length >= MAX_RESULTS) return
        const field = match(n)
        if (field) out.push({ responseId: r.id, responseName: r.name, node: n, path, field })
        if (n.children.length) walk(n.children, [...path, n.tag || 'RAW'])
      }
    }
    walk(r.nodes, [])
  }
  return out
}
