# CamPad

En snabb, modern textredigerare för Windows — byggd med Electron + CodeMirror 6.

## Snabbstart (utveckling)

```bash
# 1. Installera dependencies
npm install

# 2. Starta i dev-läge
npm start
```

## Bygg till .exe

```bash
# Skapa installer (NSIS) + portable .exe
npm run dist:win

# Bara portable .exe (snabbast)
npm run dist:portable

# Outputen hamnar i ./release/
```

## Projektstruktur

```
campad-electron/
├── package.json          # Dependencies + electron-builder config
├── src/
│   ├── main.js           # Electron main process (fönster, menyer, fil-I/O)
│   ├── preload.js        # Secure bridge (contextBridge API)
│   └── index.html        # CamPad editor (CodeMirror 6 + all UI)
└── release/              # Genererade .exe-filer (efter build)
```

## Funktioner

- **Flikar** med Ctrl+1-9 switch, modified-indikator
- **Syntax highlighting** för 11+ språk (Tokyo Night-tema)
- **Command Palette** (Ctrl+Shift+P)
- **Find/Replace** med regex, case-sensitive, whole-word
- **Minimap** toggle
- **Native fil-I/O** — riktiga Spara/Öppna-dialoger i Windows
- **Multi-cursor editing**, bracket matching, code folding
- **Text transforms** — uppercase, sort lines, trim whitespace etc.
- **Plugin API** via `window.CamPad`

## Lägga till en app-ikon

1. Skapa en `icon.ico` (256x256 rekommenderat)
2. Lägg den i `src/icon.ico`
3. Bygg om med `npm run dist:win`

## Krav

- Node.js 18+
- npm eller yarn
- Windows 10/11 (för att bygga .exe)
