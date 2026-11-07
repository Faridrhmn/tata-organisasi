# 🚀 Panduan Deployment Production TARI (Linux Native + Systemd)

Dokumentasi resmi untuk menjalankan platform **TARI (Tata Organisasi)** di lingkungan server Linux (Ubuntu 22.04 / 24.04 LTS, Debian, atau server mandiri) secara native tanpa overhead container, menggunakan `systemd` daemon, `PostgreSQL 16`, dan `Nginx` reverse proxy ber-SSL.

---

## 1. Struktur Direktori Produksi (`/opt/tari`)

```bash
/opt/tari/
├── current -> releases/20261107_v0.1.0/   # Symlink ke rilis aktif
├── releases/                              # Riwayat versi rilis (zero-downtime)
│   └── 20261107_v0.1.0/
│       ├── bin/
│       │   └── tari-api                   # Native binary Linux (Axum)
│       └── frontend/
│           └── dist/                      # Static bundle React + Vite
└── shared/                                # Data persisten antar-rilis
    ├── .env                               # Kredensial & master key AES-256
    ├── uploads/                           # Bukti transfer kas & aset
    └── backups/
        └── db/                            # Cadangan harian pg_dump terkompresi
```

---

## 2. Langkah Instalasi Cepat (Turnkey Setup)

### Langkah A: Buat User Sistem & Direktori
```bash
sudo useradd -r -s /bin/false -d /opt/tari tari
sudo mkdir -p /opt/tari/{releases,shared/uploads,shared/backups/db}
sudo chown -R tari:tari /opt/tari
```

### Langkah B: Pasang Konfigurasi Lingkungan (`.env`)
Salin file konfigurasi produksi ke `/opt/tari/shared/.env`:
```bash
sudo cp .env.example /opt/tari/shared/.env
sudo chmod 600 /opt/tari/shared/.env
sudo chown tari:tari /opt/tari/shared/.env
```
> Pastikan mengatur `POSTGRES_PASSWORD`, `JWT_SECRET`, dan `VAULT_MASTER_KEY` (32 bytes hex) dengan nilai acak yang aman.

### Langkah C: Kompilasi & Salin Binary
```bash
# Kompilasi backend Rust ke binary rilis teroptimasi
cd backend
cargo build --release

# Kompilasi frontend SPA
cd ../frontend
npm run build

# Buat folder rilis baru
RELEASE_DIR="/opt/tari/releases/$(date +%Y%m%d_%H%M%S)"
sudo mkdir -p "${RELEASE_DIR}/bin" "${RELEASE_DIR}/frontend"

# Salin binary dan aset
sudo cp ../backend/target/release/tari-api "${RELEASE_DIR}/bin/"
sudo cp -r dist/ "${RELEASE_DIR}/frontend/"
sudo ln -sfn "${RELEASE_DIR}" /opt/tari/current
sudo chown -R tari:tari /opt/tari
```

### Langkah D: Pasang & Aktifkan Service Systemd
Salin template systemd dari folder `deploy/`:
```bash
sudo cp deploy/tari-api.service /etc/systemd/system/
sudo cp deploy/tari-worker.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now tari-api.service
sudo systemctl enable --now tari-worker.service
```

Periksa status layanan:
```bash
sudo systemctl status tari-api.service
sudo systemctl status tari-worker.service
```

### Langkah E: Pasang Nginx Reverse Proxy & SSL
```bash
# Salin konfigurasi Nginx
sudo cp deploy/nginx-tari.conf /etc/nginx/sites-available/tari.conf
sudo ln -s /etc/nginx/sites-available/tari.conf /etc/nginx/sites-enabled/

# Uji konfigurasi Nginx
sudo nginx -t

# Pasang sertifikat SSL gratis Let's Encrypt (Certbot)
sudo certbot --nginx -d tari.yourdomain.com

# Muat ulang Nginx
sudo systemctl reload nginx
```

---

## 3. Otomatisasi Cadangan Database Harian (Cron)

Pasang skrip cadangan otomatis PostgreSQL yang sudah disiapkan:
```bash
sudo cp deploy/backup-db.sh /opt/tari/shared/backup-db.sh
sudo chmod +x /opt/tari/shared/backup-db.sh
```

Tambahkan ke cron job root (`sudo crontab -e`):
```cron
# Jalankan backup database terkompresi setiap hari pukul 02:00 WIB (rotasi 7 hari)
0 2 * * * /opt/tari/shared/backup-db.sh >> /var/log/tari-backup.log 2>&1
```

### Pemulihan Bencana (Disaster Recovery):
Jika sewaktu-waktu server perlu dipulihkan:
```bash
./deploy/restore-db.sh /opt/tari/shared/backups/db/tari_db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz
```

