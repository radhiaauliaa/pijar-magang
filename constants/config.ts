// constants/config.ts
export const CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],

  // File Upload
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf"],

  // JWT
  TOKEN_COOKIE_NAME: "mm_token",
  TOKEN_EXPIRY_DAYS: 7,

  // Polling
  NOTIFICATION_POLL_INTERVAL: 30_000, // 30 seconds
  DASHBOARD_POLL_INTERVAL: 60_000,    // 1 minute

  // Absensi
  CHECK_IN_START_HOUR: 7,   // 07:00
  CHECK_IN_END_HOUR: 10,    // 10:00
  LATE_THRESHOLD_HOUR: 8,   // after 08:00 = terlambat

  // WhatsApp
  DEFAULT_WA_NUMBER: process.env.NEXT_PUBLIC_DEFAULT_WA_NUMBER ?? "6289531625962",

  // App
  APP_NAME: "Monitoring Magang",
  APP_DESCRIPTION: "Sistem Monitoring Mahasiswa Magang",
} as const;

export const ABSENSI_STATUS_LABEL: Record<string, string> = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  izin: "Izin",
  sakit: "Sakit",
  alpha: "Alpha",
};

export const JURNAL_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Menunggu Verifikasi",
  verified: "Terverifikasi",
};

export const MAHASISWA_STATUS_LABEL: Record<string, string> = {
  aktif: "Aktif",
  selesai: "Selesai",
  dropout: "Dropout",
};
