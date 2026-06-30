# @muoi/api

REST API for Muối Coffee web app.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | Product categories |
| GET | `/api/products` | Available products |
| GET | `/api/banners` | Active banners |
| GET | `/api/branches` | Store branches with coordinates |
| GET | `/api/variants` | Option groups for product picker |
| POST | `/api/shipping/estimate` | AhaMove fee estimate (server proxy) |
| POST | `/api/orders` | Create order (guest/COD, server price validation) |
| GET | `/api/orders?id=` | Order status by ID |

See [docs/api/orders-contract.md](../docs/api/orders-contract.md) for request/response shapes.

## Local development

```bash
# From repo root
npm run dev:api

# Requires env in api/.env or shell:
# DATABASE_URL=postgres://...
# DB_SSL=false
# AHAMOVE_V3_TOKEN=...
# AHAMOVE_API_URL=https://partner-apistg.ahamove.com/v3  (optional)
```

API listens on `http://localhost:3001`. Web app with Phase 2 endpoints:

```bash
VITE_API_TARGET=http://localhost:3001 npm run dev:web
```

Apply [`DB_MIGRATION_PHASE2.sql`](../DB_MIGRATION_PHASE2.sql) before testing order creation.

## Deploy

Deploy this folder to Vercel (same project as legacy `zalo-api-proxy` or separate).

Set `DATABASE_URL`, `AHAMOVE_V3_TOKEN` in Vercel environment variables.
