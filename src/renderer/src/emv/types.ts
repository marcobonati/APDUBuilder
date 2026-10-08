/**
 * Value formats, following EMV Book 3 notation plus a few structured formats
 * that get a dedicated editor in the UI.
 */
export type ValueFormat =
  | 'b' // binary
  | 'n' // numeric BCD, left padded with 0
  | 'cn' // compressed numeric, right padded with F
  | 'an' // alphanumeric
  | 'ans' // alphanumeric special
  | 'date' // n6 YYMMDD
  | 'dol' // Data Object List
  | 'afl' // Application File Locator
  | 'cvm' // CVM List
  | 'track2' // Track 2 equivalent data

export interface EnumOption {
  value: string
  label: string
}

export interface TagDef {
  tag: string
  name: string
  desc: string
  format: ValueFormat
  /** Min / max value length in bytes. */
  min?: number
  max?: number
  /** Key into BITFIELDS for a bit level editor. */
  bitfield?: string
  options?: EnumOption[]
  /** Tags typically found inside this constructed tag. */
  children?: string[]
  /** Tag may appear more than once in the same parent. */
  repeatable?: boolean
  /** Who provides the data object. Terminal tags are only offered in DOLs. */
  source?: 'card' | 'terminal' | 'issuer'
  example?: string
}

export interface TlvNode {
  id: string
  /** Hex tag, empty for raw (untagged) data. */
  tag: string
  /** Hex value of primitive nodes. Ignored for constructed nodes. */
  value: string
  children: TlvNode[]
  /** Untagged bytes (e.g. GET CHALLENGE response). */
  raw?: boolean
  /**
   * Primitive tag whose value is the concatenation of the children values,
   * without their tag and length (Format 1 responses, tag 80).
   */
  concat?: boolean
  required?: boolean
  /** Emit even when empty (zero length tags found in imported data). */
  keepEmpty?: boolean
  /** Value defined by the specification (e.g. PPSE name). */
  fixed?: boolean
  hint?: string
  example?: string
  /** Hex length forced by the user (negative testing). Null = automatic. */
  lengthOverride?: string | null
  collapsed?: boolean
}
