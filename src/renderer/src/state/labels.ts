import { newId } from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import { LABEL_COLORS } from './store'
import type { LabelDef } from './store'

export function newLabel(name: string, existing: LabelDef[]): LabelDef {
  return { id: newId(), name, color: LABEL_COLORS[existing.length % LABEL_COLORS.length] }
}

/** Labels applied to a node, in project order. */
export function nodeLabels(node: TlvNode, labels: LabelDef[]): LabelDef[] {
  if (!node.labels?.length) return []
  return labels.filter((l) => node.labels!.includes(l.id))
}
