import { t } from '../i18n'
import type { EnumOption, TagDef } from './types'

export const KNOWN_AIDS: EnumOption[] = [
  { value: 'A0000000031010', label: 'Visa Credit/Debit' },
  { value: 'A0000000032010', label: 'Visa Electron' },
  { value: 'A0000000032020', label: 'V PAY' },
  { value: 'A0000000033010', label: 'Visa Interlink' },
  { value: 'A0000000038010', label: 'Visa Plus' },
  { value: 'A0000000041010', label: 'Mastercard Credit/Debit' },
  { value: 'A0000000043060', label: 'Maestro' },
  { value: 'A0000000046000', label: 'Cirrus' },
  { value: 'A000000025010801', label: 'American Express' },
  { value: 'A0000000651010', label: 'JCB' },
  { value: 'A0000001523010', label: 'Discover' },
  { value: 'A0000003241010', label: 'Discover Zip' },
  { value: 'A000000333010101', label: 'UnionPay Debit' },
  { value: 'A000000333010102', label: 'UnionPay Credit' },
  { value: 'A0000001410001', label: 'PagoBANCOMAT' },
  { value: 'A0000000421010', label: 'CB (Cartes Bancaires)' },
  { value: 'A0000002771010', label: 'Interac' }
]

const COUNTRIES: EnumOption[] = [
  { value: '0380', label: '380 – Italia' },
  { value: '0250', label: '250 – Francia' },
  { value: '0276', label: '276 – Germania' },
  { value: '0724', label: '724 – Spagna' },
  { value: '0756', label: '756 – Svizzera' },
  { value: '0826', label: '826 – Regno Unito' },
  { value: '0840', label: '840 – Stati Uniti' },
  { value: '0528', label: '528 – Paesi Bassi' },
  { value: '0056', label: '056 – Belgio' },
  { value: '0040', label: '040 – Austria' }
]

const CURRENCIES: EnumOption[] = [
  { value: '0978', label: '978 – EUR' },
  { value: '0840', label: '840 – USD' },
  { value: '0826', label: '826 – GBP' },
  { value: '0756', label: '756 – CHF' },
  { value: '0392', label: '392 – JPY' },
  { value: '0985', label: '985 – PLN' }
]

const FCI_PROPRIETARY = ['50', '87', '9F38', '5F2D', '9F11', '9F12', 'BF0C', '88']

const RECORD_TAGS = [
  '57',
  '5A',
  '5F20',
  '5F24',
  '5F25',
  '5F28',
  '5F30',
  '5F34',
  '8C',
  '8D',
  '8E',
  '8F',
  '90',
  '92',
  '93',
  '9F07',
  '9F08',
  '9F0D',
  '9F0E',
  '9F0F',
  '9F14',
  '9F23',
  '9F1F',
  '9F32',
  '9F42',
  '9F44',
  '9F46',
  '9F47',
  '9F48',
  '9F49',
  '9F4A',
  '9F69',
  '9F6B',
  '56',
  '9F0B',
  '9F05',
  '5F50',
  '9F24',
  '9F19',
  '9F25',
  '61'
]

const RESPONSE_TAGS = [
  '82',
  '94',
  '57',
  '5A',
  '5F20',
  '5F24',
  '5F25',
  '5F28',
  '5F34',
  '9F07',
  '9F10',
  '9F26',
  '9F27',
  '9F36',
  '9F4B',
  '9F6C',
  '9F6E',
  '9F5D',
  '9F7C',
  '9F19',
  '9F24',
  '9F25',
  '9F69',
  '56',
  '9F6B',
  '9F4C'
]

const DEFS: TagDef[] = [
  // ---- Templates ----
  {
    tag: '6F',
    name: 'File Control Information (FCI) Template',
    desc: 'Template restituito dalla SELECT. Contiene il DF Name (84) e il template proprietario (A5).',
    format: 'b',
    children: ['84', 'A5']
  },
  {
    tag: 'A5',
    name: 'FCI Proprietary Template',
    desc: "Dati proprietari dell'FCI: label, priorità, PDOL, preferenze di lingua e dati discrezionali dell'issuer.",
    format: 'b',
    children: FCI_PROPRIETARY
  },
  {
    tag: 'BF0C',
    name: 'FCI Issuer Discretionary Data',
    desc: 'Dati discrezionali. Nella PPSE contiene una o più Directory Entry (61), una per applicazione.',
    format: 'b',
    children: ['61', '9F4D', '9F5D', '9F0A', '9F6E', '5F53', '5F54', '5F55', '5F56', '42', '9F5A']
  },
  {
    tag: '61',
    name: 'Application Template (Directory Entry)',
    desc: "Entry di directory: descrive un'applicazione disponibile sulla carta (AID, label, priorità, kernel).",
    format: 'b',
    repeatable: true,
    children: ['4F', '50', '87', '9F2A', '9F12', '73', '42', '5F55', '9F0A']
  },
  {
    tag: '70',
    name: 'READ RECORD Response Message Template',
    desc: 'Template che racchiude i dati di un record letto con READ RECORD.',
    format: 'b',
    children: RECORD_TAGS
  },
  {
    tag: '73',
    name: 'Directory Discretionary Template',
    desc: 'Dati discrezionali associati a una directory entry.',
    format: 'b',
    children: ['9F0A', '9F2A', '42']
  },
  {
    tag: '77',
    name: 'Response Message Template Format 2',
    desc: 'Risposta in formato TLV (GPO, GENERATE AC, INTERNAL AUTHENTICATE).',
    format: 'b',
    children: RESPONSE_TAGS
  },
  {
    tag: '80',
    name: 'Response Message Template Format 1',
    desc: 'Risposta in formato 1: i valori degli elementi sono concatenati senza tag né lunghezza.',
    format: 'b'
  },

  // ---- Application selection ----
  {
    tag: '4F',
    name: 'Application Identifier (AID) – card',
    desc: 'Identifica applicazione: RID (5 byte) + PIX (fino a 11 byte).',
    format: 'b',
    min: 5,
    max: 16,
    options: KNOWN_AIDS,
    example: 'A0000000031010'
  },
  {
    tag: '84',
    name: 'Dedicated File (DF) Name',
    desc: "Nome del DF selezionato: '2PAY.SYS.DDF01' per la PPSE, '1PAY.SYS.DDF01' per la PSE, oppure l'AID.",
    format: 'b',
    min: 5,
    max: 16,
    options: [
      { value: '325041592E5359532E4444463031', label: '2PAY.SYS.DDF01 (PPSE)' },
      { value: '315041592E5359532E4444463031', label: '1PAY.SYS.DDF01 (PSE)' },
      ...KNOWN_AIDS
    ]
  },
  {
    tag: '50',
    name: 'Application Label',
    desc: "Nome mnemonico dell'applicazione, mostrato al titolare (max 16 caratteri).",
    format: 'ans',
    min: 1,
    max: 16,
    example: '5649534120435245444954'
  },
  {
    tag: '9F12',
    name: 'Application Preferred Name',
    desc: "Nome preferito dell'applicazione, codificato secondo l'Issuer Code Table Index (9F11).",
    format: 'ans',
    min: 1,
    max: 16,
    example: '5649534120435245444954'
  },
  {
    tag: '87',
    name: 'Application Priority Indicator',
    desc: "Priorità dell'applicazione nella lista (1 = massima) e necessità di conferma del titolare.",
    format: 'b',
    min: 1,
    max: 1,
    bitfield: 'api',
    example: '01'
  },
  {
    tag: '88',
    name: 'Short File Identifier (SFI)',
    desc: "SFI dell'EF di directory (PSE contact). Valori 1–30.",
    format: 'b',
    min: 1,
    max: 1,
    example: '01'
  },
  {
    tag: '5F2D',
    name: 'Language Preference',
    desc: 'Da 1 a 4 codici lingua ISO 639-1 (2 caratteri ciascuno) in ordine di preferenza, es. "iten".',
    format: 'langs',
    min: 2,
    max: 8,
    example: '6974656E'
  },
  {
    tag: '9F11',
    name: 'Issuer Code Table Index',
    desc: 'Parte della ISO/IEC 8859 usata per codificare Application Preferred Name (9F12).',
    format: 'n',
    min: 1,
    max: 1,
    options: Array.from({ length: 10 }, (_, i) => ({
      value: String(i + 1).padStart(2, '0'),
      label: `ISO 8859-${i + 1}`
    })),
    example: '01'
  },
  {
    tag: '9F38',
    name: 'Processing Options Data Object List (PDOL)',
    desc: 'Lista dei dati che il terminale deve inviare nella GET PROCESSING OPTIONS (tag 83).',
    format: 'dol',
    max: 252,
    example: '9F66049F02069F03069F1A0295055F2A029A039C019F3704'
  },
  {
    tag: '9F2A',
    name: 'Kernel Identifier',
    desc: 'Identifica il kernel contactless da usare per questa applicazione.',
    format: 'b',
    min: 1,
    max: 8,
    options: [
      { value: '01', label: '01 – Kernel 1 (alcune JCB/Visa)' },
      { value: '02', label: '02 – Mastercard' },
      { value: '03', label: '03 – Visa' },
      { value: '04', label: '04 – American Express' },
      { value: '05', label: '05 – JCB' },
      { value: '06', label: '06 – Discover' },
      { value: '07', label: '07 – UnionPay' },
      { value: '08', label: '08 – EMVCo C-8' },
      { value: '2E', label: '2E – CPACE (kernel pan-europeo ECPC)' }
    ]
  },
  {
    tag: '9F0A',
    name: 'Application Selection Registered Proprietary Data',
    desc: 'Dati proprietari registrati per la selezione applicazione (ASRPD).',
    format: 'b'
  },
  {
    tag: '42',
    name: 'Issuer Identification Number (IIN)',
    desc: "Numero identificativo dell'issuer (prime cifre del PAN).",
    format: 'n',
    min: 3,
    max: 3
  },
  {
    tag: '9F4D',
    name: 'Log Entry',
    desc: 'SFI del file di log transazioni (1 byte) e numero massimo di record (1 byte).',
    format: 'b',
    min: 2,
    max: 2,
    example: '0B0A'
  },
  {
    tag: '9F5A',
    name: 'Application Program Identifier',
    desc: 'Identificativo del programma applicativo (Visa).',
    format: 'b',
    min: 1,
    max: 16
  },
  { tag: '5F50', name: 'Issuer URL', desc: "URL dell'issuer.", format: 'ans' },
  {
    tag: '5F53',
    name: 'International Bank Account Number (IBAN)',
    desc: 'IBAN associato al conto.',
    format: 'b',
    max: 34
  },
  {
    tag: '5F54',
    name: 'Bank Identifier Code (BIC)',
    desc: 'BIC della banca (ISO 9362): codice banca (4 lettere), paese (2 lettere), località (2 caratteri) e filiale opzionale (3 caratteri). 8 o 11 caratteri.',
    format: 'bic',
    min: 8,
    max: 11,
    example: '4445555444454646'
  },
  {
    tag: '5F55',
    name: 'Issuer Country Code (alpha2)',
    desc: "Paese dell'issuer, ISO 3166 alpha-2.",
    format: 'an',
    min: 2,
    max: 2,
    example: '4954'
  },
  {
    tag: '5F56',
    name: 'Issuer Country Code (alpha3)',
    desc: "Paese dell'issuer, ISO 3166 alpha-3.",
    format: 'an',
    min: 3,
    max: 3
  },

  // ---- GPO ----
  {
    tag: '82',
    name: 'Application Interchange Profile (AIP)',
    desc: 'Indica le funzioni supportate dalla carta (SDA/DDA/CDA, CVM, risk management, issuer authentication).',
    format: 'b',
    min: 2,
    max: 2,
    bitfield: 'aip',
    example: '3C00'
  },
  {
    tag: '94',
    name: 'Application File Locator (AFL)',
    desc: 'Elenco di gruppi di 4 byte: SFI, primo record, ultimo record, numero di record per ODA.',
    format: 'afl',
    min: 4,
    max: 252,
    example: '080101001001030118010200'
  },

  // ---- Records ----
  {
    tag: '57',
    name: 'Track 2 Equivalent Data',
    desc: 'PAN, separatore D, scadenza YYMM, service code, dati discrezionali; padding F se dispari.',
    format: 'track2',
    max: 19,
    example: '4761739001010010D25122011143804489'
  },
  {
    tag: '5A',
    name: 'Application Primary Account Number (PAN)',
    desc: 'PAN della carta, cn fino a 19 cifre, padding F a destra.',
    format: 'cn',
    max: 10,
    example: '4761739001010010'
  },
  {
    tag: '5F20',
    name: 'Cardholder Name',
    desc: 'Nome del titolare (2–26 caratteri), formato "COGNOME/NOME".',
    format: 'ans',
    min: 2,
    max: 26,
    example: '524F5353492F4D4152494F'
  },
  {
    tag: '9F0B',
    name: 'Cardholder Name Extended',
    desc: 'Nome esteso del titolare (27–45 caratteri).',
    format: 'ans',
    min: 27,
    max: 45
  },
  {
    tag: '5F24',
    name: 'Application Expiration Date',
    desc: "Data di scadenza dell'applicazione, YYMMDD.",
    format: 'date',
    min: 3,
    max: 3,
    example: '271231'
  },
  {
    tag: '5F25',
    name: 'Application Effective Date',
    desc: "Data di inizio validità dell'applicazione, YYMMDD.",
    format: 'date',
    min: 3,
    max: 3,
    example: '240101'
  },
  {
    tag: '5F28',
    name: 'Issuer Country Code',
    desc: "Paese dell'issuer, ISO 3166 numerico (n3).",
    format: 'n',
    min: 2,
    max: 2,
    options: COUNTRIES,
    example: '0380'
  },
  {
    tag: '5F30',
    name: 'Service Code',
    desc: 'Service code (n3) come da ISO/IEC 7813, es. 201.',
    format: 'n',
    min: 2,
    max: 2,
    example: '0201'
  },
  {
    tag: '5F34',
    name: 'PAN Sequence Number',
    desc: 'Distingue carte diverse con lo stesso PAN (n2).',
    format: 'n',
    min: 1,
    max: 1,
    example: '01'
  },
  {
    tag: '8C',
    name: 'Card Risk Management DOL 1 (CDOL1)',
    desc: 'Dati che il terminale deve inviare nel primo GENERATE AC.',
    format: 'dol',
    max: 252,
    example: '9F02069F03069F1A0295055F2A029A039C019F37049F35019F45029F4C089F3403'
  },
  {
    tag: '8D',
    name: 'Card Risk Management DOL 2 (CDOL2)',
    desc: 'Dati che il terminale deve inviare nel secondo GENERATE AC.',
    format: 'dol',
    max: 252,
    example: '910A8A0295059F37049F4C08'
  },
  {
    tag: '8E',
    name: 'Cardholder Verification Method (CVM) List',
    desc: 'Importi X e Y seguiti da regole CVM (metodo + condizione) in ordine di priorità.',
    format: 'cvm',
    min: 10,
    max: 252,
    example: '000000000000000042031E031F03'
  },
  {
    tag: '97',
    name: 'Transaction Certificate DOL (TDOL)',
    desc: 'Dati usati per generare il TC Hash Value.',
    format: 'dol',
    max: 252
  },
  {
    tag: '9F49',
    name: 'Dynamic Data Authentication DOL (DDOL)',
    desc: 'Dati inviati nella INTERNAL AUTHENTICATE (deve contenere 9F37).',
    format: 'dol',
    max: 252,
    example: '9F3704'
  },
  {
    tag: '9F07',
    name: 'Application Usage Control (AUC)',
    desc: "Restrizioni d'uso definite dall'issuer (domestico/internazionale, cash, beni, servizi, ATM).",
    format: 'b',
    min: 2,
    max: 2,
    bitfield: 'auc',
    example: 'FF00'
  },
  {
    tag: '9F08',
    name: 'Application Version Number (card)',
    desc: "Versione dell'applicazione assegnata dal payment system.",
    format: 'b',
    min: 2,
    max: 2,
    example: '0002'
  },
  {
    tag: '9F0D',
    name: 'Issuer Action Code – Default',
    desc: 'Condizioni TVR per cui rifiutare offline se il terminale non può andare online.',
    format: 'b',
    min: 5,
    max: 5,
    bitfield: 'tvr',
    example: 'F040008800'
  },
  {
    tag: '9F0E',
    name: 'Issuer Action Code – Denial',
    desc: 'Condizioni TVR per cui rifiutare la transazione senza andare online.',
    format: 'b',
    min: 5,
    max: 5,
    bitfield: 'tvr',
    example: '0010000000'
  },
  {
    tag: '9F0F',
    name: 'Issuer Action Code – Online',
    desc: 'Condizioni TVR per cui andare online.',
    format: 'b',
    min: 5,
    max: 5,
    bitfield: 'tvr',
    example: 'F040009800'
  },
  {
    tag: '9F14',
    name: 'Lower Consecutive Offline Limit',
    desc: 'Numero massimo di transazioni offline consecutive prima di andare online.',
    format: 'b',
    min: 1,
    max: 1
  },
  {
    tag: '9F23',
    name: 'Upper Consecutive Offline Limit',
    desc: 'Numero massimo di transazioni offline consecutive oltre il quale rifiutare se non online.',
    format: 'b',
    min: 1,
    max: 1
  },
  {
    tag: '9F1F',
    name: 'Track 1 Discretionary Data',
    desc: 'Dati discrezionali della traccia 1.',
    format: 'ans'
  },
  {
    tag: '9F20',
    name: 'Track 2 Discretionary Data',
    desc: 'Dati discrezionali della traccia 2.',
    format: 'cn'
  },
  {
    tag: '56',
    name: 'Track 1 Data',
    desc: 'Dati traccia 1 (Mastercard contactless, mag-stripe mode).',
    format: 'ans',
    max: 76
  },
  {
    tag: '9F6B',
    name: 'Track 2 Data',
    desc: 'Dati traccia 2 (Mastercard contactless).',
    format: 'track2',
    max: 19
  },
  {
    tag: '9F42',
    name: 'Application Currency Code',
    desc: "Valuta dell'applicazione, ISO 4217 numerico (n3).",
    format: 'n',
    min: 2,
    max: 2,
    options: CURRENCIES,
    example: '0978'
  },
  {
    tag: '9F44',
    name: 'Application Currency Exponent',
    desc: 'Posizione della virgola decimale per la valuta applicazione (n1).',
    format: 'n',
    min: 1,
    max: 1,
    example: '02'
  },
  {
    tag: '9F05',
    name: 'Application Discretionary Data',
    desc: "Dati discrezionali dell'issuer.",
    format: 'b',
    min: 1,
    max: 32
  },
  {
    tag: '9F24',
    name: 'Payment Account Reference (PAR)',
    desc: 'Riferimento del conto non finanziario (29 caratteri).',
    format: 'an',
    min: 29,
    max: 29
  },
  {
    tag: '9F19',
    name: 'Token Requestor ID',
    desc: 'Identificativo del token requestor (n11).',
    format: 'n',
    min: 6,
    max: 6
  },
  {
    tag: '9F25',
    name: 'Last 4 Digits of PAN',
    desc: 'Ultime 4 cifre del PAN (n4).',
    format: 'n',
    min: 2,
    max: 2
  },

  // ---- ODA ----
  {
    tag: '8F',
    name: 'Certification Authority Public Key Index',
    desc: 'Indice della chiave pubblica della CA (RID + indice) usata per ODA.',
    format: 'b',
    min: 1,
    max: 1,
    example: '92'
  },
  {
    tag: '90',
    name: 'Issuer Public Key Certificate',
    desc: "Certificato della chiave pubblica dell'issuer firmato dalla CA (lunghezza = modulo CA).",
    format: 'b'
  },
  {
    tag: '92',
    name: 'Issuer Public Key Remainder',
    desc: "Parte del modulo della chiave dell'issuer che non entra nel certificato.",
    format: 'b'
  },
  {
    tag: '9F32',
    name: 'Issuer Public Key Exponent',
    desc: "Esponente della chiave pubblica dell'issuer (03 o 010001).",
    format: 'b',
    min: 1,
    max: 3,
    options: [
      { value: '03', label: '3' },
      { value: '010001', label: '65537' }
    ],
    example: '03'
  },
  {
    tag: '93',
    name: 'Signed Static Application Data',
    desc: 'Dati statici firmati per SDA.',
    format: 'b'
  },
  {
    tag: '9F46',
    name: 'ICC Public Key Certificate',
    desc: "Certificato della chiave pubblica della carta firmato dall'issuer.",
    format: 'b'
  },
  {
    tag: '9F47',
    name: 'ICC Public Key Exponent',
    desc: 'Esponente della chiave pubblica della carta (03 o 010001).',
    format: 'b',
    min: 1,
    max: 3,
    options: [
      { value: '03', label: '3' },
      { value: '010001', label: '65537' }
    ],
    example: '03'
  },
  {
    tag: '9F48',
    name: 'ICC Public Key Remainder',
    desc: 'Parte del modulo della chiave della carta che non entra nel certificato.',
    format: 'b'
  },
  {
    tag: '9F4A',
    name: 'Static Data Authentication Tag List',
    desc: "Lista di tag (tipicamente solo 82) i cui valori entrano nell'autenticazione statica.",
    format: 'b',
    example: '82'
  },
  {
    tag: '9F4B',
    name: 'Signed Dynamic Application Data (SDAD)',
    desc: 'Firma dinamica generata dalla carta (DDA/fDDA/CDA).',
    format: 'b'
  },
  {
    tag: '9F4C',
    name: 'ICC Dynamic Number',
    desc: 'Numero dinamico generato dalla carta (2–8 byte).',
    format: 'b',
    min: 2,
    max: 8
  },
  {
    tag: '9F69',
    name: 'Card Authentication Related Data',
    desc: 'Dati per fDDA (Visa): versione, numero dinamico, CTQ.',
    format: 'b'
  },

  // ---- Cryptogram ----
  {
    tag: '9F27',
    name: 'Cryptogram Information Data (CID)',
    desc: 'Tipo di crittogramma restituito (AAC/TC/ARQC) e advice.',
    format: 'b',
    min: 1,
    max: 1,
    bitfield: 'cid',
    example: '80'
  },
  {
    tag: '9F36',
    name: 'Application Transaction Counter (ATC)',
    desc: 'Contatore delle transazioni gestito dalla carta.',
    format: 'b',
    min: 2,
    max: 2,
    example: '0001'
  },
  {
    tag: '9F26',
    name: 'Application Cryptogram',
    desc: 'Crittogramma (ARQC/TC/AAC) di 8 byte.',
    format: 'b',
    min: 8,
    max: 8,
    example: '1A2B3C4D5E6F7A8B'
  },
  {
    tag: '9F10',
    name: 'Issuer Application Data (IAD)',
    desc: "Dati proprietari dell'issuer trasmessi online (formato dipendente dal circuito).",
    format: 'b',
    min: 1,
    max: 32,
    example: '06011203A00000'
  },
  {
    tag: '9F13',
    name: 'Last Online ATC Register',
    desc: "Valore dell'ATC all'ultima transazione online autorizzata.",
    format: 'b',
    min: 2,
    max: 2,
    example: '0000'
  },
  {
    tag: '9F17',
    name: 'PIN Try Counter',
    desc: 'Numero di tentativi PIN rimanenti.',
    format: 'b',
    min: 1,
    max: 1,
    example: '03'
  },
  {
    tag: '9F4F',
    name: 'Log Format',
    desc: 'DOL che descrive il formato dei record del log transazioni.',
    format: 'dol',
    example: '9F27019F02065F2A029A039F3602'
  },
  {
    tag: '9F45',
    name: 'Data Authentication Code',
    desc: 'Codice generato da SDA e restituito nel GENERATE AC.',
    format: 'b',
    min: 2,
    max: 2
  },

  // ---- Contactless ----
  {
    tag: '9F6C',
    name: 'Card Transaction Qualifiers (CTQ)',
    desc: 'Indicazioni della carta al reader contactless (Visa): CVM richiesto, comportamento in caso di errore.',
    format: 'b',
    min: 2,
    max: 2,
    bitfield: 'ctq',
    example: '0000'
  },
  {
    tag: '9F6E',
    name: 'Form Factor Indicator / Third Party Data',
    desc: 'Visa: Form Factor Indicator. Mastercard: Third Party Data.',
    format: 'b',
    min: 4,
    max: 32,
    example: '20700000'
  },
  {
    tag: '9F5D',
    name: 'Available Offline Spending Amount',
    desc: 'Importo disponibile per spese offline (n12).',
    format: 'n',
    min: 6,
    max: 6
  },
  {
    tag: '9F7C',
    name: 'Customer Exclusive Data',
    desc: 'Dati proprietari del cliente/issuer (Visa).',
    format: 'b',
    max: 32
  },

  // ---- Terminal data (used in DOLs) ----
  {
    tag: '9F66',
    name: 'Terminal Transaction Qualifiers (TTQ)',
    desc: '',
    format: 'b',
    min: 4,
    max: 4,
    source: 'terminal'
  },
  {
    tag: '9F02',
    name: 'Amount, Authorised (Numeric)',
    desc: '',
    format: 'n',
    min: 6,
    max: 6,
    source: 'terminal'
  },
  {
    tag: '9F03',
    name: 'Amount, Other (Numeric)',
    desc: '',
    format: 'n',
    min: 6,
    max: 6,
    source: 'terminal'
  },
  {
    tag: '9F1A',
    name: 'Terminal Country Code',
    desc: '',
    format: 'n',
    min: 2,
    max: 2,
    source: 'terminal'
  },
  {
    tag: '95',
    name: 'Terminal Verification Results (TVR)',
    desc: '',
    format: 'b',
    min: 5,
    max: 5,
    source: 'terminal'
  },
  {
    tag: '5F2A',
    name: 'Transaction Currency Code',
    desc: '',
    format: 'n',
    min: 2,
    max: 2,
    source: 'terminal'
  },
  {
    tag: '9A',
    name: 'Transaction Date',
    desc: '',
    format: 'n',
    min: 3,
    max: 3,
    source: 'terminal'
  },
  {
    tag: '9C',
    name: 'Transaction Type',
    desc: '',
    format: 'n',
    min: 1,
    max: 1,
    source: 'terminal'
  },
  {
    tag: '9F21',
    name: 'Transaction Time',
    desc: '',
    format: 'n',
    min: 3,
    max: 3,
    source: 'terminal'
  },
  {
    tag: '9F37',
    name: 'Unpredictable Number',
    desc: '',
    format: 'b',
    min: 4,
    max: 4,
    source: 'terminal'
  },
  {
    tag: '9F35',
    name: 'Terminal Type',
    desc: '',
    format: 'n',
    min: 1,
    max: 1,
    source: 'terminal'
  },
  {
    tag: '9F33',
    name: 'Terminal Capabilities',
    desc: '',
    format: 'b',
    min: 3,
    max: 3,
    source: 'terminal'
  },
  {
    tag: '9F40',
    name: 'Additional Terminal Capabilities',
    desc: '',
    format: 'b',
    min: 5,
    max: 5,
    source: 'terminal'
  },
  {
    tag: '9F34',
    name: 'CVM Results',
    desc: '',
    format: 'b',
    min: 3,
    max: 3,
    source: 'terminal'
  },
  {
    tag: '9F09',
    name: 'Application Version Number (terminal)',
    desc: '',
    format: 'b',
    min: 2,
    max: 2,
    source: 'terminal'
  },
  {
    tag: '9F1E',
    name: 'Interface Device (IFD) Serial Number',
    desc: '',
    format: 'an',
    min: 8,
    max: 8,
    source: 'terminal'
  },
  {
    tag: '9F4E',
    name: 'Merchant Name and Location',
    desc: '',
    format: 'ans',
    source: 'terminal'
  },
  {
    tag: '9F15',
    name: 'Merchant Category Code',
    desc: '',
    format: 'n',
    min: 2,
    max: 2,
    source: 'terminal'
  },
  {
    tag: '9F16',
    name: 'Merchant Identifier',
    desc: '',
    format: 'ans',
    min: 15,
    max: 15,
    source: 'terminal'
  },
  {
    tag: '9F1C',
    name: 'Terminal Identification',
    desc: '',
    format: 'an',
    min: 8,
    max: 8,
    source: 'terminal'
  },
  {
    tag: '8A',
    name: 'Authorisation Response Code',
    desc: '',
    format: 'an',
    min: 2,
    max: 2,
    source: 'terminal'
  },
  {
    tag: '91',
    name: 'Issuer Authentication Data',
    desc: '',
    format: 'b',
    min: 8,
    max: 16,
    source: 'terminal'
  },
  {
    tag: '98',
    name: 'TC Hash Value',
    desc: '',
    format: 'b',
    min: 20,
    max: 20,
    source: 'terminal'
  },
  {
    tag: '9F52',
    name: 'Application Default Action (ADA)',
    desc: '',
    format: 'b',
    source: 'card'
  }
]

export const TAGS: Record<string, TagDef> = {}
for (const d of DEFS) {
  // First definition wins: card-side meaning has precedence over terminal-side.
  if (!TAGS[d.tag]) TAGS[d.tag] = d
}

export function tagDef(tag: string): TagDef {
  return (
    TAGS[tag.toUpperCase()] ?? {
      tag: tag.toUpperCase(),
      name: t('Tag sconosciuto / proprietario'),
      desc: 'Tag non presente nel dizionario: il valore è trattato come binario.',
      format: 'b'
    }
  )
}

/** Tags that can be referenced in a DOL, sorted so terminal data comes first. */
export const DOL_TAGS: TagDef[] = Object.values(TAGS)
  .filter((d) => !d.children)
  .sort((a, b) => Number(b.source === 'terminal') - Number(a.source === 'terminal'))

export const ROOT_TAGS = ['6F', '70', '77', '80']

export interface StatusWord {
  sw: string
  label: string
}

export const STATUS_WORDS: StatusWord[] = [
  { sw: '9000', label: 'Esecuzione corretta' },
  { sw: '6283', label: 'File selezionato invalidato (applicazione bloccata)' },
  { sw: '6300', label: 'Autenticazione fallita' },
  { sw: '63C0', label: 'Verifica fallita, 0 tentativi rimanenti (63Cx)' },
  { sw: '63C2', label: 'Verifica fallita, 2 tentativi rimanenti (63Cx)' },
  { sw: '6700', label: 'Lunghezza errata' },
  { sw: '6981', label: 'Comando incompatibile con la struttura del file' },
  { sw: '6983', label: 'Metodo di autenticazione bloccato' },
  { sw: '6984', label: 'Dati referenziati invalidati' },
  { sw: '6985', label: "Condizioni d'uso non soddisfatte" },
  { sw: '6986', label: 'Comando non consentito' },
  { sw: '6A81', label: 'Funzione non supportata (carta bloccata)' },
  { sw: '6A82', label: 'File / applicazione non trovata' },
  { sw: '6A83', label: 'Record non trovato' },
  { sw: '6A86', label: 'P1-P2 errati' },
  { sw: '6A88', label: 'Dati referenziati non trovati' },
  { sw: '6D00', label: 'INS non supportato' },
  { sw: '6E00', label: 'CLA non supportata' },
  { sw: '6F00', label: 'Errore generico' }
]

export function describeSw(sw: string): string {
  const exact = STATUS_WORDS.find((s) => s.sw === sw)
  if (exact) return t(exact.label)
  if (/^61[0-9A-F]{2}$/.test(sw))
    return t('Altri {n} byte disponibili (GET RESPONSE)', { n: parseInt(sw.substr(2), 16) })
  if (/^6C[0-9A-F]{2}$/.test(sw)) return t('Le errato, usare Le = {le}', { le: sw.substr(2) })
  if (/^63C[0-9A-F]$/.test(sw))
    return t('Verifica fallita, {n} tentativi rimanenti', { n: parseInt(sw.substr(3), 16) })
  return t('Status word non standard')
}
