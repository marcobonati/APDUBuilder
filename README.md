# emv-apdu-builder

Tool desktop (Electron + React + TypeScript) per comporre APDU response EMV in modo guidato.

- Scegli un template (SELECT PPSE/PSE/AID, GPO formato 1/2, qVSDC, READ RECORD, GENERATE AC, INTERNAL AUTHENTICATE, GET DATA, GET CHALLENGE…) oppure importa una response esistente da hex.
- Compila i tag con editor specifici per formato: testo, numerico, date, bitfield (AIP, AUC, CTQ, IAC, CID), DOL, AFL, CVM List, Track 2.
- Lunghezze e template annidati vengono calcolati automaticamente; il pannello a destra mostra i byte RAW colorati, la Status Word, la verifica e la struttura TLV.

- **C-APDU per ogni response**: il comando che produce la response viene generato seguendo il flusso del progetto (PPSE/directory → SELECT AID, PDOL → GPO, AFL → READ RECORD in ordine, CDOL1/CDOL2 → GENERATE AC, DDOL → INTERNAL AUTHENTICATE, tag → GET DATA). I dati del terminale usati nei DOL sono modificabili e valgono per tutto il progetto; il comando si può anche sostituire a mano. È incluso nella documentazione esportata.
- **Menu File** (nativo e nell'app): nuovo, apri, **apri recenti** (ultimi 10 file, anche ⌥⌘1…9), salva, salva come, importa da hex, esporta documentazione.
- Organizza più response in un **progetto** (es. tutte le risposte di un profilo carta) e salvalo/aprilo come file `.emvproj` (JSON leggibile) con ⌘S / ⇧⌘S / ⌘O / ⌘N. La sessione corrente viene comunque conservata automaticamente tra un avvio e l'altro.

- **Guida in linea** contestuale (F1 o pulsante «Guida»): pannello a destra che documenta il tag sotto il puntatore — utilizzo, ruolo nel flusso di pagamento EMV, valore corrente decodificato, formato, contesto e riferimenti alle specifiche. Si può bloccare su un tag con il lucchetto.
- **Documentazione esportabile** in Markdown o PDF (⌘E): per ogni response comando di riferimento, byte RAW, tabella dei campi con valori decodificati e descrizioni, struttura TLV, avvisi di verifica, label e note dei tag, con anteprima prima dell'esportazione.
- **Note e label sui tag**: ogni tag può avere una nota in Markdown (con anteprima) e una o più label personalizzate del progetto (es. Dynamic, Static), gestite dalla sidebar con nome e colore.
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
# Una sola piattaforma
$ npm run build:mac     # DMG + ZIP, arm64 e x64
$ npm run build:win     # installer NSIS (x64, arm64) + eseguibile portable (x64)
$ npm run build:linux   # AppImage + deb, x64 e arm64

# Tutte le piattaforme
$ npm run build:all
```

### Distribuzione

```bash
$ npm run dist
```

Esegue lint, pulizia di `out/` e `dist/`, typecheck, build di tutte le piattaforme e genera
`dist/SHA256SUMS.txt` con l'elenco degli artefatti e le loro dimensioni. Gli installer sono in `dist/`:

| Piattaforma | File                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| macOS       | `emv-apdu-builder-<versione>-mac-<arch>.dmg` / `.zip`                                                       |
| Windows     | `emv-apdu-builder-<versione>-win-<arch>-setup.exe`, `…-win-x64-portable.exe`                                |
| Linux       | `emv-apdu-builder-<versione>-linux-<arch>.AppImage` / `.deb` (x64 è `x86_64` per AppImage, `amd64` per deb) |

Note:

- Tutte le piattaforme si compilano da macOS. Da Windows o Linux non si possono creare i pacchetti macOS: in quel caso usa `build:win` / `build:linux`.
- Le app non sono firmate. Su macOS al primo avvio serve tasto destro → Apri (o `xattr -dr com.apple.quarantine "EMV APDU Builder.app"`); su Windows SmartScreen chiede conferma. Per firmare, imposta `CSC_LINK` / `CSC_KEY_PASSWORD` (e per macOS la notarizzazione in `electron-builder.yml`).
- `npm run clean` rimuove `out/` e `dist/`; `npm run checksums` rigenera solo i checksum.
