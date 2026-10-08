// Contextual help: usage of each tag and its role in the EMV payment flow.
// Texts are Italian source strings, translated with t() (see i18n/en.ts).

export type Phase =
  'sel' | 'gpo' | 'read' | 'oda' | 'restr' | 'cvm' | 'trm' | 'taa' | 'gac' | 'online' | 'compl'

export interface PhaseDef {
  id: Phase
  name: string
  desc: string
}

/** Steps of an EMV transaction, in order (EMV Book 3 §10). */
export const PHASES: PhaseDef[] = [
  {
    id: 'sel',
    name: 'Selezione applicazione',
    desc: "SELECT di PPSE/PSE e AID: il terminale costruisce la candidate list e sceglie l'applicazione."
  },
  {
    id: 'gpo',
    name: 'Avvio (GET PROCESSING OPTIONS)',
    desc: 'Il terminale invia i dati richiesti dal PDOL; la carta risponde con AIP e AFL (e in contactless spesso con il crittogramma).'
  },
  { id: 'read', name: 'Lettura dati (READ RECORD)', desc: "Lettura dei record indicati dall'AFL." },
  {
    id: 'oda',
    name: 'Offline Data Authentication',
    desc: 'Verifica di autenticità della carta con SDA, DDA, CDA o fDDA tramite certificati e firme RSA.'
  },
  {
    id: 'restr',
    name: 'Processing Restrictions',
    desc: "Controlli di versione, date di validità e restrizioni d'uso (AUC)."
  },
  {
    id: 'cvm',
    name: 'Verifica del titolare (CVM)',
    desc: 'Scelta ed esecuzione del metodo di verifica: PIN offline o online, firma, nessun CVM.'
  },
  {
    id: 'trm',
    name: 'Terminal Risk Management',
    desc: 'Floor limit, selezione casuale per online e velocity checking.'
  },
  {
    id: 'taa',
    name: 'Terminal Action Analysis',
    desc: 'Confronto del TVR con IAC e TAC per decidere se rifiutare, andare online o approvare offline.'
  },
  {
    id: 'gac',
    name: 'Card Action Analysis (GENERATE AC)',
    desc: 'La carta genera il crittogramma (AAC, TC o ARQC) confermando o modificando la decisione del terminale.'
  },
  {
    id: 'online',
    name: 'Autorizzazione online',
    desc: "Invio dei dati chip all'issuer, verifica dell'ARQC e risposta con ARPC."
  },
  {
    id: 'compl',
    name: 'Completamento e script',
    desc: 'Issuer authentication, secondo GENERATE AC e issuer script.'
  }
]

export interface TagHelp {
  phases: Phase[]
  /** Specification reference (not translated). */
  spec: string
  usage: string
  flow: string
}

export const TAG_HELP: Record<string, TagHelp> = {
  '42': {
    phases: ['sel'],
    spec: 'EMV Book 3, Annex A',
    usage:
      "Issuer Identification Number: le prime cifre del PAN (BIN/IIN) che identificano l'issuer.",
    flow: 'Può essere usato dal terminale per instradamento o selezione prima di leggere il PAN completo.'
  },
  '4F': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.2.1; ISO/IEC 7816-5',
    usage:
      'Application Identifier della carta: RID di 5 byte (identifica il circuito, es. A000000003 = Visa, A000000004 = Mastercard) seguito da un PIX fino a 11 byte che identifica il prodotto.',
    flow: "Il terminale confronta l'AID con la propria lista di AID supportati (matching esatto o parziale) per decidere quali applicazioni sono candidate, poi lo usa nel comando SELECT."
  },
  '50': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.2.3',
    usage:
      "Nome mnemonico dell'applicazione (es. 'VISA CREDIT'), in caratteri ans della ISO 8859 di base, massimo 16 caratteri.",
    flow: "Mostrato al titolare quando deve scegliere tra più applicazioni o confermarne una; il terminale lo usa se non può visualizzare l'Application Preferred Name (9F12)."
  },
  '56': {
    phases: ['read', 'online'],
    spec: 'EMV Book C-2',
    usage:
      'Track 1 Data (Mastercard): immagine della traccia 1 usata in mag-stripe mode contactless.',
    flow: "In mag-stripe mode il kernel aggiorna i dati dinamici (CVC3, UN, ATC) e li invia all'acquirer al posto dei dati chip."
  },
  '57': {
    phases: ['read', 'online'],
    spec: 'EMV Book 3, Annex A',
    usage:
      "Track 2 Equivalent Data: PAN, separatore 'D', scadenza YYMM, service code e dati discrezionali, in formato BCD con padding F.",
    flow: "Letto nei record o restituito direttamente nella GPO contactless. Viene inviato all'acquirer nel messaggio di autorizzazione (campo 35 ISO 8583) e deve essere coerente con PAN (5A) e scadenza (5F24)."
  },
  '5A': {
    phases: ['read', 'restr', 'online'],
    spec: 'EMV Book 3, Annex A',
    usage:
      'Primary Account Number della carta, numerico compresso fino a 19 cifre con padding F; deve superare il controllo Luhn.',
    flow: 'Letto nei record. Usato per la exception file check del terminale, per il messaggio di autorizzazione e, nei certificati ODA, viene confrontato con il PAN certificato.'
  },
  '5F20': {
    phases: ['read'],
    spec: 'EMV Book 3, Annex A',
    usage: "Nome del titolare (2-26 caratteri), tipicamente 'COGNOME/NOME'.",
    flow: 'Informativo: può essere stampato sullo scontrino. Per privacy molte carte contactless lo omettono o lo valorizzano con un testo generico.'
  },
  '5F24': {
    phases: ['read', 'restr'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.4',
    usage: "Data di scadenza dell'applicazione in formato YYMMDD.",
    flow: "Nelle Processing Restrictions il terminale la confronta con la data della transazione: se è passata imposta il bit TVR 'Applicazione scaduta'. In contactless Visa il CTQ può chiedere di andare online."
  },
  '5F25': {
    phases: ['read', 'restr'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.4',
    usage: "Data di inizio validità dell'applicazione in formato YYMMDD.",
    flow: "Nelle Processing Restrictions, se la data della transazione è precedente, il terminale imposta il bit TVR 'Applicazione non ancora valida'."
  },
  '5F28': {
    phases: ['read', 'restr'],
    spec: 'EMV Book 3, Annex A; ISO 3166-1',
    usage: "Paese dell'issuer, codice numerico ISO 3166-1 (es. 0380 = Italia).",
    flow: "Confrontato con il Terminal Country Code (9F1A) per stabilire se la transazione è domestica o internazionale, e quindi quali bit dell'AUC (9F07) applicare."
  },
  '5F2A': {
    phases: ['gpo', 'gac', 'cvm'],
    spec: 'EMV Book 3, Annex A; ISO 4217',
    usage: 'Valuta della transazione, codice numerico ISO 4217.',
    flow: 'Richiesto nei DOL e confrontato con 9F42 per le condizioni CVM sugli importi.'
  },
  '5F2D': {
    phases: ['sel', 'cvm'],
    spec: 'EMV Book 1 §11.3.4; ISO 639-1',
    usage:
      'Da 1 a 4 codici lingua ISO 639-1 (minuscoli, 2 caratteri ciascuno) in ordine di preferenza del titolare.',
    flow: "Il terminale sceglie la prima lingua supportata per i messaggi al titolare (es. 'Inserire PIN', 'Approvato'); se nessuna è supportata usa la lingua di default."
  },
  '5F30': {
    phases: ['read', 'restr'],
    spec: 'ISO/IEC 7813',
    usage:
      'Service code a 3 cifre (es. 201): la prima indica interchange e presenza del chip, la seconda le regole di autorizzazione, la terza i servizi consentiti e i requisiti PIN.',
    flow: 'Usato soprattutto in fallback a banda magnetica; un primo digit 2 o 6 indica che la carta ha il chip.'
  },
  '5F34': {
    phases: ['read', 'online'],
    spec: 'EMV Book 3, Annex A',
    usage:
      'PAN Sequence Number: distingue carte diverse emesse con lo stesso PAN (es. rinnovi o carte aggiuntive).',
    flow: "Inviato all'issuer nel messaggio di autorizzazione (campo 23 ISO 8583) ed è spesso un input per la derivazione delle chiavi della carta."
  },
  '5F50': {
    phases: ['sel'],
    spec: 'EMV Book 3, Annex A',
    usage: "URL dell'issuer, in caratteri ans.",
    flow: 'Informativo; non influenza il flusso di pagamento.'
  },
  '5F53': {
    phases: ['sel'],
    spec: 'EMV Book 3, Annex A; ISO 13616',
    usage: 'IBAN del conto associato alla carta.',
    flow: 'Usato in schemi domestici o per servizi a valore aggiunto (es. addebito diretto); non influenza la transazione EMV.'
  },
  '5F54': {
    phases: ['sel'],
    spec: 'EMV Book 3, Annex A; ISO 9362',
    usage:
      'Business Identifier Code della banca: 4 lettere per la banca, 2 per il paese, 2 caratteri per la località, 3 opzionali per la filiale.',
    flow: "Usato insieme all'IBAN in schemi domestici; non influenza la transazione EMV."
  },
  '5F55': {
    phases: ['sel'],
    spec: 'EMV Book 3, Annex A; ISO 3166-1',
    usage: "Paese dell'issuer in formato ISO 3166-1 alpha-2 (es. 'IT').",
    flow: 'Può essere usato in selezione per regole domestiche o di routing.'
  },
  '5F56': {
    phases: ['sel'],
    spec: 'EMV Book 3, Annex A; ISO 3166-1',
    usage: "Paese dell'issuer in formato ISO 3166-1 alpha-3 (es. 'ITA').",
    flow: 'Può essere usato in selezione per regole domestiche o di routing.'
  },
  '61': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.2.3',
    usage:
      "Directory Entry: descrive una singola applicazione disponibile sulla carta con almeno l'AID (4F) e, di solito, label (50), priorità (87) e, in contactless, il Kernel Identifier (9F2A). Può ripetersi.",
    flow: "Restituita nella PPSE (contactless) o nei record del file di directory della PSE (contact). Ogni entry diventa una candidata; il terminale poi seleziona l'AID scelto."
  },
  '6F': {
    phases: ['sel'],
    spec: 'EMV Book 1 §11.3.4',
    usage:
      'Contenitore principale della risposta a SELECT, sia per PPSE/PSE sia per un AID. Racchiude il DF Name (84) e il template proprietario (A5) con i dati utili alla selezione.',
    flow: "È la prima struttura TLV che il terminale riceve: da qui ricava la lista delle applicazioni candidate e, dopo la SELECT dell'AID, label, priorità e PDOL."
  },
  '70': {
    phases: ['read'],
    spec: 'EMV Book 3, Annex A',
    usage:
      'Template che racchiude i dati di un record letto con READ RECORD: dati di traccia, PAN, date, DOL, CVM List, Issuer Action Codes, chiavi e certificati per ODA.',
    flow: "Dopo la GPO il terminale legge tutti i record indicati dall'AFL (94); ogni risposta è un template 70. I record segnati per ODA entrano nel calcolo dell'autenticazione offline."
  },
  '73': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.2.3',
    usage:
      "Directory Discretionary Template: dati aggiuntivi associati a una Directory Entry, definiti dall'issuer o dal circuito.",
    flow: 'Letto insieme alla Directory Entry durante la costruzione della candidate list.'
  },
  '77': {
    phases: ['gpo', 'gac'],
    spec: 'EMV Book 3, Annex A; Book 3 §6.5',
    usage:
      'Response Message Template Format 2: risposta in formato TLV, in cui ogni dato è identificato dal proprio tag. È il formato più flessibile e quello usato dalle carte moderne.',
    flow: 'Usato nelle risposte a GET PROCESSING OPTIONS, GENERATE AC e INTERNAL AUTHENTICATE. In contactless (es. Visa qVSDC) la GPO in formato 2 può già contenere crittogramma e dati di traccia.'
  },
  '80': {
    phases: ['gpo', 'gac'],
    spec: 'EMV Book 3, Annex A; Book 3 §6.5',
    usage:
      'Response Message Template Format 1: i valori sono concatenati in un ordine fisso, senza tag né lunghezze interne. Per la GPO: AIP || AFL; per GENERATE AC: CID || ATC || AC || IAD.',
    flow: "Usato soprattutto da carte contact meno recenti. Il terminale scompone il valore in base alla posizione dei campi, quindi l'ordine e le lunghezze devono essere esatti."
  },
  '82': {
    phases: ['gpo', 'oda', 'cvm', 'trm'],
    spec: 'EMV Book 3, Annex C1',
    usage:
      'Application Interchange Profile: indica le funzioni supportate dalla carta: SDA, DDA, CDA, verifica del titolare, terminal risk management obbligatorio, issuer authentication e, in contactless, CVM sul dispositivo e relay resistance.',
    flow: "Restituito nella GPO. Guida il resto della transazione: il metodo ODA scelto dal terminale, l'esecuzione della CVM e del risk management. È sempre incluso nei dati autenticati staticamente."
  },
  '84': {
    phases: ['sel'],
    spec: 'EMV Book 1 §11.3.4',
    usage:
      "Nome del Dedicated File selezionato: '2PAY.SYS.DDF01' per la PPSE contactless, '1PAY.SYS.DDF01' per la PSE contact, oppure l'AID dell'applicazione.",
    flow: "Conferma al terminale quale DF è stato selezionato. Dopo la SELECT dell'AID deve coincidere (o iniziare) con l'AID richiesto."
  },
  '87': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.4',
    usage:
      "Application Priority Indicator: i bit b4-b1 indicano la priorità (1 = massima, 0 = nessuna), il bit b8 indica se l'applicazione può essere selezionata solo con conferma del titolare.",
    flow: 'Il terminale ordina la candidate list in base a questa priorità; con selezione automatica sceglie la priorità più alta che non richiede conferma.'
  },
  '88': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.2.2',
    usage:
      "Short File Identifier dell'Elementary File di directory della PSE (contact), valori 1-30.",
    flow: 'Dopo la SELECT della PSE il terminale legge i record di questo SFI con READ RECORD per ottenere le Directory Entry delle applicazioni.'
  },
  '8A': {
    phases: ['online', 'compl'],
    spec: 'EMV Book 3, Annex A',
    usage:
      "Authorisation Response Code: esito dell'autorizzazione (es. '00' approvata) o codice generato dal terminale ('Y1', 'Z1', 'Y3', 'Z3').",
    flow: 'Inviato alla carta nel secondo GENERATE AC tramite CDOL2.'
  },
  '8C': {
    phases: ['read', 'gac'],
    spec: 'EMV Book 3, Annex A; Book 3 §5.4',
    usage:
      'CDOL1: lista tag + lunghezza dei dati del terminale richiesti nel primo GENERATE AC (importo, valuta, data, TVR, Unpredictable Number, ecc.).',
    flow: 'Letto nei record. Il terminale costruisce il campo dati del primo GENERATE AC concatenando i valori richiesti; la carta li usa per il crittogramma e per il Card Risk Management.'
  },
  '8D': {
    phases: ['read', 'online', 'compl'],
    spec: 'EMV Book 3, Annex A; Book 3 §5.4',
    usage:
      'CDOL2: dati richiesti nel secondo GENERATE AC, tipicamente Authorisation Response Code (8A), Issuer Authentication Data (91), TVR e Unpredictable Number.',
    flow: "Usato dopo la risposta online dell'issuer: il terminale invia l'esito dell'autorizzazione e la carta decide se generare TC (approvata) o AAC (rifiutata)."
  },
  '8E': {
    phases: ['read', 'cvm'],
    spec: 'EMV Book 3, Annex C3; Book 3 §10.5',
    usage:
      'CVM List: importi X e Y (4 byte ciascuno) seguiti da regole di 2 byte (metodo CVM + condizione) in ordine di priorità. Il bit b7 del primo byte indica se, in caso di fallimento, provare la regola successiva.',
    flow: "Nella fase di Cardholder Verification il terminale scorre le regole: la prima la cui condizione è soddisfatta e il cui metodo è supportato viene eseguita (PIN offline, PIN online, firma, nessun CVM). L'esito finisce nei CVM Results (9F34)."
  },
  '8F': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §5',
    usage:
      "Indice della chiave pubblica della Certification Authority del circuito (combinato con il RID dell'AID).",
    flow: "All'inizio dell'ODA il terminale cerca la chiave CA corrispondente a RID + indice; se non la trova l'ODA fallisce e viene impostato il bit TVR relativo."
  },
  '90': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §5.3',
    usage:
      "Certificato della chiave pubblica dell'issuer, firmato dalla CA; la lunghezza è pari al modulo della chiave CA.",
    flow: "Il terminale lo verifica con la chiave CA (8F) per recuperare la chiave pubblica dell'issuer, necessaria per verificare SDA o il certificato ICC."
  },
  '91': {
    phases: ['online', 'compl'],
    spec: 'EMV Book 3, Annex A; Book 2 §8.2',
    usage:
      "Issuer Authentication Data: contiene l'ARPC calcolato dall'issuer ed eventuali dati proprietari.",
    flow: "Inviato alla carta con EXTERNAL AUTHENTICATE o nel secondo GENERATE AC (CDOL2) per l'issuer authentication."
  },
  '92': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §5.3',
    usage: "Parte del modulo della chiave pubblica dell'issuer che non entra nel certificato 90.",
    flow: 'Concatenato con la parte recuperata dal certificato per ricostruire il modulo completo.'
  },
  '93': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §5.4',
    usage:
      "Signed Static Application Data: firma dell'issuer sui dati statici della carta, usata per SDA.",
    flow: "Con SDA il terminale la verifica con la chiave dell'issuer, confrontando l'hash con i record ODA e i tag della SDA Tag List (9F4A)."
  },
  '94': {
    phases: ['gpo', 'read', 'oda'],
    spec: 'EMV Book 3 §10.2',
    usage:
      "Application File Locator: gruppi di 4 byte che indicano SFI, primo e ultimo record da leggere e quanti di questi record entrano nell'Offline Data Authentication.",
    flow: 'Restituito nella GPO. Il terminale esegue una READ RECORD per ogni record indicato (P2 = SFI<<3 | 4) e accumula i record ODA per la verifica della firma.'
  },
  '95': {
    phases: ['taa', 'gac', 'online'],
    spec: 'EMV Book 3, Annex C5',
    usage:
      "Terminal Verification Results: 5 byte in cui il terminale registra l'esito di tutti i controlli (ODA, restrizioni, CVM, risk management, script).",
    flow: "Confrontato con IAC/TAC nella Terminal Action Analysis, inviato alla carta in CDOL e all'issuer nell'autorizzazione."
  },
  '97': {
    phases: ['read', 'gac'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Transaction Certificate DOL: dati usati per calcolare il TC Hash Value (98).',
    flow: 'Se CDOL1/CDOL2 richiedono il TC Hash Value, il terminale lo calcola come SHA-1 dei dati indicati dal TDOL (o da un TDOL di default, impostando il relativo bit TVR).'
  },
  '98': {
    phases: ['gac'],
    spec: 'EMV Book 3, Annex A',
    usage: 'TC Hash Value: hash SHA-1 dei dati indicati dal TDOL.',
    flow: 'Inviato alla carta se richiesto da CDOL1/CDOL2.'
  },
  '9A': {
    phases: ['gpo', 'restr', 'gac'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Data della transazione, YYMMDD.',
    flow: 'Usata nelle Processing Restrictions (scadenza e inizio validità) e inclusa nel crittogramma.'
  },
  '9C': {
    phases: ['gpo', 'restr', 'gac'],
    spec: 'EMV Book 3, Annex A; ISO 8583',
    usage:
      'Tipo di transazione (primi 2 digit del Processing Code ISO 8583: 00 acquisto, 01 prelievo, 09 acquisto con cashback, 20 rimborso).',
    flow: 'Usato per i controlli AUC e richiesto spesso nei DOL.'
  },
  '9F02': {
    phases: ['gpo', 'gac', 'cvm', 'trm'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Importo autorizzato della transazione (n12, nelle unità minime della valuta).',
    flow: 'Richiesto nei DOL (PDOL, CDOL1). Usato per floor limit, condizioni CVM e incluso nel crittogramma.'
  },
  '9F03': {
    phases: ['gpo', 'gac'],
    spec: 'EMV Book 3, Annex A',
    usage: "Importo 'altro', tipicamente il cashback (n12).",
    flow: 'Richiesto nei DOL e incluso nel crittogramma.'
  },
  '9F05': {
    phases: ['read'],
    spec: 'EMV Book 3, Annex A',
    usage: "Application Discretionary Data: dati liberi definiti dall'issuer.",
    flow: 'Non interpretato dal terminale nel flusso standard.'
  },
  '9F07': {
    phases: ['read', 'restr'],
    spec: 'EMV Book 3, Annex C2; Book 3 §10.4',
    usage:
      "Application Usage Control: restrizioni d'uso definite dall'issuer: cash, beni, servizi, cashback, ATM, distinguendo tra transazioni domestiche e internazionali.",
    flow: "Nelle Processing Restrictions il terminale verifica che il tipo di transazione e la sua natura (domestica se 5F28 = 9F1A) siano consentiti; altrimenti imposta il bit TVR 'Servizio richiesto non consentito'."
  },
  '9F08': {
    phases: ['read', 'restr'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.4',
    usage: "Versione dell'applicazione assegnata dal payment system alla carta.",
    flow: "Confrontata con la versione del terminale (9F09): se diversa il terminale imposta il bit TVR 'ICC e terminale hanno versioni applicazione diverse'."
  },
  '9F09': {
    phases: ['restr'],
    spec: 'EMV Book 3, Annex A',
    usage: "Versione dell'applicazione nel terminale.",
    flow: 'Confrontata con 9F08 della carta nelle Processing Restrictions.'
  },
  '9F0A': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.5; EMVCo ASRPD',
    usage:
      'Application Selection Registered Proprietary Data: dati proprietari registrati presso EMVCo che possono influenzare la selezione (es. programmi domestici).',
    flow: 'Il terminale può usarli per escludere o preferire applicazioni secondo regole locali.'
  },
  '9F0B': {
    phases: ['read'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Nome esteso del titolare (27-45 caratteri), usato quando il nome non entra in 5F20.',
    flow: 'Informativo, come 5F20.'
  },
  '9F0D': {
    phases: ['read', 'taa'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.7',
    usage:
      'Issuer Action Code - Default: maschera con lo stesso layout del TVR. Indica le condizioni per cui la transazione va rifiutata se il terminale non riesce ad andare online.',
    flow: 'Nella Terminal Action Analysis, se la transazione non può essere autorizzata online, il terminale confronta TVR con IAC-Default e TAC-Default: un bit in comune porta a richiedere un AAC.'
  },
  '9F0E': {
    phases: ['read', 'taa'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.7',
    usage:
      "Issuer Action Code - Denial: condizioni TVR per cui la transazione deve essere rifiutata offline senza tentare l'autorizzazione online.",
    flow: 'È la prima verifica della Terminal Action Analysis: se un bit del TVR coincide con IAC-Denial o TAC-Denial il terminale chiede un AAC nel primo GENERATE AC.'
  },
  '9F0F': {
    phases: ['read', 'taa'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.7',
    usage:
      'Issuer Action Code - Online: condizioni TVR per cui la transazione deve essere autorizzata online.',
    flow: 'Se il terminale è online-capable e un bit del TVR coincide con IAC-Online o TAC-Online, chiede un ARQC; altrimenti può chiedere un TC per approvare offline.'
  },
  '9F10': {
    phases: ['gac', 'online'],
    spec: 'EMV Book 3, Annex A; scheme specifications',
    usage:
      "Issuer Application Data: dati proprietari dell'issuer (es. Cryptogram Version Number, Derivation Key Index, Card Verification Results) con formato dipendente dal circuito.",
    flow: "Restituito con il crittogramma e inviato all'issuer, che lo usa per sapere come verificare l'ARQC e quali controlli ha eseguito la carta."
  },
  '9F11': {
    phases: ['sel'],
    spec: 'EMV Book 1 §11.3.4',
    usage:
      "Indica quale parte della ISO/IEC 8859 (1-10) è usata per codificare l'Application Preferred Name (9F12).",
    flow: 'Il terminale lo usa per decidere se è in grado di mostrare 9F12; obbligatorio quando 9F12 è presente.'
  },
  '9F12': {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.2.3',
    usage:
      "Nome preferito dell'applicazione, codificato con la parte della ISO 8859 indicata da 9F11 (permette caratteri nazionali).",
    flow: 'Se il terminale supporta la code table indicata, mostra questo nome al posto della Application Label durante la selezione.'
  },
  '9F13': {
    phases: ['trm'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.6.3',
    usage: "Last Online ATC Register: valore dell'ATC all'ultima transazione autorizzata online.",
    flow: "Letto con GET DATA durante il velocity checking: se vale 0 il terminale imposta il bit TVR 'Nuova carta'."
  },
  '9F14': {
    phases: ['read', 'trm'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.6.3',
    usage:
      "Lower Consecutive Offline Limit: numero di transazioni offline consecutive oltre il quale l'issuer vuole che il terminale vada online.",
    flow: 'Nel velocity checking del Terminal Risk Management il terminale confronta ATC - Last Online ATC con questo limite e, se superato, imposta il relativo bit TVR.'
  },
  '9F15': {
    phases: ['online'],
    spec: 'EMV Book 3, Annex A; ISO 18245',
    usage: 'Merchant Category Code (MCC).',
    flow: 'Usato da issuer e carta per regole specifiche per categoria merceologica.'
  },
  '9F16': {
    phases: ['online'],
    spec: 'EMV Book 3, Annex A',
    usage: "Identificativo dell'esercente presso l'acquirer.",
    flow: 'Inviato nel messaggio di autorizzazione.'
  },
  '9F17': {
    phases: ['cvm'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.5.1',
    usage: 'PIN Try Counter: numero di tentativi PIN offline rimanenti.',
    flow: "Letto con GET DATA prima della verifica PIN offline: se vale 0 il PIN è bloccato e il terminale imposta il bit TVR 'PIN Try Limit superato'."
  },
  '9F19': {
    phases: ['read', 'online'],
    spec: 'EMVCo Payment Tokenisation',
    usage: 'Token Requestor ID: identifica chi ha richiesto il token (es. wallet mobile).',
    flow: "Presente nelle transazioni tokenizzate e inviato nell'autorizzazione."
  },
  '9F1A': {
    phases: ['gpo', 'restr', 'gac'],
    spec: 'EMV Book 3, Annex A; ISO 3166-1',
    usage: 'Paese del terminale, codice numerico ISO 3166-1.',
    flow: 'Confrontato con 5F28 per stabilire se la transazione è domestica; richiesto spesso in PDOL e CDOL1.'
  },
  '9F1C': {
    phases: ['online'],
    spec: 'EMV Book 3, Annex A',
    usage: "Identificativo del terminale presso l'acquirer.",
    flow: 'Inviato nel messaggio di autorizzazione.'
  },
  '9F1E': {
    phases: ['online'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Numero di serie del dispositivo di interfaccia (IFD).',
    flow: "Può essere inviato all'issuer per identificare il terminale."
  },
  '9F1F': {
    phases: ['read', 'online'],
    spec: 'EMV Book 3, Annex A',
    usage: "Track 1 Discretionary Data: dati discrezionali della traccia 1 definiti dall'issuer.",
    flow: "Può essere inviato all'issuer nel messaggio di autorizzazione."
  },
  '9F20': {
    phases: ['read', 'online'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Track 2 Discretionary Data: dati discrezionali della traccia 2.',
    flow: "Può essere inviato all'issuer nel messaggio di autorizzazione."
  },
  '9F21': {
    phases: ['gac'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Ora della transazione, HHMMSS.',
    flow: 'Può essere richiesta in DOL e registrata nel log.'
  },
  '9F23': {
    phases: ['read', 'trm'],
    spec: 'EMV Book 3, Annex A; Book 3 §10.6.3',
    usage:
      'Upper Consecutive Offline Limit: numero di transazioni offline consecutive oltre il quale, se non si può andare online, la transazione va rifiutata.',
    flow: "Usato nel velocity checking insieme a 9F14, 9F36 e 9F13; il superamento imposta il bit TVR 'Upper consecutive offline limit superato'."
  },
  '9F24': {
    phases: ['read', 'online'],
    spec: 'EMVCo Payment Account Reference',
    usage:
      'Payment Account Reference: riferimento non finanziario di 29 caratteri che collega PAN e token dello stesso conto.',
    flow: "Inviato nell'autorizzazione per permettere ad acquirer ed esercenti di riconoscere il conto senza usare il PAN."
  },
  '9F25': {
    phases: ['read'],
    spec: 'EMVCo Payment Tokenisation',
    usage: 'Ultime 4 cifre del PAN reale, usate con i token.',
    flow: 'Permette di mostrare o stampare le ultime cifre del conto quando la carta presenta un token.'
  },
  '9F26': {
    phases: ['gac', 'online'],
    spec: 'EMV Book 3, Annex A; Book 2 §8.1',
    usage:
      'Application Cryptogram: MAC di 8 byte calcolato dalla carta con una chiave di sessione su dati di transazione e carta (importo, valuta, data, UN, ATC, ...).',
    flow: "Un ARQC viene verificato online dall'issuer, che risponde con un ARPC; un TC o un AAC viene conservato come prova della transazione approvata o rifiutata."
  },
  '9F27': {
    phases: ['gac', 'online'],
    spec: 'EMV Book 3, Annex A; Book 3 §6.5.5',
    usage:
      'Cryptogram Information Data: i bit b8-b7 indicano il tipo di crittogramma restituito (00 AAC rifiuto, 01 TC approvazione offline, 10 ARQC richiesta online); b4 e b3-b1 gestiscono advice e motivazioni.',
    flow: "È la decisione della carta nella Card Action Analysis: può confermare o 'abbassare' la richiesta del terminale (es. terminale chiede TC, carta risponde ARQC o AAC), mai alzarla."
  },
  '9F2A': {
    phases: ['sel'],
    spec: 'EMV Book B (Entry Point)',
    usage:
      "Kernel Identifier: indica quale kernel contactless del terminale deve processare l'applicazione (es. 02 Mastercard, 03 Visa, 04 Amex, 2E CPACE).",
    flow: "Usato dall'Entry Point durante la costruzione della candidate list: una combinazione AID + kernel è candidata solo se il terminale supporta quel kernel per quell'AID."
  },
  '9F32': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §5.3',
    usage: "Esponente pubblico RSA della chiave dell'issuer: 03 oppure 010001 (65537).",
    flow: 'Usato insieme al modulo recuperato per le verifiche RSA successive.'
  },
  '9F33': {
    phases: ['cvm', 'oda'],
    spec: 'EMV Book 3, Annex A2',
    usage: 'Terminal Capabilities: capacità del terminale (input, CVM supportati, ODA supportata).',
    flow: 'Usato per scegliere il metodo ODA e le regole CVM applicabili.'
  },
  '9F34': {
    phases: ['cvm', 'gac'],
    spec: 'EMV Book 3, Annex A4',
    usage: 'CVM Results: metodo CVM eseguito, condizione ed esito.',
    flow: "Prodotto nella fase di Cardholder Verification e inviato alla carta (CDOL) e all'issuer."
  },
  '9F35': {
    phases: ['gpo', 'gac'],
    spec: 'EMV Book 3, Annex A1',
    usage:
      'Terminal Type: ambiente operativo (presidiato o no, online/offline, finanziario o esercente).',
    flow: 'Influenza condizioni CVM e decisioni della carta; richiesto in alcuni DOL.'
  },
  '9F36': {
    phases: ['gac', 'trm', 'online'],
    spec: 'EMV Book 3, Annex A',
    usage:
      'Application Transaction Counter: contatore incrementato dalla carta a ogni transazione.',
    flow: "Input del crittogramma (protegge dai replay), usato nel velocity checking (ATC - Last Online ATC) e inviato all'issuer, che verifica la progressione."
  },
  '9F37': {
    phases: ['gpo', 'oda', 'gac'],
    spec: 'EMV Book 3, Annex A',
    usage: 'Unpredictable Number: 4 byte casuali generati dal terminale.',
    flow: "Garantisce l'unicità di crittogrammi e firme dinamiche: richiesto in PDOL, CDOL e DDOL."
  },
  '9F38': {
    phases: ['sel', 'gpo'],
    spec: 'EMV Book 3, Annex A; Book 3 §5.4',
    usage:
      'Processing Options Data Object List: lista di coppie tag + lunghezza che descrive i dati del terminale richiesti dalla carta nella GPO (es. TTQ 9F66, importo 9F02, Unpredictable Number 9F37).',
    flow: "Restituito nella SELECT AID. Il terminale concatena i valori richiesti, nell'ordine e con le lunghezze indicate, nel campo 83 della GET PROCESSING OPTIONS. Senza PDOL invia 8300."
  },
  '9F40': {
    phases: ['restr'],
    spec: 'EMV Book 3, Annex A3',
    usage:
      'Additional Terminal Capabilities: tipi di transazione supportati e capacità di input/output.',
    flow: "Usato in alcune verifiche e inviato all'issuer."
  },
  '9F42': {
    phases: ['read', 'trm', 'cvm'],
    spec: 'EMV Book 3, Annex A; ISO 4217',
    usage: "Valuta dell'applicazione, codice numerico ISO 4217 (es. 0978 = EUR).",
    flow: 'Le condizioni CVM su importi X/Y (codici 06-09) si applicano solo se la valuta della transazione (5F2A) coincide con questa; usata anche nei controlli di risk management sulla carta.'
  },
  '9F44': {
    phases: ['read'],
    spec: 'EMV Book 3, Annex A',
    usage:
      "Application Currency Exponent: numero di cifre decimali della valuta dell'applicazione (es. 2 per EUR).",
    flow: "Usato per interpretare correttamente importi espressi nella valuta dell'applicazione."
  },
  '9F45': {
    phases: ['gac'],
    spec: 'EMV Book 3, Annex A',
    usage:
      "Data Authentication Code: codice di 2 byte inserito dall'issuer nei dati firmati per SDA.",
    flow: 'Recuperato verificando la SDA e, se richiesto da CDOL, inviato alla carta nel GENERATE AC.'
  },
  '9F46': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §6.4',
    usage: "Certificato della chiave pubblica della carta (ICC), firmato dall'issuer.",
    flow: "Per DDA/CDA il terminale lo verifica con la chiave dell'issuer e ottiene la chiave pubblica ICC, con cui verificherà la firma dinamica (9F4B)."
  },
  '9F47': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §6.4',
    usage: 'Esponente pubblico RSA della chiave ICC: 03 oppure 010001 (65537).',
    flow: 'Usato per verificare la firma dinamica.'
  },
  '9F48': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §6.4',
    usage: 'Parte del modulo della chiave pubblica ICC che non entra nel certificato 9F46.',
    flow: 'Concatenato alla parte recuperata dal certificato per ricostruire il modulo.'
  },
  '9F49': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §6.5',
    usage:
      "Dynamic Data Authentication DOL: dati inviati nella INTERNAL AUTHENTICATE per la DDA; deve contenere almeno l'Unpredictable Number (9F37).",
    flow: 'Con DDA il terminale invia questi dati, la carta li firma con la propria chiave privata e restituisce la SDAD (9F4B), che il terminale verifica con la chiave pubblica ICC recuperata dai certificati.'
  },
  '9F4A': {
    phases: ['read', 'oda'],
    spec: 'EMV Book 3, Annex A; Book 2 §5.4',
    usage:
      "Static Data Authentication Tag List: tag i cui valori entrano nei dati autenticati staticamente; EMV ammette solo l'AIP (82).",
    flow: "Il terminale aggiunge il valore di questi tag ai record ODA prima di calcolare l'hash per SDA, DDA o CDA."
  },
  '9F4B': {
    phases: ['oda', 'gac'],
    spec: 'EMV Book 3, Annex A; Book 2 §6.5-6.6',
    usage:
      'Signed Dynamic Application Data: firma RSA generata dalla carta su dati dinamici (Unpredictable Number, ICC Dynamic Number e, con CDA, il crittogramma).',
    flow: "Restituita nella INTERNAL AUTHENTICATE (DDA), nel GENERATE AC (CDA) o nella GPO contactless (fDDA). Il terminale la verifica con la chiave ICC: se fallisce imposta il bit TVR 'DDA/CDA fallita'."
  },
  '9F4C': {
    phases: ['oda', 'gac'],
    spec: 'EMV Book 3, Annex A',
    usage:
      'ICC Dynamic Number: numero variabile generato dalla carta a ogni transazione e incluso nella firma dinamica.',
    flow: 'Recuperato dal terminale verificando la SDAD; può essere richiesto in CDOL per legare crittogramma e firma.'
  },
  '9F4D': {
    phases: ['sel', 'compl'],
    spec: 'EMV Book 3, Annex A; Book 3 Annex D',
    usage:
      'Log Entry: SFI del file di log transazioni (1 byte) e numero massimo di record (1 byte).',
    flow: 'Non usato nel flusso di pagamento: serve a terminali o applicazioni che leggono lo storico transazioni con READ RECORD, interpretando i record con il Log Format (9F4F).'
  },
  '9F4E': {
    phases: ['online'],
    spec: 'EMV Book 3, Annex A',
    usage: "Nome e località dell'esercente.",
    flow: "Può essere richiesto in DOL o inviato nell'autorizzazione."
  },
  '9F4F': {
    phases: ['compl'],
    spec: 'EMV Book 3, Annex D',
    usage: 'Log Format: DOL che descrive il contenuto dei record del log transazioni.',
    flow: 'Letto con GET DATA da applicazioni che consultano lo storico; non fa parte del flusso di pagamento.'
  },
  '9F52': {
    phases: ['gac'],
    spec: 'EMV CPA / M/Chip',
    usage:
      'Application Default Action: comportamento della carta in situazioni particolari (es. issuer authentication fallita, transazione internazionale).',
    flow: 'Usato internamente dalla carta nel Card Risk Management.'
  },
  '9F5A': {
    phases: ['sel'],
    spec: 'Visa specifications',
    usage:
      "Application Program Identifier (Visa): identifica il programma o prodotto associato all'applicazione.",
    flow: 'Può essere usato dal terminale per applicare parametri specifici del programma (es. limiti dinamici).'
  },
  '9F5D': {
    phases: ['gpo', 'trm'],
    spec: 'Visa Contactless Payment Specification',
    usage: 'Available Offline Spending Amount: importo residuo spendibile offline.',
    flow: 'Il reader può mostrarlo al titolare dopo la transazione; riflette i contatori di risk management della carta.'
  },
  '9F66': {
    phases: ['gpo'],
    spec: 'EMV Book C-3 / Visa VCPS',
    usage:
      'Terminal Transaction Qualifiers: capacità e requisiti del reader contactless (EMV mode, online capable, CVM supportati, ODA, ecc.).',
    flow: 'Inviato alla carta nella GPO quando richiesto dal PDOL; la carta lo usa per scegliere il percorso (online, offline, CVM).'
  },
  '9F69': {
    phases: ['gpo', 'oda'],
    spec: 'Visa Contactless Payment Specification',
    usage:
      'Card Authentication Related Data (Visa fDDA): versione fDDA, Card Unpredictable Number e CTQ inclusi nella firma.',
    flow: 'Il reader Visa lo usa per verificare la firma fDDA restituita nella GPO, senza comandi aggiuntivi.'
  },
  '9F6B': {
    phases: ['read', 'online'],
    spec: 'EMV Book C-2',
    usage:
      'Track 2 Data (Mastercard): immagine della traccia 2 usata in mag-stripe mode contactless.',
    flow: "Come 56: in mag-stripe mode viene completata con i dati dinamici e inviata nell'autorizzazione."
  },
  '9F6C': {
    phases: ['gpo', 'cvm', 'restr'],
    spec: 'Visa Contactless Payment Specification',
    usage:
      "Card Transaction Qualifiers (Visa): indicazioni della carta al reader contactless: CVM richiesto (PIN online, firma), comportamento se l'ODA fallisce o l'applicazione è scaduta, eventuale CVM eseguito sul dispositivo.",
    flow: 'Restituito nella GPO qVSDC. Il reader lo combina con il TTQ (9F66) per decidere CVM e se andare online o cambiare interfaccia.'
  },
  '9F6E': {
    phases: ['gpo', 'online'],
    spec: 'Visa / EMV Book C-2',
    usage:
      'Visa: Form Factor Indicator (tipo di dispositivo: carta, mobile, wearable e sue caratteristiche). Mastercard: Third Party Data.',
    flow: "Inviato all'issuer nell'autorizzazione per analisi del rischio e reportistica."
  },
  '9F7C': {
    phases: ['gpo', 'online'],
    spec: 'Visa Contactless Payment Specification',
    usage: "Customer Exclusive Data (Visa): dati proprietari dell'issuer trasportati verso l'host.",
    flow: 'Inviato nel messaggio di autorizzazione senza essere interpretato dal terminale.'
  },
  A5: {
    phases: ['sel'],
    spec: 'EMV Book 1 §11.3.4',
    usage:
      "Template proprietario dell'FCI. Contiene gli elementi che descrivono l'applicazione o l'ambiente di pagamento: label, priorità, PDOL, preferenze di lingua, code table e dati discrezionali (BF0C).",
    flow: 'Analizzato durante la selezione: il PDOL eventualmente presente qui determina quali dati il terminale invierà nella successiva GET PROCESSING OPTIONS.'
  },
  BF0C: {
    phases: ['sel'],
    spec: 'EMV Book 1 §12.3.2',
    usage:
      "Dati discrezionali dell'issuer nell'FCI. Nella PPSE contactless contiene le Directory Entry (61), una per ogni applicazione supportata; nella SELECT AID può contenere Log Entry, dati proprietari o dati di circuito.",
    flow: 'Nel flusso contactless (EMV Book B, Entry Point) il terminale legge le entry 61 in BF0C per costruire la candidate list, abbinando AID e Kernel Identifier ai kernel che supporta.'
  }
}
