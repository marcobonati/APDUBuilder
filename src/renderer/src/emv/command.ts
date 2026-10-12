import { parseAfl } from './formats'
import { hexToBytes, hexToInt, intToHex, isHexBytes, textToHex, toHexByte } from './hex'
import { tagDef } from './tags'
import { INS_NAMES, TEMPLATES, commandOf } from './templates'
import { isConstructedTag, parseDol, valueHex } from './tlv'
import type { TlvNode } from './types'
import { t } from '../i18n'

// Command APDUs (C-APDU) that produce each response of the project. They are
// derived from the response itself and from the responses that precede it in
// the project, following the EMV transaction flow:
//   SELECT PSE (88) → READ RECORD of the directory
//   SELECT PPSE / directory (4F) → SELECT AID
//   SELECT AID (9F38 PDOL) → GET PROCESSING OPTIONS
//   GPO (94 AFL) → READ RECORD, one per record in AFL order
//   records (8C/8D CDOL1/2, 9F49 DDOL) → GENERATE AC, INTERNAL AUTHENTICATE

export const PPSE_NAME = '325041592E5359532E4444463031'
export const PSE_NAME = '315041592E5359532E4444463031'

export type DolSource = 'project' | 'card' | 'default' | 'zero'

export interface DolItem {
  tag: string
  len: number
  value: string
  source: DolSource
}

export interface CommandDol {
  /** Tag of the DOL in the card data (9F38, 8C, 8D, 9F49). */
  tag: string
  name: string
  hex: string
  /** Name of the response the DOL comes from, null for the default DDOL. */
  from: string | null
  items: DolItem[]
}

export interface CommandApdu {
  name: string
  cla: string
  ins: string
  p1: string
  p2: string
  /** Data field, '' when absent (Lc is then omitted). */
  data: string
  /** Le, '' when absent. */
  le: string
  hex: string
  p1Desc?: string
  p2Desc?: string
  dataDesc?: string
  /** How the command was derived. */
  notes: string[]
  warnings: string[]
  dol?: CommandDol
  /** Entered by the user instead of generated. */
  manual: boolean
  /** Generated command, kept when the user enters a manual one. */
  auto?: string
}

/** Response fields the derivation needs, so the project type stays out of the EMV core. */
export interface CommandInput {
  id: string
  name: string
  templateId: string
  nodes: TlvNode[]
  /** Manual C-APDU (hex), overrides the generated one. */
  command?: string
}

type Kind =
  'select' | 'readDir' | 'readRecord' | 'gpo' | 'gac' | 'intAuth' | 'getChallenge' | 'getData'

// ---------------- Terminal data ----------------

function today(): string {
  const d = new Date()
  return [d.getFullYear() % 100, d.getMonth() + 1, d.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('')
}

/** Plausible terminal values used to fill DOLs (Italian terminal, EUR, 1.00 purchase). */
const TERMINAL_DEFAULTS: Record<string, string> = {
  '9F66': 'B620C000',
  '9F02': '000000000100',
  '9F03': '000000000000',
  '9F1A': '0380',
  '95': '0000000000',
  '5F2A': '0978',
  '9C': '00',
  '9F21': '120000',
  '9F37': '12345678',
  '9F35': '22',
  '9F33': 'E0F8C8',
  '9F40': '6000F0A001',
  '9F34': '1F0302',
  '9F09': '0002',
  '9F1E': textToHex('12345678'),
  '9F4E': textToHex('EMV APDU BUILDER'),
  '9F15': '5999',
  '9F16': textToHex('MERCHANT0000001'),
  '9F1C': textToHex('TERM0001'),
  '8A': textToHex('00'),
  '9F7A': '00'
}

export function terminalDefault(tag: string): string | undefined {
  return tag === '9A' ? today() : TERMINAL_DEFAULTS[tag]
}

/** Fits a value to the length requested by a DOL entry (EMV Book 3, 5.4). */
export function fitDolValue(tag: string, value: string, len: number): string {
  const want = len * 2
  if (value.length === want) return value
  const fmt = tagDef(tag).format
  const numeric = fmt === 'n' || fmt === 'date'
  if (value.length > want) return numeric ? value.slice(value.length - want) : value.slice(0, want)
  const pad = (fmt === 'cn' ? 'F' : '0').repeat(want - value.length)
  return numeric ? pad + value : value + pad
}

// ---------------- APDU encoding ----------------

function assemble(
  cla: string,
  ins: string,
  p1: string,
  p2: string,
  data: string,
  le: string
): string {
  const n = data.length / 2
  const lc = !data ? '' : n <= 0xff ? toHexByte(n) : '00' + intToHex(n, 2)
  return cla + ins + p1 + p2 + lc + data + le
}

function make(
  parts: Pick<CommandApdu, 'cla' | 'ins' | 'p1' | 'p2'> & Partial<CommandApdu>
): CommandApdu {
  const data = parts.data ?? ''
  const le = parts.le ?? '00'
  return {
    name: INS_NAMES[parts.ins] ?? '',
    notes: [],
    warnings: [],
    manual: false,
    ...parts,
    data,
    le,
    hex: assemble(parts.cla, parts.ins, parts.p1, parts.p2, data, le)
  }
}

/** Splits a C-APDU entered by the user. */
export function parseApdu(hex: string): CommandApdu {
  const base: CommandApdu = {
    name: '',
    cla: '',
    ins: '',
    p1: '',
    p2: '',
    data: '',
    le: '',
    hex,
    notes: [],
    warnings: [],
    manual: true
  }
  if (!isHexBytes(hex) || hex.length < 8) {
    return {
      ...base,
      warnings: [t('La C-APDU deve contenere almeno 4 byte esadecimali (CLA INS P1 P2)')]
    }
  }
  const b = hexToBytes(hex)
  const out = {
    ...base,
    cla: hex.substr(0, 2),
    ins: hex.substr(2, 2),
    p1: hex.substr(4, 2),
    p2: hex.substr(6, 2)
  }
  out.name = INS_NAMES[out.ins] ?? ''
  if (b.length === 4) return out
  if (b.length === 5) return { ...out, le: hex.substr(8, 2) }
  const lc = b[4]
  if (b.length === 5 + lc) return { ...out, data: hex.substr(10) }
  if (b.length === 6 + lc) return { ...out, data: hex.substr(10, lc * 2), le: hex.substr(-2) }
  return {
    ...out,
    data: hex.substr(10),
    warnings: [t('Lc ({lc}) non coerente con la lunghezza dei dati', { lc: toHexByte(lc) })]
  }
}

// ---------------- Response analysis ----------------

function findTag(nodes: TlvNode[], tag: string): TlvNode | null {
  for (const n of nodes) {
    if (n.tag === tag) return n
    const f = findTag(n.children, tag)
    if (f) return f
  }
  return null
}

function tagValue(nodes: TlvNode[], tag: string): string | null {
  const n = findTag(nodes, tag)
  if (!n) return null
  const v = valueHex(n)
  return v || null
}

function collectValues(nodes: TlvNode[], out: Map<string, string>): void {
  for (const n of nodes) {
    if (n.raw) continue
    if (n.children.length) collectValues(n.children, out)
    else if (!isConstructedTag(n.tag) && n.value && isHexBytes(n.value)) out.set(n.tag, n.value)
  }
}

/** Root that carries the data (first non empty node). */
function rootOf(nodes: TlvNode[]): TlvNode | null {
  return nodes.find((n) => n.raw || n.tag) ?? null
}

/** Response 80 imported from hex: value only, no children. */
function format1Value(root: TlvNode | null): string | null {
  return root && root.tag === '80' && !root.children.length ? valueHex(root) : null
}

function kindOf(r: CommandInput, ctx: Ctx): Kind | null {
  const tpl = TEMPLATES.find((x) => x.id === r.templateId)
  if (tpl) {
    if (tpl.id === 'read-record-pse') return 'readDir'
    switch (commandOf(tpl)?.ins) {
      case 'A4':
        return 'select'
      case 'B2':
        return 'readRecord'
      case 'A8':
        return 'gpo'
      case 'AE':
        return 'gac'
      case '88':
        return 'intAuth'
      case '84':
        return 'getChallenge'
      case 'CA':
        return 'getData'
    }
  }
  // Imported or free responses: recognized from their content.
  const root = rootOf(r.nodes)
  if (!root) return null
  if (root.raw) return 'getChallenge'
  const has = (tag: string): boolean => !!findTag(root.children, tag)
  switch (root.tag) {
    case '6F':
      return 'select'
    case '70':
      return has('61') ? 'readDir' : 'readRecord'
    case '77':
    case '80':
      if (has('82') || has('94')) return 'gpo'
      if (has('9F27') || has('9F26')) return 'gac'
      if (has('9F4B')) return 'intAuth'
      // Format 1 without structure: the first one after the selection is the GPO.
      return ctx.afl ? 'gac' : 'gpo'
  }
  return isConstructedTag(root.tag) ? null : 'getData'
}

// ---------------- Derivation ----------------

interface Ref {
  hex: string
  from: string
}

interface Ctx {
  /** Primitive card data seen so far. */
  values: Map<string, string>
  aids: { aid: string; from: string }[]
  selected: Set<string>
  pse: { sfi: number; next: number; from: string } | null
  pdol: Ref | null
  afl: { records: { sfi: number; rec: number }[]; next: number; from: string } | null
  cdol1: Ref | null
  cdol2: Ref | null
  ddol: Ref | null
  gacCount: number
}

function dolItems(dol: string, ctx: Ctx, terminal: Record<string, string>): DolItem[] {
  return parseDol(dol).map(({ tag, len }) => {
    const user = terminal[tag]
    const def = terminalDefault(tag)
    const card = ctx.values.get(tag)
    const terminalTag = tagDef(tag).source === 'terminal'
    let value: string
    let source: DolSource
    if (user !== undefined) [value, source] = [user, 'project']
    else if (terminalTag && def !== undefined) [value, source] = [def, 'default']
    else if (card !== undefined) [value, source] = [card, 'card']
    else if (def !== undefined) [value, source] = [def, 'default']
    else [value, source] = ['', 'zero']
    return { tag, len, value: fitDolValue(tag, value, len), source }
  })
}

function withDol(
  name: string,
  tag: string,
  ref: Ref | null,
  ctx: Ctx,
  terminal: Record<string, string>,
  warnings: string[]
): { dol?: CommandDol; data: string } {
  if (!ref) return { data: '' }
  try {
    const items = dolItems(ref.hex, ctx, terminal)
    return {
      dol: { tag, name, hex: ref.hex, from: ref.from, items },
      data: items.map((i) => i.value).join('')
    }
  } catch (e) {
    warnings.push(`${name}: ${(e as Error).message}`)
    return { data: '' }
  }
}

function build(
  r: CommandInput,
  kind: Kind,
  ctx: Ctx,
  terminal: Record<string, string>
): CommandApdu {
  const notes: string[] = []
  const warnings: string[] = []
  const tpl = TEMPLATES.find((x) => x.id === r.templateId)
  const root = rootOf(r.nodes)

  switch (kind) {
    case 'select': {
      let name = tagValue(r.nodes, '84')
      if (name) {
        notes.push(t('Nome del DF preso dal tag 84 della response'))
      } else if (r.templateId === 'select-ppse') {
        name = PPSE_NAME
      } else if (r.templateId === 'select-pse') {
        name = PSE_NAME
      } else {
        const next = ctx.aids.find((a) => !ctx.selected.has(a.aid)) ?? ctx.aids[0]
        if (next) {
          name = next.aid
          notes.push(t('AID preso dalla directory entry (4F) di «{name}»', { name: next.from }))
        } else {
          name = tpl ? tpl.command.apdu.slice(10, -2) : ''
          warnings.push(
            t('AID non indicato: compila il tag 84 o aggiungi prima la SELECT PPSE/PSE')
          )
        }
      }
      const what =
        name === PPSE_NAME
          ? 'PPSE (2PAY.SYS.DDF01)'
          : name === PSE_NAME
            ? 'PSE (1PAY.SYS.DDF01)'
            : 'AID'
      return make({
        cla: '00',
        ins: 'A4',
        p1: '04',
        p2: '00',
        data: name,
        name: `SELECT ${what}`,
        p1Desc: t('Selezione per nome (DF name)'),
        p2Desc: t('Prima o unica occorrenza'),
        dataDesc: what,
        notes,
        warnings
      })
    }

    case 'readDir': {
      const sfi = ctx.pse?.sfi ?? 1
      const rec = ctx.pse ? ctx.pse.next++ : 1
      if (ctx.pse) {
        notes.push(
          t('SFI {sfi} dal tag 88 di «{name}», record {rec}', { sfi, name: ctx.pse.from, rec })
        )
      } else {
        warnings.push(t('Nessuna SELECT PSE precedente: uso SFI 1, record 1'))
      }
      return readRecord(sfi, rec, notes, warnings)
    }

    case 'readRecord': {
      const a = ctx.afl
      const next = a?.records[a.next]
      if (a && next) {
        a.next++
        notes.push(
          t("Record {rec} dell'SFI {sfi}: voce {i} di {n} dell'AFL (94) di «{name}»", {
            rec: next.rec,
            sfi: next.sfi,
            i: a.next,
            n: a.records.length,
            name: a.from
          })
        )
        return readRecord(next.sfi, next.rec, notes, warnings)
      }
      warnings.push(
        a
          ? t("Tutti i record dell'AFL sono già stati letti dalle response precedenti")
          : t('Nessuna GPO precedente con AFL (94): SFI e record presi dal template')
      )
      const ref = tpl?.command.apdu || '00B2010C00'
      const p2 = hexToInt(ref.substr(6, 2))
      return readRecord(p2 >> 3, hexToInt(ref.substr(4, 2)), notes, warnings)
    }

    case 'gpo': {
      const { dol, data } = withDol('PDOL', '9F38', ctx.pdol, ctx, terminal, warnings)
      if (ctx.pdol)
        notes.push(t('Dati 83 costruiti dal PDOL (9F38) di «{name}»', { name: ctx.pdol.from }))
      else notes.push(t('Nessun PDOL nella SELECT AID precedente: template 83 vuoto'))
      return make({
        cla: '80',
        ins: 'A8',
        p1: '00',
        p2: '00',
        data: '83' + toHexByte(data.length / 2) + data,
        p1Desc: '',
        p2Desc: '',
        dataDesc: t('Command Template (83) con i dati del PDOL'),
        dol,
        notes,
        warnings
      })
    }

    case 'gac': {
      const second = ctx.gacCount > 0
      const ref = second ? ctx.cdol2 : ctx.cdol1
      const name = second ? 'CDOL2' : 'CDOL1'
      const { dol, data } = withDol(name, second ? '8D' : '8C', ref, ctx, terminal, warnings)
      if (ref) notes.push(t('Dati costruiti dal {dol} di «{name}»', { dol: name, name: ref.from }))
      else warnings.push(t('{dol} non trovato nei record letti in precedenza', { dol: name }))
      if (second) notes.push(t('Seconda GENERATE AC della transazione: usa il CDOL2'))
      // The requested cryptogram is taken from the one returned by the card.
      const cid = tagValue(r.nodes, '9F27') ?? format1Value(root)?.substr(0, 2) ?? null
      const type = cid ? hexToInt(cid) & 0xc0 : 0x80
      const cda = !!tagValue(r.nodes, '9F4B')
      const typeName = type === 0x00 ? 'AAC' : type === 0x40 ? 'TC' : 'ARQC'
      if (cid)
        notes.push(t('Tipo di crittogramma richiesto ricavato dal CID (9F27) della response'))
      return make({
        cla: '80',
        ins: 'AE',
        p1: toHexByte(type | (cda ? 0x10 : 0)),
        p2: '00',
        data,
        name: `GENERATE AC (${typeName}${cda ? ' + CDA' : ''})`,
        p1Desc: `${typeName}${cda ? t(', firma CDA richiesta') : ''}`,
        p2Desc: '',
        dataDesc: t('Dati del {dol}', { dol: name }),
        dol,
        notes,
        warnings
      })
    }

    case 'intAuth': {
      const ref = ctx.ddol ?? { hex: '9F3704', from: '' }
      const { dol, data } = withDol('DDOL', '9F49', ref, ctx, terminal, warnings)
      if (dol && !ctx.ddol) dol.from = null
      notes.push(
        ctx.ddol
          ? t('Dati costruiti dal DDOL (9F49) di «{name}»', { name: ctx.ddol.from })
          : t('Nessun DDOL nei record: uso il Default DDOL 9F3704 (Unpredictable Number)')
      )
      return make({
        cla: '00',
        ins: '88',
        p1: '00',
        p2: '00',
        data,
        dataDesc: t('Dati del DDOL'),
        dol,
        notes,
        warnings
      })
    }

    case 'getChallenge':
      return make({ cla: '00', ins: '84', p1: '00', p2: '00', notes, warnings })

    case 'getData': {
      const tag =
        (root && !root.raw ? root.tag : '') || (tpl ? tpl.command.apdu.substr(4, 4) : '') || '9F36'
      const p1p2 = tag.padStart(4, '0').slice(-4)
      notes.push(t('P1-P2 = tag richiesto ({tag} {name})', { tag, name: tagDef(tag).name }))
      return make({
        cla: '80',
        ins: 'CA',
        p1: p1p2.substr(0, 2),
        p2: p1p2.substr(2, 2),
        name: `GET DATA ${tag}`,
        notes,
        warnings
      })
    }
  }
}

function readRecord(sfi: number, rec: number, notes: string[], warnings: string[]): CommandApdu {
  return make({
    cla: '00',
    ins: 'B2',
    p1: toHexByte(rec),
    p2: toHexByte((sfi << 3) | 4),
    name: `READ RECORD SFI ${sfi}, record ${rec}`,
    p1Desc: t('Numero del record ({n})', { n: rec }),
    p2Desc: t('SFI {sfi} << 3 | 4 (P1 è un numero di record)', { sfi }),
    notes,
    warnings
  })
}

/** Updates the context with what the response tells the terminal. */
function learn(ctx: Ctx, r: CommandInput, kind: Kind | null): void {
  collectValues(r.nodes, ctx.values)
  const walk = (nodes: TlvNode[]): void => {
    for (const n of nodes) {
      if (n.tag === '61') {
        const aid = tagValue(n.children, '4F')
        if (aid && !ctx.aids.some((a) => a.aid === aid)) ctx.aids.push({ aid, from: r.name })
      }
      walk(n.children)
    }
  }
  walk(r.nodes)
  const ref = (tag: string): Ref | null => {
    const hex = tagValue(r.nodes, tag)
    return hex ? { hex, from: r.name } : null
  }

  switch (kind) {
    case 'select': {
      const name = tagValue(r.nodes, '84')
      if (name === PSE_NAME || r.templateId === 'select-pse') {
        const sfi = tagValue(r.nodes, '88')
        ctx.pse = { sfi: sfi ? hexToInt(sfi) : 1, next: 1, from: r.name }
      } else if (name !== PPSE_NAME && r.templateId !== 'select-ppse') {
        // New application: the transaction starts over.
        if (name) ctx.selected.add(name)
        ctx.pdol = ref('9F38')
        ctx.afl = null
        ctx.cdol1 = ctx.cdol2 = ctx.ddol = null
        ctx.gacCount = 0
      }
      return
    }
    case 'gpo': {
      const afl = tagValue(r.nodes, '94') ?? format1Value(rootOf(r.nodes))?.substr(4) ?? ''
      const records = parseAfl(afl).flatMap((e) =>
        Array.from({ length: Math.max(0, e.last - e.first + 1) }, (_, i) => ({
          sfi: e.sfi,
          rec: e.first + i
        }))
      )
      ctx.afl = records.length ? { records, next: 0, from: r.name } : null
      ctx.gacCount = 0
      return
    }
    case 'readRecord':
      ctx.cdol1 = ref('8C') ?? ctx.cdol1
      ctx.cdol2 = ref('8D') ?? ctx.cdol2
      ctx.ddol = ref('9F49') ?? ctx.ddol
      return
    case 'gac':
      ctx.gacCount++
      return
  }
}

/**
 * C-APDU of every response, keyed by response id. Null when no command can be
 * derived (e.g. a response made only of a status word, with no manual command).
 */
export function deriveCommands(
  responses: CommandInput[],
  terminal: Record<string, string> = {}
): Map<string, CommandApdu | null> {
  const ctx: Ctx = {
    values: new Map(),
    aids: [],
    selected: new Set(),
    pse: null,
    pdol: null,
    afl: null,
    cdol1: null,
    cdol2: null,
    ddol: null,
    gacCount: 0
  }
  const out = new Map<string, CommandApdu | null>()
  for (const r of responses) {
    const kind = kindOf(r, ctx)
    // Generated even when overridden, so that the following commands keep their position in the flow.
    const auto = kind ? build(r, kind, ctx, terminal) : null
    out.set(r.id, r.command ? { ...parseApdu(r.command), auto: auto?.hex } : auto)
    learn(ctx, r, kind)
  }
  return out
}
