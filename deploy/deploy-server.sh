#!/usr/bin/env bash
# ========================================================
# Script Auto-Deploy / Update TARI di Server
# Path: /home/ubuntu/Program/tata-organisasi
# ========================================================
set -e

echo "🚀 [1/4] Memperbarui kode dari git repository..."
git pull origin main || true

echo "🦀 [2/4] Mengompilasi backend Rust (Release Mode)..."
cd backend
cargo build --release
cd ..

echo "⚛️ [3/4] Mengompilasi frontend React + Vite..."
cd frontend
npm install
npm run build
cd ..

echo "🔄 [4/4] Me-restart service systemd tari-api..."
sudo systemctl restart tari-api.service

echo "✅ Deployment selesai! Cek status layanan:"
sudo systemctl status tari-api.service --no-pager

