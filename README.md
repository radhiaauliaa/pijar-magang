# PIJAR – Platform Monitoring Magang PT PLN (Persero) UP3 Padang

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-Serverless-4285F4?style=for-the-badge&logo=google&logoColor=white)

**PIJAR (Platform Informasi & Jurnal Absensi Rekapitulasi)** adalah sistem aplikasi web modern berstandar enterprise yang dirancang khusus untuk mengelola, memantau, dan me-rekapitulasi seluruh kegiatan mahasiswa magang di **PT PLN (Persero) UP3 Padang** serta Unit Layanan Pelanggan (ULP) di bawah naungannya.

---

## Daftar Isi

- [Fitur Utama & Peran Pengguna (RBAC)](#fitur-utama--peran-pengguna-rbac)
- [Teknologi & Tools Yang Digunakan](#teknologi--tools-yang-digunakan)
- [Struktur Arsitektur & Direktori Proyek](#struktur-arsitektur--direktori-proyek)
- [Panduan Instalasi & Jalankan Lokal](#panduan-instalasi--jalankan-lokal)
- [Konfigurasi Backend Google Apps Script (GAS)](#konfigurasi-backend-google-apps-script-gas)
- [Daftar Akun Pengujian (Testing Accounts)](#daftar-akun-pengujian-testing-accounts)

---

## Fitur Utama & Peran Pengguna (RBAC)

Sistem PIJAR menerapkan **Role-Based Access Control (RBAC)** ketat yang membagi wewenang menjadi 4 peran utama:

### 1. Mahasiswa Magang (`role: mahasiswa`)
- **Pendaftaran Magang Online:** Mengisi data diri, NIM, Universitas, Program Studi, Periode Magang, serta mengunggah berkas wajib:
  - **Surat Ajuan / Pengantar Kampus** (PDF)
  - **CV / Resume** (PDF/Word)
  - **Proposal Magang** (PDF)
- **Absensi Selfie Digital Real-Time:** 
  - Presensi Masuk (Check-in) & Keluar (Check-out) menggunakan kamera webcam / selfie smartphone.
  - Penilaian keterlambatan otomatis berdasarkan batas jam masuk kerja.
  - Pengajuan Izin / Sakit disertai unggahan Surat Dokter/Lampiran Bukti.
- **Jurnal Kegiatan Harian:** 
  - Catat judul kegiatan, deskripsi pekerjaan, serta lampiran foto dokumentasi kegiatan harian.
  - Export Laporan Jurnal ke format **PDF**.
- **Monitoring Status Real-Time:** Halaman status interaktif (`/menunggu-verifikasi`, `/pendaftaran-ditolak`, `/mahasiswa`).

### 2. Pembimbing / Supervisor (`role: pembimbing`)
- **Isolasi Mahasiswa per Divisi:** Pembimbing HANYA dapat melihat dan memantau mahasiswa yang ditempatkan pada divisi & cabang miliknya (misal: Pembimbing Divisi TEL tidak akan melihat jurnal/absensi mahasiswa Divisi Perencanaan).
- **Verifikasi Jurnal Harian:** Meninjau, membaca, dan memberikan verifikasi terverifikasi pada jurnal mahasiswa binaan.
- **Rekap Absensi Bulanan:** Melihat matriks kehadiran mahasiswa harian (Hadir, Terlambat, Izin/Sakit, Alpha).

### 3. Admin ULP / Unit Layanan Pelanggan (`role: admin_ulp`)
- **Pengelolaan Mahasiswa Transferan:** Mengelola mahasiswa magang yang dialihkan ke cabang ULP akibat kapasitas kantor UP3 penuh.
- **Penempatan Pembimbing & Divisi Lokal:** Menentukan pembimbing dan divisi tempat mahasiswa bertugas di ULP tersebut.
- **Monitoring Absensi & Jurnal ULP:** Rekapitulasi absensi dan jurnal khusus mahasiswa di lingkup cabang ULP terkait.
- **Hak Akses Terbatas:** Disembunyikan dari fitur penerimaan lamaran baru, kelola cabang, dan log aktivitas global.

### 4. Admin Utama UP3 Padang (`role: admin`)
- **Manajemen Lamaran Masuk:** Meninjau berkas pendaftaran (Surat Ajuan, CV, Proposal Magang PDF), menyetujui (Approve) atau menolak (Reject) calon mahasiswa.
- **Penempatan Dinamis & Terfilter:** Saat menyetujui lamaran, dropdown pilihan Pembimbing otomatis ter-filter secara presisi berdasarkan **Divisi** dan **Cabang** yang dipilih.
- **Manajemen User (Pembimbing & Admin ULP):** Membuat akun baru untuk Pembimbing dan Admin ULP dengan *temporary password* otomatis yang siap disalin ke WhatsApp/Email.
- **Kelola Divisi & Cabang:** Pengaturan kapasitas maksimum mahasiswa di UP3 Padang maupun Cabang ULP.
- **Export Data Matriks:** Export daftar hadir seluruh mahasiswa ke format **Excel / CSV** matriks bulanan.
- **Log Aktivitas Sistem:** Audit trail rekam jejak seluruh aksi pengguna di dalam aplikasi.

---

## Teknologi & Tools Yang Digunakan

### Frontend Framework & Core UI
- **[Next.js 15.3.3 (App Router)](https://nextjs.org/):** Framework React tingkat lanjut dengan Server-Side Rendering (SSR) & API Routes.
- **[React 19.0.0](https://react.dev/):** Library UI deklaratif berbasis komponen terkini.
- **[TypeScript 5.0](https://www.typescriptlang.org/):** Pengetikan kode statis untuk keandalan dan keamanan data.
- **[Tailwind CSS 3.4](https://tailwindcss.com/):** Utility-first CSS framework untuk styling responsif & modern.
- **[Radix UI Primitives](https://www.radix-ui.com/):** Komponen UI headless yang mudah diakses (*Dialog, Select, Popover, Dropdown, Tabs, Toast, ScrollArea*).
- **[Lucide React](https://lucide.dev/):** Library ikon vektor bersih dan modern.

### State Management & Data Fetching
- **[TanStack React Query v5](https://tanstack.com/query/latest):** Manajemen async state, caching, & revalidation otomatis.
- **[Axios](https://axios-http.com/):** HTTP Client dengan Request & Response Interceptors.
- **[React Hook Form](https://react-hook-form.com/):** Pengelolaan formulir efisien tanpa re-render berlebihan.
- **[Zod 3.24](https://zod.dev/):** Skema validasi data formulir dan tipe data runtime.

### Backend, Database & External Services
- **[Google Apps Script (GAS)](https://developers.google.com/apps-script):** Serverless Backend Engine gratis dan andal.
- **[Google Sheets API (Database)](https://www.google.com/sheets/about/):** NoSQL-like Relational Spreadsheet (*Users, Mahasiswa, Pembimbing, Divisi, Cabang, Lamaran, Jurnal, Absensi, Log Aktivitas*).
- **[Google Drive API (Cloud Storage):](https://www.google.com/drive/)** Penyimpanan berkas PDF Surat Ajuan, CV, Proposal Magang, Foto Jurnal, dan Foto Profil Avatar.
- **[Nodemailer / GAS MailApp:](https://nodemailer.com/)** Layanan pengiriman notifikasi email konfirmasi & OTP.
- **[JWT (JSON Web Token):](https://jwt.io/)** Autentikasi sesi berbasis token aman.

---

## Struktur Arsitektur & Direktori Proyek

```text
monitoring-magang/
├── app/                                # Next.js App Router (Halaman, Layouts, & API Routes)
│   ├── (auth)/                         # Group Halaman Autentikasi Split-Screen
│   │   ├── aktivasi/
│   │   │   └── page.tsx                # Halaman Form Aktivasi Password Pembimbing
│   │   ├── daftar/
│   │   │   ├── magang/
│   │   │   │   └── page.tsx            # Form Pendaftaran Magang (Surat Ajuan, CV, Proposal)
│   │   │   └── page.tsx                # Halaman Pilih Jenis Pendaftaran
│   │   ├── login/
│   │   │   └── page.tsx                # Halaman Form Login dengan Live Role Detection
│   │   ├── menunggu-verifikasi/
│   │   │   └── page.tsx                # Halaman Status Berhasil / Menunggu Verifikasi Admin
│   │   ├── pendaftaran-ditolak/
│   │   │   └── page.tsx                # Halaman Status Pendaftaran Ditolak
│   │   └── layout.tsx                  # Layout Split-Screen Auth (100vh Fixed Left Panel)
│   ├── (dashboard)/                    # Group Halaman Internal Dashboard (Protected Routes)
│   │   ├── admin/                      # Dashboard & Fitur Admin Utama UP3 Padang
│   │   │   ├── absensi/
│   │   │   │   └── page.tsx            # Rekapitulasi Matriks Absensi Bulanan & Export CSV
│   │   │   ├── cabang/
│   │   │   │   └── page.tsx            # Kelola Data Cabang UP3 Padang & ULP
│   │   │   ├── divisi/
│   │   │   │   └── page.tsx            # Kelola Data Divisi & Kapasitas Kuota Magang
│   │   │   ├── jurnal/
│   │   │   │   └── page.tsx            # Pemantauan & Verifikasi Jurnal Mahasiswa
│   │   │   ├── lamaran/
│   │   │   │   └── page.tsx            # Review Berkas (Surat, CV, Proposal PDF) & Approve/Reject
│   │   │   ├── log/
│   │   │   │   └── page.tsx            # Log Aktivitas System Audit Trail
│   │   │   ├── mahasiswa/
│   │   │   │   └── page.tsx            # Kelola Penempatan & Pembimbing Mahasiswa Magang
│   │   │   ├── pembimbing/
│   │   │   │   └── page.tsx            # Kelola Akun Pembimbing Lapangan
│   │   │   ├── ulp/
│   │   │   │   └── page.tsx            # Kelola Akun Penanggung Jawab Admin ULP per Cabang
│   │   │   └── page.tsx                # Dashboard Statistik & Grafis Admin UP3
│   │   ├── mahasiswa/                  # Dashboard & Fitur Mahasiswa Magang
│   │   │   ├── absensi/
│   │   │   │   └── page.tsx            # Presensi Selfie Digital (Check-In / Check-Out / Izin)
│   │   │   ├── jurnal/
│   │   │   │   └── page.tsx            # Catat Jurnal Harian & PDF Laporan Export
│   │   │   └── page.tsx                # Dashboard Progress & Status Mahasiswa
│   │   ├── pembimbing/                 # Dashboard & Fitur Pembimbing / Supervisor
│   │   │   ├── absensi/
│   │   │   │   └── page.tsx            # Rekap Absensi Mahasiswa Binaan Ter-Isolasi Divisi
│   │   │   ├── jurnal/
│   │   │   │   └── page.tsx            # Verifikasi Jurnal Mahasiswa Binaan Ter-Isolasi Divisi
│   │   │   ├── mahasiswa/
│   │   │   │   └── page.tsx            # Daftar Mahasiswa Binaan
│   │   │   └── page.tsx                # Dashboard Ringkasan Pembimbing
│   │   └── layout.tsx                  # Layout Dashboard Shared (Sidebar, Header, Profile Modal)
│   ├── api/                            # Server-Side API Proxy & Microservices Routes
│   │   ├── auth/
│   │   │   └── check-role/
│   │   │       └── route.ts            # API Real-time Database User Role Lookup
│   │   ├── cron/
│   │   │   └── sync/
│   │   │       └── route.ts            # Cron Job Synchronization Service
│   │   ├── drive-image/
│   │   │   └── route.ts                # Proxy Reader Image Google Drive Base64
│   │   ├── email/
│   │   │   └── route.ts                # Nodemailer Email Notification Gateway
│   │   ├── notifications/
│   │   │   └── route.ts                # Internal Push Notification Service
│   │   ├── otp/
│   │   │   ├── send/
│   │   │   │   └── route.ts            # API Generator & Pengirim OTP Email
│   │   │   └── verify/
│   │   │       └── route.ts            # API Verifikator Kode OTP User
│   │   ├── proxy/
│   │   │   └── route.ts                # Proxy Gateway to Google Apps Script Web App
│   │   └── universitas/
│   │       └── route.ts                # Autocomplete Data Perguruan Tinggi Indonesia
│   ├── fitur/
│   │   └── page.tsx                    # Halaman Informasi Fitur Aplikasi
│   ├── tentang/
│   │   └── page.tsx                    # Halaman Informasi Tentang Program Magang PLN
│   ├── globals.css                     # Global CSS Styling (Tailwind Custom Tokens & Utilities)
│   ├── layout.tsx                      # Root Layout Next.js (Font Inter, Providers, Toaster)
│   └── page.tsx                        # Halaman Utama (Landing Page PIJAR PLN UP3 Padang)
├── components/                         # Komponen Reusable UI & Layout Shared
│   ├── layout/
│   │   ├── Header.tsx                  # Navigation Header Bar & User Profile Trigger
│   │   └── Sidebar.tsx                 # Dynamic Role-Based Access Navigation Sidebar
│   ├── shared/
│   │   ├── DataTable.tsx               # Komponen Data Table Paginated & Searchable
│   │   ├── EmptyState.tsx              # Display Placeholder State Data Kosong
│   │   ├── LoadingSpinner.tsx          # Indicator Loading State & Skeleton
│   │   ├── PageHeader.tsx              # Standardized Page Title & Action Bar
│   │   ├── ProfileModal.tsx            # Modal Ubah Nama, Foto Profil, & Password User
│   │   ├── StatCard.tsx                # Widget Card Statistik Analytic Metrics
│   │   └── StatusBadge.tsx             # Visual Color Badge Status (Aktif, Menunggu, Selesai)
│   └── ui/                             # Primitive Design System Components (Radix UI)
│       ├── avatar.tsx                  # Radix Avatar Component
│       ├── badge.tsx                   # Radix Badge Component
│       ├── button.tsx                  # Radix Button Variant Component
│       ├── card.tsx                    # Radix Card Layout Component
│       ├── dialog.tsx                  # Radix Modal Dialog Component
│       ├── dropdown-menu.tsx           # Radix Dropdown Action Menu
│       ├── input.tsx                   # Form Input Element
│       ├── label.tsx                   # Form Label Element
│       ├── progress.tsx                # Radix Progress Bar Component
│       ├── scroll-area.tsx             # Radix Custom Scrollbar Container
│       ├── select.tsx                  # Radix Select Dropdown Element
│       ├── separator.tsx               # Visual Divider Line
│       ├── skeleton.tsx                # Loading Skeleton Shimmer Component
│       ├── tabs.tsx                    # Radix Tab Navigation Component
│       └── textarea.tsx                # Form Textarea Element
├── constants/                          # System Constant Configurations
│   ├── config.ts                       # Global App Config, Limits, & Allowed File Types
│   └── routes.ts                       # Navigation Route Path Declarations
├── features/                           # Component Views & Business Logic per Feature Domain
│   ├── absensi/
│   │   └── components/
│   │       ├── AbsensiAdminPage.tsx    # Rekapitulasi Matriks Absensi Bulanan Admin
│   │       └── AbsensiMahasiswaPage.tsx# Presensi Selfie Webcam Real-time & Izin Mahasiswa
│   ├── admin/
│   │   └── components/
│   │       ├── AdminDashboard.tsx      # Analytic Metric Charts & Overview Admin
│   │       ├── AdminUlpPage.tsx        # Pendaftaran & Kelola Akun Admin ULP per Cabang
│   │       └── LamaranPage.tsx         # Modal Peninjauan Dokumen (CV/Proposal PDF) & Approval
│   ├── auth/
│   │   └── components/
│   │       ├── AktivasiForm.tsx        # Form Set Password Pertama Akun Pembimbing
│   │       ├── DaftarAkunForm.tsx      # Form Buat Akun Mahasiswa Baru
│   │       ├── DaftarMagangForm.tsx    # Form Pendaftaran Magang (Surat, CV, Proposal)
│   │       ├── LoginForm.tsx           # Form Login & Real-Time Role Detector
│   │       ├── OTPVerificationModal.tsx# Modal Verifikasi 6 Digit OTP Email
│   │       └── RegisterForm.tsx        # Multi-Step Registration Form
│   ├── cabang/
│   │   └── components/
│   │       └── CabangPage.tsx          # Form & Tabel Kelola Cabang UP3 / ULP
│   ├── divisi/
│   │   └── components/
│   │       └── DivisiPage.tsx          # Form & Tabel Kelola Divisi & Kapasitas Kuota
│   ├── jurnal/
│   │   └── components/
│   │       ├── JurnalAdminPage.tsx     # View & Verifikasi Jurnal Mahasiswa Admin
│   │       ├── JurnalForm.tsx          # Form Tambah/Edit Jurnal & Upload Foto Dokumentasi
│   │       └── JurnalMahasiswaPage.tsx # View Jurnal Harian Mahasiswa & Export PDF
│   ├── landing/
│   │   └── components/
│   │       ├── FiturPage.tsx           # Halaman Detail Fitur-Fitur Aplikasi PIJAR
│   │       ├── LandingPage.tsx         # Landing Page Utama (Hero, Alur, FAQ)
│   │       └── TentangPage.tsx         # Halaman Informasi Program Magang PLN UP3 Padang
│   ├── log/
│   │   └── components/
│   │       └── LogPage.tsx             # Table Audit Trail Log Aktivitas Pengguna
│   ├── mahasiswa/
│   │   └── components/
│   │       ├── MahasiswaDashboard.tsx  # Dashboard Mahasiswa Overview
│   │       ├── MahasiswaForm.tsx       # Form Modal Edit Data Mahasiswa
│   │       └── MahasiswaPage.tsx       # Tabel Kelola Mahasiswa & Penempatan Supervisor
│   └── pembimbing/
│       └── components/
│           ├── PembimbingDashboard.tsx # Dashboard Overview Pembimbing
│           └── PembimbingPage.tsx      # Form & Tabel Kelola Pembimbing Lapangan
├── google-apps-script/                 # Google Apps Script Serverless Backend Engines (.gs)
│   ├── AbsensiService.gs               # Logic Check-In/Check-Out Selfie & Matriks Absensi
│   ├── ActivityLogger.gs               # Service Catat Audit Trail Log Aktivitas
│   ├── AuthService.gs                  # Authentication Engine, JWT Sign/Verify, & CheckRole
│   ├── CabangService.gs                # CRUD Data Cabang UP3 / ULP
│   ├── Code.gs                         # Main API Gateway Router (doGet, doPost, doOptions)
│   ├── DashboardService.gs             # Service Agregasi Analytic Metric & Stats
│   ├── DivisiCabangService.gs          # CRUD & Check Capacity Divisi
│   ├── DrivePDFService.gs              # Service Integration Google Drive & PDF Generator
│   ├── EmailService.gs                 # Service Pengiriman Email via MailApp API
│   ├── Hash.gs                         # Security Password Hashing & Verification (SHA-256)
│   ├── JWT.gs                          # JSON Web Token Encoder & Decoder Engine
│   ├── JurnalAbsensiService.gs         # Service Query & Process Jurnal Harian
│   ├── LamaranService.gs               # Service Submit, Approve, & Reject Lamaran Magang
│   ├── MahasiswaService.gs             # Service Management Data Mahasiswa Magang
│   ├── PembimbingService.gs            # Service Management User Pembimbing & Admin ULP
│   ├── RateLimiter.gs                  # Security Service Protection Rate Limiting Requests
│   ├── Setup.gs                        # Script Auto-create Database Sheets & Table Schema
│   ├── SpreadsheetRepo.gs              # Data Access Layer (ORM-like CRUD untuk Google Sheets)
│   ├── Utils.gs                        # Helper Functions Format Date, Responses, & IDs
│   └── appsscript.json                 # Manifest Configuration File Google Apps Script Project
├── hooks/                              # Custom React Hooks Modules
│   ├── useAuth.ts                      # Custom Hook Auth Login, Register, & Logout
│   ├── useDebounce.ts                  # Custom Hook Debouncing Input Query
│   ├── useGoogleSignIn.ts              # Custom Hook Google OAuth 2.0 Integration
│   └── usePagination.ts                # Custom Hook Table Pagination Control
├── lib/                                # Utilities & Shared Infrastructure Helpers
│   ├── auth.ts                         # Client-Side Token Storage (Cookie/LocalStorage)
│   ├── AuthBackContext.tsx             # Context Provider Custom Back Button Behavior
│   ├── email-templates.ts              # HTML Templates Email Notifikasi & Konfirmasi
│   ├── mailer.ts                       # Server-Side Nodemailer Transport Gateway
│   ├── notifications-store.ts          # State Store Push Notifications
│   ├── otp-store.ts                    # In-Memory Cache Code OTP Verifikasi
│   ├── queryClient.ts                  # TanStack React Query Client Global Instance
│   ├── universities.ts                 # Master Data Autocomplete Perguruan Tinggi Indonesia
│   ├── utils.ts                        # Helper Class Merging (cn), Date Formatter, Base64
│   └── validations.ts                  # Schema Validasi Form Zod (Auth, Mhs, Divisi, Jurnal)
├── services/                           # Client Service API Layer Calls (Axios API Proxy)
│   ├── absensi.service.ts              # API Calls Endpoint Absensi & Export
│   ├── api.ts                          # Axios Instance with Request/Response Interceptors
│   ├── auth.service.ts                 # API Calls Endpoint Auth, Login, & Profile
│   ├── cabang.service.ts               # API Calls Endpoint Management Cabang
│   ├── dashboard.service.ts            # API Calls Endpoint Analytic Metric Stats
│   ├── divisi.service.ts               # API Calls Endpoint Management Divisi
│   ├── jurnal.service.ts               # API Calls Endpoint Jurnal & PDF Laporan
│   ├── lamaran.service.ts              # API Calls Endpoint Review & Approval Lamaran
│   ├── mahasiswa.service.ts            # API Calls Endpoint Data Mahasiswa Magang
│   └── pembimbing.service.ts           # API Calls Endpoint Management Pembimbing & Admin ULP
├── types/                              # TypeScript Interface & Type Definitions
│   └── index.ts                        # Global Types (User, Role, Mahasiswa, Jurnal, Absensi)
├── .env.local                          # Environment Variables File (API URL Configuration)
├── .eslintrc.json                      # ESLint Configuration File
├── .gitignore                          # Git Exclude Pattern Definitions
├── components.json                     # Shadcn / Radix UI Component Configuration File
├── next.config.mjs                     # Next.js Server Framework Configuration
├── package.json                        # Project Metadata, Scripts, & Package Dependencies
├── postcss.config.mjs                  # PostCSS & Tailwind Plugin Config
├── README.md                           # Master Technical System Documentation File
├── tailwind.config.ts                  # Tailwind CSS Design System, Palette, & Animations
└── tsconfig.json                       # TypeScript Compiler Configuration Settings
```

---

## Panduan Instalasi & Jalankan Lokal

### 1. Prerequisites (Prasyarat)
Pastikan perangkat komputer Anda sudah terinstal:
- **Node.js:** v18.0.0 atau versi lebih baru.
- **npm:** v9.0.0 atau **pnpm** / **yarn**.

### 2. Clone Repository & Install Dependencies
```bash
# Clone repository
git clone https://github.com/username/monitoring-magang.git

# Masuk ke direktori proyek
cd monitoring-magang

# Install seluruh dependensi
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat berkas `.env.local` pada root direktori proyek dan isikan variabel berikut:

```env
# URL Google Apps Script Web App Deployment
NEXT_PUBLIC_API_URL="https://script.google.com/macros/s/AKfycbx.../exec"

# URL Aplikasi Lokal
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser dan akses alamat: `http://localhost:3000`

### 5. Pemeriksaan Tipe & Build Production
```bash
# Jalankan verifikasi TypeScript
npm run type-check

# Build proyek untuk produksi
npm run build

# Jalankan server produksi
npm run start
```

---

## Konfigurasi Backend Google Apps Script (GAS)

Backend aplikasi ini menggunakan **Google Apps Script** gratis tanpa biaya server (*Serverless Architecture*).

1. Buat **Google Spreadsheet** baru di Google Drive Anda.
2. Buka **Extensions ➔ Apps Script**.
3. Salin seluruh berkas dari direktori `google-apps-script/` di proyek ini (`Code.gs`, `AuthService.gs`, `Setup.gs`, dll) ke editor Apps Script.
4. Jalankan fungsi `setupDatabase()` pada berkas `Setup.gs` satu kali untuk membuat seluruh tabel/sheet database secara otomatis.
5. Klik **Deploy ➔ New Deployment**:
   - Select Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin **Web App URL** yang dihasilkan dan tempelkan ke variabel `NEXT_PUBLIC_API_URL` di berkas `.env.local`.

---

## Daftar Akun Pengujian (Testing Accounts)

Untuk mempermudah pengujian seluruh fitur dan alur kerja aplikasi, Anda dapat menggunakan akun terdaftar di bawah ini:

| Peran (Role) | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin Utama UP3** | `magangplnup3pdg@gmail.com` | *(Password Admin)* | Akses penuh ke seluruh sistem & lamaran |
| **Admin ULP Cabang** | `archivepage00@gmail.com` | *(Password ULP)* | Kelola mahasiswa & pembimbing ULP |
| **Pembimbing / Supervisor** | `nanda@gmail.com` | *(Password Pembimbing)* | Verifikasi jurnal & absensi divisi |
| **Pembimbing / Supervisor** | `panjul@gmail.com` | *(Password Pembimbing)* | Verifikasi jurnal & absensi divisi |
| **Mahasiswa Magang** | `radhiaaulia993@gmail.com` | *(Password Mahasiswa)* | Akses absensi selfie & jurnal harian |
| **Mahasiswa Magang** | `radhiaulian@gmail.com` | *(Password Mahasiswa)* | Akses absensi selfie & jurnal harian |

> **Tips:** Sistem dilengkapi fitur **Live Role Detection** pada form login. Saat Anda mengetikkan email di atas, indikator role akan secara otomatis menyorot status role pengguna secara *real-time* dari database!

---

© 2026 **PT PLN (Persero) UP3 Padang** — *PIJAR Internship Management Platform*. All rights reserved.
