#!/usr/bin/env bash
#
# install-ssl.sh — install the Nginx site and request a Let's Encrypt cert.
# Run after DNS is pointed at the VM and after install-systemd.sh.

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "This script must be run as root. Try: sudo $0" >&2
  exit 1
fi

INSTALL_ROOT="${INSTALL_ROOT:-/srv/lawnguy}"
DOMAIN="${DOMAIN:-lawnguybradford.ca}"
EMAIL="${EMAIL:-remy.post.06@gmail.com}"

# Copy the Nginx site config and enable it
cp -v "${INSTALL_ROOT}/ops/nginx/lawnguy.conf" /etc/nginx/sites-available/lawnguy.conf
ln -sf /etc/nginx/sites-available/lawnguy.conf /etc/nginx/sites-enabled/lawnguy.conf

nginx -t
systemctl reload nginx

# Request the certificate. Certbot will edit the Nginx config in place to add
# the SSL block and redirect HTTP → HTTPS.
certbot --nginx \
  --non-interactive --agree-tos \
  --email "${EMAIL}" \
  --redirect \
  -d "${DOMAIN}" -d "www.${DOMAIN}"

systemctl reload nginx

echo
echo "──────────────────────────────────────────────────────────────────"
echo "  https://${DOMAIN} should now respond with a valid certificate."
echo
echo "  Cert auto-renews via the certbot.timer systemd unit (already on)."
echo "──────────────────────────────────────────────────────────────────"
