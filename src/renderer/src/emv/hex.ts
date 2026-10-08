// Low level helpers for hex strings. All hex strings handled by the app are
// uppercase, without separators.

export function normalizeHex(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase()
}

/** Lenient cleanup used when importing data pasted from logs/tools. */
export function cleanPastedHex(input: string): string {
  return input
    .replace(/0x/gi, '')
    .replace(/[\s,:;{}[\]()'"-]/g, '')
    .toUpperCase()
}

export function isHex(s: string): boolean {
  return /^[0-9A-F]*$/i.test(s)
}

export function isHexBytes(s: string): boolean {
  return isHex(s) && s.length % 2 === 0
}

export function byteLength(hex: string): number {
  return Math.floor(hex.length / 2)
}

export function toHexByte(n: number): string {
  return (n & 0xff).toString(16).toUpperCase().padStart(2, '0')
}

export function intToHex(n: number, bytes: number): string {
  let out = ''
  let v = Math.max(0, Math.floor(n))
  for (let i = 0; i < bytes; i++) {
    out = toHexByte(v % 256) + out
    v = Math.floor(v / 256)
  }
  return out
}

export function hexToInt(hex: string): number {
  if (!hex) return 0
  return parseInt(hex, 16)
}

export function hexToBytes(hex: string): number[] {
  const out: number[] = []
  for (let i = 0; i + 1 < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16))
  return out
}

export function bytesToHex(bytes: number[]): string {
  return bytes.map(toHexByte).join('')
}

export function splitBytes(hex: string): string[] {
  const out: string[] = []
  for (let i = 0; i < hex.length; i += 2) out.push(hex.substr(i, 2))
  return out
}

/** EMV an/ans fields use ISO 8859 single byte encodings. */
export function textToHex(text: string): string {
  return Array.from(text)
    .map((c) => toHexByte(c.charCodeAt(0)))
    .join('')
}

export function hexToText(hex: string): string {
  return hexToBytes(hex)
    .map((b) => String.fromCharCode(b))
    .join('')
}

export function isPrintableHex(hex: string): boolean {
  return hexToBytes(hex).every((b) => b >= 0x20 && b <= 0x7e)
}

export function printable(hex: string): string {
  return hexToBytes(hex)
    .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
    .join('')
}

export function spaced(hex: string): string {
  return splitBytes(hex).join(' ')
}

export function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return bytesToHex(Array.from(arr))
}
