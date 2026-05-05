#!/usr/bin/env bash
#
# backup.sh — nightly mongodump.
# Triggered by lawnguy-backup.timer at 03:00 local.
#
# Retention: 14 daily archives in BACKUP_DIR.
# Optional: set OCI_BUCKET to also upload to OCI Object Storage
# (requires `oci` CLI configured for the lawnguy user, or a wrapper).

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/lawnguy}"
MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/lawnguy}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
OCI_BUCKET="${OCI_BUCKET:-}"

mkdir -p "${BACKUP_DIR}"

STAMP="$(date +%Y%m%dT%H%M%S)"
ARCHIVE="${BACKUP_DIR}/lawnguy-${STAMP}.archive.gz"

echo "==> mongodump → ${ARCHIVE}"
mongodump --uri="${MONGO_URI}" --archive="${ARCHIVE}" --gzip

echo "==> Pruning archives older than ${RETENTION_DAYS} days"
find "${BACKUP_DIR}" -maxdepth 1 -name 'lawnguy-*.archive.gz' \
  -mtime "+${RETENTION_DAYS}" -delete

if [[ -n "${OCI_BUCKET}" ]] && command -v oci >/dev/null 2>&1; then
  echo "==> Uploading to OCI Object Storage: ${OCI_BUCKET}"
  oci os object put \
    --bucket-name "${OCI_BUCKET}" \
    --file "${ARCHIVE}" \
    --name "lawnguy/$(basename "${ARCHIVE}")" \
    --force
fi

echo "==> Done. Local archives:"
ls -lh "${BACKUP_DIR}"
