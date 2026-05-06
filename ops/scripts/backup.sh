#!/usr/bin/env bash
#
# backup.sh — nightly mongodump.
# Triggered by lawnguy-backup.timer at 03:00 local.
#
# Retention: 14 daily archives in BACKUP_DIR.
# Optional: set DO_SPACES_BUCKET to also upload to DigitalOcean Spaces
# (S3-compatible). Requires `s3cmd` and ~lawnguy/.s3cfg with the Spaces
# access key / secret. The bootstrap script installs s3cmd; the .s3cfg
# file is created by the operator on first deploy (see ops/README.md).

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/lawnguy}"
MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/lawnguy}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DO_SPACES_BUCKET="${DO_SPACES_BUCKET:-}"

mkdir -p "${BACKUP_DIR}"

STAMP="$(date +%Y%m%dT%H%M%S)"
ARCHIVE="${BACKUP_DIR}/lawnguy-${STAMP}.archive.gz"

echo "==> mongodump → ${ARCHIVE}"
mongodump --uri="${MONGO_URI}" --archive="${ARCHIVE}" --gzip

echo "==> Pruning archives older than ${RETENTION_DAYS} days"
find "${BACKUP_DIR}" -maxdepth 1 -name 'lawnguy-*.archive.gz' \
  -mtime "+${RETENTION_DAYS}" -delete

if [[ -n "${DO_SPACES_BUCKET}" ]] && command -v s3cmd >/dev/null 2>&1; then
  echo "==> Uploading to DO Spaces: s3://${DO_SPACES_BUCKET}/lawnguy/"
  s3cmd put --acl-private \
    "${ARCHIVE}" \
    "s3://${DO_SPACES_BUCKET}/lawnguy/$(basename "${ARCHIVE}")"
fi

echo "==> Done. Local archives:"
ls -lh "${BACKUP_DIR}"
