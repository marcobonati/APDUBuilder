export interface BitOption {
  value: number
  label: string
}

/** A field inside a byte, from bit `hi` down to bit `lo` (b8..b1). */
export interface BitDef {
  byte: number
  hi: number
  lo: number
  label: string
  options?: BitOption[]
  /** Describe the field even when its value is 0. */
  showZero?: boolean
}

export interface BitfieldDef {
  bytes: number
  fields: BitDef[]
}

const bit = (byte: number, b: number, label: string): BitDef => ({
  byte,
  hi: b,
  lo: b,
  label
})

export const BITFIELDS: Record<string, BitfieldDef> = {
  aip: {
    bytes: 2,
    fields: [
      bit(0, 7, 'SDA supportata'),
      bit(0, 6, 'DDA supportata'),
      bit(0, 5, 'Cardholder verification supportata'),
      bit(0, 4, 'Terminal risk management da eseguire'),
      bit(0, 3, 'Issuer authentication supportata'),
      bit(0, 2, 'On-device cardholder verification supportata'),
      bit(0, 1, 'CDA supportata'),
      bit(1, 8, 'Riservato EMV Contactless (es. MC: EMV mode supported)'),
      bit(1, 1, 'Relay Resistance Protocol supportato')
    ]
  },
  auc: {
    bytes: 2,
    fields: [
      bit(0, 8, 'Valida per cash domestico'),
      bit(0, 7, 'Valida per cash internazionale'),
      bit(0, 6, 'Valida per beni domestici'),
      bit(0, 5, 'Valida per beni internazionali'),
      bit(0, 4, 'Valida per servizi domestici'),
      bit(0, 3, 'Valida per servizi internazionali'),
      bit(0, 2, 'Valida su ATM'),
      bit(0, 1, 'Valida su terminali diversi da ATM'),
      bit(1, 8, 'Cashback domestico consentito'),
      bit(1, 7, 'Cashback internazionale consentito')
    ]
  },
  ctq: {
    bytes: 2,
    fields: [
      bit(0, 8, 'Online PIN richiesto'),
      bit(0, 7, 'Firma richiesta'),
      bit(0, 6, 'Vai online se ODA fallisce e il reader è online-capable'),
      bit(0, 5, 'Cambia interfaccia se ODA fallisce e il reader supporta il contact'),
      bit(0, 4, "Vai online se l'applicazione è scaduta"),
      bit(0, 3, 'Cambia interfaccia per transazioni cash'),
      bit(0, 2, 'Cambia interfaccia per transazioni cashback'),
      bit(0, 1, 'Non valida per transazioni ATM contactless'),
      bit(1, 8, 'Consumer Device CVM eseguito'),
      bit(1, 7, 'La carta supporta Issuer Update Processing al POS')
    ]
  },
  tvr: {
    bytes: 5,
    fields: [
      bit(0, 8, 'Offline data authentication non eseguita'),
      bit(0, 7, 'SDA fallita'),
      bit(0, 6, 'Dati ICC mancanti'),
      bit(0, 5, 'Carta presente nella exception file del terminale'),
      bit(0, 4, 'DDA fallita'),
      bit(0, 3, 'CDA fallita'),
      bit(0, 2, 'SDA selezionata'),
      bit(1, 8, 'ICC e terminale hanno versioni applicazione diverse'),
      bit(1, 7, 'Applicazione scaduta'),
      bit(1, 6, 'Applicazione non ancora valida'),
      bit(1, 5, 'Servizio richiesto non consentito per il prodotto'),
      bit(1, 4, 'Nuova carta'),
      bit(2, 8, 'Cardholder verification non riuscita'),
      bit(2, 7, 'CVM non riconosciuto'),
      bit(2, 6, 'PIN Try Limit superato'),
      bit(2, 5, 'PIN richiesto e PIN pad assente o non funzionante'),
      bit(2, 4, 'PIN richiesto, PIN pad presente ma PIN non inserito'),
      bit(2, 3, 'Online PIN inserito'),
      bit(3, 8, 'Transazione oltre il floor limit'),
      bit(3, 7, 'Lower consecutive offline limit superato'),
      bit(3, 6, 'Upper consecutive offline limit superato'),
      bit(3, 5, 'Transazione selezionata casualmente per online'),
      bit(3, 4, 'Merchant ha forzato la transazione online'),
      bit(4, 8, 'Usato TDOL di default'),
      bit(4, 7, 'Issuer authentication fallita'),
      bit(4, 6, 'Script fallito prima del GENERATE AC finale'),
      bit(4, 5, 'Script fallito dopo il GENERATE AC finale'),
      bit(4, 4, 'Relay resistance threshold superata'),
      bit(4, 3, 'Relay resistance time limits superati'),
      {
        byte: 4,
        hi: 2,
        lo: 1,
        label: 'Relay resistance',
        options: [
          { value: 0, label: 'Non supportato' },
          { value: 1, label: 'Non eseguito' },
          { value: 2, label: 'Eseguito' },
          { value: 3, label: 'RFU' }
        ]
      }
    ]
  },
  cid: {
    bytes: 1,
    fields: [
      {
        byte: 0,
        hi: 8,
        lo: 7,
        label: 'Tipo di crittogramma',
        showZero: true,
        options: [
          { value: 0, label: 'AAC – rifiuto' },
          { value: 1, label: 'TC – approvato offline' },
          { value: 2, label: 'ARQC – richiesta online' },
          { value: 3, label: 'RFU' }
        ]
      },
      { byte: 0, hi: 6, lo: 5, label: 'Specifico del payment system' },
      bit(0, 4, 'Advice richiesto'),
      {
        byte: 0,
        hi: 3,
        lo: 1,
        label: 'Reason / advice code',
        options: [
          { value: 0, label: 'Nessuna informazione' },
          { value: 1, label: 'Servizio non consentito' },
          { value: 2, label: 'PIN Try Limit superato' },
          { value: 3, label: 'Issuer authentication fallita' }
        ]
      }
    ]
  },
  api: {
    bytes: 1,
    fields: [
      bit(0, 8, 'Richiede conferma del titolare per la selezione'),
      {
        byte: 0,
        hi: 4,
        lo: 1,
        label: 'Priorità (0 = nessuna, 1 = massima)'
      }
    ]
  }
}

export function fieldMask(f: BitDef): number {
  return ((1 << (f.hi - f.lo + 1)) - 1) << (f.lo - 1)
}

export function getField(bytes: number[], f: BitDef): number {
  return ((bytes[f.byte] ?? 0) & fieldMask(f)) >> (f.lo - 1)
}

export function setField(bytes: number[], f: BitDef, v: number): number[] {
  const out = [...bytes]
  const mask = fieldMask(f)
  out[f.byte] = ((out[f.byte] ?? 0) & ~mask) | ((v << (f.lo - 1)) & mask)
  return out
}

/** Short human readable list of the set bits. */
export function describeBits(def: BitfieldDef, bytes: number[]): string {
  const parts: string[] = []
  for (const f of def.fields) {
    const v = getField(bytes, f)
    if (f.options) {
      const o = f.options.find((x) => x.value === v)
      if (v !== 0 || f.showZero) parts.push(o ? o.label : `${f.label}: ${v}`)
    } else if (f.hi !== f.lo) {
      if (v !== 0) parts.push(`${f.label}: ${v}`)
    } else if (v) {
      parts.push(f.label)
    }
  }
  return parts.join(' · ')
}
