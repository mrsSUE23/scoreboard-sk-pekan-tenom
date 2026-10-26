# Live Scoreboard SK Pekan Tenom 2026 — Render deployment bundle

This bundle is prepared for a Render Node.js Web Service with a persistent disk.
It keeps the existing React/Vite + Express app and seeds the persistent database
from `seed-data/scoreboard_db.json` on the first launch.

## Render settings
- Service type: Web Service
- Runtime: Node
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/public/scoreboard`
- Persistent disk mount: `/var/data` (1 GB)
- Environment variable: `DATA_DIR=/var/data`
- `render.yaml` contains the same settings (Blueprint deployment).

## Important before making the app public
- This app includes a default administrator password (`admin2026`) in its current source/database defaults. Change it immediately after deployment and before sharing the public link.
- Do not add API keys or passwords to GitHub. Configure secrets in the hosting provider's environment settings if needed.
- Keep a backup of `data/scoreboard_db.json` before deployment.
- A persistent disk requires a paid Render web service. Review current Render pricing before confirming deployment.
