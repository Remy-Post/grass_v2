#!/usr/bin/env bash
#
# bootstrap-vm.sh — first-time setup for an Ubuntu 24.04 LTS VM.
# Tested on DigitalOcean Droplet (Basic Regular 4 GB, x86_64, TOR1) and
# Oracle OCI Always-Free Ampere A1 (ARM64). Either architecture works —
# the MongoDB apt source below declares both amd64 and arm64.
#
# What this script does (idempotent — safe to re-run):
#   1. Installs Node 22, pnpm 9, MongoDB 7, Nginx, certbot, s3cmd
#   2. Creates a `lawnguy` system user that runs the app processes
#   3. Creates /srv/lawnguy, /var/log/lawnguy, /var/backups/lawnguy
#   4. Opens firewall ports for HTTP/HTTPS (UFW) — keeps SSH open
#
# What this script does NOT do (intentionally):
#   - Clone the repo (you do this manually after the VM is up so the user can
#     decide where to fetch from — GitHub, private mirror, scp).
#   - Configure SSL — run install-ssl.sh after DNS is pointed at the VM.
#   - Start app services — run install-systemd.sh after the repo is in place.
#   - Write ~lawnguy/.s3cfg — the operator creates this on first deploy
#     so the nightly backup can upload to DO Spaces.
#
# Run as root. On DO Ubuntu droplets that's the default user (`ssh root@...`).
# On OCI it's `ssh ubuntu@... "sudo bash ..."`.

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "This script must be run as root. Try: sudo $0" >&2
  exit 1
fi

LAWNGUY_USER="${LAWNGUY_USER:-lawnguy}"
INSTALL_ROOT="${INSTALL_ROOT:-/srv/lawnguy}"
LOG_DIR="${LOG_DIR:-/var/log/lawnguy}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/lawnguy}"

echo "==> Updating apt indexes"
apt-get update -y

echo "==> Installing base packages"
apt-get install -y \
  ca-certificates curl gnupg lsb-release \
  ufw nginx certbot python3-certbot-nginx \
  build-essential git rsync logrotate \
  s3cmd

# ── Node 22 ──────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v 2>/dev/null | cut -d. -f1)" != "v22" ]]; then
  echo "==> Installing Node 22 via NodeSource"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

# ── pnpm via corepack ────────────────────────────────────────────
if ! command -v pnpm >/dev/null 2>&1; then
  echo "==> Enabling pnpm via corepack"
  corepack enable
  corepack prepare pnpm@9.12.0 --activate
fi
pnpm -v

# ── MongoDB 7 ────────────────────────────────────────────────────
if ! command -v mongod >/dev/null 2>&1; then
  echo "==> Adding MongoDB 7.0 apt repository"
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
    | gpg --dearmor -o /usr/share/keyrings/mongodb-7.0.gpg
  UBUNTU_CODENAME="$(lsb_release -cs)"
  # Mongo's apt repo lags Ubuntu — fall back to jammy if the current codename
  # has no MongoDB repo yet.
  if ! curl -fsSL --head \
    "https://repo.mongodb.org/apt/ubuntu/dists/${UBUNTU_CODENAME}/mongodb-org/7.0/Release" \
    >/dev/null 2>&1; then
    echo "    (no MongoDB repo for ${UBUNTU_CODENAME}, using jammy)"
    UBUNTU_CODENAME="jammy"
  fi
  echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-7.0.gpg] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -y
  apt-get install -y mongodb-org
  systemctl enable --now mongod
fi
mongod --version | head -1

# ── App user + directories ──────────────────────────────────────
if ! id "${LAWNGUY_USER}" >/dev/null 2>&1; then
  echo "==> Creating system user ${LAWNGUY_USER}"
  useradd --system --create-home --home-dir "/home/${LAWNGUY_USER}" \
    --shell /usr/sbin/nologin "${LAWNGUY_USER}"
fi

mkdir -p "${INSTALL_ROOT}" "${LOG_DIR}" "${BACKUP_DIR}"
chown -R "${LAWNGUY_USER}:${LAWNGUY_USER}" "${INSTALL_ROOT}" "${LOG_DIR}" "${BACKUP_DIR}"

# ── Firewall ─────────────────────────────────────────────────────
echo "==> Configuring UFW (keeping SSH open)"
ufw --force reset >/dev/null 2>&1 || true
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── Nginx default site off ──────────────────────────────────────
if [[ -f /etc/nginx/sites-enabled/default ]]; then
  echo "==> Disabling Nginx default site"
  rm -f /etc/nginx/sites-enabled/default
  systemctl reload nginx
fi

cat <<EOF

──────────────────────────────────────────────────────────────────
  Bootstrap complete.

  Next steps (in order):
    1. Get the repo onto this VM:
         sudo -u ${LAWNGUY_USER} git clone <your-remote> ${INSTALL_ROOT}
         # or: rsync from your laptop into ${INSTALL_ROOT}

    2. Create env files (chmod 600, owned by ${LAWNGUY_USER}):
         ${INSTALL_ROOT}/apps/api/.env
         ${INSTALL_ROOT}/apps/web/.env.local

    3. First install + build:
         cd ${INSTALL_ROOT}
         sudo -u ${LAWNGUY_USER} pnpm install --frozen-lockfile
         sudo -u ${LAWNGUY_USER} pnpm build
         sudo -u ${LAWNGUY_USER} pnpm seed

    4. Install systemd services:
         sudo ${INSTALL_ROOT}/ops/scripts/install-systemd.sh

    5. Configure DNS to point lawnguybradford.ca → this VM's public IP.
       Wait for propagation (a few minutes).

    6. Issue SSL cert and enable Nginx site:
         sudo ${INSTALL_ROOT}/ops/scripts/install-ssl.sh

──────────────────────────────────────────────────────────────────
EOF
