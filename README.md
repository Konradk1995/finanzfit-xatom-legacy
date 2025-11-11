# FinanzfitxAtom

## Repository
- GitHub: [Konradk1995/FinanzfitxAtom-New1](https://github.com/Konradk1995/FinanzfitxAtom-New1.git)

## Entwicklung starten
- Voraussetzungen: Node.js LTS, npm oder pnpm
- Dev-Server (Port 3000):
  - npm: `PORT=3000 npm run start`
  - pnpm: `PORT=3000 pnpm start`

## Build
- npm: `npm run build`
- pnpm: `pnpm build`

## Git: Erste Veröffentlichung
Das Remote ist bereits gesetzt (`origin`). Für den ersten Push:

1) Personal Access Token (PAT) mit Scope „repo“ erstellen.
2) Eine der folgenden Optionen nutzen:
   - Einmalig Token in der Push-URL verwenden:
     ```
     git push https://<GITHUB_USERNAME>:<PAT>@github.com/Konradk1995/FinanzfitxAtom-New1.git main
     ```
   - Oder normal pushen und den Token beim Prompt eingeben:
     ```
     git push -u origin main
     ```

## Hinweise
- `node_modules/`, `.env` sind in `.gitignore` ausgeschlossen. `dist/` wird bewusst getrackt, damit CDNs direkt darauf zugreifen können.
- Server bitte immer auf Port 3000 starten.

## CDN-Nutzung
- jsDelivr (empfohlen):
  ```
  https://cdn.jsdelivr.net/gh/Konradk1995/FinanzfitxAtom-New1@main/dist/app.js
  ```
- Statically:
  ```
  https://cdn.statically.io/gh/Konradk1995/FinanzfitxAtom-New1/main/dist/app.js
  ```
