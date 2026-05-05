#!/usr/bin/env bash
#
# install-systemd.sh — copy systemd units into place and enable them.
# Re-run safely after edits.

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "This script must be run as root. Try: sudo $0" >&2
  exit 1
fi

INSTALL_ROOT="${INSTALL_ROOT:-/srv/lawnguy}"
SYSTEMD_DIR="/etc/systemd/system"

cp -v "${INSTALL_ROOT}/ops/systemd/lawnguy-web.service" "${SYSTEMD_DIR}/"
cp -v "${INSTALL_ROOT}/ops/systemd/lawnguy-api.service" "${SYSTEMD_DIR}/"
cp -v "${INSTALL_ROOT}/ops/systemd/lawnguy-backup.service" "${SYSTEMD_DIR}/"
cp -v "${INSTALL_ROOT}/ops/systemd/lawnguy-backup.timer" "${SYSTEMD_DIR}/"

systemctl daemon-reload
systemctl enable --now lawnguy-api.service
systemctl enable --now lawnguy-web.service
systemctl enable --now lawnguy-backup.timer

systemctl --no-pager status lawnguy-api.service || true
systemctl --no-pager status lawnguy-web.service || true
systemctl --no-pager status lawnguy-backup.timer || true

echo
echo "Logs:"
echo "  journalctl -u lawnguy-api -f"
echo "  journalctl -u lawnguy-web -f"
