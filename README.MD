# Clair Coffee Ordering

This repository contains the Clair Coffee Ordering monorepo in `claircoffee/`, including the backend API service and multiple frontends.

## Backend API Documentation

**Base URL**
- Local dev: `http://localhost:3001`
- Health check: `GET /health` → `{ "ok": true }`

**Auth**
- `POST /v1/auth/login` → `{ token }`
- Send authenticated requests with `Authorization: Bearer <token>`

**Errors**
- JSON format: `{ "error": { "code": "...", "message": "...", "details": {} } }`

**Core endpoints**
- **Menu**
  - `GET /v1/menu?branchId=<id>` (products, options, bundles, bundle items)
- **Orders**
  - `POST /v1/orders`
  - `POST /v1/orders/sync`
  - `POST /v1/orders/:id/pay`
  - `POST /v1/orders/:id/status`
  - `POST /v1/orders/:id/complete`
  - `POST /v1/orders/:id/void`
  - `POST /v1/orders/:id/refund`
- **Shifts**
  - `POST /v1/shifts/open`
  - `POST /v1/shifts/:id/close`
- **Customers**
  - `POST /v1/customers/identify`
- **Public**
  - `GET /v1/public/orders/track?token=<token>`
- **Inventory**
  - Products: `GET/POST /v1/inventory/products`, `PUT/DELETE /v1/inventory/products/:id`
  - Options: `GET/POST /v1/inventory/options`, `PUT/DELETE /v1/inventory/options/:id`
  - Bundles: `GET/POST /v1/inventory/bundles`, `PUT/DELETE /v1/inventory/bundles/:id`
  - Stock items: `GET/POST /v1/inventory/stock-items`
  - Unit conversions: `GET/POST /v1/inventory/unit-conversions`
  - Recipes: `POST /v1/inventory/recipes`
  - Purchase orders: `POST /v1/inventory/purchase-orders`
  - Purchase order items: `POST /v1/inventory/purchase-orders/:id/items`
  - Purchase order receive: `POST /v1/inventory/purchase-orders/:id/receive`
  - Wastage: `POST /v1/inventory/wastage`
  - Adjustments: `POST /v1/inventory/adjust`
  - Counts: `POST /v1/inventory/counts`
  - Count submit/post: `POST /v1/inventory/counts/:id/submit`, `POST /v1/inventory/counts/:id/post`
- **Reports**
  - `GET /v1/reports/sales/daily?branchId=<id>&format=csv`
  - `GET /v1/reports/best-sellers?branchId=<id>&format=csv`
  - `GET /v1/reports/time-of-day?branchId=<id>&format=csv`
  - `GET /v1/reports/inventory-usage?branchId=<id>&format=csv`
  - `GET /v1/reports/cogs-margin?branchId=<id>&format=csv`

For detailed request/response shapes, see the route definitions in `claircoffee/services/api/src/routes/`.

## Run Locally

1) Install dependencies:
```bash
cd claircoffee
pnpm install
```

2) Start MySQL (Docker):
```bash
docker compose up -d db
```

3) Migrate/seed the database:
```bash
pnpm db:migrate
pnpm db:seed
```

4) Start the API and frontends:
```bash
pnpm dev
```

The API runs at `http://localhost:3001` by default.

## Configuration Setup

**Backend API**
- Copy `claircoffee/services/api/.env.example` to `claircoffee/services/api/.env`.
- Key settings include:
  - `DATABASE_URL` (MySQL connection string)
  - `JWT_SECRET`
  - `ADMIN_PIN` (used for void/refund authorization)
  - `CORS_ALLOWED_ORIGINS` (comma-separated list)
  - `DEFAULT_STOCK_THRESHOLD` (stock visibility for menu options)

**Frontends**
- Copy each `.env.example` under `claircoffee/apps/*` to `.env`.
- Set LAN/API base URLs for Vite apps, e.g.:
  - `VITE_API_BASE_URL=http://<LAN_IP>:3001`
  - `VITE_WS_URL=http://<LAN_IP>:3001`
