import { newId } from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import { LABEL_COLORS } from './store'
import type { LabelDef, Project, ResponseDoc } from './store'
import { t } from '../i18n'

export const PROJECT_FORMAT = 'emv-apdu-builder-project'
export const PROJECT_VERSION = 1
export const PROJECT_EXTENSION = 'emvproj'

interface FileNode {
  tag: string
  value?: string
  children?: FileNode[]
  raw?: boolean
  concat?: boolean
  required?: boolean
  keepEmpty?: boolean
  fixed?: boolean
  hint?: string
  example?: string
  lengthOverride?: string | null
  note?: string
  /** Label ids, see ProjectFile.labels. */
  labels?: string[]
}

interface FileResponse {
  name: string
  templateId: string
  sw: string
  /** Manual C-APDU, absent when generated. */
  command?: string
  nodes: FileNode[]
}

interface ProjectFile {
  format: typeof PROJECT_FORMAT
  version: number
  name: string
  savedAt: string
  activeIndex: number
  labels?: LabelDef[]
  /** Terminal data used in the generated commands. */
  terminal?: Record<string, string>
  responses: FileResponse[]
}

function toFileNode(n: TlvNode): FileNode {
  const out: FileNode = { tag: n.tag }
  if (n.value) out.value = n.value
  if (n.children.length) out.children = n.children.map(toFileNode)
  if (n.raw) out.raw = true
  if (n.concat) out.concat = true
  if (n.required) out.required = true
  if (n.keepEmpty) out.keepEmpty = true
  if (n.fixed) out.fixed = true
  if (n.hint) out.hint = n.hint
  if (n.example) out.example = n.example
  if (n.lengthOverride) out.lengthOverride = n.lengthOverride
  if (n.note?.trim()) out.note = n.note
  if (n.labels?.length) out.labels = n.labels
  return out
}

/** Serializes the project. Internal ids and view state (collapsed nodes) are not saved. */
export function serializeProject(p: Project): string {
  const file: ProjectFile = {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    name: p.name,
    savedAt: new Date().toISOString(),
    activeIndex: Math.max(
      0,
      p.responses.findIndex((r) => r.id === p.activeId)
    ),
    labels: p.labels.length ? p.labels : undefined,
    terminal: p.terminal && Object.keys(p.terminal).length ? p.terminal : undefined,
    responses: p.responses.map((r) => ({
      name: r.name,
      templateId: r.templateId,
      sw: r.sw,
      command: r.command || undefined,
      nodes: r.nodes.map(toFileNode)
    }))
  }
  return JSON.stringify(file, null, 2) + '\n'
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const str = (v: unknown, def = ''): string => (typeof v === 'string' ? v : def)
const hex = (v: unknown): string => str(v).replace(/\s+/g, '').toUpperCase()

function fromFileNode(v: unknown, path: string, labelIds: Set<string>): TlvNode {
  if (!isObj(v)) throw new Error(`${path}: ${t('nodo non valido')}`)
  if (v.children !== undefined && !Array.isArray(v.children)) {
    throw new Error(`${path}: ${t('"children" deve essere una lista')}`)
  }
  const children = ((v.children as unknown[]) ?? []).map((c, i) =>
    fromFileNode(c, `${path}.${i + 1}`, labelIds)
  )
  const labels = Array.isArray(v.labels)
    ? v.labels.filter((l): l is string => typeof l === 'string' && labelIds.has(l))
    : []
  return {
    id: newId(),
    tag: v.raw ? '' : hex(v.tag),
    value: hex(v.value),
    children,
    raw: v.raw === true || undefined,
    concat: v.concat === true || undefined,
    required: v.required === true || undefined,
    keepEmpty: v.keepEmpty === true || undefined,
    fixed: v.fixed === true || undefined,
    hint: str(v.hint) || undefined,
    example: hex(v.example) || undefined,
    lengthOverride: hex(v.lengthOverride) || null,
    note: str(v.note) || undefined,
    labels: labels.length ? labels : undefined,
    collapsed: false
  }
}

export function parseProject(text: string): Project {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(t('Il file non è un JSON valido'))
  }
  if (!isObj(data) || data.format !== PROJECT_FORMAT) {
    throw new Error(t('Il file non è un progetto EMV APDU Builder'))
  }
  if (typeof data.version !== 'number' || data.version > PROJECT_VERSION) {
    throw new Error(t('Versione del progetto non supportata ({v})', { v: String(data.version) }))
  }
  if (!Array.isArray(data.responses) || data.responses.length === 0) {
    throw new Error(t('Il progetto non contiene response'))
  }
  const labels: LabelDef[] = (Array.isArray(data.labels) ? data.labels : [])
    .filter(isObj)
    .map((l, i) => ({
      id: str(l.id) || newId(),
      name: str(l.name).trim(),
      color: /^#[0-9a-f]{6}$/i.test(str(l.color))
        ? str(l.color)
        : LABEL_COLORS[i % LABEL_COLORS.length]
    }))
    .filter((l) => l.name)
  const labelIds = new Set(labels.map((l) => l.id))
  const responses: ResponseDoc[] = data.responses.map((r: unknown, i: number) => {
    const where = `Response ${i + 1}`
    if (!isObj(r)) throw new Error(`${where}: ${t('formato non valido')}`)
    if (!Array.isArray(r.nodes)) throw new Error(`${where}: ${t('"nodes" mancante')}`)
    const sw = hex(r.sw)
    const command = hex(r.command)
    return {
      id: newId(),
      name: str(r.name, where) || where,
      templateId: str(r.templateId, 'import'),
      sw: /^[0-9A-F]{4}$/.test(sw) ? sw : '9000',
      command: /^([0-9A-F]{2}){4,}$/.test(command) ? command : undefined,
      nodes: r.nodes.map((n: unknown, j: number) =>
        fromFileNode(n, `${where}, ${t('nodo')} ${j + 1}`, labelIds)
      ),
      touched: true
    }
  })
  const terminal: Record<string, string> = {}
  if (isObj(data.terminal)) {
    for (const [tag, v] of Object.entries(data.terminal)) {
      const value = hex(v)
      if (/^([0-9A-F]{2})+$/.test(tag) && /^([0-9A-F]{2})*$/.test(value)) terminal[tag] = value
    }
  }
  const idx = typeof data.activeIndex === 'number' ? data.activeIndex : 0
  return {
    name: str(data.name) || t('Progetto'),
    responses,
    activeId: (responses[idx] ?? responses[0]).id,
    labels,
    terminal: Object.keys(terminal).length ? terminal : undefined
  }
}

/** File name without directory and extension. */
export function baseName(path: string): string {
  return path
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]+$/, '')
}
