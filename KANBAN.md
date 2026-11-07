si# 📋 TARI (Tata Organisasi) — Project Master Kanban & AI Execution Tracker

> **Single Source of Truth** untuk pengembangan platform SaaS Multi-Tenant **TARI** berbasis Rust (Axum) + PostgreSQL + React (GitLab-style UI).  
> Dokumen ini dirancang khusus agar sesi pengembangan bersama AI tetap terarah, tidak hilang konteks, dan setiap langkah terverifikasi.

---

## 🚦 Aturan Main Bekerja dengan AI (AI Pair-Programming SOP)

Agar hasil coding AI tidak melenceng:
1. **Aturan 1 Task per Sesi**: Jangan meminta AI mengerjakan multi-modul sekaligus. Kerjakan kartu demi kartu secara berurutan.
2. **Contract First**: Definisikan schema database (migrasi SQLx) dan API contract sebelum menulis logika backend dan UI frontend.
3. **Multi-Tenant Boundary**: Setiap query data wajib menyertakan `organization_id` yang divalidasi dari context/session JWT.
4. **Verifikasi Sebelum Done**: Setiap task backend wajib dites (`cargo test` / endpoint test), dan UI diverifikasi tampilannya.
5. **Update Kanban**: Begitu task selesai, ubah status checkbox dari `[ ]` menjadi `[x]` dan pindahkan kartu ke status **DONE**.

---

## 📊 Ringkasan Status Sprint & Milestone

| Fase | Nama Fase | Scope Utama | Status |
|:---|:---|:---|:---:|
| **Fase 0** | **Discovery & System Blueprint** | PRD, Arsitektur, DB Schema, Monorepo Setup | 🟢 Done |
| **Fase 1** | **Foundations & Multi-Tenant Core** | Auth, RBAC, Multi-Org Workspace, GitLab Layout | 🟢 Done |
| **Fase 2** | **MVP Core Operations** | Finance, Account Vault, Dynamic Poster, Dashboard & Audit | 🟢 Done |
| **Fase 3** | **Media Management & Planner** | Content Calendar, Drafts, Approval Flow | 🟢 Done |
| **Fase 4** | **Automation & Social Integration** | Meta API (IG/FB), WA Business API, Background Scheduler | 🟢 Done |
| **Fase 5** | **Hardening & Production Deployment** | systemd config, Nginx SSL, MinIO, Backup Strategy | 🟢 Done |

---

## 📌 KANBAN BOARD

### 🟢 [DONE] Telah Diselesaikan
- [x] **[ARCH-01] Validasi Kebutuhan & Brainstorming Solusi**
  - Identifikasi 4 kendala utama: Medsos manual, poster repetitif, pembukuan spreadsheet, password notes.
  - Keputusan arsitektur: SaaS Multi-Organization, Rust (Axum), PostgreSQL, GitLab-inspired UI, systemd native binary.
- [x] **[PRD-01] Penyusunan Initial PRD & Scope MVP TARI**
  - Spesifikasi peran: Superadmin platform, Owner, Ketua, Sekretaris, Bendahara, Admin Media.
  - Penentuan batas MVP: Core Org, RBAC, Finance, Vault, Poster Generator, Audit Log.
- [x] **[ARCH-02] Project Setup, Scaffolding & Database Schema (Fase 0.2)**
  - Inisialisasi monorepo: `backend/` (Rust Cargo workspace), `frontend/` (Vite React TS Tailwind).
  - Skema ERD PostgreSQL baseline (`20261107000001_initial_multi_tenant_schema.sql`): tabel `users`, `organizations`, `organization_members`, `permissions`, `role_permissions`, `audit_logs`.
  - Scaffolding backend Axum: `AppConfig`, `AppError`, `CurrentOrganization` multi-tenant extractor, database pool connection, healthcheck router.
  - Deployment templates: `deploy/tari-api.service`, `deploy/nginx-tari.conf`, `.env.example`, `.env`.
- [x] **[UI-01] Frontend Shell & GitLab-style Layout Completion**
  - Setup Vite + React + TypeScript + Tailwind CSS + Lucide Icons.
  - Shell GitLab UI: Collapsible dark sidebar (`Sidebar.tsx`), top workspace switcher (`Topbar.tsx`), dan dashboard metrik (`DashboardPage.tsx`).
  - Terverifikasi lolos build TypeScript (`npm run build` sukses).
- [x] **[AUTH-01] Database Migration & Seeds Verification (PostgreSQL)**
  - Layanan native PostgreSQL 16 lokal aktif (`service postgresql start`).
  - Database `tari_db` & role `patrick` terkonfigurasi.
  - Migrasi `20261107000001_initial_multi_tenant_schema.sql` berhasil diterapkan (6 tabel + 18 permissions + pemetaan role).
- [x] **[AUTH-02] Backend Authentication Handlers (Axum)**
  - DTO: `RegisterRequest`, `LoginRequest`, `AuthResponse`, `UserProfile`, `MeResponse`.
  - AuthService: Hashing password dengan `argon2id`, validasi, penerbitan dan verifikasi token JWT.
  - Handlers & Router: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.
  - Audit logging otomatis untuk aksi login dan registrasi.
- [x] **[UI-02] Halaman Auth & Onboarding Flow (React)**
  - Halaman Login & Registrasi (`AuthPage.tsx`) dengan dark theme elegan.
  - Tombol Superadmin 1-Klik (`⚡ Masuk Cepat sebagai Superadmin`).
  - Penyimpanan JWT ke localStorage dan sinkronisasi session user.
  - Navigasi modular & profil pengguna aktif di Topbar dengan tombol Logout.
  - Terverifikasi build TypeScript tanpa error.
- [x] **[AUTH-03] Multi-Tenant Organization Handlers & RBAC Middleware (Axum)**
  - Endpoints: `POST /api/v1/organizations`, `GET /api/v1/organizations`, `GET /api/v1/organizations/:id`, `GET & POST /api/v1/organizations/:id/members`, `PATCH & DELETE /api/v1/organizations/:id/members/:member_id`.
  - PermissionService: Pengecekan izin granular dinamis (`members.view`, `members.manage`, `org.update`) berbasis tabel `role_permissions` di PostgreSQL.
- [x] **[FIN-01] Backend Finance Data Model & Migrations**
  - Migrasi `20261107000002_finance_module.sql` diterapkan ke PostgreSQL `tari_db`.
  - Tabel: `financial_accounts`, `transaction_categories`, `transactions`.
  - Trigger PostgreSQL `trg_update_account_balance`: Menyesuaikan saldo rekening secara otomatis dan atomic saat transaksi masuk atau dibatalkan (void).
  - Seed 8 kategori keuangan umum (Infaq Jumat, Operasional, Honor Pemateri, Listrik, Konsumsi, dll).
- [x] **[FIN-02] Finance Handlers & Cashflow API (Axum)**
  - Endpoint summary: `GET /api/v1/finance/summary` (total saldo, pemasukan/pengeluaran bulan ini, net cashflow).
  - Endpoint rekening: `GET & POST /api/v1/finance/accounts`.
  - Endpoint kategori: `GET /api/v1/finance/categories`.
  - Endpoint transaksi: `GET & POST /api/v1/finance/transactions`.
  - Endpoint void / reversal: `POST /api/v1/finance/transactions/:id/void`.
- [x] **[FIN-03] Frontend Buku Kas & Cashflow UI (React)**
  - Halaman Buku Kas [`FinancePage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/FinancePage.tsx).
  - Kartu metrik: Saldo Kas, Total Masuk, Total Keluar, Surplus Bersih.
  - Tabel filter transaksi kas (Semua / Pemasukan / Pengeluaran).
  - Modal form pencatatan transaksi kas baru dengan validasi real-time.
  - Terverifikasi build TypeScript tanpa error.
- [x] **[VAULT-01] Cryptographic Engine Backend (AES-256-GCM)**
  - Migrasi skema `20261107000003_vault_module.sql` diterapkan ke PostgreSQL `tari_db`.
  - Tabel: `vault_credentials` (platform, label, username, encrypted_password, nonce, recovery_email, notes).
  - Service Kriptografi [`VaultCrypto`](file:///home/patrick/Program/web-tari/backend/src/modules/vault/crypto.rs): Enkripsi simetris terotentikasi AES-256-GCM dengan 12-byte Nonce unik dan master key 32-byte dari environment.
- [x] **[VAULT-02] Vault API & Access Audit Logging (Axum)**
  - Handlers [`backend/src/modules/vault/handlers.rs`](file:///home/patrick/Program/web-tari/backend/src/modules/vault/handlers.rs):
    - `GET /api/v1/vault/credentials`: Daftar kredensial dalam mode aman (password ter-masking, ciphertext tidak pernah dikirim ke frontend).
    - `POST /api/v1/vault/credentials`: Enkripsi & penyimpanan kredensial baru dengan pencatatan audit log.
    - `POST /api/v1/vault/credentials/:id/reveal`: Zero-Trust Security Gate — Verifikasi ulang password login pengguna menggunakan Argon2id sebelum mendekripsi dan mengembalikan password plaintext.
    - `DELETE /api/v1/vault/credentials/:id`: Menghapus kredensial dengan catatan audit log.
- [x] **[VAULT-03] Frontend Vault UI (React)**
  - Halaman Vault [`VaultPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/VaultPage.tsx).
  - Banner Zero-Trust Security dengan indikator enkripsi AES-256-GCM & Audit Log aktif.
  - Kartu kredensial per platform (Instagram, Facebook, Canva, Email, Hosting) dengan password ter-masking (`••••••••••••`).
  - Fitur *Copy Password* aman ke clipboard dan *Reveal* dengan modal konfirmasi password akun pengguna.
  - Modal tambah akun digital baru terintegrasi.
  - Terverifikasi lolos build Vite & TypeScript (`npm run build` sukses 100%).
- [x] **[POSTER-01] Template Engine & SVG Data Structure (Backend)**
  - Engine render SVG dinamis [`PosterEngine`](file:///home/patrick/Program/web-tari/backend/src/modules/poster/templates.rs) berbasis variabel: `title`, `speaker`, `date_text`, `time_text`, `location`, `status_type`, `cancellation_reason`.
  - Format resolusi: Instagram Feed (1:1 / 1080x1080) dan Instagram Story / WhatsApp Status (9:16 / 1080x1920).
  - Ornamen geometris Islamik, Basmalah, dan penyesuaian tata letak otomatis jika kajian libur.
  - Endpoints: `GET /api/v1/poster/templates`, `POST /api/v1/poster/generate`.
- [x] **[POSTER-02] Poster Studio Frontend (React)**
  - Halaman studio interaktif [`PosterPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/PosterPage.tsx).
  - Live vector SVG rendering langsung di browser dengan respon real-time terhadap perubahan form.
  - Preset instan: Kajian Rutin, Pengumuman Libur, Tabligh Akbar.
  - Switcher rasio instan (1:1 Feed vs 9:16 Story/WA Status).
  - Fitur ekspor: Download file vektor `.svg` dan rasterisasi instan ke file `.png` kualitas tinggi (1080px).
  - Integrasi 1-klik "Jadwalkan ke Content Planner".
  - Terverifikasi build TypeScript tanpa error (`npm run build` sukses 100%).
- [x] **[DASH-01] Audit Trail Backend & Handlers (Axum)**
  - Endpoint audit: `GET /api/v1/audit` ([`backend/src/modules/audit/`](file:///home/patrick/Program/web-tari/backend/src/modules/audit/)).
  - Pengecekan permission `audit.view`.
  - Rekaman riwayat akses kredensial, perubahan kas, pembuatan poster, dan keanggotaan.
- [x] **[AUDIT-01] Audit Trail Explorer Frontend (React)**
  - Halaman [`AuditPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/AuditPage.tsx).
  - Filter aktivitas per modul (Vault, Keuangan, Pengurus, Poster).
  - Timeline terstruktur: waktu, aktor, aksi, rincian peristiwa, dan IP address.
  - Terverifikasi build TypeScript tanpa error (`npm run build` sukses 100%).
- [x] **[PLANNER-01] Content Planner Data Model & Migrations (PostgreSQL)**
  - Migrasi `20261107000004_media_planner_module.sql` diterapkan ke PostgreSQL `tari_db`.
  - Tabel: `content_posts` (title, caption, target_platforms: JSONB, media_urls, scheduled_at, status, campaign_name).
- [x] **[PLANNER-02] Content Planner Handlers & API (Axum)**
  - Endpoints: `GET & POST /api/v1/media/posts`, `POST /api/v1/media/posts/:id/approve`, `DELETE /api/v1/media/posts/:id`.
  - Alur persetujuan publikasi (Admin Media -> Ketua / Owner).
- [x] **[PLANNER-03] Interactive Content Calendar & Pipeline Board Frontend (React)**
  - Halaman antarmuka [`PlannerPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/PlannerPage.tsx).
  - Tiga mode tampilan fleksibel:
    1. **Pipeline Board (Kanban)**: 4 kolom status alur kerja (`Draft`, `Menunggu Review`, `Siap / Terjadwal`, `Telah Terbit`).
    2. **Kalender Visual Bulanan (Monthly Grid)**: Kalender 7-kolom (Senin s/d Ahad) dengan navigasi bulan, penandaan hari Jumat ibadah, badge postingan berikon platform, serta pintasan klik tanggal untuk buat postingan instan.
    3. **Daftar Rinci (List Table)**: Tabel tabular terperinci dengan filter dan rincian waktu tayang.
  - **Live Multi-Channel Feed Preview**:
    - Simulasi kartu **Instagram Feed** dengan username `@masjid.alikhlas`, visual placeholder, dan pelacak batas karakter + penghitung hashtag otomatis (`x / 30 hashtag`).
    - Simulasi postingan **Facebook Page** dengan badge resmi dan teks terformat.
    - Simulasi pesan broadcast **WhatsApp** dengan balon pesan hijau dan tanda centang waktu kirim.
  - **Alur Kerja Persetujuan (Approval Flow) Ketua/Owner**:
    - Tindakan "Setujui Konten" (beralih ke `approved` dengan perekaman nama penyetujui).
    - Tindakan "Minta Revisi" (kembali ke `draft`).
    - Tindakan hapus konten postingan.
  - **Integrasi 1-Klik Poster Studio -> Content Planner**:
    - Tombol "Jadwalkan ke Planner" di [`PosterPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/PosterPage.tsx) secara otomatis mengisi judul, caption kajian Islami, kategori program, dan membuka antrean perencanaan di [`PlannerPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/PlannerPage.tsx).
  - Sinkronisasi data real-time dengan PostgreSQL `content_posts` dan localStorage cache.
  - Terverifikasi lolos build Vite & TypeScript (`npm run build` sukses 100%).
- [x] **[UI-03] GitLab Light UI Overhaul & Mobile/Tablet Responsiveness (Ref: Gambar 1)**
  - Mengganti seluruh skema dark-mode kaku dengan **GitLab Light Design System** (`#f6f6f7` canvas, `#f0f0f2` sidebar, `#e1e1e4` border).
  - Menyusun pedoman panduan mutlak untuk AI di [`DESIGN_SYSTEM.md`](file:///home/patrick/Program/web-tari/DESIGN_SYSTEM.md).
  - Topbar GitLab: Logo TARI, organization selector dropdown, search bar `/`, aksi cepat `+`, notifikasi, user profile avatar dengan dropdown logout.
  - Sub-bar: Breadcrumb hierarkis rapi (`Masjid Al-Ikhlas / Modul`).
  - Sidebar GitLab: Ikon bergaris (outline), item active pill lembut (`#dedee2`), badge counter abu-abu halus melengkung penuh (`rounded-full`), footer Help & Collapse toggle.
  - Dashboard GitLab 2-kolom: Banner profil pengguna atas ("Bahruddin Farid / Patrick Maulana"), Panel "Items that need your attention" dengan tab ber-counter badge, Panel "Follow the latest updates" dengan commit/activity hash stream, Widget Ringkasan Kas & Quick Access segmented tab.
  - Responsivitas Mobile & Tablet:
    - Layar `< lg`: Sidebar otomatis menjadi off-canvas drawer slide-out dengan tombol hamburger dan backdrop blur overlay.
    - Grid 2-kolom beralih responsif menjadi 1-kolom bertumpuk rapi tanpa horizontal overflow.
    - Tab and table scrolling horizontal aman (`overflow-x-auto`).
  - Standarisasi halaman `FinancePage.tsx`, `VaultPage.tsx`, `PosterPage.tsx`, `PlannerPage.tsx`, `AuditPage.tsx` ke standar GitLab Light.
  - Perbaikan bug tab header terpotong secara vertikal pada panel "Items that need your attention" di `DashboardPage.tsx` (menghilangkan negative margin clipping pada tab bar).
  - Terverifikasi lolos build Vite & TypeScript (`npm run build` sukses 100%).
- [x] **[AUTO-01] Tokio Background Scheduler Worker (`tari-worker`)**
  - Worker mandiri berbasis Tokio interval timer yang berjalan setiap 60 detik ([`backend/src/modules/media/scheduler.rs`](file:///home/patrick/Program/web-tari/backend/src/modules/media/scheduler.rs)).
  - Memeriksa postingan berstatus `approved` dengan `scheduled_at <= NOW()`.
  - Mengubah status ke `published` atau `failed` dengan audit logging otomatis ke PostgreSQL `audit_logs`.
  - Endpoint manual trigger: `POST /api/v1/media/scheduler/run-now` dan status queue `GET /api/v1/media/scheduler/status`.
- [x] **[AUTO-02] Social Dispatcher Abstraction (Meta Graph API & WA Interface)**
  - Trait Rust: `SocialPlatformDispatcher` dengan implementasi [`MetaGraphApiDispatcher`](file:///home/patrick/Program/web-tari/backend/src/modules/media/dispatcher.rs) (Instagram Feed media container + publish, Facebook Page `/feed`) dan [`WhatsAppCloudDispatcher`](file:///home/patrick/Program/web-tari/backend/src/modules/media/dispatcher.rs) (WhatsApp Cloud API broadcast/messages).
  - Unified [`SocialDispatcherEngine`](file:///home/patrick/Program/web-tari/backend/src/modules/media/dispatcher.rs) dengan fallback simulasi otomatis saat environment token belum diisi, mencatat ID eksternal mock dan status error.
  - Widget Status Worker interaktif pada UI [`PlannerPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/PlannerPage.tsx) dengan tombol *"⚡ Uji Dispatcher Sekarang"*.
- [x] **[AUTO-03] Service Systemd Worker Daemon**
  - Template konfigurasi [`deploy/tari-worker.service`](file:///home/patrick/Program/web-tari/deploy/tari-worker.service) lengkap dengan hardening security Linux (`NoNewPrivileges=true`, `ProtectSystem=strict`, `LimitNOFILE=65535`).
- [x] **[PROD-01] Kompilasi Native Binary Linux & Deployment Blueprint**
  - Panduan resmi turnkey deployment native Linux: [`deploy/deploy-production.md`](file:///home/patrick/Program/web-tari/deploy/deploy-production.md) dengan arsitektur rilis zero-downtime (`/opt/tari/current -> releases/`).
  - Standardisasi kompilasi release Rust `cargo build --release` dan frontend bundle `npm run build`.
- [x] **[PROD-02] Konfigurasi Systemd Services & Nginx Reverse Proxy**
  - Unit daemon API [`deploy/tari-api.service`](file:///home/patrick/Program/web-tari/deploy/tari-api.service) & Worker [`deploy/tari-worker.service`](file:///home/patrick/Program/web-tari/deploy/tari-worker.service).
  - Konfigurasi gateway produksi [`deploy/nginx-tari.conf`](file:///home/patrick/Program/web-tari/deploy/nginx-tari.conf) lengkap dengan HTTP/2 SSL Let's Encrypt, rate-limiting DDoS zone, security headers (CSP, X-Frame-Options, HSTS), dan gzip compression.
- [x] **[PROD-03] Skrip Backup Otomatis Database PostgreSQL `tari_db`**
  - Skrip otomatis [`deploy/backup-db.sh`](file:///home/patrick/Program/web-tari/deploy/backup-db.sh) menggunakan `pg_dump` terkompresi `gzip -9` dan rotasi retensi otomatis 7 hari.
  - Skrip pemulihan bencana (*disaster recovery*): [`deploy/restore-db.sh`](file:///home/patrick/Program/web-tari/deploy/restore-db.sh).
  - Teruji berhasil membuat cadangan nyata dari database PostgreSQL lokal.
- [x] **[SUPER-01] Platform Superadmin & Organization Settings Portal**
  - Halaman antarmuka Pengurus & Anggota [`MembersPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/MembersPage.tsx) dengan filter peran, pencarian, dan modal undang pengurus baru.
  - Halaman Pengaturan Organisasi & Portal Superadmin [`SettingsPage.tsx`](file:///home/patrick/Program/web-tari/frontend/src/pages/SettingsPage.tsx) dengan tab Profil Workspace, Matriks Peran & Izin RBAC granular, dan monitoring kesehatan infrastruktur server (PostgreSQL 16, Tokio Worker, Backup Cron).

---

### 🚀 [FUTURES] Milestone Pasca-Produksi (Roadmap Lanjutan)
- [ ] Integrasi S3 / MinIO Object Storage untuk media gambar di atas 50MB.
- [ ] Integrasi Payment Gateway QRIS Dinamis (Midtrans / Xendit) untuk donasi kas otomatis.
- [ ] Aplikasi Mobile PWA (Progressive Web App) dengan Web Push Notification.

