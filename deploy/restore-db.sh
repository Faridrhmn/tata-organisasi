#!/usr/bin/env bash
# ========================================================
# TARI (Tata Organisasi) — Database Restore Utility
# Restores a .sql.gz backup to PostgreSQL database
# ========================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Penggunaan: $0 <path-to-backup-file.sql.gz>"
    echo "Contoh: $0 /opt/tari/shared/backups/db/tari_db_backup_2026-11-07_12-00-00.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Berkas backup '$BACKUP_FILE' tidak ditemukan!" >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs -d '\n')
fi

DB_NAME="${POSTGRES_DB:-tari_db}"
DB_USER="${POSTGRES_USER:-patrick}"
DB_PASSWORD="${POSTGRES_PASSWORD:-5}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo "⚠️ PERINGATAN: Memulihkan database '${DB_NAME}' dari '${BACKUP_FILE}'."
read -p "Apakah Anda yakin ingin menimpa data yang ada? (y/N): " -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Operasi dibatalkan oleh pengguna."
    exit 0
fi

echo "🔄 Mendekompresi dan mengimpor data ke PostgreSQL..."
export PGPASSWORD="$DB_PASSWORD"
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

echo "✅ Pemulihan database '${DB_NAME}' berhasil diselesaikan!"

