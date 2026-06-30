# @muoi/web

Standalone web app for Muối Coffee & Tea (no Zalo Mini App runtime).

## Development

```bash
# Terminal 1 — monorepo API (port 3001, needs DATABASE_URL + AHAMOVE_V3_TOKEN)
npm run dev:api

# Terminal 2 — Web (proxies /api → VITE_API_TARGET, default localhost:3000)
VITE_API_TARGET=http://localhost:3001 npm run dev:web
```

Open http://localhost:5173

- Default proxy target: `http://localhost:3000` (existing production-like backend)
- Phase 2 endpoints (`POST /api/orders`, `/api/shipping/estimate`, `/api/variants`): use `VITE_API_TARGET=http://localhost:3001`

Optional: set `VITE_API_URL=https://your-api-domain.com` to call API directly (no Vite proxy).

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- Recoil + React Router
- `@muoi/core` shared business logic
- `webPlatformAdapter` (browser geolocation, COD checkout)

## Phase 2 scope

- Product picker with variants, cart, checkout form
- AhaMove shipping estimate via `POST /api/shipping/estimate`
- Guest COD checkout via `POST /api/orders`
- Order success page with lookup code
