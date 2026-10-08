// English translations. Keys are the Italian source strings (see ./index.ts).

export const EN: Record<string, string> = {
  "Numero identificativo dell'issuer (prime cifre del PAN).":
    'Issuer identification number (leading digits of the PAN).',
  "Nome mnemonico dell'applicazione, mostrato al titolare (max 16 caratteri).":
    'Mnemonic name of the application, shown to the cardholder (max 16 characters).',
  'Dati traccia 1 (Mastercard contactless, mag-stripe mode).':
    'Track 1 data (Mastercard contactless, mag-stripe mode).',
  'PAN, separatore D, scadenza YYMM, service code, dati discrezionali; padding F se dispari.':
    'PAN, D separator, expiry YYMM, service code, discretionary data; F padding if odd.',
  "Entry di directory: descrive un'applicazione disponibile sulla carta (AID, label, priorità, kernel).":
    'Directory entry: describes an application available on the card (AID, label, priority, kernel).',
  'Template che racchiude i dati di un record letto con READ RECORD.':
    'Template wrapping the data of a record read with READ RECORD.',
  'Dati discrezionali associati a una directory entry.':
    'Discretionary data associated with a directory entry.',
  'Risposta in formato TLV (GPO, GENERATE AC, INTERNAL AUTHENTICATE).':
    'TLV format response (GPO, GENERATE AC, INTERNAL AUTHENTICATE).',
  'Risposta in formato 1: i valori degli elementi sono concatenati senza tag né lunghezza.':
    'Format 1 response: the element values are concatenated without tag or length.',
  'Indica le funzioni supportate dalla carta (SDA/DDA/CDA, CVM, risk management, issuer authentication).':
    'Indicates the functions supported by the card (SDA/DDA/CDA, CVM, risk management, issuer authentication).',
  "Nome del DF selezionato: '2PAY.SYS.DDF01' per la PPSE, '1PAY.SYS.DDF01' per la PSE, oppure l'AID.":
    "Name of the selected DF: '2PAY.SYS.DDF01' for the PPSE, '1PAY.SYS.DDF01' for the PSE, or the AID.",
  "Priorità dell'applicazione nella lista (1 = massima) e necessità di conferma del titolare.":
    'Priority of the application in the list (1 = highest) and whether cardholder confirmation is required.',
  "SFI dell'EF di directory (PSE contact). Valori 1–30.":
    'SFI of the directory EF (contact PSE). Values 1–30.',
  "Certificato della chiave pubblica dell'issuer firmato dalla CA (lunghezza = modulo CA).":
    'Issuer public key certificate signed by the CA (length = CA modulus).',
  "Parte del modulo della chiave dell'issuer che non entra nel certificato.":
    'Part of the issuer key modulus that does not fit in the certificate.',
  'Dati statici firmati per SDA.': 'Signed static data for SDA.',
  'Elenco di gruppi di 4 byte: SFI, primo record, ultimo record, numero di record per ODA.':
    'List of 4-byte groups: SFI, first record, last record, number of records for ODA.',
  'Dati usati per generare il TC Hash Value.': 'Data used to generate the TC Hash Value.',
  'Template restituito dalla SELECT. Contiene il DF Name (84) e il template proprietario (A5).':
    'Template returned by SELECT. Contains the DF Name (84) and the proprietary template (A5).',
  "Dati proprietari dell'FCI: label, priorità, PDOL, preferenze di lingua e dati discrezionali dell'issuer.":
    'FCI proprietary data: label, priority, PDOL, language preferences and issuer discretionary data.',
  'Dati discrezionali. Nella PPSE contiene una o più Directory Entry (61), una per applicazione.':
    'Discretionary data. In the PPSE it contains one or more Directory Entries (61), one per application.',
  'Identifica applicazione: RID (5 byte) + PIX (fino a 11 byte).':
    'Identifies the application: RID (5 bytes) + PIX (up to 11 bytes).',
  "Nome preferito dell'applicazione, codificato secondo l'Issuer Code Table Index (9F11).":
    'Preferred application name, encoded according to the Issuer Code Table Index (9F11).',
  'Da 1 a 4 codici lingua ISO 639-1 (2 caratteri ciascuno) in ordine di preferenza, es. "iten".':
    '1 to 4 ISO 639-1 language codes (2 characters each) in order of preference, e.g. "enit".',
  'Parte della ISO/IEC 8859 usata per codificare Application Preferred Name (9F12).':
    'Part of ISO/IEC 8859 used to encode the Application Preferred Name (9F12).',
  'Lista dei dati che il terminale deve inviare nella GET PROCESSING OPTIONS (tag 83).':
    'List of data the terminal must send in GET PROCESSING OPTIONS (tag 83).',
  'Identifica il kernel contactless da usare per questa applicazione.':
    'Identifies the contactless kernel to use for this application.',
  '01 – Kernel 1 (alcune JCB/Visa)': '01 – Kernel 1 (some JCB/Visa)',
  '2E – CPACE (kernel pan-europeo ECPC)': '2E – CPACE (ECPC pan-European kernel)',
  'Dati proprietari registrati per la selezione applicazione (ASRPD).':
    'Registered proprietary data for application selection (ASRPD).',
  'SFI del file di log transazioni (1 byte) e numero massimo di record (1 byte).':
    'SFI of the transaction log file (1 byte) and maximum number of records (1 byte).',
  'Identificativo del programma applicativo (Visa).': 'Application program identifier (Visa).',
  "URL dell'issuer.": 'Issuer URL.',
  'IBAN associato al conto.': 'IBAN of the account.',
  "Paese dell'issuer, ISO 3166 alpha-2.": 'Issuer country, ISO 3166 alpha-2.',
  "Paese dell'issuer, ISO 3166 alpha-3.": 'Issuer country, ISO 3166 alpha-3.',
  'PAN della carta, cn fino a 19 cifre, padding F a destra.':
    'Card PAN, cn up to 19 digits, F padding on the right.',
  'Nome del titolare (2–26 caratteri), formato "COGNOME/NOME".':
    'Cardholder name (2–26 characters), "SURNAME/NAME" format.',
  'Nome esteso del titolare (27–45 caratteri).': 'Extended cardholder name (27–45 characters).',
  "Data di scadenza dell'applicazione, YYMMDD.": 'Application expiration date, YYMMDD.',
  "Data di inizio validità dell'applicazione, YYMMDD.": 'Application effective date, YYMMDD.',
  "Paese dell'issuer, ISO 3166 numerico (n3).": 'Issuer country, ISO 3166 numeric (n3).',
  '380 – Italia': '380 – Italy',
  '250 – Francia': '250 – France',
  '276 – Germania': '276 – Germany',
  '724 – Spagna': '724 – Spain',
  '756 – Svizzera': '756 – Switzerland',
  '826 – Regno Unito': '826 – United Kingdom',
  '840 – Stati Uniti': '840 – United States',
  '528 – Paesi Bassi': '528 – Netherlands',
  '056 – Belgio': '056 – Belgium',
  '040 – Austria': '040 – Austria',
  'Service code (n3) come da ISO/IEC 7813, es. 201.':
    'Service code (n3) as per ISO/IEC 7813, e.g. 201.',
  'Distingue carte diverse con lo stesso PAN (n2).':
    'Distinguishes different cards with the same PAN (n2).',
  'Dati che il terminale deve inviare nel primo GENERATE AC.':
    'Data the terminal must send in the first GENERATE AC.',
  'Dati che il terminale deve inviare nel secondo GENERATE AC.':
    'Data the terminal must send in the second GENERATE AC.',
  'Importi X e Y seguiti da regole CVM (metodo + condizione) in ordine di priorità.':
    'Amounts X and Y followed by CVM rules (method + condition) in order of priority.',
  'Dati inviati nella INTERNAL AUTHENTICATE (deve contenere 9F37).':
    'Data sent in INTERNAL AUTHENTICATE (must contain 9F37).',
  "Restrizioni d'uso definite dall'issuer (domestico/internazionale, cash, beni, servizi, ATM).":
    'Usage restrictions defined by the issuer (domestic/international, cash, goods, services, ATM).',
  "Versione dell'applicazione assegnata dal payment system.":
    'Application version assigned by the payment system.',
  'Condizioni TVR per cui rifiutare offline se il terminale non può andare online.':
    'TVR conditions for which to decline offline if the terminal cannot go online.',
  'Condizioni TVR per cui rifiutare la transazione senza andare online.':
    'TVR conditions for which to decline the transaction without going online.',
  'Condizioni TVR per cui andare online.': 'TVR conditions for which to go online.',
  'Numero massimo di transazioni offline consecutive prima di andare online.':
    'Maximum number of consecutive offline transactions before going online.',
  'Numero massimo di transazioni offline consecutive oltre il quale rifiutare se non online.':
    'Maximum number of consecutive offline transactions beyond which to decline if not online.',
  'Dati discrezionali della traccia 1.': 'Track 1 discretionary data.',
  'Dati discrezionali della traccia 2.': 'Track 2 discretionary data.',
  'Dati traccia 2 (Mastercard contactless).': 'Track 2 data (Mastercard contactless).',
  "Valuta dell'applicazione, ISO 4217 numerico (n3).":
    'Application currency, ISO 4217 numeric (n3).',
  'Posizione della virgola decimale per la valuta applicazione (n1).':
    'Position of the decimal point for the application currency (n1).',
  "Dati discrezionali dell'issuer.": 'Issuer discretionary data.',
  'Riferimento del conto non finanziario (29 caratteri).':
    'Non-financial account reference (29 characters).',
  'Identificativo del token requestor (n11).': 'Token requestor identifier (n11).',
  'Ultime 4 cifre del PAN (n4).': 'Last 4 digits of the PAN (n4).',
  'Indice della chiave pubblica della CA (RID + indice) usata per ODA.':
    'Index of the CA public key (RID + index) used for ODA.',
  "Esponente della chiave pubblica dell'issuer (03 o 010001).":
    'Issuer public key exponent (03 or 010001).',
  "Certificato della chiave pubblica della carta firmato dall'issuer.":
    'Card public key certificate signed by the issuer.',
  'Esponente della chiave pubblica della carta (03 o 010001).':
    'Card public key exponent (03 or 010001).',
  'Parte del modulo della chiave della carta che non entra nel certificato.':
    'Part of the card key modulus that does not fit in the certificate.',
  "Lista di tag (tipicamente solo 82) i cui valori entrano nell'autenticazione statica.":
    'List of tags (usually only 82) whose values are part of static authentication.',
  'Firma dinamica generata dalla carta (DDA/fDDA/CDA).':
    'Dynamic signature generated by the card (DDA/fDDA/CDA).',
  'Numero dinamico generato dalla carta (2–8 byte).':
    'Dynamic number generated by the card (2–8 bytes).',
  'Dati per fDDA (Visa): versione, numero dinamico, CTQ.':
    'fDDA data (Visa): version, dynamic number, CTQ.',
  'Tipo di crittogramma restituito (AAC/TC/ARQC) e advice.':
    'Type of cryptogram returned (AAC/TC/ARQC) and advice.',
  'Contatore delle transazioni gestito dalla carta.': 'Transaction counter maintained by the card.',
  'Crittogramma (ARQC/TC/AAC) di 8 byte.': '8-byte cryptogram (ARQC/TC/AAC).',
  "Dati proprietari dell'issuer trasmessi online (formato dipendente dal circuito).":
    'Issuer proprietary data sent online (scheme-dependent format).',
  "Valore dell'ATC all'ultima transazione online autorizzata.":
    'ATC value at the last authorised online transaction.',
  'Numero di tentativi PIN rimanenti.': 'Number of PIN tries remaining.',
  'DOL che descrive il formato dei record del log transazioni.':
    'DOL describing the format of the transaction log records.',
  'Codice generato da SDA e restituito nel GENERATE AC.':
    'Code generated by SDA and returned in GENERATE AC.',
  'Indicazioni della carta al reader contactless (Visa): CVM richiesto, comportamento in caso di errore.':
    'Card indications to the contactless reader (Visa): required CVM, behaviour on failure.',
  'Visa: Form Factor Indicator. Mastercard: Third Party Data.':
    'Visa: Form Factor Indicator. Mastercard: Third Party Data.',
  'Importo disponibile per spese offline (n12).': 'Amount available for offline spending (n12).',
  'Dati proprietari del cliente/issuer (Visa).': 'Customer/issuer proprietary data (Visa).',
  'Esecuzione corretta': 'Normal processing',
  'File selezionato invalidato (applicazione bloccata)':
    'Selected file invalidated (application blocked)',
  'Autenticazione fallita': 'Authentication failed',
  'Verifica fallita, 0 tentativi rimanenti (63Cx)': 'Verification failed, 0 tries remaining (63Cx)',
  'Verifica fallita, 2 tentativi rimanenti (63Cx)': 'Verification failed, 2 tries remaining (63Cx)',
  'Lunghezza errata': 'Wrong length',
  'Comando incompatibile con la struttura del file': 'Command incompatible with file structure',
  'Metodo di autenticazione bloccato': 'Authentication method blocked',
  'Dati referenziati invalidati': 'Referenced data invalidated',
  "Condizioni d'uso non soddisfatte": 'Conditions of use not satisfied',
  'Comando non consentito': 'Command not allowed',
  'Funzione non supportata (carta bloccata)': 'Function not supported (card blocked)',
  'File / applicazione non trovata': 'File / application not found',
  'Record non trovato': 'Record not found',
  'P1-P2 errati': 'Incorrect P1-P2',
  'Dati referenziati non trovati': 'Referenced data not found',
  'INS non supportato': 'INS not supported',
  'CLA non supportata': 'CLA not supported',
  'Errore generico': 'Generic error',
  'SDA supportata': 'SDA supported',
  'DDA supportata': 'DDA supported',
  'Cardholder verification supportata': 'Cardholder verification supported',
  'Terminal risk management da eseguire': 'Terminal risk management to be performed',
  'Issuer authentication supportata': 'Issuer authentication supported',
  'On-device cardholder verification supportata': 'On-device cardholder verification supported',
  'CDA supportata': 'CDA supported',
  'Riservato EMV Contactless (es. MC: EMV mode supported)':
    'Reserved for EMV Contactless (e.g. MC: EMV mode supported)',
  'Relay Resistance Protocol supportato': 'Relay Resistance Protocol supported',
  'Valida per cash domestico': 'Valid for domestic cash',
  'Valida per cash internazionale': 'Valid for international cash',
  'Valida per beni domestici': 'Valid for domestic goods',
  'Valida per beni internazionali': 'Valid for international goods',
  'Valida per servizi domestici': 'Valid for domestic services',
  'Valida per servizi internazionali': 'Valid for international services',
  'Valida su ATM': 'Valid at ATMs',
  'Valida su terminali diversi da ATM': 'Valid at terminals other than ATMs',
  'Cashback domestico consentito': 'Domestic cashback allowed',
  'Cashback internazionale consentito': 'International cashback allowed',
  'Online PIN richiesto': 'Online PIN required',
  'Firma richiesta': 'Signature required',
  'Vai online se ODA fallisce e il reader è online-capable':
    'Go online if ODA fails and the reader is online capable',
  'Cambia interfaccia se ODA fallisce e il reader supporta il contact':
    'Switch interface if ODA fails and the reader supports contact',
  "Vai online se l'applicazione è scaduta": 'Go online if the application has expired',
  'Cambia interfaccia per transazioni cash': 'Switch interface for cash transactions',
  'Cambia interfaccia per transazioni cashback': 'Switch interface for cashback transactions',
  'Non valida per transazioni ATM contactless': 'Not valid for contactless ATM transactions',
  'Consumer Device CVM eseguito': 'Consumer Device CVM performed',
  'La carta supporta Issuer Update Processing al POS':
    'Card supports Issuer Update Processing at the POS',
  'Offline data authentication non eseguita': 'Offline data authentication was not performed',
  'SDA fallita': 'SDA failed',
  'Dati ICC mancanti': 'ICC data missing',
  'Carta presente nella exception file del terminale': 'Card appears on terminal exception file',
  'DDA fallita': 'DDA failed',
  'CDA fallita': 'CDA failed',
  'SDA selezionata': 'SDA selected',
  'ICC e terminale hanno versioni applicazione diverse':
    'ICC and terminal have different application versions',
  'Applicazione scaduta': 'Expired application',
  'Applicazione non ancora valida': 'Application not yet effective',
  'Servizio richiesto non consentito per il prodotto':
    'Requested service not allowed for card product',
  'Nuova carta': 'New card',
  'Cardholder verification non riuscita': 'Cardholder verification was not successful',
  'CVM non riconosciuto': 'Unrecognised CVM',
  'PIN Try Limit superato': 'PIN Try Limit exceeded',
  'PIN richiesto e PIN pad assente o non funzionante':
    'PIN entry required and PIN pad not present or not working',
  'PIN richiesto, PIN pad presente ma PIN non inserito':
    'PIN entry required, PIN pad present, but PIN was not entered',
  'Online PIN inserito': 'Online PIN entered',
  'Transazione oltre il floor limit': 'Transaction exceeds floor limit',
  'Lower consecutive offline limit superato': 'Lower consecutive offline limit exceeded',
  'Upper consecutive offline limit superato': 'Upper consecutive offline limit exceeded',
  'Transazione selezionata casualmente per online':
    'Transaction selected randomly for online processing',
  'Merchant ha forzato la transazione online': 'Merchant forced transaction online',
  'Usato TDOL di default': 'Default TDOL used',
  'Issuer authentication fallita': 'Issuer authentication failed',
  'Script fallito prima del GENERATE AC finale':
    'Script processing failed before final GENERATE AC',
  'Script fallito dopo il GENERATE AC finale': 'Script processing failed after final GENERATE AC',
  'Relay resistance threshold superata': 'Relay resistance threshold exceeded',
  'Relay resistance time limits superati': 'Relay resistance time limits exceeded',
  'Relay resistance': 'Relay resistance',
  'Non supportato': 'Not supported',
  'Non eseguito': 'Not performed',
  Eseguito: 'Performed',
  'Tipo di crittogramma': 'Cryptogram type',
  'AAC – rifiuto': 'AAC – decline',
  'TC – approvato offline': 'TC – approved offline',
  'ARQC – richiesta online': 'ARQC – online request',
  'Specifico del payment system': 'Payment system specific',
  'Advice richiesto': 'Advice required',
  'Reason / advice code': 'Reason / advice code',
  'Nessuna informazione': 'No information given',
  'Servizio non consentito': 'Service not allowed',
  'Richiede conferma del titolare per la selezione':
    'Cardholder confirmation required for selection',
  'Priorità (0 = nessuna, 1 = massima)': 'Priority (0 = none, 1 = highest)',
  'Plaintext PIN verificato dalla ICC': 'Plaintext PIN verified by ICC',
  'Enciphered PIN verificato online': 'Enciphered PIN verified online',
  'Plaintext PIN ICC + firma': 'Plaintext PIN by ICC + signature',
  'Enciphered PIN verificato dalla ICC': 'Enciphered PIN verified by ICC',
  'Enciphered PIN ICC + firma': 'Enciphered PIN by ICC + signature',
  'Firma (cartacea)': 'Signature (paper)',
  'Nessun CVM richiesto': 'No CVM required',
  'Non disponibile (RFU)': 'Not available (RFU)',
  Sempre: 'Always',
  'Se cash non presidiato': 'If unattended cash',
  'Se non cash non presidiato, non cash manuale, non cashback':
    'If not unattended cash, not manual cash, not cashback',
  'Se il terminale supporta il CVM': 'If terminal supports the CVM',
  'Se cash manuale': 'If manual cash',
  'Se acquisto con cashback': 'If purchase with cashback',
  'Se in valuta applicazione e sotto X': 'If in application currency and under X',
  'Se in valuta applicazione e sopra X': 'If in application currency and over X',
  'Se in valuta applicazione e sotto Y': 'If in application currency and under Y',
  'Se in valuta applicazione e sopra Y': 'If in application currency and over Y',
  Selezione: 'Selection',
  'Risposta alla SELECT del Proximity Payment System Environment (contactless). Contiene una Directory Entry (61) per ciascuna applicazione: duplicala per aggiungere altre AID.':
    'Response to SELECT of the Proximity Payment System Environment (contactless). Contains one Directory Entry (61) per application: duplicate it to add more AIDs.',
  'Fisso: "2PAY.SYS.DDF01"': 'Fixed: "2PAY.SYS.DDF01"',
  'Una entry per applicazione: usa "Duplica" per aggiungerne altre':
    'One entry per application: use "Duplicate" to add more',
  'Seleziona un AID noto o inseriscilo in hex': 'Pick a known AID or enter it in hex',
  'Consigliato: mostrato al titolare': 'Recommended: shown to the cardholder',
  'Obbligatorio se ci sono più applicazioni': 'Mandatory if there is more than one application',
  'Opzionale: kernel contactless': 'Optional: contactless kernel',
  'SELECT PSE (contact)': 'SELECT PSE (contact)',
  "Risposta alla SELECT del Payment System Environment (contact). Indica l'SFI del file di directory da leggere con READ RECORD.":
    'Response to SELECT of the Payment System Environment (contact). Gives the SFI of the directory file to read with READ RECORD.',
  'Fisso: "1PAY.SYS.DDF01"': 'Fixed: "1PAY.SYS.DDF01"',
  'SFI del Directory Elementary File': 'SFI of the Directory Elementary File',
  'Record del file di directory della PSE (contact): una entry 61 per applicazione.':
    'Record of the PSE directory file (contact): one 61 entry per application.',
  "Risposta alla SELECT dell'applicazione. Il PDOL (9F38) indica i dati che il terminale deve inviare nella GPO.":
    'Response to SELECT of the application. The PDOL (9F38) lists the data the terminal must send in the GPO.',
  "Lc e AID dipendono dall'applicazione": 'Lc and AID depend on the application',
  "AID dell'applicazione selezionata": 'AID of the selected application',
  'Necessario se la GPO deve ricevere dati del terminale':
    'Needed if the GPO must receive terminal data',
  'GPO – Formato 2 (77)': 'GPO – Format 2 (77)',
  'Risposta GPO in formato TLV con AIP e AFL. È il formato più usato.':
    'GPO response in TLV format with AIP and AFL. It is the most common format.',
  'Dati 83 secondo il PDOL': 'Tag 83 data according to the PDOL',
  'GPO – Formato 1 (80)': 'GPO – Format 1 (80)',
  "Risposta GPO in formato 1: AIP (2 byte) seguito dall'AFL, senza tag interni.":
    'GPO response in format 1: AIP (2 bytes) followed by the AFL, without inner tags.',
  'GPO – Visa qVSDC': 'GPO – Visa qVSDC',
  'Risposta GPO contactless Visa (qVSDC): oltre ad AIP/AFL contiene Track 2, crittogramma, IAD e CTQ.':
    'Visa contactless GPO response (qVSDC): besides AIP/AFL it contains Track 2, cryptogram, IAD and CTQ.',
  'Esempio con PDOL 9F66 9F02 9F03 9F1A 95 5F2A 9A 9C 9F37':
    'Example with PDOL 9F66 9F02 9F03 9F1A 95 5F2A 9A 9C 9F37',
  'GPO – Mastercard contactless': 'GPO – Mastercard contactless',
  'Risposta GPO Mastercard (M/Chip contactless): AIP con bit EMV mode e AFL.':
    'Mastercard GPO response (M/Chip contactless): AIP with the EMV mode bit, and AFL.',
  'READ RECORD – Track 2 / titolare': 'READ RECORD – Track 2 / cardholder',
  'Record con i dati di traccia e il nome del titolare.':
    'Record with track data and cardholder name.',
  'READ RECORD – Dati applicazione': 'READ RECORD – Application data',
  'Record con PAN, date, codici paese/valuta, DOL per il GENERATE AC, CVM List e Issuer Action Codes.':
    'Record with PAN, dates, country/currency codes, DOLs for GENERATE AC, CVM List and Issuer Action Codes.',
  'READ RECORD – Certificati ODA': 'READ RECORD – ODA certificates',
  "Record con gli elementi per l'Offline Data Authentication (chiavi e certificati).":
    'Record with the Offline Data Authentication elements (keys and certificates).',
  'GENERATE AC – Formato 2 (77)': 'GENERATE AC – Format 2 (77)',
  'Risposta GENERATE AC in formato TLV. Con CDA include la firma dinamica (9F4B).':
    'GENERATE AC response in TLV format. With CDA it includes the dynamic signature (9F4B).',
  'Lc + dati CDOL1 + Le': 'Lc + CDOL1 data + Le',
  'Solo con CDA': 'CDA only',
  'GENERATE AC – Formato 1 (80)': 'GENERATE AC – Format 1 (80)',
  'Risposta GENERATE AC in formato 1: CID || ATC || AC || IAD concatenati.':
    'GENERATE AC response in format 1: CID || ATC || AC || IAD concatenated.',
  Autenticazione: 'Authentication',
  'INTERNAL AUTHENTICATE – Formato 2': 'INTERNAL AUTHENTICATE – Format 2',
  'Firma dinamica DDA in formato TLV.': 'DDA dynamic signature in TLV format.',
  'Dati secondo DDOL': 'Data according to the DDOL',
  'INTERNAL AUTHENTICATE – Formato 1': 'INTERNAL AUTHENTICATE – Format 1',
  'Firma dinamica DDA in formato 1 (solo valore dentro il tag 80).':
    'DDA dynamic signature in format 1 (value only inside tag 80).',
  'Numero casuale di 8 byte, senza struttura TLV.': '8-byte random number, without TLV structure.',
  '8 byte casuali': '8 random bytes',
  'Numero di tentativi PIN residui.': 'Number of PIN tries remaining.',
  "ATC dell'ultima transazione online.": 'ATC of the last online transaction.',
  'Formato dei record del log transazioni.': 'Format of the transaction log records.',
  Altro: 'Other',
  'Risposta vuota / personalizzata': 'Empty / custom response',
  'Parti da zero aggiungendo i tag che ti servono, oppure importa una risposta esistente.':
    'Start from scratch adding the tags you need, or import an existing response.',
  'Solo Status Word (errore)': 'Status Word only (error)',
  'Risposta senza dati, solo SW1 SW2 (es. 6A82 applicazione non trovata).':
    'Response without data, only SW1 SW2 (e.g. 6A82 application not found).',
  'Il progetto corrente ha modifiche non salvate. Vuoi continuare e perderle?':
    'The current project has unsaved changes. Continue and lose them?',
  progetto: 'project',
  'Progetto salvato in {path}': 'Project saved to {path}',
  'Progetto scaricato': 'Project downloaded',
  'Salvataggio non riuscito': 'Save failed',
  'Aperto "{name}" ({n} response)': 'Opened "{name}" ({n} responses)',
  'Impossibile aprire il progetto': 'Unable to open the project',
  'Response importata': 'Imported response',
  'Response ricostruita da dati esadecimali. Puoi modificare, aggiungere o rimuovere tag.':
    'Response rebuilt from hex data. You can edit, add or remove tags.',
  'Comando di riferimento': 'Reference command',
  'Campi obbligatori compilati': 'Mandatory fields filled in',
  '{n}/{total} obbligatori': '{n}/{total} mandatory',
  '{n} opzionali compilati': '{n} optional filled in',
  'Riempie i campi vuoti con valori di esempio': 'Fills empty fields with example values',
  'Compila con esempi': 'Fill with examples',
  'Svuota valori': 'Clear values',
  Espandi: 'Expand',
  Comprimi: 'Collapse',
  Annulla: 'Undo',
  Ripeti: 'Redo',
  'Response senza dati: verrà inviata solo la Status Word {sw}.':
    'Response without data: only Status Word {sw} will be sent.',
  'Nessun tag. Aggiungi un template radice (es. 6F, 70, 77) o importa una response.':
    'No tags. Add a root template (e.g. 6F, 70, 77) or import a response.',
  'Aggiungi tag in {tag}': 'Add tag in {tag}',
  'Aggiungi tag radice': 'Add root tag',
  'Cerca per tag o nome, o digita un tag hex…': 'Search by tag or name, or type a hex tag…',
  'Tag personalizzato': 'Custom tag',
  'Suggeriti per {tag}': 'Suggested for {tag}',
  Suggeriti: 'Suggested',
  'Dati non TLV (es. GET CHALLENGE)': 'Non-TLV data (e.g. GET CHALLENGE)',
  'Altri tag': 'Other tags',
  'Il testo non è esadecimale valido (numero di cifre dispari o caratteri non hex).':
    'The text is not valid hex (odd number of digits or non-hex characters).',
  'Importa response da hex': 'Import response from hex',
  "Incolla una response esistente (spazi, 0x e virgole vengono ignorati). Verrà scomposta in TLV e potrai modificarla con l'editor guidato.":
    'Paste an existing response (spaces, 0x and commas are ignored). It will be split into TLVs and you can edit it with the guided editor.',
  'Gli ultimi 2 byte sono la Status Word': 'The last 2 bytes are the Status Word',
  Importa: 'Import',
  'Clicca per cambiare il tag': 'Click to change the tag',
  'Dati raw (senza tag)': 'Raw data (no tag)',
  obbligatorio: 'mandatory',
  opzionale: 'optional',
  'valore da specifica': 'value from specification',
  'formato 1 · valori concatenati': 'format 1 · concatenated values',
  'senza tag/lunghezza': 'no tag/length',
  "vuoto · escluso dall'output": 'empty · left out of the output',
  'Lunghezza calcolata automaticamente. Clicca per forzarla (test negativi).':
    'Length computed automatically. Click to force it (negative tests).',
  'Sposta su': 'Move up',
  'Sposta giù': 'Move down',
  Duplica: 'Duplicate',
  Rimuovi: 'Remove',
  'Forza lunghezza manuale': 'Force manual length',
  'Automatica: {hex} ({n} byte). Utile solo per test negativi.':
    'Automatic: {hex} ({n} bytes). Only useful for negative tests.',
  'Template vuoto': 'Empty template',
  'Dati raw': 'Raw data',
  'lunghezza (auto)': 'length (auto)',
  'lunghezza forzata': 'forced length',
  valore: 'value',
  'Risposta RAW': 'RAW response',
  '{n} byte dati': '{n} data bytes',
  'Lunghezza auto': 'Auto length',
  Valore: 'Value',
  'Includi SW': 'Include SW',
  'Nessun dato': 'No data',
  Copiato: 'Copied',
  Copia: 'Copy',
  '— personalizzata —': '— custom —',
  'Inserisci 4 cifre esadecimali': 'Enter 4 hex digits',
  Verifica: 'Checks',
  '{n} errori': '{n} errors',
  '{n} avvisi': '{n} warnings',
  'Nessun problema': 'No issues',
  'Struttura TLV': 'TLV structure',
  'Doppio clic per rinominare': 'Double-click to rename',
  Rinomina: 'Rename',
  Elimina: 'Delete',
  'Eliminare la response "{name}"?': 'Delete the response "{name}"?',
  Lingua: 'Language',
  'Nome del progetto': 'Project name',
  'Modifiche non salvate': 'Unsaved changes',
  'Non ancora salvato': 'Not saved yet',
  modificato: 'modified',
  'Nuovo progetto': 'New project',
  'Apri…': 'Open…',
  Salva: 'Save',
  'Salva come…': 'Save as…',
  'Aggiunge una response al progetto (sostituisce quella attiva se non è ancora stata modificata).':
    'Adds a response to the project (replaces the active one if it has not been modified yet).',
  Testo: 'Text',
  'Valore non stampabile: modificalo in hex': 'Non-printable value: edit it in hex',
  'Scrivi il testo…': 'Type the text…',
  'Numerico (n{d}) – padding a sinistra con 0': 'Numeric (n{d}) – left padded with 0',
  'Solo cifre 0–9': 'Digits 0–9 only',
  'Ammesse solo cifre': 'Digits only',
  'Numerico compresso (cn) – padding F automatico': 'Compressed numeric (cn) – automatic F padding',
  'Data (YYMMDD)': 'Date (YYMMDD)',
  Oggi: 'Today',
  '+3 anni (fine mese)': '+3 years (end of month)',
  Scaduta: 'Expired',
  'Valori noti': 'Known values',
  '— personalizzato —': '— custom —',
  '— scegli —': '— choose —',
  'DOL non interpretabile: correggi il valore in hex.':
    'DOL cannot be parsed: fix the value in hex.',
  Nome: 'Name',
  'Lungh.': 'Len.',
  '+ Aggiungi data object…': '+ Add data object…',
  terminale: 'terminal',
  'Dati richiesti al terminale: {n} byte': 'Data requested from the terminal: {n} bytes',
  'Primo rec.': 'First rec.',
  'Ultimo rec.': 'Last rec.',
  'Rec. per ODA': 'ODA rec.',
  '+ Aggiungi gruppo di record': '+ Add record group',
  'Record totali da leggere: {n}': 'Total records to read: {n}',
  'Importo X': 'Amount X',
  'Importo Y': 'Amount Y',
  'in unità minime della valuta applicazione': 'in minor units of the application currency',
  'Metodo CVM': 'CVM method',
  'Se fallisce, prova la successiva': 'If unsuccessful, apply the next one',
  Condizione: 'Condition',
  'proprietario/RFU': 'proprietary/RFU',
  'proprietaria/RFU': 'proprietary/RFU',
  '+ Aggiungi regola CVM': '+ Add CVM rule',
  'Controllo Luhn fallito': 'Luhn check failed',
  'Scadenza (YYMM)': 'Expiry (YYMM)',
  'Dati discrezionali': 'Discretionary data',
  'lunghezza variabile': 'variable length',
  'Valore HEX': 'HEX value',
  'es.': 'e.g.',
  'Valore esadecimale': 'Hexadecimal value',
  'Usa esempio': 'Use example',
  Casuale: 'Random',
  Svuota: 'Clear',
  'SFI deve essere tra 1 e 30': 'SFI must be between 1 and 30',
  'Il primo record deve essere ≥ 1': 'The first record must be ≥ 1',
  'I record ODA eccedono i record del gruppo': 'ODA records exceed the records of the group',
  'nessun bit impostato': 'no bits set',
  'contiene caratteri non stampabili': 'contains non-printable characters',
  'scad.': 'exp.',
  '{n} tentativi': '{n} tries',
  'SFI {sfi}, {n} record': 'SFI {sfi}, {n} records',
  'Il valore contiene caratteri non esadecimali': 'The value contains non-hex characters',
  'Numero dispari di cifre esadecimali': 'Odd number of hex digits',
  'Lunghezza attesa {n} byte, presenti {len}': 'Expected length {n} bytes, found {len}',
  'Lunghezza minima {n} byte, presenti {len}': 'Minimum length {n} bytes, found {len}',
  'Lunghezza massima {n} byte, presenti {len}': 'Maximum length {n} bytes, found {len}',
  'Formato numerico (n): ammesse solo cifre 0–9': 'Numeric format (n): digits 0–9 only',
  'Data non valida (YYMMDD)': 'Invalid date (YYMMDD)',
  'Formato cn: cifre 0–9 seguite da eventuale padding F':
    'cn format: digits 0–9 followed by optional F padding',
  'Formato an: ammessi solo caratteri alfanumerici': 'an format: alphanumeric characters only',
  'Contiene caratteri non stampabili': 'Contains non-printable characters',
  'AFL voce {n}': 'AFL entry {n}',
  'DOL: tag {tag} non valido': 'DOL: invalid tag {tag}',
  'DOL non valido': 'Invalid DOL',
  'CVM List: le regole devono essere di 2 byte': 'CVM List: rules must be 2 bytes',
  'Track 2: manca il separatore D': 'Track 2: missing D separator',
  'Track 2: scadenza YYMM non valida': 'Track 2: invalid YYMM expiry',
  'Track 2: il PAN non supera il controllo Luhn': 'Track 2: the PAN fails the Luhn check',
  'Il PAN non supera il controllo Luhn': 'The PAN fails the Luhn check',
  'Tag sconosciuto / proprietario': 'Unknown / proprietary tag',
  'Altri {n} byte disponibili (GET RESPONSE)': '{n} more bytes available (GET RESPONSE)',
  'Le errato, usare Le = {le}': 'Wrong Le, use Le = {le}',
  'Verifica fallita, {n} tentativi rimanenti': 'Verification failed, {n} tries remaining',
  'Status word non standard': 'Non-standard status word',
  'Tag vuoto': 'Empty tag',
  'Il tag deve essere esadecimale con un numero pari di cifre':
    'The tag must be hex with an even number of digits',
  'Il primo byte del tag non può essere 00 o FF': 'The first tag byte cannot be 00 or FF',
  'Tag a 1 byte: i bit b5-b1 del primo byte non sono 11111':
    '1-byte tag: bits b5-b1 of the first byte are not 11111',
  'Il primo byte indica un tag multi-byte ma manca il byte successivo':
    'The first byte indicates a multi-byte tag but the next byte is missing',
  'Il byte {n} del tag ha b8=1: manca un byte successivo':
    'Tag byte {n} has b8=1: a following byte is missing',
  'Il byte {n} del tag ha b8=0 ma il tag continua': 'Tag byte {n} has b8=0 but the tag continues',
  'Dati non esadecimali o con numero dispari di cifre':
    'Data is not hex or has an odd number of digits',
  "Byte di padding {b} ignorato all'offset {pos}": 'Padding byte {b} ignored at offset {pos}',
  "Tag troncato all'offset {pos}": 'Tag truncated at offset {pos}',
  'Manca la lunghezza del tag {tag} (offset {pos})': 'Missing length for tag {tag} (offset {pos})',
  'Lunghezza non valida per il tag {tag}': 'Invalid length for tag {tag}',
  'Lunghezza troncata per il tag {tag}': 'Truncated length for tag {tag}',
  'Il tag {tag} dichiara {len} byte ma ne restano {left} (offset {pos})':
    'Tag {tag} declares {len} bytes but only {left} remain (offset {pos})',
  'DOL non esadecimale': 'DOL is not hex',
  'Tag troncato nel DOL': 'Tag truncated in DOL',
  'Manca la lunghezza nel DOL': 'Missing length in DOL',
  'Dati raw non esadecimali o con numero dispari di cifre':
    'Raw data is not hex or has an odd number of digits',
  'Dati obbligatori vuoti': 'Mandatory data empty',
  'tag duplicato nello stesso template': 'duplicate tag in the same template',
  "{tag} non è tipico all'interno di {parent}": '{tag} is not typical inside {parent}',
  'è un dato del terminale, non della carta': 'this is terminal data, not card data',
  'template vuoto': 'empty template',
  'campo obbligatorio vuoto': 'mandatory field empty',
  'lunghezza forzata non esadecimale': 'forced length is not hex',
  'lunghezza forzata a {forced} (reale {actual} byte)':
    'length forced to {forced} (actual {actual} bytes)',
  'tag costruito usato come formato 1': 'constructed tag used as format 1',
  'Status word non valida': 'Invalid status word',
  'Con SW {sw} la carta normalmente non restituisce dati':
    'With SW {sw} the card normally returns no data',
  'I dati superano 256 byte ({n}): servono extended length o GET RESPONSE':
    'Data exceeds 256 bytes ({n}): extended length or GET RESPONSE required',
  'nodo non valido': 'invalid node',
  '"children" deve essere una lista': '"children" must be a list',
  'Il file non è un JSON valido': 'The file is not valid JSON',
  'Il file non è un progetto EMV APDU Builder': 'The file is not an EMV APDU Builder project',
  'Versione del progetto non supportata ({v})': 'Unsupported project version ({v})',
  'Il progetto non contiene response': 'The project contains no responses',
  'formato non valido': 'invalid format',
  '"nodes" mancante': '"nodes" missing',
  nodo: 'node',
  Progetto: 'Project',
  copia: 'copy',
  'Hex spaziato': 'Spaced hex',
  '{n} byte': '{n} bytes',
  '{min}–{max} byte': '{min}–{max} bytes',
  'max {n} byte': 'max {n} bytes',
  'min {n} byte': 'min {n} bytes',
  "L'AFL deve essere un multiplo di 4 byte": 'The AFL must be a multiple of 4 bytes',
  'I codici lingua devono essere di 2 caratteri': 'Language codes must be 2 characters long',
  'Codice lingua {code}: ISO 639-1 usa lettere minuscole':
    'Language code {code}: ISO 639-1 uses lowercase letters',
  'Codice lingua sconosciuto (non ISO 639-1): {code}':
    'Unknown language code (not ISO 639-1): {code}',
  'Lingue in ordine di preferenza (max {n})': 'Languages in order of preference (max {n})',
  'Nessuna lingua selezionata': 'No language selected',
  'Codice non ISO 639-1': 'Not an ISO 639-1 code',
  'Sposta prima': 'Move earlier',
  'Sposta dopo': 'Move later',
  'Massimo {n} lingue': 'Maximum {n} languages',
  '+ Aggiungi lingua…': '+ Add language…',
  'Più comuni': 'Most common',
  'Tutte (ISO 639-1)': 'All (ISO 639-1)',
  'BIC della banca (ISO 9362): codice banca (4 lettere), paese (2 lettere), località (2 caratteri) e filiale opzionale (3 caratteri). 8 o 11 caratteri.':
    'Bank BIC (ISO 9362): bank code (4 letters), country (2 letters), location (2 characters) and optional branch (3 characters). 8 or 11 characters.',
  'BIC (ASCII) – convertito automaticamente in HEX': 'BIC (ASCII) – automatically converted to HEX',
  'es. {ex}': 'e.g. {ex}',
  Banca: 'Bank',
  Paese: 'Country',
  Località: 'Location',
  Filiale: 'Branch',
  'sede principale': 'head office',
  'Il BIC deve avere 8 o 11 caratteri (presenti {n})':
    'The BIC must have 8 or 11 characters ({n} found)',
  'BIC non valido: atteso 4 lettere banca, 2 lettere paese, 2 caratteri località, filiale opzionale di 3':
    'Invalid BIC: expected 4-letter bank, 2-letter country, 2-character location, optional 3-character branch',
  documentazione: 'documentation',
  'Documentazione esportata in {path}': 'Documentation exported to {path}',
  'Documentazione esportata': 'Documentation exported',
  'Esportazione non riuscita': 'Export failed',
  'Markdown copiato negli appunti': 'Markdown copied to the clipboard',
  'Impossibile copiare negli appunti': 'Unable to copy to the clipboard',
  'Esporta documentazione': 'Export documentation',
  'Genera un documento con tutte le APDU response del progetto: comando di riferimento, byte RAW, tabella dei campi con valori decodificati e descrizioni, label e note.':
    'Generates a document with all the APDU responses of the project: reference command, RAW bytes, field table with decoded values and descriptions, labels and notes.',
  Contenuto: 'Content',
  'Tutte le response ({n})': 'All responses ({n})',
  'Solo la response attiva': 'Active response only',
  Sezioni: 'Sections',
  'Descrizioni dei campi': 'Field descriptions',
  'Avvisi di verifica': 'Check warnings',
  'Il documento usa la lingua corrente dell’interfaccia.':
    'The document uses the current interface language.',
  Anteprima: 'Preview',
  'Copia Markdown': 'Copy Markdown',
  'Esporta Markdown…': 'Export Markdown…',
  'Generazione…': 'Generating…',
  'Esporta PDF…': 'Export PDF…',
  'Documentazione APDU response generata da EMV APDU Builder il {date}.':
    'APDU response documentation generated by EMV APDU Builder on {date}.',
  Indice: 'Contents',
  'Lunghezza dati': 'Data length',
  Campi: 'Fields',
  'Significato e descrizione': 'Meaning and description',
  Significato: 'Meaning',
  'campo obbligatorio nel template': 'mandatory field in the template',
  'Binario: sequenza di byte libera, mostrata in esadecimale.':
    'Binary: free byte sequence, shown in hexadecimal.',
  'Numerico BCD: due cifre per byte, allineato a destra con zeri iniziali.':
    'BCD numeric: two digits per byte, right aligned with leading zeros.',
  'Numerico compresso: cifre BCD allineate a sinistra, completate con F a destra.':
    'Compressed numeric: BCD digits left aligned, padded with F on the right.',
  'Alfanumerico: lettere e cifre codificate in ASCII / ISO 8859.':
    'Alphanumeric: letters and digits encoded in ASCII / ISO 8859.',
  'Alfanumerico con caratteri speciali: testo stampabile in ASCII / ISO 8859.':
    'Alphanumeric special: printable text in ASCII / ISO 8859.',
  'Data numerica YYMMDD in BCD (3 byte).': 'Numeric date YYMMDD in BCD (3 bytes).',
  'Data Object List: sequenza di coppie tag + lunghezza (1 byte), senza valori.':
    'Data Object List: sequence of tag + length (1 byte) pairs, without values.',
  'Application File Locator: gruppi di 4 byte (SFI, primo record, ultimo record, record ODA).':
    'Application File Locator: 4-byte groups (SFI, first record, last record, ODA records).',
  'CVM List: importo X (4 byte), importo Y (4 byte) e regole CVM di 2 byte.':
    'CVM List: amount X (4 bytes), amount Y (4 bytes) and 2-byte CVM rules.',
  'Track 2 in BCD: PAN, separatore D, scadenza YYMM, service code, dati discrezionali, padding F.':
    'Track 2 in BCD: PAN, D separator, expiry YYMM, service code, discretionary data, F padding.',
  'Sequenza di codici lingua ISO 639-1 in ASCII, 2 caratteri ciascuno.':
    'Sequence of ISO 639-1 language codes in ASCII, 2 characters each.',
  'Business Identifier Code ISO 9362 in ASCII (8 o 11 caratteri).':
    'ISO 9362 Business Identifier Code in ASCII (8 or 11 characters).',
  Universale: 'Universal',
  Applicazione: 'Application',
  'Specifica di contesto': 'Context-specific',
  Privata: 'Private',
  'Mostra o nascondi la guida in linea': 'Show or hide the online help',
  Guida: 'Help',
  'SFI {sfi}: record da {first} a {last}, {oda} per ODA':
    'SFI {sfi}: records {first} to {last}, {oda} for ODA',
  'se fallisce prova la successiva': 'if unsuccessful try the next one',
  'Guida in linea': 'Online help',
  'Sgancia: segui il puntatore': 'Unpin: follow the pointer',
  'Fissa su questo tag': 'Pin to this tag',
  'Chiudi guida': 'Close help',
  'Passa il mouse su un tag, su un byte della risposta RAW o su una voce di un DOL per vederne qui la documentazione.':
    'Hover over a tag, a byte of the RAW response or a DOL entry to see its documentation here.',
  'Byte inviati così come sono, senza struttura TLV: è il caso ad esempio della risposta a GET CHALLENGE, che restituisce 8 byte casuali.':
    'Bytes sent as they are, without TLV structure: for example the GET CHALLENGE response, which returns 8 random bytes.',
  'dato del terminale': 'terminal data',
  'dato della carta': 'card data',
  'tag non nel dizionario': 'tag not in the dictionary',
  costruito: 'constructed',
  primitivo: 'primitive',
  Utilizzo: 'Usage',
  'Nel flusso di pagamento': 'In the payment flow',
  'Valore corrente': 'Current value',
  'Nessun valore inserito.': 'No value entered.',
  '{n} elementi, {len} byte di valore': '{n} elements, {len} value bytes',
  Formato: 'Format',
  Lunghezza: 'Length',
  'Tag BER': 'BER tag',
  'classe {cls}, {kind}, numero {n}': '{cls} class, {kind}, number {n}',
  Contesto: 'Context',
  'Si trova in:': 'Found in:',
  'Può contenere:': 'May contain:',
  'Presente nei template:': 'Present in templates:',
  Riferimenti: 'References',
  'Controllo Luhn': 'Luhn check',
  'Il controllo Luhn (algoritmo "mod 10", ISO/IEC 7812-1) verifica la cifra di controllo del PAN: l\'ultima cifra è scelta dall\'issuer in modo che la somma calcolata sulle cifre sia un multiplo di 10.':
    'The Luhn check ("mod 10" algorithm, ISO/IEC 7812-1) verifies the PAN check digit: the issuer chooses the last digit so that the sum computed over the digits is a multiple of 10.',
  'Serve a intercettare errori di digitazione o trascrizione: rileva qualsiasi cifra singola sbagliata e quasi tutti gli scambi tra due cifre adiacenti. Non è un controllo di sicurezza: chiunque può calcolare un PAN che lo supera.':
    'It catches typing or transcription errors: it detects any single wrong digit and almost all swaps of two adjacent digits. It is not a security check: anyone can compute a PAN that passes it.',
  "Partendo dall'ultima cifra (la cifra di controllo) e procedendo verso sinistra, raddoppia una cifra sì e una no: la seconda da destra, la quarta, e così via.":
    'Starting from the last digit (the check digit) and moving left, double every second digit: the second from the right, the fourth, and so on.',
  'Se un raddoppio supera 9, sottrai 9 (equivale a sommare le due cifre del risultato).':
    'If a doubled value exceeds 9, subtract 9 (the same as adding its two digits).',
  'Somma tutti i valori ottenuti, compresa la cifra di controllo.':
    'Add up all the resulting values, including the check digit.',
  'Il PAN è valido se la somma è un multiplo di 10.':
    'The PAN is valid if the sum is a multiple of 10.',
  'EMV non chiede al terminale di verificarlo sui dati letti dal chip, ma acquirer e sistemi di autorizzazione scartano i PAN non validi: per questo anche i PAN usati nei test devono superarlo.':
    'EMV does not require the terminal to check it on data read from the chip, but acquirers and authorisation systems reject invalid PANs: this is why test PANs must pass it too.',
  'Calcolo sul PAN corrente:': 'Computation on the current PAN:',
  'Riga sopra: cifre del PAN (evidenziate quelle raddoppiate). Riga sotto: valore sommato.':
    'Top row: PAN digits (doubled ones highlighted). Bottom row: value added to the sum.',
  'Somma = {sum}': 'Sum = {sum}',
  'multiplo di 10: PAN valido ✓': 'multiple of 10: valid PAN ✓',
  'non multiplo di 10: PAN non valido. Cifra di controllo attesa {exp} (presente {cur}).':
    'not a multiple of 10: invalid PAN. Expected check digit {exp} (found {cur}).',
  "Scelta dell'applicazione: PPSE, PSE e AID": 'Application choice: PPSE, PSE and AID',
  'Avvio della transazione: AIP e AFL': 'Transaction start: AIP and AFL',
  "Dati della carta indicati dall'AFL": 'Card data listed in the AFL',
  'Autenticazione offline (DDA) e numeri casuali':
    'Offline authentication (DDA) and random numbers',
  'Crittogramma: decisione della carta': "Cryptogram: the card's decision",
  'Contatori e dati letti con GET DATA': 'Counters and data read with GET DATA',
  'Risposte libere o di solo errore': 'Free-form or error-only responses',
  'Response del progetto': 'Project responses',
  'Template di risposta': 'Response templates',
  'Cerca template (nome, comando, circuito…)': 'Search templates (name, command, scheme…)',
  'Nessun template corrisponde alla ricerca.': 'No template matches the search.',
  'Importa response da hex…': 'Import response from hex…',
  'Esporta documentazione…': 'Export documentation…',
  'Apri recenti': 'Open recent',
  'Nessun file recente': 'No recent files',
  'Cancella elenco': 'Clear list',
  // ---- Contextual help (generated) ----
  'Selezione applicazione': 'Application selection',
  "SELECT di PPSE/PSE e AID: il terminale costruisce la candidate list e sceglie l'applicazione.":
    'SELECT of PPSE/PSE and AID: the terminal builds the candidate list and chooses the application.',
  'Avvio (GET PROCESSING OPTIONS)': 'Initiation (GET PROCESSING OPTIONS)',
  'Il terminale invia i dati richiesti dal PDOL; la carta risponde con AIP e AFL (e in contactless spesso con il crittogramma).':
    'The terminal sends the data requested by the PDOL; the card answers with AIP and AFL (and in contactless often the cryptogram).',
  'Lettura dati (READ RECORD)': 'Read application data (READ RECORD)',
  "Lettura dei record indicati dall'AFL.": 'Reading of the records listed in the AFL.',
  'Offline Data Authentication': 'Offline Data Authentication',
  'Verifica di autenticità della carta con SDA, DDA, CDA o fDDA tramite certificati e firme RSA.':
    'Card authenticity check with SDA, DDA, CDA or fDDA using certificates and RSA signatures.',
  'Processing Restrictions': 'Processing Restrictions',
  "Controlli di versione, date di validità e restrizioni d'uso (AUC).":
    'Checks on version, validity dates and usage restrictions (AUC).',
  'Verifica del titolare (CVM)': 'Cardholder verification (CVM)',
  'Scelta ed esecuzione del metodo di verifica: PIN offline o online, firma, nessun CVM.':
    'Choice and execution of the verification method: offline or online PIN, signature, no CVM.',
  'Terminal Risk Management': 'Terminal Risk Management',
  'Floor limit, selezione casuale per online e velocity checking.':
    'Floor limit, random selection for online and velocity checking.',
  'Terminal Action Analysis': 'Terminal Action Analysis',
  'Confronto del TVR con IAC e TAC per decidere se rifiutare, andare online o approvare offline.':
    'Comparison of the TVR with IACs and TACs to decide whether to decline, go online or approve offline.',
  'Card Action Analysis (GENERATE AC)': 'Card Action Analysis (GENERATE AC)',
  'La carta genera il crittogramma (AAC, TC o ARQC) confermando o modificando la decisione del terminale.':
    'The card generates the cryptogram (AAC, TC or ARQC), confirming or changing the terminal decision.',
  'Autorizzazione online': 'Online authorisation',
  "Invio dei dati chip all'issuer, verifica dell'ARQC e risposta con ARPC.":
    'Chip data sent to the issuer, ARQC verification and ARPC response.',
  'Completamento e script': 'Completion and scripts',
  'Issuer authentication, secondo GENERATE AC e issuer script.':
    'Issuer authentication, second GENERATE AC and issuer scripts.',
  'Contenitore principale della risposta a SELECT, sia per PPSE/PSE sia per un AID. Racchiude il DF Name (84) e il template proprietario (A5) con i dati utili alla selezione.':
    'Outer container of the SELECT response, both for PPSE/PSE and for an AID. It wraps the DF Name (84) and the proprietary template (A5) with the data needed for selection.',
  "È la prima struttura TLV che il terminale riceve: da qui ricava la lista delle applicazioni candidate e, dopo la SELECT dell'AID, label, priorità e PDOL.":
    'It is the first TLV structure the terminal receives: from it the terminal builds the candidate list and, after selecting the AID, reads label, priority and PDOL.',
  "Template proprietario dell'FCI. Contiene gli elementi che descrivono l'applicazione o l'ambiente di pagamento: label, priorità, PDOL, preferenze di lingua, code table e dati discrezionali (BF0C).":
    'FCI proprietary template. It holds the elements describing the application or payment environment: label, priority, PDOL, language preference, code table and discretionary data (BF0C).',
  'Analizzato durante la selezione: il PDOL eventualmente presente qui determina quali dati il terminale invierà nella successiva GET PROCESSING OPTIONS.':
    'Parsed during selection: the PDOL found here, if any, determines which data the terminal sends in the following GET PROCESSING OPTIONS.',
  "Dati discrezionali dell'issuer nell'FCI. Nella PPSE contactless contiene le Directory Entry (61), una per ogni applicazione supportata; nella SELECT AID può contenere Log Entry, dati proprietari o dati di circuito.":
    'Issuer discretionary data in the FCI. In the contactless PPSE it contains the Directory Entries (61), one per supported application; in the AID SELECT it may contain Log Entry, proprietary or scheme data.',
  'Nel flusso contactless (EMV Book B, Entry Point) il terminale legge le entry 61 in BF0C per costruire la candidate list, abbinando AID e Kernel Identifier ai kernel che supporta.':
    'In the contactless flow (EMV Book B, Entry Point) the terminal reads the 61 entries in BF0C to build the candidate list, matching AID and Kernel Identifier against the kernels it supports.',
  "Directory Entry: descrive una singola applicazione disponibile sulla carta con almeno l'AID (4F) e, di solito, label (50), priorità (87) e, in contactless, il Kernel Identifier (9F2A). Può ripetersi.":
    'Directory Entry: describes one application available on the card with at least the AID (4F) and usually label (50), priority (87) and, for contactless, the Kernel Identifier (9F2A). It can be repeated.',
  "Restituita nella PPSE (contactless) o nei record del file di directory della PSE (contact). Ogni entry diventa una candidata; il terminale poi seleziona l'AID scelto.":
    'Returned in the PPSE (contactless) or in the PSE directory file records (contact). Each entry becomes a candidate; the terminal then selects the chosen AID.',
  'Template che racchiude i dati di un record letto con READ RECORD: dati di traccia, PAN, date, DOL, CVM List, Issuer Action Codes, chiavi e certificati per ODA.':
    'Template wrapping the data of a record read with READ RECORD: track data, PAN, dates, DOLs, CVM List, Issuer Action Codes, keys and certificates for ODA.',
  "Dopo la GPO il terminale legge tutti i record indicati dall'AFL (94); ogni risposta è un template 70. I record segnati per ODA entrano nel calcolo dell'autenticazione offline.":
    'After GPO the terminal reads all records listed in the AFL (94); each response is a 70 template. Records flagged for ODA are included in the offline authentication.',
  "Directory Discretionary Template: dati aggiuntivi associati a una Directory Entry, definiti dall'issuer o dal circuito.":
    'Directory Discretionary Template: additional data attached to a Directory Entry, defined by the issuer or the scheme.',
  'Letto insieme alla Directory Entry durante la costruzione della candidate list.':
    'Read together with the Directory Entry while building the candidate list.',
  'Response Message Template Format 2: risposta in formato TLV, in cui ogni dato è identificato dal proprio tag. È il formato più flessibile e quello usato dalle carte moderne.':
    'Response Message Template Format 2: TLV response where every data element is identified by its tag. It is the most flexible format and the one used by modern cards.',
  'Usato nelle risposte a GET PROCESSING OPTIONS, GENERATE AC e INTERNAL AUTHENTICATE. In contactless (es. Visa qVSDC) la GPO in formato 2 può già contenere crittogramma e dati di traccia.':
    'Used in the responses to GET PROCESSING OPTIONS, GENERATE AC and INTERNAL AUTHENTICATE. In contactless (e.g. Visa qVSDC) a format 2 GPO may already contain the cryptogram and track data.',
  'Response Message Template Format 1: i valori sono concatenati in un ordine fisso, senza tag né lunghezze interne. Per la GPO: AIP || AFL; per GENERATE AC: CID || ATC || AC || IAD.':
    'Response Message Template Format 1: values are concatenated in a fixed order, without inner tags or lengths. For GPO: AIP || AFL; for GENERATE AC: CID || ATC || AC || IAD.',
  "Usato soprattutto da carte contact meno recenti. Il terminale scompone il valore in base alla posizione dei campi, quindi l'ordine e le lunghezze devono essere esatti.":
    'Mostly used by older contact cards. The terminal splits the value by field position, so order and lengths must be exact.',
  'Application Identifier della carta: RID di 5 byte (identifica il circuito, es. A000000003 = Visa, A000000004 = Mastercard) seguito da un PIX fino a 11 byte che identifica il prodotto.':
    'Card Application Identifier: 5-byte RID (identifies the scheme, e.g. A000000003 = Visa, A000000004 = Mastercard) followed by a PIX of up to 11 bytes identifying the product.',
  "Il terminale confronta l'AID con la propria lista di AID supportati (matching esatto o parziale) per decidere quali applicazioni sono candidate, poi lo usa nel comando SELECT.":
    'The terminal compares the AID with its list of supported AIDs (exact or partial match) to decide which applications are candidates, then uses it in the SELECT command.',
  "Nome del Dedicated File selezionato: '2PAY.SYS.DDF01' per la PPSE contactless, '1PAY.SYS.DDF01' per la PSE contact, oppure l'AID dell'applicazione.":
    "Name of the selected Dedicated File: '2PAY.SYS.DDF01' for the contactless PPSE, '1PAY.SYS.DDF01' for the contact PSE, or the application AID.",
  "Conferma al terminale quale DF è stato selezionato. Dopo la SELECT dell'AID deve coincidere (o iniziare) con l'AID richiesto.":
    'Confirms to the terminal which DF was selected. After the AID SELECT it must match (or start with) the requested AID.',
  "Nome mnemonico dell'applicazione (es. 'VISA CREDIT'), in caratteri ans della ISO 8859 di base, massimo 16 caratteri.":
    "Mnemonic name of the application (e.g. 'VISA CREDIT'), in basic ISO 8859 ans characters, up to 16 characters.",
  "Mostrato al titolare quando deve scegliere tra più applicazioni o confermarne una; il terminale lo usa se non può visualizzare l'Application Preferred Name (9F12).":
    'Shown to the cardholder when choosing between applications or confirming one; the terminal uses it when it cannot display the Application Preferred Name (9F12).',
  "Nome preferito dell'applicazione, codificato con la parte della ISO 8859 indicata da 9F11 (permette caratteri nazionali).":
    'Preferred application name, encoded with the ISO 8859 part indicated by 9F11 (allows national characters).',
  'Se il terminale supporta la code table indicata, mostra questo nome al posto della Application Label durante la selezione.':
    'If the terminal supports the indicated code table, it displays this name instead of the Application Label during selection.',
  "Application Priority Indicator: i bit b4-b1 indicano la priorità (1 = massima, 0 = nessuna), il bit b8 indica se l'applicazione può essere selezionata solo con conferma del titolare.":
    'Application Priority Indicator: bits b4-b1 give the priority (1 = highest, 0 = none), bit b8 indicates whether the application can be selected only with cardholder confirmation.',
  'Il terminale ordina la candidate list in base a questa priorità; con selezione automatica sceglie la priorità più alta che non richiede conferma.':
    'The terminal sorts the candidate list by this priority; with automatic selection it picks the highest priority that does not require confirmation.',
  "Short File Identifier dell'Elementary File di directory della PSE (contact), valori 1-30.":
    'Short File Identifier of the PSE directory Elementary File (contact), values 1-30.',
  'Dopo la SELECT della PSE il terminale legge i record di questo SFI con READ RECORD per ottenere le Directory Entry delle applicazioni.':
    'After selecting the PSE the terminal reads the records of this SFI with READ RECORD to get the application Directory Entries.',
  'Da 1 a 4 codici lingua ISO 639-1 (minuscoli, 2 caratteri ciascuno) in ordine di preferenza del titolare.':
    "One to four ISO 639-1 language codes (lowercase, 2 characters each) in the cardholder's order of preference.",
  "Il terminale sceglie la prima lingua supportata per i messaggi al titolare (es. 'Inserire PIN', 'Approvato'); se nessuna è supportata usa la lingua di default.":
    "The terminal picks the first supported language for cardholder messages (e.g. 'Enter PIN', 'Approved'); if none is supported it uses its default language.",
  "Indica quale parte della ISO/IEC 8859 (1-10) è usata per codificare l'Application Preferred Name (9F12).":
    'Indicates which part of ISO/IEC 8859 (1-10) is used to encode the Application Preferred Name (9F12).',
  'Il terminale lo usa per decidere se è in grado di mostrare 9F12; obbligatorio quando 9F12 è presente.':
    'The terminal uses it to decide whether it can display 9F12; mandatory when 9F12 is present.',
  'Processing Options Data Object List: lista di coppie tag + lunghezza che descrive i dati del terminale richiesti dalla carta nella GPO (es. TTQ 9F66, importo 9F02, Unpredictable Number 9F37).':
    'Processing Options Data Object List: list of tag + length pairs describing the terminal data the card requires in the GPO (e.g. TTQ 9F66, amount 9F02, Unpredictable Number 9F37).',
  "Restituito nella SELECT AID. Il terminale concatena i valori richiesti, nell'ordine e con le lunghezze indicate, nel campo 83 della GET PROCESSING OPTIONS. Senza PDOL invia 8300.":
    'Returned in the AID SELECT. The terminal concatenates the requested values, in the given order and lengths, into field 83 of GET PROCESSING OPTIONS. Without a PDOL it sends 8300.',
  "Kernel Identifier: indica quale kernel contactless del terminale deve processare l'applicazione (es. 02 Mastercard, 03 Visa, 04 Amex, 2E CPACE).":
    'Kernel Identifier: indicates which contactless kernel of the terminal must process the application (e.g. 02 Mastercard, 03 Visa, 04 Amex, 2E CPACE).',
  "Usato dall'Entry Point durante la costruzione della candidate list: una combinazione AID + kernel è candidata solo se il terminale supporta quel kernel per quell'AID.":
    'Used by the Entry Point while building the candidate list: an AID + kernel combination is a candidate only if the terminal supports that kernel for that AID.',
  'Application Selection Registered Proprietary Data: dati proprietari registrati presso EMVCo che possono influenzare la selezione (es. programmi domestici).':
    'Application Selection Registered Proprietary Data: proprietary data registered with EMVCo that can influence selection (e.g. domestic programmes).',
  'Il terminale può usarli per escludere o preferire applicazioni secondo regole locali.':
    'The terminal may use them to exclude or prefer applications according to local rules.',
  "Issuer Identification Number: le prime cifre del PAN (BIN/IIN) che identificano l'issuer.":
    'Issuer Identification Number: the leading digits of the PAN (BIN/IIN) identifying the issuer.',
  'Può essere usato dal terminale per instradamento o selezione prima di leggere il PAN completo.':
    'May be used by the terminal for routing or selection before reading the full PAN.',
  'Log Entry: SFI del file di log transazioni (1 byte) e numero massimo di record (1 byte).':
    'Log Entry: SFI of the transaction log file (1 byte) and maximum number of records (1 byte).',
  'Non usato nel flusso di pagamento: serve a terminali o applicazioni che leggono lo storico transazioni con READ RECORD, interpretando i record con il Log Format (9F4F).':
    'Not used in the payment flow: it serves terminals or applications that read the transaction history with READ RECORD, interpreting records with the Log Format (9F4F).',
  "Application Program Identifier (Visa): identifica il programma o prodotto associato all'applicazione.":
    'Application Program Identifier (Visa): identifies the programme or product associated with the application.',
  'Può essere usato dal terminale per applicare parametri specifici del programma (es. limiti dinamici).':
    'May be used by the terminal to apply programme-specific parameters (e.g. dynamic limits).',
  "URL dell'issuer, in caratteri ans.": 'Issuer URL, in ans characters.',
  'Informativo; non influenza il flusso di pagamento.':
    'Informational; it does not affect the payment flow.',
  'IBAN del conto associato alla carta.': 'IBAN of the account linked to the card.',
  'Usato in schemi domestici o per servizi a valore aggiunto (es. addebito diretto); non influenza la transazione EMV.':
    'Used by domestic schemes or value-added services (e.g. direct debit); it does not affect the EMV transaction.',
  'Business Identifier Code della banca: 4 lettere per la banca, 2 per il paese, 2 caratteri per la località, 3 opzionali per la filiale.':
    'Bank Business Identifier Code: 4 letters for the bank, 2 for the country, 2 characters for the location, 3 optional for the branch.',
  "Usato insieme all'IBAN in schemi domestici; non influenza la transazione EMV.":
    'Used together with the IBAN by domestic schemes; it does not affect the EMV transaction.',
  "Paese dell'issuer in formato ISO 3166-1 alpha-2 (es. 'IT').":
    "Issuer country as ISO 3166-1 alpha-2 (e.g. 'IT').",
  'Può essere usato in selezione per regole domestiche o di routing.':
    'May be used during selection for domestic or routing rules.',
  "Paese dell'issuer in formato ISO 3166-1 alpha-3 (es. 'ITA').":
    "Issuer country as ISO 3166-1 alpha-3 (e.g. 'ITA').",
  'Application Interchange Profile: indica le funzioni supportate dalla carta: SDA, DDA, CDA, verifica del titolare, terminal risk management obbligatorio, issuer authentication e, in contactless, CVM sul dispositivo e relay resistance.':
    'Application Interchange Profile: indicates the functions supported by the card: SDA, DDA, CDA, cardholder verification, mandatory terminal risk management, issuer authentication and, for contactless, on-device CVM and relay resistance.',
  "Restituito nella GPO. Guida il resto della transazione: il metodo ODA scelto dal terminale, l'esecuzione della CVM e del risk management. È sempre incluso nei dati autenticati staticamente.":
    'Returned in the GPO. It drives the rest of the transaction: the ODA method chosen by the terminal, CVM processing and risk management. It is always included in the statically authenticated data.',
  "Application File Locator: gruppi di 4 byte che indicano SFI, primo e ultimo record da leggere e quanti di questi record entrano nell'Offline Data Authentication.":
    'Application File Locator: groups of 4 bytes giving SFI, first and last record to read and how many of those records are part of Offline Data Authentication.',
  'Restituito nella GPO. Il terminale esegue una READ RECORD per ogni record indicato (P2 = SFI<<3 | 4) e accumula i record ODA per la verifica della firma.':
    'Returned in the GPO. The terminal issues a READ RECORD for each listed record (P2 = SFI<<3 | 4) and accumulates the ODA records for signature verification.',
  "Track 2 Equivalent Data: PAN, separatore 'D', scadenza YYMM, service code e dati discrezionali, in formato BCD con padding F.":
    "Track 2 Equivalent Data: PAN, 'D' separator, expiry YYMM, service code and discretionary data, in BCD with F padding.",
  "Letto nei record o restituito direttamente nella GPO contactless. Viene inviato all'acquirer nel messaggio di autorizzazione (campo 35 ISO 8583) e deve essere coerente con PAN (5A) e scadenza (5F24).":
    'Read from the records or returned directly in the contactless GPO. It is sent to the acquirer in the authorisation message (ISO 8583 field 35) and must be consistent with PAN (5A) and expiry (5F24).',
  'Primary Account Number della carta, numerico compresso fino a 19 cifre con padding F; deve superare il controllo Luhn.':
    'Card Primary Account Number, compressed numeric up to 19 digits with F padding; it must pass the Luhn check.',
  'Letto nei record. Usato per la exception file check del terminale, per il messaggio di autorizzazione e, nei certificati ODA, viene confrontato con il PAN certificato.':
    'Read from the records. Used for the terminal exception file check, for the authorisation message and, in ODA certificates, compared with the certified PAN.',
  "Nome del titolare (2-26 caratteri), tipicamente 'COGNOME/NOME'.":
    "Cardholder name (2-26 characters), typically 'SURNAME/NAME'.",
  'Informativo: può essere stampato sullo scontrino. Per privacy molte carte contactless lo omettono o lo valorizzano con un testo generico.':
    'Informational: it may be printed on the receipt. For privacy many contactless cards omit it or set a generic text.',
  'Nome esteso del titolare (27-45 caratteri), usato quando il nome non entra in 5F20.':
    'Extended cardholder name (27-45 characters), used when the name does not fit in 5F20.',
  'Informativo, come 5F20.': 'Informational, like 5F20.',
  "Data di scadenza dell'applicazione in formato YYMMDD.":
    'Application expiration date in YYMMDD format.',
  "Nelle Processing Restrictions il terminale la confronta con la data della transazione: se è passata imposta il bit TVR 'Applicazione scaduta'. In contactless Visa il CTQ può chiedere di andare online.":
    "During Processing Restrictions the terminal compares it with the transaction date: if it has passed it sets the TVR bit 'Expired application'. In Visa contactless the CTQ may request going online.",
  "Data di inizio validità dell'applicazione in formato YYMMDD.":
    'Application effective date in YYMMDD format.',
  "Nelle Processing Restrictions, se la data della transazione è precedente, il terminale imposta il bit TVR 'Applicazione non ancora valida'.":
    "During Processing Restrictions, if the transaction date is earlier, the terminal sets the TVR bit 'Application not yet effective'.",
  "Paese dell'issuer, codice numerico ISO 3166-1 (es. 0380 = Italia).":
    'Issuer country, ISO 3166-1 numeric code (e.g. 0380 = Italy).',
  "Confrontato con il Terminal Country Code (9F1A) per stabilire se la transazione è domestica o internazionale, e quindi quali bit dell'AUC (9F07) applicare.":
    'Compared with the Terminal Country Code (9F1A) to decide whether the transaction is domestic or international, and therefore which AUC (9F07) bits apply.',
  'Service code a 3 cifre (es. 201): la prima indica interchange e presenza del chip, la seconda le regole di autorizzazione, la terza i servizi consentiti e i requisiti PIN.':
    '3-digit service code (e.g. 201): the first digit indicates interchange and chip presence, the second authorisation rules, the third allowed services and PIN requirements.',
  'Usato soprattutto in fallback a banda magnetica; un primo digit 2 o 6 indica che la carta ha il chip.':
    'Mostly used in magnetic stripe fallback; a first digit of 2 or 6 indicates the card has a chip.',
  'PAN Sequence Number: distingue carte diverse emesse con lo stesso PAN (es. rinnovi o carte aggiuntive).':
    'PAN Sequence Number: distinguishes different cards issued with the same PAN (e.g. renewals or additional cards).',
  "Inviato all'issuer nel messaggio di autorizzazione (campo 23 ISO 8583) ed è spesso un input per la derivazione delle chiavi della carta.":
    'Sent to the issuer in the authorisation message (ISO 8583 field 23) and often an input to card key derivation.',
  'CDOL1: lista tag + lunghezza dei dati del terminale richiesti nel primo GENERATE AC (importo, valuta, data, TVR, Unpredictable Number, ecc.).':
    'CDOL1: tag + length list of the terminal data required in the first GENERATE AC (amount, currency, date, TVR, Unpredictable Number, etc.).',
  'Letto nei record. Il terminale costruisce il campo dati del primo GENERATE AC concatenando i valori richiesti; la carta li usa per il crittogramma e per il Card Risk Management.':
    'Read from the records. The terminal builds the data field of the first GENERATE AC by concatenating the requested values; the card uses them for the cryptogram and Card Risk Management.',
  'CDOL2: dati richiesti nel secondo GENERATE AC, tipicamente Authorisation Response Code (8A), Issuer Authentication Data (91), TVR e Unpredictable Number.':
    'CDOL2: data required in the second GENERATE AC, typically Authorisation Response Code (8A), Issuer Authentication Data (91), TVR and Unpredictable Number.',
  "Usato dopo la risposta online dell'issuer: il terminale invia l'esito dell'autorizzazione e la carta decide se generare TC (approvata) o AAC (rifiutata).":
    "Used after the issuer's online response: the terminal sends the authorisation outcome and the card decides whether to generate a TC (approved) or AAC (declined).",
  'CVM List: importi X e Y (4 byte ciascuno) seguiti da regole di 2 byte (metodo CVM + condizione) in ordine di priorità. Il bit b7 del primo byte indica se, in caso di fallimento, provare la regola successiva.':
    'CVM List: amounts X and Y (4 bytes each) followed by 2-byte rules (CVM method + condition) in order of priority. Bit b7 of the first byte indicates whether to try the next rule on failure.',
  "Nella fase di Cardholder Verification il terminale scorre le regole: la prima la cui condizione è soddisfatta e il cui metodo è supportato viene eseguita (PIN offline, PIN online, firma, nessun CVM). L'esito finisce nei CVM Results (9F34).":
    'In the Cardholder Verification step the terminal walks the rules: the first whose condition is met and whose method is supported is performed (offline PIN, online PIN, signature, no CVM). The outcome goes into the CVM Results (9F34).',
  'Transaction Certificate DOL: dati usati per calcolare il TC Hash Value (98).':
    'Transaction Certificate DOL: data used to compute the TC Hash Value (98).',
  'Se CDOL1/CDOL2 richiedono il TC Hash Value, il terminale lo calcola come SHA-1 dei dati indicati dal TDOL (o da un TDOL di default, impostando il relativo bit TVR).':
    'If CDOL1/CDOL2 request the TC Hash Value, the terminal computes it as the SHA-1 of the data listed in the TDOL (or a default TDOL, setting the related TVR bit).',
  "Dynamic Data Authentication DOL: dati inviati nella INTERNAL AUTHENTICATE per la DDA; deve contenere almeno l'Unpredictable Number (9F37).":
    'Dynamic Data Authentication DOL: data sent in INTERNAL AUTHENTICATE for DDA; it must contain at least the Unpredictable Number (9F37).',
  'Con DDA il terminale invia questi dati, la carta li firma con la propria chiave privata e restituisce la SDAD (9F4B), che il terminale verifica con la chiave pubblica ICC recuperata dai certificati.':
    'With DDA the terminal sends these data, the card signs them with its private key and returns the SDAD (9F4B), which the terminal verifies with the ICC public key recovered from the certificates.',
  "Application Usage Control: restrizioni d'uso definite dall'issuer: cash, beni, servizi, cashback, ATM, distinguendo tra transazioni domestiche e internazionali.":
    'Application Usage Control: usage restrictions defined by the issuer: cash, goods, services, cashback, ATM, distinguishing domestic and international transactions.',
  "Nelle Processing Restrictions il terminale verifica che il tipo di transazione e la sua natura (domestica se 5F28 = 9F1A) siano consentiti; altrimenti imposta il bit TVR 'Servizio richiesto non consentito'.":
    "During Processing Restrictions the terminal checks that the transaction type and its nature (domestic when 5F28 = 9F1A) are allowed; otherwise it sets the TVR bit 'Requested service not allowed'.",
  "Versione dell'applicazione assegnata dal payment system alla carta.":
    'Application version assigned to the card by the payment system.',
  "Confrontata con la versione del terminale (9F09): se diversa il terminale imposta il bit TVR 'ICC e terminale hanno versioni applicazione diverse'.":
    "Compared with the terminal version (9F09): if different the terminal sets the TVR bit 'ICC and terminal have different application versions'.",
  'Issuer Action Code - Default: maschera con lo stesso layout del TVR. Indica le condizioni per cui la transazione va rifiutata se il terminale non riesce ad andare online.':
    'Issuer Action Code - Default: mask with the same layout as the TVR. It lists the conditions for which the transaction must be declined if the terminal cannot go online.',
  'Nella Terminal Action Analysis, se la transazione non può essere autorizzata online, il terminale confronta TVR con IAC-Default e TAC-Default: un bit in comune porta a richiedere un AAC.':
    'In Terminal Action Analysis, if the transaction cannot be authorised online, the terminal compares the TVR with IAC-Default and TAC-Default: a common bit leads to requesting an AAC.',
  "Issuer Action Code - Denial: condizioni TVR per cui la transazione deve essere rifiutata offline senza tentare l'autorizzazione online.":
    'Issuer Action Code - Denial: TVR conditions for which the transaction must be declined offline without attempting online authorisation.',
  'È la prima verifica della Terminal Action Analysis: se un bit del TVR coincide con IAC-Denial o TAC-Denial il terminale chiede un AAC nel primo GENERATE AC.':
    'It is the first check of Terminal Action Analysis: if a TVR bit matches IAC-Denial or TAC-Denial the terminal requests an AAC in the first GENERATE AC.',
  'Issuer Action Code - Online: condizioni TVR per cui la transazione deve essere autorizzata online.':
    'Issuer Action Code - Online: TVR conditions for which the transaction must be authorised online.',
  'Se il terminale è online-capable e un bit del TVR coincide con IAC-Online o TAC-Online, chiede un ARQC; altrimenti può chiedere un TC per approvare offline.':
    'If the terminal is online capable and a TVR bit matches IAC-Online or TAC-Online, it requests an ARQC; otherwise it may request a TC to approve offline.',
  "Lower Consecutive Offline Limit: numero di transazioni offline consecutive oltre il quale l'issuer vuole che il terminale vada online.":
    'Lower Consecutive Offline Limit: number of consecutive offline transactions beyond which the issuer wants the terminal to go online.',
  'Nel velocity checking del Terminal Risk Management il terminale confronta ATC - Last Online ATC con questo limite e, se superato, imposta il relativo bit TVR.':
    'In the velocity checking of Terminal Risk Management the terminal compares ATC - Last Online ATC with this limit and, if exceeded, sets the related TVR bit.',
  'Upper Consecutive Offline Limit: numero di transazioni offline consecutive oltre il quale, se non si può andare online, la transazione va rifiutata.':
    'Upper Consecutive Offline Limit: number of consecutive offline transactions beyond which, if online is not possible, the transaction must be declined.',
  "Usato nel velocity checking insieme a 9F14, 9F36 e 9F13; il superamento imposta il bit TVR 'Upper consecutive offline limit superato'.":
    "Used in velocity checking together with 9F14, 9F36 and 9F13; exceeding it sets the TVR bit 'Upper consecutive offline limit exceeded'.",
  "Track 1 Discretionary Data: dati discrezionali della traccia 1 definiti dall'issuer.":
    'Track 1 Discretionary Data: issuer-defined discretionary data of track 1.',
  "Può essere inviato all'issuer nel messaggio di autorizzazione.":
    'May be sent to the issuer in the authorisation message.',
  'Track 2 Discretionary Data: dati discrezionali della traccia 2.':
    'Track 2 Discretionary Data: discretionary data of track 2.',
  'Track 1 Data (Mastercard): immagine della traccia 1 usata in mag-stripe mode contactless.':
    'Track 1 Data (Mastercard): image of track 1 used in contactless mag-stripe mode.',
  "In mag-stripe mode il kernel aggiorna i dati dinamici (CVC3, UN, ATC) e li invia all'acquirer al posto dei dati chip.":
    'In mag-stripe mode the kernel updates the dynamic data (CVC3, UN, ATC) and sends them to the acquirer instead of chip data.',
  'Track 2 Data (Mastercard): immagine della traccia 2 usata in mag-stripe mode contactless.':
    'Track 2 Data (Mastercard): image of track 2 used in contactless mag-stripe mode.',
  "Come 56: in mag-stripe mode viene completata con i dati dinamici e inviata nell'autorizzazione.":
    'Like 56: in mag-stripe mode it is completed with dynamic data and sent in the authorisation.',
  "Valuta dell'applicazione, codice numerico ISO 4217 (es. 0978 = EUR).":
    'Application currency, ISO 4217 numeric code (e.g. 0978 = EUR).',
  'Le condizioni CVM su importi X/Y (codici 06-09) si applicano solo se la valuta della transazione (5F2A) coincide con questa; usata anche nei controlli di risk management sulla carta.':
    'CVM conditions on amounts X/Y (codes 06-09) apply only if the transaction currency (5F2A) matches this one; also used by card risk management checks.',
  "Application Currency Exponent: numero di cifre decimali della valuta dell'applicazione (es. 2 per EUR).":
    'Application Currency Exponent: number of decimal digits of the application currency (e.g. 2 for EUR).',
  "Usato per interpretare correttamente importi espressi nella valuta dell'applicazione.":
    'Used to correctly interpret amounts expressed in the application currency.',
  "Application Discretionary Data: dati liberi definiti dall'issuer.":
    'Application Discretionary Data: free data defined by the issuer.',
  'Non interpretato dal terminale nel flusso standard.':
    'Not interpreted by the terminal in the standard flow.',
  'Payment Account Reference: riferimento non finanziario di 29 caratteri che collega PAN e token dello stesso conto.':
    'Payment Account Reference: 29-character non-financial reference linking PAN and tokens of the same account.',
  "Inviato nell'autorizzazione per permettere ad acquirer ed esercenti di riconoscere il conto senza usare il PAN.":
    'Sent in the authorisation so acquirers and merchants can recognise the account without using the PAN.',
  'Token Requestor ID: identifica chi ha richiesto il token (es. wallet mobile).':
    'Token Requestor ID: identifies who requested the token (e.g. a mobile wallet).',
  "Presente nelle transazioni tokenizzate e inviato nell'autorizzazione.":
    'Present in tokenised transactions and sent in the authorisation.',
  'Ultime 4 cifre del PAN reale, usate con i token.':
    'Last 4 digits of the real PAN, used with tokens.',
  'Permette di mostrare o stampare le ultime cifre del conto quando la carta presenta un token.':
    'Allows the last digits of the account to be displayed or printed when the card presents a token.',
  "Indice della chiave pubblica della Certification Authority del circuito (combinato con il RID dell'AID).":
    'Index of the scheme Certification Authority public key (combined with the AID RID).',
  "All'inizio dell'ODA il terminale cerca la chiave CA corrispondente a RID + indice; se non la trova l'ODA fallisce e viene impostato il bit TVR relativo.":
    'At the start of ODA the terminal looks up the CA key matching RID + index; if not found ODA fails and the related TVR bit is set.',
  "Certificato della chiave pubblica dell'issuer, firmato dalla CA; la lunghezza è pari al modulo della chiave CA.":
    'Issuer public key certificate, signed by the CA; its length equals the CA key modulus.',
  "Il terminale lo verifica con la chiave CA (8F) per recuperare la chiave pubblica dell'issuer, necessaria per verificare SDA o il certificato ICC.":
    'The terminal verifies it with the CA key (8F) to recover the issuer public key, needed to verify SDA or the ICC certificate.',
  "Parte del modulo della chiave pubblica dell'issuer che non entra nel certificato 90.":
    'Part of the issuer public key modulus that does not fit in certificate 90.',
  'Concatenato con la parte recuperata dal certificato per ricostruire il modulo completo.':
    'Concatenated with the part recovered from the certificate to rebuild the full modulus.',
  "Esponente pubblico RSA della chiave dell'issuer: 03 oppure 010001 (65537).":
    'RSA public exponent of the issuer key: 03 or 010001 (65537).',
  'Usato insieme al modulo recuperato per le verifiche RSA successive.':
    'Used together with the recovered modulus for subsequent RSA verifications.',
  "Signed Static Application Data: firma dell'issuer sui dati statici della carta, usata per SDA.":
    'Signed Static Application Data: issuer signature over the card static data, used for SDA.',
  "Con SDA il terminale la verifica con la chiave dell'issuer, confrontando l'hash con i record ODA e i tag della SDA Tag List (9F4A).":
    'With SDA the terminal verifies it with the issuer key, comparing the hash with the ODA records and the tags in the SDA Tag List (9F4A).',
  "Certificato della chiave pubblica della carta (ICC), firmato dall'issuer.":
    'Card (ICC) public key certificate, signed by the issuer.',
  "Per DDA/CDA il terminale lo verifica con la chiave dell'issuer e ottiene la chiave pubblica ICC, con cui verificherà la firma dinamica (9F4B).":
    'For DDA/CDA the terminal verifies it with the issuer key and obtains the ICC public key, used to verify the dynamic signature (9F4B).',
  'Esponente pubblico RSA della chiave ICC: 03 oppure 010001 (65537).':
    'RSA public exponent of the ICC key: 03 or 010001 (65537).',
  'Usato per verificare la firma dinamica.': 'Used to verify the dynamic signature.',
  'Parte del modulo della chiave pubblica ICC che non entra nel certificato 9F46.':
    'Part of the ICC public key modulus that does not fit in certificate 9F46.',
  'Concatenato alla parte recuperata dal certificato per ricostruire il modulo.':
    'Concatenated with the part recovered from the certificate to rebuild the modulus.',
  "Static Data Authentication Tag List: tag i cui valori entrano nei dati autenticati staticamente; EMV ammette solo l'AIP (82).":
    'Static Data Authentication Tag List: tags whose values are included in the statically authenticated data; EMV allows only the AIP (82).',
  "Il terminale aggiunge il valore di questi tag ai record ODA prima di calcolare l'hash per SDA, DDA o CDA.":
    'The terminal appends the value of these tags to the ODA records before computing the hash for SDA, DDA or CDA.',
  'Signed Dynamic Application Data: firma RSA generata dalla carta su dati dinamici (Unpredictable Number, ICC Dynamic Number e, con CDA, il crittogramma).':
    'Signed Dynamic Application Data: RSA signature generated by the card over dynamic data (Unpredictable Number, ICC Dynamic Number and, with CDA, the cryptogram).',
  "Restituita nella INTERNAL AUTHENTICATE (DDA), nel GENERATE AC (CDA) o nella GPO contactless (fDDA). Il terminale la verifica con la chiave ICC: se fallisce imposta il bit TVR 'DDA/CDA fallita'.":
    "Returned in INTERNAL AUTHENTICATE (DDA), in GENERATE AC (CDA) or in the contactless GPO (fDDA). The terminal verifies it with the ICC key: on failure it sets the TVR bit 'DDA/CDA failed'.",
  'ICC Dynamic Number: numero variabile generato dalla carta a ogni transazione e incluso nella firma dinamica.':
    'ICC Dynamic Number: variable number generated by the card for each transaction and included in the dynamic signature.',
  'Recuperato dal terminale verificando la SDAD; può essere richiesto in CDOL per legare crittogramma e firma.':
    'Recovered by the terminal when verifying the SDAD; it may be requested in a CDOL to bind cryptogram and signature.',
  'Card Authentication Related Data (Visa fDDA): versione fDDA, Card Unpredictable Number e CTQ inclusi nella firma.':
    'Card Authentication Related Data (Visa fDDA): fDDA version, Card Unpredictable Number and CTQ included in the signature.',
  'Il reader Visa lo usa per verificare la firma fDDA restituita nella GPO, senza comandi aggiuntivi.':
    'The Visa reader uses it to verify the fDDA signature returned in the GPO, without additional commands.',
  'Cryptogram Information Data: i bit b8-b7 indicano il tipo di crittogramma restituito (00 AAC rifiuto, 01 TC approvazione offline, 10 ARQC richiesta online); b4 e b3-b1 gestiscono advice e motivazioni.':
    'Cryptogram Information Data: bits b8-b7 give the type of cryptogram returned (00 AAC decline, 01 TC offline approval, 10 ARQC online request); b4 and b3-b1 handle advice and reasons.',
  "È la decisione della carta nella Card Action Analysis: può confermare o 'abbassare' la richiesta del terminale (es. terminale chiede TC, carta risponde ARQC o AAC), mai alzarla.":
    "It is the card's decision in Card Action Analysis: it may confirm or downgrade the terminal request (e.g. terminal asks for a TC, card answers ARQC or AAC), never upgrade it.",
  'Application Transaction Counter: contatore incrementato dalla carta a ogni transazione.':
    'Application Transaction Counter: counter incremented by the card on every transaction.',
  "Input del crittogramma (protegge dai replay), usato nel velocity checking (ATC - Last Online ATC) e inviato all'issuer, che verifica la progressione.":
    'Input to the cryptogram (protects against replay), used in velocity checking (ATC - Last Online ATC) and sent to the issuer, which checks its progression.',
  'Application Cryptogram: MAC di 8 byte calcolato dalla carta con una chiave di sessione su dati di transazione e carta (importo, valuta, data, UN, ATC, ...).':
    'Application Cryptogram: 8-byte MAC computed by the card with a session key over transaction and card data (amount, currency, date, UN, ATC, ...).',
  "Un ARQC viene verificato online dall'issuer, che risponde con un ARPC; un TC o un AAC viene conservato come prova della transazione approvata o rifiutata.":
    'An ARQC is verified online by the issuer, which answers with an ARPC; a TC or AAC is kept as evidence of the approved or declined transaction.',
  "Issuer Application Data: dati proprietari dell'issuer (es. Cryptogram Version Number, Derivation Key Index, Card Verification Results) con formato dipendente dal circuito.":
    'Issuer Application Data: issuer proprietary data (e.g. Cryptogram Version Number, Derivation Key Index, Card Verification Results) in a scheme-dependent format.',
  "Restituito con il crittogramma e inviato all'issuer, che lo usa per sapere come verificare l'ARQC e quali controlli ha eseguito la carta.":
    'Returned with the cryptogram and sent to the issuer, which uses it to know how to verify the ARQC and which checks the card performed.',
  "Last Online ATC Register: valore dell'ATC all'ultima transazione autorizzata online.":
    'Last Online ATC Register: ATC value at the last online authorised transaction.',
  "Letto con GET DATA durante il velocity checking: se vale 0 il terminale imposta il bit TVR 'Nuova carta'.":
    "Read with GET DATA during velocity checking: if it is 0 the terminal sets the TVR bit 'New card'.",
  'PIN Try Counter: numero di tentativi PIN offline rimanenti.':
    'PIN Try Counter: number of remaining offline PIN tries.',
  "Letto con GET DATA prima della verifica PIN offline: se vale 0 il PIN è bloccato e il terminale imposta il bit TVR 'PIN Try Limit superato'.":
    "Read with GET DATA before offline PIN verification: if it is 0 the PIN is blocked and the terminal sets the TVR bit 'PIN Try Limit exceeded'.",
  'Log Format: DOL che descrive il contenuto dei record del log transazioni.':
    'Log Format: DOL describing the content of the transaction log records.',
  'Letto con GET DATA da applicazioni che consultano lo storico; non fa parte del flusso di pagamento.':
    'Read with GET DATA by applications browsing the history; not part of the payment flow.',
  "Data Authentication Code: codice di 2 byte inserito dall'issuer nei dati firmati per SDA.":
    'Data Authentication Code: 2-byte code placed by the issuer in the SDA signed data.',
  'Recuperato verificando la SDA e, se richiesto da CDOL, inviato alla carta nel GENERATE AC.':
    'Recovered when verifying SDA and, if requested by a CDOL, sent to the card in GENERATE AC.',
  "Card Transaction Qualifiers (Visa): indicazioni della carta al reader contactless: CVM richiesto (PIN online, firma), comportamento se l'ODA fallisce o l'applicazione è scaduta, eventuale CVM eseguito sul dispositivo.":
    'Card Transaction Qualifiers (Visa): card indications to the contactless reader: required CVM (online PIN, signature), behaviour when ODA fails or the application has expired, consumer device CVM performed.',
  'Restituito nella GPO qVSDC. Il reader lo combina con il TTQ (9F66) per decidere CVM e se andare online o cambiare interfaccia.':
    'Returned in the qVSDC GPO. The reader combines it with the TTQ (9F66) to decide the CVM and whether to go online or switch interface.',
  'Visa: Form Factor Indicator (tipo di dispositivo: carta, mobile, wearable e sue caratteristiche). Mastercard: Third Party Data.':
    'Visa: Form Factor Indicator (device type: card, mobile, wearable and its features). Mastercard: Third Party Data.',
  "Inviato all'issuer nell'autorizzazione per analisi del rischio e reportistica.":
    'Sent to the issuer in the authorisation for risk analysis and reporting.',
  'Available Offline Spending Amount: importo residuo spendibile offline.':
    'Available Offline Spending Amount: remaining amount that can be spent offline.',
  'Il reader può mostrarlo al titolare dopo la transazione; riflette i contatori di risk management della carta.':
    'The reader may display it to the cardholder after the transaction; it reflects the card risk management counters.',
  "Customer Exclusive Data (Visa): dati proprietari dell'issuer trasportati verso l'host.":
    'Customer Exclusive Data (Visa): issuer proprietary data carried to the host.',
  'Inviato nel messaggio di autorizzazione senza essere interpretato dal terminale.':
    'Sent in the authorisation message without being interpreted by the terminal.',
  'Application Default Action: comportamento della carta in situazioni particolari (es. issuer authentication fallita, transazione internazionale).':
    'Application Default Action: card behaviour in particular situations (e.g. failed issuer authentication, international transaction).',
  'Usato internamente dalla carta nel Card Risk Management.':
    'Used internally by the card in Card Risk Management.',
  'Terminal Transaction Qualifiers: capacità e requisiti del reader contactless (EMV mode, online capable, CVM supportati, ODA, ecc.).':
    'Terminal Transaction Qualifiers: capabilities and requirements of the contactless reader (EMV mode, online capable, supported CVMs, ODA, etc.).',
  'Inviato alla carta nella GPO quando richiesto dal PDOL; la carta lo usa per scegliere il percorso (online, offline, CVM).':
    'Sent to the card in the GPO when requested by the PDOL; the card uses it to choose the path (online, offline, CVM).',
  'Importo autorizzato della transazione (n12, nelle unità minime della valuta).':
    'Authorised amount of the transaction (n12, in minor currency units).',
  'Richiesto nei DOL (PDOL, CDOL1). Usato per floor limit, condizioni CVM e incluso nel crittogramma.':
    'Requested in DOLs (PDOL, CDOL1). Used for floor limits, CVM conditions and included in the cryptogram.',
  "Importo 'altro', tipicamente il cashback (n12).": "'Other' amount, typically cashback (n12).",
  'Richiesto nei DOL e incluso nel crittogramma.':
    'Requested in DOLs and included in the cryptogram.',
  'Paese del terminale, codice numerico ISO 3166-1.': 'Terminal country, ISO 3166-1 numeric code.',
  'Confrontato con 5F28 per stabilire se la transazione è domestica; richiesto spesso in PDOL e CDOL1.':
    'Compared with 5F28 to decide whether the transaction is domestic; often requested in PDOL and CDOL1.',
  "Terminal Verification Results: 5 byte in cui il terminale registra l'esito di tutti i controlli (ODA, restrizioni, CVM, risk management, script).":
    'Terminal Verification Results: 5 bytes where the terminal records the outcome of all checks (ODA, restrictions, CVM, risk management, scripts).',
  "Confrontato con IAC/TAC nella Terminal Action Analysis, inviato alla carta in CDOL e all'issuer nell'autorizzazione.":
    'Compared with IAC/TAC in Terminal Action Analysis, sent to the card in CDOLs and to the issuer in the authorisation.',
  'Valuta della transazione, codice numerico ISO 4217.':
    'Transaction currency, ISO 4217 numeric code.',
  'Richiesto nei DOL e confrontato con 9F42 per le condizioni CVM sugli importi.':
    'Requested in DOLs and compared with 9F42 for amount-based CVM conditions.',
  'Data della transazione, YYMMDD.': 'Transaction date, YYMMDD.',
  'Usata nelle Processing Restrictions (scadenza e inizio validità) e inclusa nel crittogramma.':
    'Used in Processing Restrictions (expiry and effective date) and included in the cryptogram.',
  'Tipo di transazione (primi 2 digit del Processing Code ISO 8583: 00 acquisto, 01 prelievo, 09 acquisto con cashback, 20 rimborso).':
    'Transaction type (first 2 digits of the ISO 8583 Processing Code: 00 purchase, 01 cash, 09 purchase with cashback, 20 refund).',
  'Usato per i controlli AUC e richiesto spesso nei DOL.':
    'Used for AUC checks and often requested in DOLs.',
  'Ora della transazione, HHMMSS.': 'Transaction time, HHMMSS.',
  'Può essere richiesta in DOL e registrata nel log.':
    'May be requested in DOLs and stored in the log.',
  'Unpredictable Number: 4 byte casuali generati dal terminale.':
    'Unpredictable Number: 4 random bytes generated by the terminal.',
  "Garantisce l'unicità di crittogrammi e firme dinamiche: richiesto in PDOL, CDOL e DDOL.":
    'Guarantees the uniqueness of cryptograms and dynamic signatures: requested in PDOL, CDOL and DDOL.',
  'Terminal Type: ambiente operativo (presidiato o no, online/offline, finanziario o esercente).':
    'Terminal Type: operating environment (attended or not, online/offline, financial institution or merchant).',
  'Influenza condizioni CVM e decisioni della carta; richiesto in alcuni DOL.':
    'Affects CVM conditions and card decisions; requested in some DOLs.',
  'Terminal Capabilities: capacità del terminale (input, CVM supportati, ODA supportata).':
    'Terminal Capabilities: terminal capabilities (input, supported CVMs, supported ODA).',
  'Usato per scegliere il metodo ODA e le regole CVM applicabili.':
    'Used to choose the ODA method and the applicable CVM rules.',
  'Additional Terminal Capabilities: tipi di transazione supportati e capacità di input/output.':
    'Additional Terminal Capabilities: supported transaction types and input/output capabilities.',
  "Usato in alcune verifiche e inviato all'issuer.": 'Used in some checks and sent to the issuer.',
  'CVM Results: metodo CVM eseguito, condizione ed esito.':
    'CVM Results: CVM method performed, condition and result.',
  "Prodotto nella fase di Cardholder Verification e inviato alla carta (CDOL) e all'issuer.":
    'Produced in the Cardholder Verification step and sent to the card (CDOL) and to the issuer.',
  "Versione dell'applicazione nel terminale.": 'Application version in the terminal.',
  'Confrontata con 9F08 della carta nelle Processing Restrictions.':
    'Compared with the card 9F08 during Processing Restrictions.',
  'Numero di serie del dispositivo di interfaccia (IFD).': 'Interface Device (IFD) serial number.',
  "Può essere inviato all'issuer per identificare il terminale.":
    'May be sent to the issuer to identify the terminal.',
  "Nome e località dell'esercente.": 'Merchant name and location.',
  "Può essere richiesto in DOL o inviato nell'autorizzazione.":
    'May be requested in DOLs or sent in the authorisation.',
  'Merchant Category Code (MCC).': 'Merchant Category Code (MCC).',
  'Usato da issuer e carta per regole specifiche per categoria merceologica.':
    'Used by issuer and card for category-specific rules.',
  "Identificativo dell'esercente presso l'acquirer.": 'Merchant identifier at the acquirer.',
  'Inviato nel messaggio di autorizzazione.': 'Sent in the authorisation message.',
  "Identificativo del terminale presso l'acquirer.": 'Terminal identifier at the acquirer.',
  "Authorisation Response Code: esito dell'autorizzazione (es. '00' approvata) o codice generato dal terminale ('Y1', 'Z1', 'Y3', 'Z3').":
    "Authorisation Response Code: authorisation outcome (e.g. '00' approved) or a terminal-generated code ('Y1', 'Z1', 'Y3', 'Z3').",
  'Inviato alla carta nel secondo GENERATE AC tramite CDOL2.':
    'Sent to the card in the second GENERATE AC through CDOL2.',
  "Issuer Authentication Data: contiene l'ARPC calcolato dall'issuer ed eventuali dati proprietari.":
    'Issuer Authentication Data: contains the ARPC computed by the issuer and any proprietary data.',
  "Inviato alla carta con EXTERNAL AUTHENTICATE o nel secondo GENERATE AC (CDOL2) per l'issuer authentication.":
    'Sent to the card with EXTERNAL AUTHENTICATE or in the second GENERATE AC (CDOL2) for issuer authentication.',
  'TC Hash Value: hash SHA-1 dei dati indicati dal TDOL.':
    'TC Hash Value: SHA-1 hash of the data listed in the TDOL.',
  'Inviato alla carta se richiesto da CDOL1/CDOL2.':
    'Sent to the card if requested by CDOL1/CDOL2.',
  // ---- end contextual help ----
  // Labels and notes
  Label: 'Labels',
  'Rimuovi label': 'Remove label',
  'Cerca o crea una label…': 'Search or create a label…',
  'Nessuna label nel progetto: scrivi un nome per crearne una.':
    'No labels in the project: type a name to create one.',
  'Crea "{name}"': 'Create "{name}"',
  'Cambia colore': 'Change color',
  'Tag con questa label': 'Tags with this label',
  'Eliminare la label "{name}"? Verrà rimossa da {n} tag.':
    'Delete the label "{name}"? It will be removed from {n} tags.',
  'Le label classificano i tag (es. Dynamic, Static) e compaiono nella documentazione esportata.':
    'Labels classify tags (e.g. Dynamic, Static) and appear in the exported documentation.',
  'Nuova label…': 'New label…',
  'Esiste già una label con questo nome': 'A label with this name already exists',
  Aggiungi: 'Add',
  Scrivi: 'Write',
  'Markdown supportato': 'Markdown supported',
  Fatto: 'Done',
  'Nessuna nota.': 'No note.',
  'Note sul tag in Markdown: **grassetto**, _corsivo_, `codice`, elenchi, tabelle, link…':
    'Tag notes in Markdown: **bold**, _italic_, `code`, lists, tables, links…',
  'Modifica nota': 'Edit note',
  'Aggiungi nota': 'Add note',
  'Doppio clic per modificare la nota': 'Double-click to edit the note',
  Note: 'Notes',
  Nota: 'Note',
  'Note sui tag': 'Tag notes'
}

/** Strings that are the same in both languages (product names, codes, commands). */
const NEUTRAL = [
  'File',
  'Template',
  'Status Word',
  'Tag',
  'L',

  '2PAY.SYS.DDF01 (PPSE)',
  '1PAY.SYS.DDF01 (PSE)',
  'Visa Credit/Debit',
  'Visa Electron',
  'V PAY',
  'Visa Interlink',
  'Visa Plus',
  'Mastercard Credit/Debit',
  'Maestro',
  'Cirrus',
  'American Express',
  'JCB',
  'Discover',
  'Discover Zip',
  'UnionPay Debit',
  'UnionPay Credit',
  'PagoBANCOMAT',
  'CB (Cartes Bancaires)',
  'Interac',
  'ISO 8859-1',
  'ISO 8859-2',
  'ISO 8859-3',
  'ISO 8859-4',
  'ISO 8859-5',
  'ISO 8859-6',
  'ISO 8859-7',
  'ISO 8859-8',
  'ISO 8859-9',
  'ISO 8859-10',
  '02 – Mastercard',
  '03 – Visa',
  '04 – American Express',
  '05 – JCB',
  '06 – Discover',
  '07 – UnionPay',
  '08 – EMVCo C-8',
  '978 – EUR',
  '840 – USD',
  '826 – GBP',
  '756 – CHF',
  '392 – JPY',
  '985 – PLN',
  '3',
  '65537',
  'RFU',
  'Fail CVM processing',
  'SELECT PPSE',
  'SELECT 2PAY.SYS.DDF01',
  'SELECT 1PAY.SYS.DDF01',
  'READ RECORD PSE directory',
  'READ RECORD SFI 1, record 1',
  'SELECT AID',
  'Get Processing Options',
  'GET PROCESSING OPTIONS',
  'Read Record',
  'READ RECORD SFI 2, record 1',
  'READ RECORD SFI 3, record 1',
  'Generate AC',
  'GENERATE AC (ARQC)',
  'INTERNAL AUTHENTICATE',
  'GET CHALLENGE',
  'Get Data',
  'GET DATA – ATC',
  'Application Transaction Counter.',
  'GET DATA 9F36',
  'GET DATA – PIN Try Counter',
  'GET DATA 9F17',
  'GET DATA – Last Online ATC',
  'GET DATA 9F13',
  'GET DATA – Log Format',
  'GET DATA 9F4F',
  '—'
]
for (const k of NEUTRAL) EN[k] ??= k
