import { textToHex } from './hex'
import { newId } from './tlv'
import { tagDef } from './tags'
import type { TlvNode } from './types'

interface Spec {
  tag: string
  /** Fixed hex value. */
  value?: string
  /** Fixed value as text (converted to hex). */
  text?: string
  example?: string
  exampleText?: string
  req?: boolean
  hint?: string
  concat?: boolean
  raw?: boolean
  children?: Spec[]
}

/** Interface on which the response is used. */
export type Iface = 'contact' | 'contactless' | 'both'

export interface ResponseTemplate {
  id: string
  /** Key of TEMPLATE_GROUPS. */
  group: string
  iface?: Iface
  /** Payment scheme when the template is scheme specific. */
  scheme?: string
  name: string
  description: string
  command: { name: string; apdu: string; note?: string }
  sw?: string
  root: Spec[]
}

export function buildNodes(specs: Spec[]): TlvNode[] {
  return specs.map((s) => {
    const example = s.example ?? (s.exampleText ? textToHex(s.exampleText) : tagDef(s.tag).example)
    return {
      id: newId(),
      tag: s.raw ? '' : s.tag,
      value: s.value ?? (s.text ? textToHex(s.text) : ''),
      children: s.children ? buildNodes(s.children) : [],
      raw: s.raw,
      concat: s.concat,
      required: s.req,
      fixed: s.value !== undefined || s.text !== undefined,
      hint: s.hint,
      example
    }
  })
}

export interface TemplateGroup {
  id: string
  /** Step in the transaction flow, absent for utility groups. */
  step?: number
  desc: string
}

/** Template groups in transaction flow order. */
export const TEMPLATE_GROUPS: TemplateGroup[] = [
  { id: 'Selezione', step: 1, desc: "Scelta dell'applicazione: PPSE, PSE e AID" },
  { id: 'Get Processing Options', step: 2, desc: 'Avvio della transazione: AIP e AFL' },
  { id: 'Read Record', step: 3, desc: "Dati della carta indicati dall'AFL" },
  { id: 'Autenticazione', step: 4, desc: 'Autenticazione offline (DDA) e numeri casuali' },
  { id: 'Generate AC', step: 5, desc: 'Crittogramma: decisione della carta' },
  { id: 'Get Data', step: 6, desc: 'Contatori e dati letti con GET DATA' },
  { id: 'Altro', desc: 'Risposte libere o di solo errore' }
]

export const INS_NAMES: Record<string, string> = {
  A4: 'SELECT',
  B2: 'READ RECORD',
  A8: 'GET PROCESSING OPTIONS',
  AE: 'GENERATE AC',
  '88': 'INTERNAL AUTHENTICATE',
  '84': 'GET CHALLENGE',
  CA: 'GET DATA',
  '82': 'EXTERNAL AUTHENTICATE',
  '20': 'VERIFY'
}

/** INS byte and standard command name of the reference command APDU. */
export function commandOf(tpl: ResponseTemplate): { ins: string; name: string } | null {
  const ins = tpl.command.apdu.substr(2, 2).toUpperCase()
  return ins ? { ins, name: INS_NAMES[ins] ?? '' } : null
}

const PPSE = '325041592E5359532E4444463031'
const PSE = '315041592E5359532E4444463031'

export const TEMPLATES: ResponseTemplate[] = [
  // -------- Selection --------
  {
    id: 'select-ppse',
    group: 'Selezione',
    iface: 'contactless',
    name: 'SELECT PPSE',
    description:
      'Risposta alla SELECT del Proximity Payment System Environment (contactless). Contiene una Directory Entry (61) per ciascuna applicazione: duplicala per aggiungere altre AID.',
    command: {
      name: 'SELECT 2PAY.SYS.DDF01',
      apdu: '00A404000E325041592E5359532E444446303100'
    },
    root: [
      {
        tag: '6F',
        req: true,
        children: [
          {
            tag: '84',
            value: PPSE,
            req: true,
            hint: 'Fisso: "2PAY.SYS.DDF01"'
          },
          {
            tag: 'A5',
            req: true,
            children: [
              {
                tag: 'BF0C',
                req: true,
                children: [
                  {
                    tag: '61',
                    req: true,
                    hint: 'Una entry per applicazione: usa "Duplica" per aggiungerne altre',
                    children: [
                      {
                        tag: '4F',
                        req: true,
                        hint: 'Seleziona un AID noto o inseriscilo in hex'
                      },
                      { tag: '50', hint: 'Consigliato: mostrato al titolare' },
                      {
                        tag: '87',
                        hint: 'Obbligatorio se ci sono più applicazioni'
                      },
                      {
                        tag: '9F2A',
                        example: '03',
                        hint: 'Opzionale: kernel contactless'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'select-pse',
    group: 'Selezione',
    iface: 'contact',
    name: 'SELECT PSE (contact)',
    description:
      "Risposta alla SELECT del Payment System Environment (contact). Indica l'SFI del file di directory da leggere con READ RECORD.",
    command: {
      name: 'SELECT 1PAY.SYS.DDF01',
      apdu: '00A404000E315041592E5359532E444446303100'
    },
    root: [
      {
        tag: '6F',
        req: true,
        children: [
          { tag: '84', value: PSE, req: true, hint: 'Fisso: "1PAY.SYS.DDF01"' },
          {
            tag: 'A5',
            req: true,
            children: [
              {
                tag: '88',
                req: true,
                hint: 'SFI del Directory Elementary File'
              },
              { tag: '5F2D' },
              { tag: '9F11' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'read-record-pse',
    group: 'Selezione',
    iface: 'contact',
    name: 'READ RECORD PSE directory',
    description: 'Record del file di directory della PSE (contact): una entry 61 per applicazione.',
    command: { name: 'READ RECORD SFI 1, record 1', apdu: '00B2010C00' },
    root: [
      {
        tag: '70',
        req: true,
        children: [
          {
            tag: '61',
            req: true,
            children: [
              { tag: '4F', req: true },
              { tag: '50', req: true },
              { tag: '9F12' },
              { tag: '87' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'select-aid',
    group: 'Selezione',
    iface: 'both',
    name: 'SELECT AID',
    description:
      "Risposta alla SELECT dell'applicazione. Il PDOL (9F38) indica i dati che il terminale deve inviare nella GPO.",
    command: {
      name: 'SELECT AID',
      apdu: '00A4040007A000000003101000',
      note: "Lc e AID dipendono dall'applicazione"
    },
    root: [
      {
        tag: '6F',
        req: true,
        children: [
          {
            tag: '84',
            req: true,
            example: 'A0000000031010',
            hint: "AID dell'applicazione selezionata"
          },
          {
            tag: 'A5',
            req: true,
            children: [
              { tag: '50', req: true },
              { tag: '87' },
              {
                tag: '9F38',
                hint: 'Necessario se la GPO deve ricevere dati del terminale'
              },
              { tag: '5F2D', exampleText: 'iten' },
              { tag: '9F11' },
              { tag: '9F12' },
              { tag: 'BF0C', children: [{ tag: '9F4D' }] }
            ]
          }
        ]
      }
    ]
  },

  // -------- GPO --------
  {
    id: 'gpo-f2',
    group: 'Get Processing Options',
    iface: 'both',
    name: 'GPO – Formato 2 (77)',
    description: 'Risposta GPO in formato TLV con AIP e AFL. È il formato più usato.',
    command: {
      name: 'GET PROCESSING OPTIONS',
      apdu: '80A8000002830000',
      note: 'Dati 83 secondo il PDOL'
    },
    root: [
      {
        tag: '77',
        req: true,
        children: [
          { tag: '82', req: true },
          { tag: '94', req: true }
        ]
      }
    ]
  },
  {
    id: 'gpo-f1',
    group: 'Get Processing Options',
    iface: 'contact',
    name: 'GPO – Formato 1 (80)',
    description: "Risposta GPO in formato 1: AIP (2 byte) seguito dall'AFL, senza tag interni.",
    command: { name: 'GET PROCESSING OPTIONS', apdu: '80A8000002830000' },
    root: [
      {
        tag: '80',
        concat: true,
        req: true,
        children: [
          { tag: '82', req: true },
          { tag: '94', req: true }
        ]
      }
    ]
  },
  {
    id: 'gpo-qvsdc',
    group: 'Get Processing Options',
    iface: 'contactless',
    scheme: 'Visa',
    name: 'GPO – Visa qVSDC',
    description:
      'Risposta GPO contactless Visa (qVSDC): oltre ad AIP/AFL contiene Track 2, crittogramma, IAD e CTQ.',
    command: {
      name: 'GET PROCESSING OPTIONS',
      apdu: '80A80000238321B620C000000000000100000000000000038000000000000978240101001234567800',
      note: 'Esempio con PDOL 9F66 9F02 9F03 9F1A 95 5F2A 9A 9C 9F37'
    },
    root: [
      {
        tag: '77',
        req: true,
        children: [
          { tag: '82', req: true, example: '2000' },
          { tag: '94', example: '18010301' },
          { tag: '57', req: true },
          { tag: '5F20' },
          { tag: '5F34' },
          { tag: '9F10', req: true },
          { tag: '9F26', req: true },
          { tag: '9F27', req: true },
          { tag: '9F36', req: true },
          { tag: '9F6C', req: true },
          { tag: '9F6E' }
        ]
      }
    ]
  },
  {
    id: 'gpo-mc',
    group: 'Get Processing Options',
    iface: 'contactless',
    scheme: 'Mastercard',
    name: 'GPO – Mastercard contactless',
    description: 'Risposta GPO Mastercard (M/Chip contactless): AIP con bit EMV mode e AFL.',
    command: { name: 'GET PROCESSING OPTIONS', apdu: '80A8000002830000' },
    root: [
      {
        tag: '77',
        req: true,
        children: [
          { tag: '82', req: true, example: '1980' },
          { tag: '94', req: true, example: '0801010010010301' }
        ]
      }
    ]
  },

  // -------- Records --------
  {
    id: 'rr-track',
    group: 'Read Record',
    iface: 'both',
    name: 'READ RECORD – Track 2 / titolare',
    description: 'Record con i dati di traccia e il nome del titolare.',
    command: { name: 'READ RECORD SFI 1, record 1', apdu: '00B2010C00' },
    root: [
      {
        tag: '70',
        req: true,
        children: [{ tag: '57', req: true }, { tag: '5F20' }, { tag: '9F1F' }]
      }
    ]
  },
  {
    id: 'rr-app',
    group: 'Read Record',
    iface: 'both',
    name: 'READ RECORD – Dati applicazione',
    description:
      'Record con PAN, date, codici paese/valuta, DOL per il GENERATE AC, CVM List e Issuer Action Codes.',
    command: { name: 'READ RECORD SFI 2, record 1', apdu: '00B2011400' },
    root: [
      {
        tag: '70',
        req: true,
        children: [
          { tag: '5A', req: true },
          { tag: '5F24', req: true },
          { tag: '5F25' },
          { tag: '5F28' },
          { tag: '5F34' },
          { tag: '9F07' },
          { tag: '8C', req: true },
          { tag: '8D' },
          { tag: '8E', req: true },
          { tag: '9F0D' },
          { tag: '9F0E' },
          { tag: '9F0F' },
          { tag: '9F42' },
          { tag: '9F08' }
        ]
      }
    ]
  },
  {
    id: 'rr-oda',
    group: 'Read Record',
    iface: 'both',
    name: 'READ RECORD – Certificati ODA',
    description:
      "Record con gli elementi per l'Offline Data Authentication (chiavi e certificati).",
    command: { name: 'READ RECORD SFI 3, record 1', apdu: '00B2011C00' },
    root: [
      {
        tag: '70',
        req: true,
        children: [
          { tag: '8F', req: true },
          { tag: '90', req: true },
          { tag: '9F32', req: true },
          { tag: '92' },
          { tag: '9F46' },
          { tag: '9F47' },
          { tag: '9F48' },
          { tag: '9F49' },
          { tag: '9F4A' }
        ]
      }
    ]
  },

  // -------- Generate AC --------
  {
    id: 'gac-f2',
    group: 'Generate AC',
    iface: 'both',
    name: 'GENERATE AC – Formato 2 (77)',
    description: 'Risposta GENERATE AC in formato TLV. Con CDA include la firma dinamica (9F4B).',
    command: {
      name: 'GENERATE AC (ARQC)',
      apdu: '80AE8000',
      note: 'Lc + dati CDOL1 + Le'
    },
    root: [
      {
        tag: '77',
        req: true,
        children: [
          { tag: '9F27', req: true },
          { tag: '9F36', req: true },
          { tag: '9F26', req: true },
          { tag: '9F10' },
          { tag: '9F4B', hint: 'Solo con CDA' }
        ]
      }
    ]
  },
  {
    id: 'gac-f1',
    group: 'Generate AC',
    iface: 'contact',
    name: 'GENERATE AC – Formato 1 (80)',
    description: 'Risposta GENERATE AC in formato 1: CID || ATC || AC || IAD concatenati.',
    command: {
      name: 'GENERATE AC (ARQC)',
      apdu: '80AE8000',
      note: 'Lc + dati CDOL1 + Le'
    },
    root: [
      {
        tag: '80',
        concat: true,
        req: true,
        children: [
          { tag: '9F27', req: true },
          { tag: '9F36', req: true },
          { tag: '9F26', req: true },
          { tag: '9F10', example: '0110A00003220000000000000000000000FF' }
        ]
      }
    ]
  },

  // -------- Authentication --------
  {
    id: 'ia-f2',
    group: 'Autenticazione',
    iface: 'contact',
    name: 'INTERNAL AUTHENTICATE – Formato 2',
    description: 'Firma dinamica DDA in formato TLV.',
    command: {
      name: 'INTERNAL AUTHENTICATE',
      apdu: '00880000041234567800',
      note: 'Dati secondo DDOL'
    },
    root: [{ tag: '77', req: true, children: [{ tag: '9F4B', req: true }] }]
  },
  {
    id: 'ia-f1',
    group: 'Autenticazione',
    iface: 'contact',
    name: 'INTERNAL AUTHENTICATE – Formato 1',
    description: 'Firma dinamica DDA in formato 1 (solo valore dentro il tag 80).',
    command: { name: 'INTERNAL AUTHENTICATE', apdu: '00880000041234567800' },
    root: [
      {
        tag: '80',
        concat: true,
        req: true,
        children: [{ tag: '9F4B', req: true }]
      }
    ]
  },
  {
    id: 'get-challenge',
    group: 'Autenticazione',
    iface: 'contact',
    name: 'GET CHALLENGE',
    description: 'Numero casuale di 8 byte, senza struttura TLV.',
    command: { name: 'GET CHALLENGE', apdu: '0084000000' },
    root: [
      {
        tag: '',
        raw: true,
        req: true,
        example: '0102030405060708',
        hint: '8 byte casuali'
      }
    ]
  },

  // -------- Get data --------
  {
    id: 'gd-atc',
    group: 'Get Data',
    iface: 'both',
    name: 'GET DATA – ATC',
    description: 'Application Transaction Counter.',
    command: { name: 'GET DATA 9F36', apdu: '80CA9F3600' },
    root: [{ tag: '9F36', req: true }]
  },
  {
    id: 'gd-ptc',
    group: 'Get Data',
    iface: 'contact',
    name: 'GET DATA – PIN Try Counter',
    description: 'Numero di tentativi PIN residui.',
    command: { name: 'GET DATA 9F17', apdu: '80CA9F1700' },
    root: [{ tag: '9F17', req: true }]
  },
  {
    id: 'gd-lonatc',
    group: 'Get Data',
    iface: 'both',
    name: 'GET DATA – Last Online ATC',
    description: "ATC dell'ultima transazione online.",
    command: { name: 'GET DATA 9F13', apdu: '80CA9F1300' },
    root: [{ tag: '9F13', req: true }]
  },
  {
    id: 'gd-logformat',
    group: 'Get Data',
    iface: 'both',
    name: 'GET DATA – Log Format',
    description: 'Formato dei record del log transazioni.',
    command: { name: 'GET DATA 9F4F', apdu: '80CA9F4F00' },
    root: [{ tag: '9F4F', req: true }]
  },

  // -------- Other --------
  {
    id: 'empty',
    group: 'Altro',
    name: 'Risposta vuota / personalizzata',
    description:
      'Parti da zero aggiungendo i tag che ti servono, oppure importa una risposta esistente.',
    command: { name: '—', apdu: '' },
    root: []
  },
  {
    id: 'sw-only',
    group: 'Altro',
    name: 'Solo Status Word (errore)',
    description: 'Risposta senza dati, solo SW1 SW2 (es. 6A82 applicazione non trovata).',
    command: { name: '—', apdu: '' },
    sw: '6A82',
    root: []
  }
]
