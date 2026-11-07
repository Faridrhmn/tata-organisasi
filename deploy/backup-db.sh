#!/usr/bin/env bash
# ========================================================
# TARI (Tata Organisasi) — Automated Database Backup Script
# PostgreSQL pg_dump with Gzip Compression & 7-Day Retention
# ========================================================

set -euo pipefail

# 1. Konfigurasi Default & Environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env jika tersedia
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs -d '\n')
fi

DB_NAME="${POSTGRES_DB:-tari_db}"
DB_USER="${POSTGRES_USER:-patrick}"
DB_PASSWORD="${POSTGRES_PASSWORD:-5}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

BACKUP_DIR="${TARI_BACKUP_DIR:-/opt/tari/shared/backups/db}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP="$(date +'%Y-%m-%d_%H-%M-%S')"
BACKUP_FILENAME="${DB_NAME}_backup_${TIMESTAMP}.sql.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "=========================================================="
echo "📦 [$(date '+%Y-%m-%d %H:%M:%S')] Memulai Backup Database: ${DB_NAME}"
echo "=========================================================="

# 2. Buat direktori backup jika belum ada
mkdir -p "$BACKUP_DIR"

# 3. Eksekusi pg_dump terkompresi GZIP level 9
export PGPASSWORD="$DB_PASSWORD"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    --quote-all-identifiers \
    | gzip -9 > "$BACKUP_FILEPATH"; then

    BACKUP_SIZE="$(du -h "$BACKUP_FILEPATH" | cut -f1)"
    echo "✅ [SUCCESS] Backup database selesai!"
    echo "   📁 Berkas: ${BACKUP_FILEPATH}"
    echo "   📊 Ukuran: ${BACKUP_SIZE}"
else
    echo "❌ [ERROR] Gagal melakukan pg_dump!" >&2
    exit 1
fi

# 4. Validasi Integritas Berkas Backup
if [ ! -s "$BACKUP_FILEPATH" ]; then
    echo "❌ [CRITICAL] Berkas backup kosong atau rusak!" >&2
    exit 1
fi

# 5. Rotasi Pembersihan Backup Usang (> RETENTION_DAYS)
echo "🧹 Membersihkan cadangan yang lebih tua dari ${RETENTION_DAYS} hari..."
DELETED_COUNT=$(find "$BACKUP_DIR" -type f -name "${DB_NAME}_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    find "$BACKUP_DIR" -type f -name "${DB_NAME}_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
    echo "   🗑️ Dihapus ${DELETED_COUNT} berkas cadangan usang."
else
    echo "   ✨ Tidak ada berkas cadangan usang yang perlu dihapus."
fi

echo "🎉 [$(date '+%Y-%m-%d %H:%M:%S')] Seluruh proses backup selesai dengan aman."
echo ""

