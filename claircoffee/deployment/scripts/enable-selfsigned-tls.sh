#!/usr/bin/env bash
set -euo pipefail

LAN_IP=${LAN_IP:-}
CERT_HOSTNAME=${CERT_HOSTNAME:-claircoffee.local}

if [[ ${EUID} -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

log() {
  echo "[claircoffee] $*"
}

if [[ -z "${LAN_IP}" ]]; then
  if [[ -t 0 ]]; then
    read -r -p "Enter LAN IP address: " LAN_IP
  else
    echo "LAN_IP is required (e.g., LAN_IP=192.168.1.10)." >&2
    exit 1
  fi
fi

log "Generating self-signed certificate for ${CERT_HOSTNAME} (${LAN_IP})..."
${SUDO} mkdir -p /etc/ssl/private /etc/ssl/certs

OPENSSL_CONFIG=$(mktemp)
cat <<OPENSSL_EOF > "${OPENSSL_CONFIG}"
[req]
prompt = no
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = ${CERT_HOSTNAME}

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = claircoffee.local
DNS.2 = ${CERT_HOSTNAME}
IP.1 = ${LAN_IP}
OPENSSL_EOF

${SUDO} openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout /etc/ssl/private/claircoffee.key \
  -out /etc/ssl/certs/claircoffee.crt \
  -config "${OPENSSL_CONFIG}"

rm -f "${OPENSSL_CONFIG}"
${SUDO} chmod 600 /etc/ssl/private/claircoffee.key

log "Writing nginx TLS configuration..."
${SUDO} mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

${SUDO} tee /etc/nginx/sites-available/claircoffee-ssl.conf >/dev/null <<NGINX_EOF
server {
  listen 80;
  server_name ${CERT_HOSTNAME} ${LAN_IP};
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name ${CERT_HOSTNAME} ${LAN_IP};

  ssl_certificate /etc/ssl/certs/claircoffee.crt;
  ssl_certificate_key /etc/ssl/private/claircoffee.key;

  location /pos/ {
    proxy_pass http://127.0.0.1:5173;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /kitchen/ {
    proxy_pass http://127.0.0.1:5174;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /display/ {
    proxy_pass http://127.0.0.1:5175;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /customer/ {
    proxy_pass http://127.0.0.1:5176;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /admin/ {
    proxy_pass http://127.0.0.1:5177;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /socket.io/ {
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
NGINX_EOF

if [[ ! -e /etc/nginx/sites-enabled/claircoffee-ssl.conf ]]; then
  ${SUDO} ln -s /etc/nginx/sites-available/claircoffee-ssl.conf /etc/nginx/sites-enabled/claircoffee-ssl.conf
fi

log "Validating nginx configuration..."
${SUDO} nginx -t

log "Reloading nginx..."
${SUDO} systemctl reload nginx

cat <<'INSTRUCTIONS'

Self-signed TLS enabled.

Trusting the certificate:
- Android: Copy claircoffee.crt to the device and install it via Settings > Security > Install from storage.
- iOS: AirDrop/email the certificate, install the profile, then enable full trust under Settings > General > About > Certificate Trust Settings.
- Windows/macOS: Import claircoffee.crt into the Trusted Root Certification Authorities (Windows) or Keychain Access > System (macOS).

Note: Browsers will show a warning unless the cert is trusted on each device.
INSTRUCTIONS
