// Explanations of value formats and BER tag classes shown in the help panel
// (Italian source strings, translated with t()).

export const FORMAT_HELP: Record<string, string> = {
  b: 'Binario: sequenza di byte libera, mostrata in esadecimale.',
  n: 'Numerico BCD: due cifre per byte, allineato a destra con zeri iniziali.',
  cn: 'Numerico compresso: cifre BCD allineate a sinistra, completate con F a destra.',
  an: 'Alfanumerico: lettere e cifre codificate in ASCII / ISO 8859.',
  ans: 'Alfanumerico con caratteri speciali: testo stampabile in ASCII / ISO 8859.',
  date: 'Data numerica YYMMDD in BCD (3 byte).',
  dol: 'Data Object List: sequenza di coppie tag + lunghezza (1 byte), senza valori.',
  afl: 'Application File Locator: gruppi di 4 byte (SFI, primo record, ultimo record, record ODA).',
  cvm: 'CVM List: importo X (4 byte), importo Y (4 byte) e regole CVM di 2 byte.',
  track2:
    'Track 2 in BCD: PAN, separatore D, scadenza YYMM, service code, dati discrezionali, padding F.',
  langs: 'Sequenza di codici lingua ISO 639-1 in ASCII, 2 caratteri ciascuno.',
  bic: 'Business Identifier Code ISO 9362 in ASCII (8 o 11 caratteri).'
}

/** BER tag class from bits b8-b7 of the first tag byte. */
export const TAG_CLASSES = ['Universale', 'Applicazione', 'Specifica di contesto', 'Privata']
