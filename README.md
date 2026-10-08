# emv-apdu-builder

Tool desktop (Electron + React + TypeScript) per comporre APDU response EMV in modo guidato.

- Scegli un template (SELECT PPSE/PSE/AID, GPO formato 1/2, qVSDC, READ RECORD, GENERATE AC, INTERNAL AUTHENTICATE, GET DATA, GET CHALLENGE…) oppure importa una response esistente da hex.
- Compila i tag con editor specifici per formato: testo, numerico, date, bitfield (AIP, AUC, CTQ, IAC, CID), DOL, AFL, CVM List, Track 2.
- Lunghezze e template annidati vengono calcolati automaticamente; il pannello a destra mostra i byte RAW colorati, la Status Word, la verifica e la struttura TLV.

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
