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

## Quick Install (Ubuntu)
Run the on-prem installer locally (Ubuntu 22.04+ or Debian-based):
```bash
curl -fsSL file://$(pwd)/deployment/scripts/install-ubuntu-onprem.sh | bash
```

Flags:
- `INSTALL_UFW=1` to enable/configure UFW (allows 80/443 and optional 3001).
- `EXPOSE_API_PORT=1` to open port 3001/tcp when UFW is enabled.
- `MYSQL_SECURE=1` to run `mysql_secure_installation` (best-effort, may prompt).

Example:
```bash
INSTALL_UFW=1 EXPOSE_API_PORT=1 MYSQL_SECURE=1 bash deployment/scripts/install-ubuntu-onprem.sh
```

Node.js is installed via the NodeSource LTS repo (`https://deb.nodesource.com/setup_lts.x`).

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
VITE_API_BASE_URL=https://<LAN_IP>/api
VITE_WS_URL=https://<LAN_IP>
```

If you're not using nginx/TLS, set:
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

## Optional HTTPS (Self-signed)
Generate and enable a self-signed certificate for LAN HTTPS:
```bash
LAN_IP=192.168.1.10 CERT_HOSTNAME=claircoffee.local bash deployment/scripts/enable-selfsigned-tls.sh
```

This script:
- Creates `/etc/ssl/private/claircoffee.key` and `/etc/ssl/certs/claircoffee.crt` with SAN entries.
- Writes the nginx TLS server block (see `deployment/nginx/claircoffee-ssl.conf`).
- Runs `nginx -t` and reloads nginx.

Troubleshooting tips:
- Validate config: `sudo nginx -t`
- Ensure the TLS config is enabled: `/etc/nginx/sites-enabled/claircoffee-ssl.conf`
- Confirm ports 80/443 are open (UFW or firewall rules).
- WebSocket headers (`Upgrade`/`Connection`) are required for `/socket.io/`.

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
