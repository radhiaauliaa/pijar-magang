// types/index.ts — Centralized type definitions

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth
export type Role = "admin" | "admin_ulp" | "pembimbing" | "mahasiswa";
export type UserStatus = "aktif" | "nonaktif";
export type MahasiswaRegistrasiStatus = "belum_daftar" | "menunggu" | "aktif" | "ditolak" | "selesai";


export interface User {
  id: string;
  nama: string;
  email: string;
  role: Role;
  status: UserStatus;
  foto_profil?: string;
  divisi?: string;
  divisi_nama?: string;
  cabang?: string;
  program_studi?: string;
  mahasiswa_status?: MahasiswaRegistrasiStatus;
}


export interface AuthPayload {
  user: User;
  token: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DaftarAkunRequest {
  nama: string;
  email: string;
  password: string;
  nomor_hp: string;
  via_google?: boolean;
  google_id?: string;
}

/** @deprecated Gunakan DaftarAkunRequest */
export interface RegisterAkunRequest extends DaftarAkunRequest { }

export interface DaftarMagangRequest {
  // data mahasiswa
  nim: string;
  universitas: string;
  program_studi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  surat_ajuan: string;
  cv: string;
  proposal: string;
}

/** @deprecated */
export interface RegisterMahasiswaRequest extends DaftarMagangRequest { }

export interface AktivasiPembimbingRequest {
  email: string;
  password: string;
  konfirmasi_password: string;
}

export type RegistrasiStatus = "pending" | "approved" | "rejected";

export type LamaranStatus = "menunggu" | "diterima" | "ditolak";

export interface Lamaran {
  id: string;
  user_id: string;
  nama: string;
  email: string;
  nomor_hp?: string;
  nim: string;
  universitas: string;
  program_studi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  surat_ajuan_url: string;
  surat_penerimaan_url?: string;
  cv_url?: string;
  proposal_url?: string;
  status: LamaranStatus;
  created_at: string;
  alasan_tolak?: string;
}

export interface ApproveLamaranRequest {
  id: string;
  divisi: string;
  cabang: string;
  pembimbing: string;
  surat_penerimaan?: File | string;
}

export interface RejectLamaranRequest {
  id: string;
  alasan?: string;
}

export interface LamaranFilter extends PaginationParams {
  status?: LamaranStatus | "";
}


// Mahasiswa
export type MahasiswaStatus = "aktif" | "selesai" | "dropout";

export interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  universitas: string;
  program_studi: string;
  email: string;
  nomor_hp: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  divisi: string;
  cabang: string;
  pembimbing: string;
  status: MahasiswaStatus;
}

export interface CreateMahasiswaRequest {
  nama: string;
  nim: string;
  universitas: string;
  program_studi: string;
  email: string;
  nomor_hp: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  divisi: string;
  cabang: string;
  pembimbing: string;
}

export interface UpdateMahasiswaRequest extends Partial<CreateMahasiswaRequest> {
  status?: MahasiswaStatus;
}

// Divisi
export interface Divisi {
  id: string;
  nama_divisi: string;
  kapasitas: number;
  jumlah_mahasiswa: number;
  cabang?: string;
}

export interface CreateDivisiRequest {
  nama_divisi: string;
  kapasitas: number;
  cabang?: string;
}

// Cabang
export interface Cabang {
  id: string;
  nama_cabang: string;
  kapasitas: number;
  jumlah_mahasiswa: number;
}

export interface CreateCabangRequest {
  nama_cabang: string;
  kapasitas: number;
}

// Pembimbing
export interface Pembimbing {
  id: string;
  nama: string;
  email: string;
  divisi: string;
  cabang: string;
  status: UserStatus;
  jumlah_mahasiswa: number;
  role?: Role | string;
}

export interface CreatePembimbingRequest {
  nama: string;
  email: string;
  nomor_hp?: string;
  divisi: string;
  cabang: string;
  status?: UserStatus;
  role?: Role | string;
}

export interface CreatePembimbingResponse extends Pembimbing {
  temp_password?: string;
}

export interface UpdatePembimbingRequest extends Partial<CreatePembimbingRequest> {
  password?: string;
  status?: UserStatus;
}

export interface PembimbingFilter extends PaginationParams {
  search?: string;
  status?: UserStatus;
  role?: string;
}

// Jurnal
export type JurnalStatus = "draft" | "submitted" | "verified";

export interface Jurnal {
  id: string;
  mahasiswa_id: string;
  mahasiswa_nama?: string;
  mahasiswa_universitas?: string;
  tanggal: string;
  judul: string;
  deskripsi: string;
  foto: string; // Google Drive URL
  status: JurnalStatus;
  created_at: string;
}

export interface CreateJurnalRequest {
  tanggal: string;
  judul: string;
  deskripsi: string;
  foto?: File;
}

export interface UpdateJurnalRequest extends Partial<Omit<CreateJurnalRequest, "foto">> {
  foto?: File;
}

// Kehadiran / Absensi
export type AbsensiStatus = "hadir" | "terlambat" | "izin" | "sakit" | "alpha";
export type JenisIzin = "Izin Sehari" | "Izin Setengah Hari" | "Sakit";

export interface Kehadiran {
  id: string;
  mahasiswa_id: string;
  mahasiswa_nama?: string;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  status: AbsensiStatus;
  keterangan: string;
  foto_masuk?: string;
  foto_pulang?: string;
  jenis_izin?: string;
  dokumen_izin?: string;
}

export interface CheckInRequest {
  keterangan?: string;
  foto?: string;
}

export interface CheckOutRequest {
  keterangan?: string;
  foto?: string;
}

export interface AjukanIzinRequest {
  jenis_izin: JenisIzin;
  keterangan: string;
  dokumen?: string;
}

export interface ChangePasswordRequest {
  password_lama: string;
  password_baru: string;
  konfirmasi_password: string;
}

export interface UpdateProfileRequest {
  nama?: string;
  foto_profil?: string;
}


// Log Aktivitas
export interface LogAktivitas {
  id: string;
  user: string;
  aktivitas: string;
  tanggal: string;
}

// Dashboard Stats
export interface AdminStats {
  total_mahasiswa: number;
  total_lamaran: number;
  lamaran_menunggu: number;
  total_cabang: number;
  total_pembimbing?: number;
  mahasiswa_aktif: number;
  mahasiswa_selesai: number;
}


export interface PembimbingStats {
  jumlah_mahasiswa: number;
  mahasiswa_aktif: number;
  mahasiswa_selesai: number;
  total_jurnal: number;
  jurnal_pending: number;
}

export interface MahasiswaStats {
  progress_magang: number; // percentage
  total_jurnal: number;
  total_hadir: number;
  sisa_hari: number;
  divisi?: string;
  cabang?: string;
  pembimbing_nama?: string;
}

// Filter & Query
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface MahasiswaFilter extends PaginationParams {
  search?: string;
  universitas?: string;
  divisi?: string;
  cabang?: string;
  status?: MahasiswaStatus;
}

export interface JurnalFilter extends PaginationParams {
  search?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  universitas?: string;
  divisi?: string;
  cabang?: string;
  status?: JurnalStatus;
  mahasiswa_id?: string;
}

export interface AbsensiFilter extends PaginationParams {
  mahasiswa_id?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status?: AbsensiStatus;
}

export interface Notification {
  id: string;
  type: "jurnal_submitted" | "jurnal_verified" | "absensi" | "info" | "otp" | "lamaran" | "reminder" | "status" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
