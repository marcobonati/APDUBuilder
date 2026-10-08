import { BITFIELDS, describeBits } from './bitfields'
import {
  hexToBytes,
  hexToInt,
  hexToText,
  intToHex,
  isHexBytes,
  isPrintableHex,
  toHexByte
} from './hex'
import { parseDol, tagError } from './tlv'
import type { TagDef } from './types'

// ---------------- Numeric ----------------

/** n: digits left padded with zeros to the field length (or to an even count). */
export function numericToHex(digits: string, def: TagDef): string {
  const fixed = def.min !== undefined && def.min === def.max ? def.max * 2 : 0
  const target = Math.max(fixed, digits.length + (digits.length % 2))
  return digits.padStart(target, '0')
}

/** cn: digits right padded with F to the field length or to an even count. */
export function compressedToHex(digits: string): string {
  return digits.length % 2 ? digits + 'F' : digits
}

export function hexToCompressed(hex: string): string {
  return hex.replace(/F+$/, '')
}

// ---------------- Date ----------------

/** YYMMDD → yyyy-mm-dd (for <input type=date>). */
export function yymmddToIso(hex: string): string {
  if (!/^\d{6}$/.test(hex)) return ''
  const yy = parseInt(hex.substr(0, 2), 10)
  const year = yy < 50 ? 2000 + yy : 1900 + yy
  return `${year}-${hex.substr(2, 2)}-${hex.substr(4, 2)}`
}

export function isoToYymmdd(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? m[1].substr(2) + m[2] + m[3] : ''
}

export function formatYymmdd(hex: string): string {
  if (!/^\d{6}$/.test(hex)) return ''
  return `${hex.substr(4, 2)}/${hex.substr(2, 2)}/20${hex.substr(0, 2)}`
}

// ---------------- AFL ----------------

export interface AflEntry {
  sfi: number
  first: number
  last: number
  oda: number
}

export function parseAfl(hex: string): AflEntry[] {
  const b = hexToBytes(hex)
  const out: AflEntry[] = []
  for (let i = 0; i + 3 < b.length; i += 4) {
    out.push({
      sfi: b[i] >> 3,
      first: b[i + 1],
      last: b[i + 2],
      oda: b[i + 3]
    })
  }
  return out
}

export function encodeAfl(entries: AflEntry[]): string {
  return entries
    .map((e) => toHexByte(e.sfi << 3) + toHexByte(e.first) + toHexByte(e.last) + toHexByte(e.oda))
    .join('')
}

export function aflEntryError(e: AflEntry): string | null {
  if (e.sfi < 1 || e.sfi > 30) return 'SFI deve essere tra 1 e 30'
  if (e.first < 1) return 'Il primo record deve essere ≥ 1'
  if (e.last < e.first) return "L'ultimo record deve essere ≥ del primo"
  if (e.oda > e.last - e.first + 1) return 'I record ODA eccedono i record del gruppo'
  return null
}

// ---------------- CVM List ----------------

export const CVM_METHODS: { value: number; label: string }[] = [
  { value: 0x00, label: 'Fail CVM processing' },
  { value: 0x01, label: 'Plaintext PIN verificato dalla ICC' },
  { value: 0x02, label: 'Enciphered PIN verificato online' },
  { value: 0x03, label: 'Plaintext PIN ICC + firma' },
  { value: 0x04, label: 'Enciphered PIN verificato dalla ICC' },
  { value: 0x05, label: 'Enciphered PIN ICC + firma' },
  { value: 0x1e, label: 'Firma (cartacea)' },
  { value: 0x1f, label: 'Nessun CVM richiesto' },
  { value: 0x3f, label: 'Non disponibile (RFU)' }
]

export const CVM_CONDITIONS: { value: number; label: string }[] = [
  { value: 0x00, label: 'Sempre' },
  { value: 0x01, label: 'Se cash non presidiato' },
  {
    value: 0x02,
    label: 'Se non cash non presidiato, non cash manuale, non cashback'
  },
  { value: 0x03, label: 'Se il terminale supporta il CVM' },
  { value: 0x04, label: 'Se cash manuale' },
  { value: 0x05, label: 'Se acquisto con cashback' },
  { value: 0x06, label: 'Se in valuta applicazione e sotto X' },
  { value: 0x07, label: 'Se in valuta applicazione e sopra X' },
  { value: 0x08, label: 'Se in valuta applicazione e sotto Y' },
  { value: 0x09, label: 'Se in valuta applicazione e sopra Y' }
]

export interface CvmRule {
  method: number
  applyNext: boolean
  condition: number
}

export interface CvmList {
  x: number
  y: number
  rules: CvmRule[]
}

export function parseCvm(hex: string): CvmList {
  const b = hexToBytes(hex)
  const rules: CvmRule[] = []
  for (let i = 8; i + 1 < b.length; i += 2) {
    rules.push({
      method: b[i] & 0x3f,
      applyNext: (b[i] & 0x40) !== 0,
      condition: b[i + 1]
    })
  }
  return {
    x: hexToInt(hex.substr(0, 8)),
    y: hexToInt(hex.substr(8, 8)),
    rules
  }
}

export function encodeCvm(cvm: CvmList): string {
  return (
    intToHex(cvm.x, 4) +
    intToHex(cvm.y, 4) +
    cvm.rules
      .map((r) => toHexByte((r.applyNext ? 0x40 : 0) | (r.method & 0x3f)) + toHexByte(r.condition))
      .join('')
  )
}

// ---------------- Track 2 ----------------

export interface Track2 {
  pan: string
  expiry: string
  serviceCode: string
  discretionary: string
}

export function parseTrack2(hex: string): Track2 {
  const s = hex.toUpperCase().replace(/F$/, '')
  const i = s.indexOf('D')
  if (i < 0) return { pan: s, expiry: '', serviceCode: '', discretionary: '' }
  const rest = s.substr(i + 1)
  return {
    pan: s.substr(0, i),
    expiry: rest.substr(0, 4),
    serviceCode: rest.substr(4, 3),
    discretionary: rest.substr(7)
  }
}

export function encodeTrack2(t: Track2): string {
  const s = `${t.pan}D${t.expiry}${t.serviceCode}${t.discretionary}`
  return s.length % 2 ? s + 'F' : s
}

/** Luhn check on a digit string. */
export function luhnValid(pan: string): boolean {
  if (!/^\d{8,19}$/.test(pan)) return false
  let sum = 0
  for (let i = 0; i < pan.length; i++) {
    let d = parseInt(pan[pan.length - 1 - i], 10)
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

// ---------------- Description ----------------

/** One line human readable interpretation of a primitive value. */
export function describeValue(def: TagDef, hex: string): string {
  if (!hex || !isHexBytes(hex)) return ''
  try {
    if (def.bitfield && BITFIELDS[def.bitfield]) {
      return describeBits(BITFIELDS[def.bitfield], hexToBytes(hex)) || 'nessun bit impostato'
    }
    const opt = def.options?.find((o) => o.value === hex)
    if (opt) return opt.label
    switch (def.format) {
      case 'an':
      case 'ans':
        return isPrintableHex(hex) ? `"${hexToText(hex)}"` : 'contiene caratteri non stampabili'
      case 'date':
        return formatYymmdd(hex)
      case 'cn':
        return hexToCompressed(hex)
      case 'n':
        return String(parseInt(hex, 10))
      case 'track2': {
        const t = parseTrack2(hex)
        return `PAN ${t.pan} · scad. ${t.expiry.substr(2, 2)}/${t.expiry.substr(0, 2)} · SC ${t.serviceCode}`
      }
      case 'afl':
        return parseAfl(hex)
          .map((e) => `SFI ${e.sfi}: rec ${e.first}–${e.last}${e.oda ? ` (ODA ${e.oda})` : ''}`)
          .join(' · ')
      case 'dol':
        return parseDol(hex)
          .map((e) => `${e.tag}(${e.len})`)
          .join(' ')
      case 'cvm': {
        const c = parseCvm(hex)
        return c.rules
          .map(
            (r) =>
              CVM_METHODS.find((m) => m.value === r.method)?.label ?? `CVM ${toHexByte(r.method)}`
          )
          .join(' → ')
      }
    }
    if (def.tag === '9F36' || def.tag === '9F13') return `${hexToInt(hex)}`
    if (def.tag === '9F17') return `${hexToInt(hex)} tentativi`
    if (def.tag === '88' || def.tag === '8F' || def.tag === '9F14' || def.tag === '9F23') {
      return `${hexToInt(hex)}`
    }
    if (def.tag === '9F4D')
      return `SFI ${hexToInt(hex.substr(0, 2))}, ${hexToInt(hex.substr(2, 2))} record`
  } catch {
    return ''
  }
  return ''
}

/** Validates a primitive value against the tag definition. */
export function valueIssues(def: TagDef, hex: string): string[] {
  const out: string[] = []
  if (!isHexBytes(hex)) {
    out.push(
      /[^0-9A-F]/i.test(hex)
        ? 'Il valore contiene caratteri non esadecimali'
        : 'Numero dispari di cifre esadecimali'
    )
    return out
  }
  const len = hex.length / 2
  if (len > 0) {
    if (def.min !== undefined && def.max !== undefined && def.min === def.max && len !== def.min) {
      out.push(`Lunghezza attesa ${def.min} byte, presenti ${len}`)
    } else {
      if (def.min !== undefined && len < def.min)
        out.push(`Lunghezza minima ${def.min} byte, presenti ${len}`)
      if (def.max !== undefined && len > def.max)
        out.push(`Lunghezza massima ${def.max} byte, presenti ${len}`)
    }
  }
  switch (def.format) {
    case 'n':
    case 'date':
      if (!/^\d*$/.test(hex)) out.push('Formato numerico (n): ammesse solo cifre 0–9')
      if (def.format === 'date' && hex && !yymmddToIso(hex)) out.push('Data non valida (YYMMDD)')
      break
    case 'cn':
      if (!/^\d*F*$/.test(hex)) out.push('Formato cn: cifre 0–9 seguite da eventuale padding F')
      break
    case 'an':
      if (!/^[0-9A-Za-z]*$/.test(hexToText(hex)))
        out.push('Formato an: ammessi solo caratteri alfanumerici')
      break
    case 'ans':
      if (!isPrintableHex(hex)) out.push('Contiene caratteri non stampabili')
      break
    case 'afl':
      if (len % 4) out.push("L'AFL deve essere un multiplo di 4 byte")
      else
        parseAfl(hex).forEach((e, i) => {
          const err = aflEntryError(e)
          if (err) out.push(`AFL voce ${i + 1}: ${err}`)
        })
      break
    case 'dol':
      try {
        parseDol(hex).forEach((e) => {
          const err = tagError(e.tag)
          if (err) out.push(`DOL: tag ${e.tag} non valido`)
        })
      } catch (e) {
        out.push(`DOL non valido: ${(e as Error).message}`)
      }
      break
    case 'cvm':
      if (len >= 8 && (len - 8) % 2) out.push('CVM List: le regole devono essere di 2 byte')
      break
    case 'track2': {
      const t = parseTrack2(hex)
      if (!hex.includes('D')) out.push('Track 2: manca il separatore D')
      else if (!/^\d{4}$/.test(t.expiry)) out.push('Track 2: scadenza YYMM non valida')
      if (t.pan && !luhnValid(t.pan)) out.push('Track 2: il PAN non supera il controllo Luhn')
      break
    }
  }
  if (def.tag === '5A') {
    const pan = hexToCompressed(hex)
    if (pan && !luhnValid(pan)) out.push('Il PAN non supera il controllo Luhn')
  }
  return out
}
