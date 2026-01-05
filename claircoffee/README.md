# Clair Coffee Ordering (Backend)

Backend service for an on-prem coffee shop ordering + inventory system.

## Requirements
- Node.js 20+
- pnpm
- Docker (for MySQL)

## Quick start (dev)
```bash
pnpm install
pnpm dev
```

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
