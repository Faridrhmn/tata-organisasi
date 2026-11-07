# 🎨 GitLab-Inspired Design System & AI Guidelines for TARI

> **PANDUAN MUTLAK UNTUK AI ASSISTANT & DEVELOPER**:  
> Seluruh antarmuka web platform **TARI (Tata Kelola Organisasi)** mengadopsi standar visual modern **GitLab Light Edition** (mengacu pada screenshot referensi GitLab Home `media_1794037335927_4ba4c9a0.jpg`).  
> **DILARANG** mengembalikan tampilan ke dark-mode kaku/hitam pekat (seperti `media_1794037433724_7db1abd9.jpg`) atau template dashboard admin generik dengan kontras kasar.

---

## 1. Filosofi Desain: GitLab Light Standard

| Aspek | ❌ Desain Lama (Kaku / Gambar 2) | ✅ Desain GitLab Light Baru (Gambar 1) |
|:---|:---|:---|
| **Tema Sidebar** | Hitam/ungu gelap pekat (`#0f0d1b`) | **Abu-abu terang netral (`#f0f0f2`)** dengan border halus (`#e1e1e4`) |
| **Page Canvas** | Putih dingin dengan bayangan tebal | **Abu-abu netral sangat lembut (`#f6f6f7`)** |
| **Panels & Cards** | Sudut terlalu membulat (`rounded-2xl`), shadow berat | **Sudut terukur (`rounded-lg`), border 1px (`#e5e5e7`), shadow sangat tipis (`shadow-gitlab`)** |
| **Active Nav Indicator** | Garis neon hijau tebal | **Pill abu-abu lembut (`bg-[#dedee2]`) dengan font tebal** |
| **Counter Badges** | Kotak berwarna kontras | **Pill abu-abu halus melengkung penuh (`rounded-full`)** |
| **Responsivitas** | Terpotong di mobile/tablet, sidebar kaku | **Sidebar otomatis menjadi drawer geser (slide-out), grid 2-kolom stack rapi jadi 1 kolom** |

---

## 2. Palet Token Warna & CSS Variables

| Token Key | Nilai Hex | Tailwind Class / Variable | Fungsi Penggunaan |
|:---|:---|:---|:---|
| **Body Canvas** | `#f6f6f7` | `bg-gitlab-bg` | Latar belakang seluruh area halaman. |
| **Sidebar Canvas** | `#f0f0f2` | `bg-gitlab-sidebar` | Latar belakang menu samping kiri. |
| **Sidebar Hover** | `#e8e8eb` | `hover:bg-gitlab-sidebarHover` | Status hover item menu sidebar. |
| **Sidebar Active** | `#dedee2` | `bg-gitlab-sidebarActive` | Status modul/halaman yang sedang aktif. |
| **Sidebar Border** | `#e1e1e4` | `border-gitlab-border` | Garis pembatas sidebar dan topbar. |
| **Panel Border** | `#e5e5e7` | `border-gitlab-panelBorder` | Border 1px di seluruh kartu/tabel. |
| **Text Primary** | `#1f1f23` | `text-gitlab-text` | Judul, heading utama, dan teks tebal. |
| **Text Secondary** | `#626168` | `text-gitlab-secondary` | Deskripsi, label menu, subtitle. |
| **Text Muted** | `#8c8b94` | `text-gitlab-muted` | Timestamp relatif, status hash, ID. |
| **Brand Green** | `#16a34a` | `bg-tari-green` | Aksen tombol utama TARI, status sukses. |
| **GitLab Link Blue** | `#1068eb` | `text-gitlab-blue` | Link tautan, tab aktif, breadcrumbs. |

---

## 3. Komponen Layout Wajib (Layout Anatomy)

### 3.1. Topbar Navbar (Tinggi 44px - 48px)
- **Kiri**: Tombol hamburger (`lg:hidden`), logo TARI (ikon persegi hijau `T`), pemisah `|`, dan dropdown switcher organisasi aktif (`Building2`).
- **Tengah**: GitLab search input dengan shortcut `/` atau `Ctrl+K` (`hidden md:block`).
- **Kanan**: Tombol aksi cepat `+` (modal pintas), lonceng notifikasi dengan unread dot, dan avatar profil dengan inisial/foto.
- **Sub-bar**: Breadcrumb bersih setinggi 28px (`Nama Organisasi / Modul Aktif`).

### 3.2. Sidebar Kiri (Desktop: 240px / 56px, Mobile: Drawer)
- **Header**: Label kategori kecil (`MENU ORGANISASI` / `YOUR WORK`).
- **Item Menu**: Ikon bergaris (outline) 16px, label 13px, badge counter numerik halus di kanan (`text-[10px] bg-slate-200/90 text-slate-700 px-1.5 rounded-full`).
- **Footer**: Tombol Bantuan (`HelpCircle`) dan Ciutkan/Perluas Sidebar (`ChevronLeft`/`ChevronRight`).

### 3.3. Dashboard Page (Persis Referensi GitLab Gambar 1)
- **Baris Profil Atas**: Avatar bulat (48px) di kiri, Nama Pengguna tebal di kanan dengan teks sub-caption moto/status.
- **Struktur Grid 12 Kolom (`grid-cols-1 lg:grid-cols-12`)**:
  - **Kolom Kiri (8 Span)**:
    - *Panel 1: "Items that need your attention"*: Tab horizontal ("All", "Review requested (1)", "Keuangan (1)", "Vault (7)") dengan garis bawah biru aktif `border-gitlab-blue`, item tugas dengan ikon modul, relative time, tombol checklist cepat.
    - *Panel 2: "Follow the latest updates"*: Dropdown filter aktivitas, feed riwayat kronologis dengan hash commit/transaksi dan timestamp.
  - **Kolom Kanan (4 Span)**:
    - *Widget 1: "Buku Kas & Keuangan / Ringkasan"*: Saldo kas bersih, badge arus masuk/keluar, waktu pembaruan terakhir, link detail.
    - *Widget 2: "Quick Access"*: Segmented control tab (`Recently viewed` vs `Modul Utama`), tautan cepat langsung ke fitur favorit.

---

## 4. Standar Responsivitas (Mobile & Tablet First)

Untuk memastikan pengalaman mobile dan tablet mulus tanpa glitch:
1. **Breakpoint Sidebar**:
   - Layar `< 1024px` (`lg` breakpoint): Sidebar disembunyikan sepenuhnya dari aliran dokumen (`hidden lg:flex`).
   - Ketika hamburger ditekan, sidebar muncul sebagai **Drawer Slide-Out** (`fixed inset-y-0 left-0 w-64 shadow-2xl z-50`) disertai backdrop overlay redup (`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40`).
2. **Breakpoint Konten**:
   - Kolom dashboard beralih dari 2 kolom berdampingan menjadi 1 kolom tumpuk (`grid-cols-1 lg:grid-cols-12`).
   - Tabel dan tab horizontal wajib dibungkus kontainer `overflow-x-auto whitespace-nowrap` agar tidak menyebabkan horizontal overflow pada seluruh layar HP.
3. **Ukuran Target Sentuh (Touch Targets)**:
   - Tombol dan icon button di mobile berukuran minimal 36px × 36px untuk kenyamanan tap jari.

---

## 5. Checklist Validasi untuk AI Setiap Kali Melakukan Perubahan

- [ ] Apakah warna latar belakang tetap terang netral (`#f6f6f7`) dan TIDAK berubah ke tema gelap?
- [ ] Apakah sidebar tetap berwarna abu-abu terang (`#f0f0f2`)?
- [ ] Apakah seluruh card menggunakan `rounded-lg border border-gitlab-panelBorder shadow-gitlab`?
- [ ] Apakah menu mobile hamburger dan drawer slide-out tetap berfungsi normal?
- [ ] Apakah `npm run build` berhasil tanpa error TypeScript (`TS6133` unused vars dsb.)?
- [ ] Apakah status di `KANBAN.md` sudah diperbarui sesuai task yang dikerjakan?
