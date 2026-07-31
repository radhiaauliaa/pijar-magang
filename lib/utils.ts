// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { id } from "date-fns/locale";

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format date to Indonesian locale */
export function formatDate(date: string | Date | undefined | null, fmt = "dd MMMM yyyy"): string {
  if (!date) return "-";
  try {
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else {
      const str = String(date).trim();
      const parsedIso = parseISO(str);
      if (isValid(parsedIso)) {
        d = parsedIso;
      } else {
        d = new Date(str);
      }
    }
    if (!isValid(d)) return "-";
    return format(d, fmt, { locale: id });
  } catch {
    return "-";
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd MMM yyyy, HH:mm");
}

export function formatTime(time?: string | Date | null): string {
  const str = String(time).trim();
  if (!str || str === "-" || str === "00:00" || str === "00:00:00") return "—";

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    return str.substring(0, 5);
  }

  const timeMatch = str.match(/(\d{2}:\d{2}(:\d{2})?)/);
  if (timeMatch) {
    return timeMatch[1].substring(0, 5);
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${hours}:${mins}`;
    }
  } catch {}

  return str;
}

/** Calculate internship progress percentage */
export function calcProgress(start: string, end: string): number {
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const now = new Date();
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    const total = differenceInDays(endDate, startDate);
    const elapsed = differenceInDays(now, startDate);
    return Math.round((elapsed / total) * 100);
  } catch {
    return 0;
  }
}

/** Format bytes to human readable */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/** Helper generator for WhatsApp direct notification link (clean text without garbled emojis) */
export function getWhatsAppNotificationLink(options: {
  nomorHp?: string;
  nama: string;
  type: "diterima" | "ditolak" | "update_penempatan";
  unitName: string;
  divisiName?: string;
  pembimbingName?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  alasanTolak?: string;
}): string {
  let rawHp = String(options.nomorHp || "").replace(/[^0-9]/g, "");
  if (!rawHp) rawHp = "6282170366479";
  if (rawHp.startsWith("0")) rawHp = "62" + rawHp.substring(1);
  if (!rawHp.startsWith("62")) rawHp = "62" + rawHp;

  let text = "";
  if (options.type === "diterima") {
    text = `*PEMBERITAHUAN PENERIMAAN MAGANG PLN UP3 PADANG*\n\n` +
      `Selamat! Lamaran Magang atas nama *${options.nama}* di PT PLN (Persero) telah *DITERIMA*.\n\n` +
      `*Detail Penempatan*:\n` +
      `• Unit: *${options.unitName}*\n` +
      `• Divisi: *${options.divisiName || "Akan Ditentukan"}*\n` +
      `• Pembimbing: *${options.pembimbingName || "Akan Ditentukan"}*\n` +
      `• Periode: ${formatDate(options.tanggalMulai)} s/d ${formatDate(options.tanggalSelesai)}\n\n` +
      `*Silakan cek Email Anda atau login ke platform PIJAR untuk mengunduh Surat Balasan Resmi Penerimaan Magang Anda.*\n\n` +
      `Terima kasih!`;
  } else if (options.type === "update_penempatan") {
    text = `*UPDATE PENEMPATAN MAGANG PLN UP3 PADANG*\n\n` +
      `Halo Kak *${options.nama}*,\n` +
      `Informasi penempatan divisi dan pembimbing magang Anda di *${options.unitName}* telah resmi diperbarui.\n\n` +
      `*Detail Penempatan Terbaru*:\n` +
      `• Unit Penempatan: *${options.unitName}*\n` +
      `• Divisi: *${options.divisiName || "Belum Ditentukan"}*\n` +
      `• Pembimbing Lapangan: *${options.pembimbingName || "Belum Ditentukan"}*\n\n` +
      `*Silakan login ke aplikasi PIJAR untuk melihat tugas dan melakukan koordinasi dengan Pembimbing Lapangan Anda.*\n\n` +
      `Terima kasih!`;
  } else {
    text = `*PEMBERITAHUAN LAMARAN MAGANG PLN UP3 PADANG*\n\n` +
      `Halo Kak *${options.nama}*,\n` +
      `Terima kasih telah mengajukan lamaran magang di PT PLN (Persero) UP3 Padang.\n\n` +
      `Mohon maaf, lamaran magang Anda saat ini *BELUM DAPAT DITERIMA*.\n` +
      `*Alasan*: ${options.alasanTolak || "Kapasitas kuota penempatan penuh"}\n\n` +
      `Tetap semangat dan sukses selalu!`;
  }

  return `https://wa.me/${rawHp}?text=${encodeURIComponent(text)}`;
}

/** Generate unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
  });
}

export function toQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return new URLSearchParams(filtered).toString();
}

export function downloadBase64File(base64Data: string, filename: string, mimeType = "application/pdf") {
  if (typeof window === "undefined") return;
  const cleanData = base64Data.replace(/^data:[^;]+;base64,/, "");
  const byteCharacters = atob(cleanData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function getDirectImageUrl(url?: string | null): string {
  if (!url) return "";
  const str = String(url).trim();
  if (!str || str === "-") return "";
  if (str.startsWith("data:image/")) return str;

  // Extract Drive File ID from various URL patterns
  let fileId = "";
  const fileDMatch = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch) fileId = fileDMatch[1];

  const idParamMatch = str.match(/id=([a-zA-Z0-9_-]+)/);
  if (!fileId && idParamMatch && str.includes("drive.google.com")) fileId = idParamMatch[1];

  const lh3Match = str.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (!fileId && lh3Match) fileId = lh3Match[1];

  if (fileId) {
    return `/api/drive-image?id=${fileId}`;
  }

  if (str.startsWith("http")) {
    return `/api/drive-image?url=${encodeURIComponent(str)}`;
  }

  return str;
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
