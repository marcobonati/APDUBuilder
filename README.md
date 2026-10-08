# emv-apdu-builder

Tool desktop (Electron + React + TypeScript) per comporre APDU response EMV in modo guidato.

- Scegli un template (SELECT PPSE/PSE/AID, GPO formato 1/2, qVSDC, READ RECORD, GENERATE AC, INTERNAL AUTHENTICATE, GET DATA, GET CHALLENGE…) oppure importa una response esistente da hex.
- Compila i tag con editor specifici per formato: testo, numerico, date, bitfield (AIP, AUC, CTQ, IAC, CID), DOL, AFL, CVM List, Track 2.
- Lunghezze e template annidati vengono calcolati automaticamente; il pannello a destra mostra i byte RAW colorati, la Status Word, la verifica e la struttura TLV.

- **Menu File** (nativo e nell'app): nuovo, apri, **apri recenti** (ultimi 10 file, anche ⌥⌘1…9), salva, salva come, importa da hex, esporta documentazione.
- Organizza più response in un **progetto** (es. tutte le risposte di un profilo carta) e salvalo/aprilo come file `.emvproj` (JSON leggibile) con ⌘S / ⇧⌘S / ⌘O / ⌘N. La sessione corrente viene comunque conservata automaticamente tra un avvio e l'altro.

- **Guida in linea** contestuale (F1 o pulsante «Guida»): pannello a destra che documenta il tag sotto il puntatore — utilizzo, ruolo nel flusso di pagamento EMV, valore corrente decodificato, formato, contesto e riferimenti alle specifiche. Si può bloccare su un tag con il lucchetto.
- **Documentazione esportabile** in Markdown o PDF (⌘E): per ogni response comando di riferimento, byte RAW, tabella dei campi con valori decodificati e descrizioni, struttura TLV e avvisi di verifica, con anteprima prima dell'esportazione.
- Interfaccia in **italiano o inglese** (selettore IT/EN in alto a sinistra; di default segue la lingua di sistema). I testi sono in `src/renderer/src/i18n/`: le chiavi sono le stringhe italiane, le traduzioni inglesi stanno in `en.ts`.

Il core EMV (TLV, dizionario tag, template, validazione) si trova in `src/renderer/src/emv/`.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
