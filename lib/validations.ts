// lib/validations.ts 
import { z } from "zod";
import { CONFIG } from "@/constants/config";

// Auth
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Mahasiswa
export const mahasiswaSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").max(100),
  nim: z.string().min(5, "NIM minimal 5 karakter").max(20),
  universitas: z.string().min(2, "Universitas wajib diisi"),
  program_studi: z.string().min(2, "Program studi wajib diisi"),
  email: z.string().email("Email tidak valid"),
  nomor_hp: z
    .string()
    .min(10, "Nomor HP minimal 10 digit")
    .max(15)
    .regex(/^[0-9+\-\s]+$/, "Format nomor HP tidak valid"),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  divisi: z.string().min(1, "Divisi wajib dipilih"),
  cabang: z.string().min(1, "Cabang wajib dipilih"),
  pembimbing: z.string().min(1, "Pembimbing wajib dipilih"),
});

export type MahasiswaFormValues = z.infer<typeof mahasiswaSchema>;

// Divisi
export const divisiSchema = z.object({
  nama_divisi: z.string().min(2, "Nama divisi minimal 2 karakter").max(100),
  kapasitas: z.coerce.number().min(1, "Kapasitas minimal 1").max(1000),
});

export type DivisiFormValues = z.infer<typeof divisiSchema>;

// Cabang / Unit
export const cabangSchema = z.object({
  nama_cabang: z.string().min(2, "Nama unit minimal 2 karakter").max(100),
  kapasitas: z.coerce.number().min(1, "Kapasitas minimal 1").max(1000),
});

export type CabangFormValues = z.infer<typeof cabangSchema>;

// Pembimbing & Admin ULP
export const pembimbingSchema = z.object({
  nama:     z.string().min(2, "Nama minimal 2 karakter").max(100),
  email:    z.string().email("Email tidak valid"),
  nomor_hp: z.string().optional(),
  divisi:   z.string().min(1, "Divisi wajib dipilih"),
  cabang:   z.string().min(1, "Unit wajib dipilih"),
  status:   z.enum(["aktif", "nonaktif"]).default("aktif"),
  role:     z.enum(["pembimbing", "admin_ulp"]).default("pembimbing"),
});

export type PembimbingFormValues = z.infer<typeof pembimbingSchema>;


// Jurnal
const MAX_SIZE = CONFIG.MAX_FILE_SIZE_BYTES;
const ACCEPTED_TYPES = CONFIG.ALLOWED_IMAGE_TYPES;

export const jurnalSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  judul: z.string().min(3, "Judul minimal 3 karakter").max(200),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter").max(5000),
  foto: z
  .any()
  .optional()
  .refine(
    (files) =>
      !files ||
      typeof FileList === "undefined" ||
      files.length === 0 ||
      files[0].size <= MAX_SIZE,
    {
      message: "Ukuran file maksimal 5 MB",
    }
  )
});

export type JurnalFormValues = z.infer<typeof jurnalSchema>;

// Absensi
export const absensiSchema = z.object({
  keterangan: z.string().max(500).optional(),
});

export type AbsensiFormValues = z.infer<typeof absensiSchema>;

// Sanitize
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}
