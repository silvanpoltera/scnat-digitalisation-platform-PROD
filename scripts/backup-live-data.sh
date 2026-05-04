#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# backup-live-data.sh
# Snapshot of data/ to /opt/scnat-data-backups/<timestamp>/.
# Designed to run from cron every ~30 min on the live VM.
#
# Crontab entry on VM (run: crontab -e):
#   */30 * * * * /opt/scnat-portal-prod/scripts/backup-live-data.sh >> /var/log/scnat-data-backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────

set -e

APP_DIR="/opt/scnat-portal-prod"
BACKUP_ROOT="/opt/scnat-data-backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Only snapshot if there were actual changes since the last backup
LATEST="$(ls -1dt "$BACKUP_ROOT"/*/ 2>/dev/null | grep -v "$TIMESTAMP" | head -n 1 || true)"
cp -a "$APP_DIR/data/." "$BACKUP_DIR/"

if [ -n "$LATEST" ] && diff -rq "$LATEST" "$BACKUP_DIR" >/dev/null 2>&1; then
  # Nothing changed since previous snapshot → drop the new empty-equivalent one
  rm -rf "$BACKUP_DIR"
  echo "[$(date -Iseconds)] no data changes – skipped"
  exit 0
fi

echo "[$(date -Iseconds)] data snapshot → $BACKUP_DIR"

# Housekeeping: keep last 200 snapshots (~4 days at 30-min cadence)
ls -1dt "$BACKUP_ROOT"/*/ 2>/dev/null | tail -n +201 | xargs -r rm -rf
