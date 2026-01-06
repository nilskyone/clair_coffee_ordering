#!/usr/bin/env bash
set -euo pipefail

INSTALL_UFW=${INSTALL_UFW:-0}
EXPOSE_API_PORT=${EXPOSE_API_PORT:-0}
MYSQL_SECURE=${MYSQL_SECURE:-0}

if [[ ${EUID} -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

log() {
  echo "[claircoffee] $*"
}

log "Updating apt cache..."
${SUDO} apt-get update

log "Installing core dependencies..."
${SUDO} apt-get install -y curl git build-essential ca-certificates gnupg lsb-release

if ! command -v node >/dev/null 2>&1; then
  log "Installing Node.js LTS via NodeSource (https://deb.nodesource.com/setup_lts.x)..."
  curl -fsSL https://deb.nodesource.com/setup_lts.x | ${SUDO} -E bash -
  ${SUDO} apt-get install -y nodejs
else
  log "Node.js already installed: $(node --version)"
fi

if command -v corepack >/dev/null 2>&1; then
  log "Enabling corepack and activating pnpm..."
  ${SUDO} corepack enable
  corepack prepare pnpm@latest --activate
else
  log "Corepack not found. Ensure Node.js 16+ is installed and rerun."
fi

log "Installing nginx and mysql-server..."
${SUDO} apt-get install -y nginx mysql-server

log "Enabling and starting nginx and mysql..."
${SUDO} systemctl enable --now nginx
${SUDO} systemctl enable --now mysql

if [[ "${INSTALL_UFW}" == "1" ]]; then
  log "Configuring UFW firewall rules..."
  if ! command -v ufw >/dev/null 2>&1; then
    ${SUDO} apt-get install -y ufw
  fi

  ufw_status=$(${SUDO} ufw status | head -n 1 || true)
  if ! echo "${ufw_status}" | grep -qi "active"; then
    log "Enabling UFW..."
    ${SUDO} ufw --force enable
  fi

  ${SUDO} ufw allow 80/tcp
  ${SUDO} ufw allow 443/tcp
  if [[ "${EXPOSE_API_PORT}" == "1" ]]; then
    ${SUDO} ufw allow 3001/tcp
  fi
else
  log "Skipping UFW configuration (set INSTALL_UFW=1 to enable)."
fi

if [[ "${MYSQL_SECURE}" == "1" ]]; then
  log "MYSQL_SECURE=1 requested."
  if [[ -t 0 ]]; then
    log "Running mysql_secure_installation..."
    ${SUDO} mysql_secure_installation || log "mysql_secure_installation failed; please run it manually."
  else
    log "Non-interactive shell detected. Please run mysql_secure_installation manually."
  fi
fi

cat <<'NEXT_STEPS'

Next steps:
1) Run the on-prem setup script:
   ./deployment/scripts/setup-onprem.sh
2) Run database migrations and seed data:
   pnpm db:migrate
   pnpm db:seed
3) Install nginx + systemd scripts (see deployment/nginx and deployment/scripts).

NEXT_STEPS
