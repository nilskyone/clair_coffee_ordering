# Clair Coffee Ordering (Backend + Frontends)

Backend service and frontend apps for an on-prem coffee shop ordering + inventory system.

## Requirements
- Node.js 20+
- pnpm
- Docker (for MySQL)

## Quick start (dev)
```bash
pnpm install
pnpm dev
```

## Frontend apps (LAN dev)
The frontend apps run via Vite and are bound to `0.0.0.0` so they can be opened from tablets and displays on the same LAN.

1) Copy env files and update LAN IP:
```bash
cp apps/pos/.env.example apps/pos/.env
cp apps/kitchen/.env.example apps/kitchen/.env
cp apps/display/.env.example apps/display/.env
cp apps/customer/.env.example apps/customer/.env
cp apps/admin/.env.example apps/admin/.env
```

Edit each `.env`:
```
VITE_API_BASE_URL=http://<LAN_IP>:3001
VITE_WS_URL=http://<LAN_IP>:3001
```

2) Run all apps:
```bash
pnpm dev
```

3) Open from LAN devices:
- POS: `http://<LAN_IP>:5173`
- Kitchen: `http://<LAN_IP>:5174/kitchen`
- Display: `http://<LAN_IP>:5175/display`
- Customer tracking: `http://<LAN_IP>:5176/track/<token>`
- Admin: `http://<LAN_IP>:5177/admin/login`

> Tip: For POS kiosk mode set `MODE=KIOSK` in `apps/pos/.env`, or append `?mode=kiosk` to the URL for dev.

### MySQL via Docker
```bash
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## LAN / Linux on-prem setup
- The API binds to `HOST=0.0.0.0` and `PORT=3001` by default.
- To find your LAN IP:
```bash
ip a
```
- Suggest static IP for the server (set via your router or OS).
- Allow firewall port:
```bash
sudo ufw allow 3001/tcp
```

### Nginx reverse proxy (with WebSocket headers)
```
server {
  listen 80;
  server_name your-hostname-or-ip;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Environment
Copy `services/api/.env.example` to `.env` and update values.

## Migrations & Seed
```bash
pnpm db:migrate
pnpm db:seed
```

## Notes
- Authentication is JWT-based. Login returns a token that must be provided in `Authorization: Bearer <token>`.
- Errors follow: `{ "error": { "code": "...", "message": "...", "details": {} } }`.
