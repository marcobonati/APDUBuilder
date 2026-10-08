import { hexToBytes, isHexBytes, toHexByte, bytesToHex } from './hex'
import type { TlvNode } from './types'
import { t } from '../i18n'

export function newId(): string {
  return crypto.randomUUID()
}

export function isConstructedTag(tag: string): boolean {
  if (tag.length < 2) return false
  return (parseInt(tag.substr(0, 2), 16) & 0x20) !== 0
}

/** True when the node encodes its value from its children. */
export function hasChildren(node: TlvNode): boolean {
  return !node.raw && (node.concat === true || isConstructedTag(node.tag))
}

/** Checks the BER-TLV tag structure (subsequent bytes, continuation bit). */
export function tagError(tag: string): string | null {
  if (!tag) return t('Tag vuoto')
  if (!isHexBytes(tag)) return t('Il tag deve essere esadecimale con un numero pari di cifre')
  const bytes = hexToBytes(tag)
  if (bytes[0] === 0x00 || bytes[0] === 0xff)
    return t('Il primo byte del tag non può essere 00 o FF')
  if ((bytes[0] & 0x1f) !== 0x1f) {
    return bytes.length === 1 ? null : t('Tag a 1 byte: i bit b5-b1 del primo byte non sono 11111')
  }
  if (bytes.length === 1)
    return t('Il primo byte indica un tag multi-byte ma manca il byte successivo')
  for (let i = 1; i < bytes.length; i++) {
    const last = i === bytes.length - 1
    const more = (bytes[i] & 0x80) !== 0
    if (last && more)
      return t('Il byte {n} del tag ha b8=1: manca un byte successivo', { n: i + 1 })
    if (!last && !more) return t('Il byte {n} del tag ha b8=0 ma il tag continua', { n: i + 1 })
  }
  return null
}

export function encodeLength(len: number): string {
  if (len < 0x80) return toHexByte(len)
  if (len <= 0xff) return '81' + toHexByte(len)
  if (len <= 0xffff) return '82' + toHexByte(len >> 8) + toHexByte(len)
  return '83' + toHexByte(len >> 16) + toHexByte(len >> 8) + toHexByte(len)
}

export type SegmentKind = 'tag' | 'len' | 'val' | 'sw'

export interface Segment {
  /** Ids of the node owning the bytes and all of its ancestors. */
  path: string[]
  kind: SegmentKind
  hex: string
  depth: number
  autoLength?: boolean
}

export interface Encoded {
  hex: string
  segments: Segment[]
}

/** Primitive values that are not valid hex are left out of the output. */
function safeValue(hex: string): string {
  return isHexBytes(hex) ? hex.toUpperCase() : ''
}

/**
 * Optional primitive fields left empty are not part of the response: emitting
 * them as zero length TLVs is almost never what the user wants.
 */
export function isOmitted(node: TlvNode): boolean {
  return (
    !node.raw &&
    !node.required &&
    !node.keepEmpty &&
    !node.value &&
    !node.lengthOverride &&
    !node.concat &&
    !isConstructedTag(node.tag)
  )
}

function emit(node: TlvNode, path: string[], depth: number, out: Segment[]): void {
  const p = [...path, node.id]
  if (node.raw) {
    out.push({ path: p, kind: 'val', hex: safeValue(node.value), depth })
    return
  }
  const inner: Segment[] = []
  if (node.concat) {
    for (const c of node.children) {
      inner.push({
        path: [...p, c.id],
        kind: 'val',
        hex: safeValue(c.value),
        depth: depth + 1
      })
    }
  } else if (isConstructedTag(node.tag)) {
    for (const c of node.children) if (!isOmitted(c)) emit(c, p, depth + 1, inner)
  } else {
    inner.push({ path: p, kind: 'val', hex: safeValue(node.value), depth })
  }
  const valueLen = inner.reduce((n, s) => n + s.hex.length / 2, 0)
  const override =
    node.lengthOverride && isHexBytes(node.lengthOverride) ? node.lengthOverride : null
  out.push({
    path: p,
    kind: 'tag',
    hex: isHexBytes(node.tag) ? node.tag : '',
    depth
  })
  out.push({
    path: p,
    kind: 'len',
    hex: override ?? encodeLength(valueLen),
    depth,
    autoLength: override === null
  })
  out.push(...inner)
}

export function encodeNodes(nodes: TlvNode[]): Encoded {
  const segments: Segment[] = []
  for (const n of nodes) if (!isOmitted(n)) emit(n, [], 0, segments)
  const nonEmpty = segments.filter((s) => s.hex.length > 0)
  return { hex: nonEmpty.map((s) => s.hex).join(''), segments: nonEmpty }
}

/** Encoded value of constructed nodes. Nodes are immutable, so the cache never goes stale. */
const valueCache = new WeakMap<TlvNode, string>()

/** Value bytes of a node, as they will be encoded. */
export function valueHex(node: TlvNode): string {
  if (node.raw) return safeValue(node.value)
  if (node.concat) return node.children.map((c) => safeValue(c.value)).join('')
  if (isConstructedTag(node.tag)) {
    let hex = valueCache.get(node)
    if (hex === undefined) {
      hex = encodeNodes(node.children).hex
      valueCache.set(node, hex)
    }
    return hex
  }
  return safeValue(node.value)
}

export interface ParseResult {
  nodes: TlvNode[]
  warnings: string[]
}

export function parseTlv(hex: string): ParseResult {
  if (!isHexBytes(hex)) throw new Error(t('Dati non esadecimali o con numero dispari di cifre'))
  const bytes = hexToBytes(hex)
  const warnings: string[] = []
  let pos = 0

  function parseList(end: number): TlvNode[] {
    const out: TlvNode[] = []
    while (pos < end) {
      if (bytes[pos] === 0x00 || bytes[pos] === 0xff) {
        warnings.push(
          t("Byte di padding {b} ignorato all'offset {pos}", { b: toHexByte(bytes[pos]), pos })
        )
        pos++
        continue
      }
      const tagStart = pos
      if ((bytes[pos++] & 0x1f) === 0x1f) {
        do {
          if (pos >= end) throw new Error(t("Tag troncato all'offset {pos}", { pos: tagStart }))
        } while (bytes[pos++] & 0x80)
      }
      const tag = bytesToHex(bytes.slice(tagStart, pos))
      if (pos >= end)
        throw new Error(
          t('Manca la lunghezza del tag {tag} (offset {pos})', { tag, pos: tagStart })
        )
      let len = bytes[pos++]
      if (len & 0x80) {
        const n = len & 0x7f
        if (n === 0 || n > 3) throw new Error(t('Lunghezza non valida per il tag {tag}', { tag }))
        if (pos + n > end) throw new Error(t('Lunghezza troncata per il tag {tag}', { tag }))
        len = 0
        for (let i = 0; i < n; i++) len = len * 256 + bytes[pos++]
      }
      if (pos + len > end) {
        throw new Error(
          t('Il tag {tag} dichiara {len} byte ma ne restano {left} (offset {pos})', {
            tag,
            len,
            left: end - pos,
            pos: tagStart
          })
        )
      }
      const node: TlvNode = { id: newId(), tag, value: '', children: [] }
      if (isConstructedTag(tag)) {
        node.children = parseList(pos + len)
      } else {
        node.value = bytesToHex(bytes.slice(pos, pos + len))
        node.keepEmpty = len === 0
        pos += len
      }
      out.push(node)
    }
    return out
  }

  const nodes = parseList(bytes.length)
  return { nodes, warnings }
}

/** Parses a DOL (tag + 1 byte length list). */
export function parseDol(hex: string): { tag: string; len: number }[] {
  if (!isHexBytes(hex)) throw new Error(t('DOL non esadecimale'))
  const b = hexToBytes(hex)
  const out: { tag: string; len: number }[] = []
  let pos = 0
  while (pos < b.length) {
    const start = pos
    if ((b[pos++] & 0x1f) === 0x1f) {
      do {
        if (pos >= b.length) throw new Error(t('Tag troncato nel DOL'))
      } while (b[pos++] & 0x80)
    }
    if (pos >= b.length) throw new Error(t('Manca la lunghezza nel DOL'))
    out.push({ tag: bytesToHex(b.slice(start, pos)), len: b[pos++] })
  }
  return out
}

export function encodeDol(entries: { tag: string; len: number }[]): string {
  return entries.map((e) => e.tag + toHexByte(e.len)).join('')
}
