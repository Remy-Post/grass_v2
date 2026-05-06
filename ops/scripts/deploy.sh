#!/usr/bin/env bash
#
# deploy.sh — pull latest code, build, restart.
# Run as root: sudo /srv/lawnguy/ops/scripts/deploy.sh
# Internally drops to the lawnguy user for git/pnpm operations and
# uses systemctl directly for service restarts.
#
# Optional flags:
#   --seed    Re-run pnpm seed after build (only when content/spec changed)

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "This script must be run as root. Try: sudo $0" >&2
  exit 1
fi

INSTALL_ROOT="${INSTALL_ROOT:-/srv/lawnguy}"
SEED=0

for arg in "$@"; do
  case "${arg}" in
    --seed) SEED=1 ;;
    *) echo "Unknown flag: ${arg}" >&2; exit 1 ;;
  esac
done

cd "${INSTALL_ROOT}"

echo "==> git pull"
sudo -u lawnguy git pull --ff-only

echo "==> pnpm install"
sudo -u lawnguy pnpm install --frozen-lockfile

echo "==> Stopping web service before build"
systemctl stop lawnguy-web.service || true

restart_web_on_exit() {
  systemctl restart lawnguy-web.service || true
}
trap restart_web_on_exit EXIT

echo "==> pnpm build"
sudo -u lawnguy pnpm exec turbo run build --force

if [[ "${SEED}" -eq 1 ]]; then
  echo "==> pnpm seed"
  sudo -u lawnguy pnpm seed
fi

echo "==> Restarting services"
systemctl restart lawnguy-api.service
systemctl restart lawnguy-web.service
trap - EXIT

echo "==> Done."
