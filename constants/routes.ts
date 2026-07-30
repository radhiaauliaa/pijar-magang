// constants/routes.ts

export const ROUTES = {
  // Public
  LOGIN: "/login",

  // Admin
  ADMIN: {
    DASHBOARD: "/admin",
    MAHASISWA: "/admin/mahasiswa",
    MAHASISWA_NEW: "/admin/mahasiswa/new",
    MAHASISWA_EDIT: (id: string) => `/admin/mahasiswa/${id}/edit`,
    DIVISI: "/admin/divisi",
    CABANG: "/admin/cabang",
    PEMBIMBING: "/admin/pembimbing",
    JURNAL: "/admin/jurnal",
    ABSENSI: "/admin/absensi",
    LOG: "/admin/log",
  },

  // Pembimbing
  PEMBIMBING: {
    DASHBOARD: "/pembimbing",
    MAHASISWA: "/pembimbing/mahasiswa",
    MAHASISWA_DETAIL: (id: string) => `/pembimbing/mahasiswa/${id}`,
    JURNAL: "/pembimbing/jurnal",
    JURNAL_DETAIL: (id: string) => `/pembimbing/jurnal/${id}`,
    ABSENSI: "/pembimbing/absensi",
  },

  // Mahasiswa
  MAHASISWA: {
    DASHBOARD: "/mahasiswa",
    JURNAL: "/mahasiswa/jurnal",
    JURNAL_NEW: "/mahasiswa/jurnal/new",
    JURNAL_EDIT: (id: string) => `/mahasiswa/jurnal/${id}/edit`,
    ABSENSI: "/mahasiswa/absensi",
  },
} as const;

export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  admin: ROUTES.ADMIN.DASHBOARD,
  admin_ulp: ROUTES.ADMIN.DASHBOARD,
  pembimbing: ROUTES.PEMBIMBING.DASHBOARD,
  mahasiswa: ROUTES.MAHASISWA.DASHBOARD,
};

export const PROTECTED_ROUTES = {
  admin: ["/admin"],
  admin_ulp: ["/admin"],
  pembimbing: ["/pembimbing"],
  mahasiswa: ["/mahasiswa"],
} as const;
