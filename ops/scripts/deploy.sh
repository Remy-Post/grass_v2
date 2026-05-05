#!/usr/bin/env bash
#
# deploy.sh — pull latest code, build, restart.
# Run as the lawnguy user (or via sudo -u lawnguy).
#
# Optional flags:
#   --seed    Re-run pnpm seed after build (only when content/spec changed)

set -euo pipefail

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
git pull --ff-only

echo "==> pnpm install"
pnpm install --frozen-lockfile

echo "==> Stopping web service before build"
sudo systemctl stop lawnguy-web.service || true

restart_web_on_exit() {
  sudo systemctl restart lawnguy-web.service || true
}
trap restart_web_on_exit EXIT

echo "==> pnpm build"
pnpm exec turbo run build --force

if [[ "${SEED}" -eq 1 ]]; then
  echo "==> pnpm seed"
  pnpm seed
fi

echo "==> Restarting services"
sudo systemctl restart lawnguy-api.service
sudo systemctl restart lawnguy-web.service
trap - EXIT

echo "==> Done."
