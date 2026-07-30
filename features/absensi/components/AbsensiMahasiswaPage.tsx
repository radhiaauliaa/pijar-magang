// features/absensi/components/AbsensiMahasiswaPage.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock, LogIn, LogOut, Download, Calendar, Camera,
  FileText, Upload, AlertCircle, CheckCircle2, ShieldAlert, X,
  Filter, RotateCcw, Eye, History, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { absensiService } from "@/services/absensi.service";
import { dashboardService } from "@/services/dashboard.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePagination } from "@/hooks/usePagination";
import { formatDate, formatTime, getDirectImageUrl } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Kehadiran, JenisIzin } from "@/types";

// Camera Modal Component
function CameraModal({
  open,
  onClose,
  onCapture,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Verify browser support
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        setError("Browser Anda tidak mendukung akses kamera langsung. Silakan gunakan tombol Pilih Foto dari File di bawah ini.");
        return;
      }

      if (streamRef.current) return;

      const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      const videoConstraints: MediaTrackConstraints | boolean = isMobile
        ? { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } };

      let mediaStream: MediaStream | null = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
      } catch (err1) {
        console.warn("First camera constraint attempt notice:", err1);
        // Universal fallback for all webcams
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      setError(
        "Akses kamera diblokir atau tidak tersedia di browser ini. Silakan izinkan akses kamera di browser, atau gunakan Opsi Upload Foto dari File di bawah."
      );
    }
  }, []);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .catch((playErr) => console.warn("Video stream play notice:", playErr));
    }
  }, [stream]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      stopCamera();
      onCapture(base64);
      onClose();
      toast.success("Foto selfie berhasil diambil!");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result as string);
      stopCamera();
      onClose();
      toast.success("Foto selfie berhasil diunggah dari file!");
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Ambil Foto Selfie Absen
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onClick={(e) => {
              (e.target as HTMLInputElement).value = "";
            }}
            onChange={handleFileUpload}
          />

          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center text-sm space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto opacity-80" />
              <p className="text-xs leading-relaxed font-semibold">{error}</p>

              <div className="flex gap-2 justify-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="text-xs h-9"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Coba Lagi Kamera
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Pilih Foto dari File
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs h-9"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload File
              </Button>
              {!error && (
                <Button onClick={handleCapture} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9">
                  <Camera className="w-4 h-4 mr-2" />
                  Jepret Foto
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getRecordTimestamp(item: Kehadiran): number {
  const rawDate = String(item.tanggal || "").trim();
  const jamStr = item.jam_masuk && item.jam_masuk !== "00:00" && item.jam_masuk !== "-" ? item.jam_masuk : "00:00";

  if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
    const ymd = rawDate.slice(0, 10);
    const d = new Date(`${ymd}T${jamStr}:00`);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  const monthMap: Record<string, string> = {
    januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
    juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12"
  };
  const parts = rawDate.toLowerCase().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, "0");
    const month = monthMap[parts[1]] || "01";
    const year = parts[2];
    const d = new Date(`${year}-${month}-${day}T${jamStr}:00`);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) return parsed;

  return 0;
}

// Main Page
export function AbsensiMahasiswaPage() {
  const queryClient = useQueryClient();
  const { page, limit, setPage, setLimit } = usePagination();

  // Foto states
  const [fotoMasuk, setFotoMasuk] = useState<string>("");
  const [fotoPulang, setFotoPulang] = useState<string>("");
  const [showCameraMasuk, setShowCameraMasuk] = useState(false);
  const [showCameraPulang, setShowCameraPulang] = useState(false);

  // Upload input refs
  const uploadMasukRef = useRef<HTMLInputElement>(null);
  const uploadPulangRef = useRef<HTMLInputElement>(null);
  const dokumenInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Preview Image Modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form Izin states
  const [jenisIzin, setJenisIzin] = useState<JenisIzin>("Izin Sehari");
  const [keteranganIzin, setKeteranganIzin] = useState("");
  const [dokumenFile, setDokumenFile] = useState<string>("");
  const [fileName, setFileName] = useState("");

  const { data: todayStatus } = useQuery({
    queryKey: ["today-absensi"],
    queryFn: absensiService.getTodayStatus,
    refetchInterval: 30_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["my-absensi", page, limit],
    queryFn: () => absensiService.getMy({ page, limit }),
  });

  const checkInMutation = useMutation({
    mutationFn: () => {
      if (!fotoMasuk) {
        throw new Error("Foto selfie / upload foto wajib diisi sebelum Absen Masuk");
      }
      return absensiService.checkIn(fotoMasuk);
    },
    onSuccess: () => {
      toast.success("Absen Masuk Berhasil!");
      setFotoMasuk("");
      dashboardService.pushNotification({
        title: "Absen Masuk Berhasil",
        message: "Absen Masuk Anda hari ini telah berhasil dicatat.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["today-absensi"] });
      queryClient.invalidateQueries({ queryKey: ["my-absensi"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => {
      if (!fotoPulang) {
        throw new Error("Foto selfie / upload foto wajib diisi sebelum Absen Pulang");
      }
      return absensiService.checkOut(fotoPulang);
    },
    onSuccess: () => {
      toast.success("Absen Pulang Berhasil!");
      setFotoPulang("");
      dashboardService.pushNotification({
        title: "Absen Pulang Berhasil",
        message: "Absen Pulang Anda hari ini telah berhasil dicatat.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["today-absensi"] });
      queryClient.invalidateQueries({ queryKey: ["my-absensi"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const izinMutation = useMutation({
    mutationFn: () =>
      absensiService.ajukanIzin({
        jenis_izin: jenisIzin,
        keterangan: keteranganIzin,
        dokumen: dokumenFile,
      }),
    onSuccess: () => {
      toast.success("Pengajuan Izin Berhasil Dikirim!");
      dashboardService.pushNotification({
        title: "Pengajuan Izin Dikirim",
        message: `Pengajuan ${jenisIzin} Anda telah berhasil dikirim ke pembimbing.`,
        type: "info",
      });
      setKeteranganIzin("");
      setDokumenFile("");
      setFileName("");
      if (dokumenInputRef.current) dokumenInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["today-absensi"] });
      queryClient.invalidateQueries({ queryKey: ["my-absensi"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Handle upload file dokumen izin
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setDokumenFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload fallback for selfie foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "masuk" | "pulang") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === "masuk") setFotoMasuk(base64);
      else setFotoPulang(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPDF = async () => {
    try {
      const url = await absensiService.generatePDF("me");
      window.open(url, "_blank");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const rawItems = data?.items ?? [];
  const todayWibStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
  const todayRecordFromItems = rawItems.find((item) => {
    const itemDateStr = String(item.tanggal || "").slice(0, 10);
    return itemDateStr === todayWibStr;
  });
  const activeTodayStatus = todayStatus || todayRecordFromItems;

  const isIzinSetengahHari = activeTodayStatus?.jenis_izin === "Izin Setengah Hari";
  const hasCheckedIn = !!activeTodayStatus && (
    (!!activeTodayStatus.jam_masuk && activeTodayStatus.jam_masuk !== "00:00" && activeTodayStatus.jam_masuk !== "-") ||
    !!activeTodayStatus.jenis_izin ||
    !!activeTodayStatus.status
  );
  const hasCheckedOut = !!activeTodayStatus && (
    !!activeTodayStatus.jam_pulang && activeTodayStatus.jam_pulang !== "00:00" && activeTodayStatus.jam_pulang !== "-"
  );

  const currentHour = new Date().getHours();
  const isAfter8PM = currentHour >= 20;

  const canCheckIn = !hasCheckedIn && !activeTodayStatus?.jenis_izin && !activeTodayStatus?.status;
  const canCheckOut = (hasCheckedIn || isIzinSetengahHari) && !hasCheckedOut && !isAfter8PM;
  const canSubmitIzin = !hasCheckedIn && !hasCheckedOut && !activeTodayStatus?.jenis_izin && !activeTodayStatus?.status;

  // Filter items by Status & Sort by Timestamp
  let filteredItems = rawItems.filter((item) => {
    if (statusFilter !== "all") {
      const s = String(item.status || "").toLowerCase();
      const iz = String(item.jenis_izin || "").toLowerCase();
      const target = statusFilter.toLowerCase();
      if (s !== target && iz !== target) return false;
    }
    return true;
  });

  filteredItems.sort((a, b) => {
    const tsA = getRecordTimestamp(a);
    const tsB = getRecordTimestamp(b);
    if (tsA !== tsB) {
      return sortOrder === "newest" ? tsB - tsA : tsA - tsB;
    }
    return 0;
  });

  const columns: Column<Kehadiran>[] = [
    { key: "tanggal", title: "TANGGAL", render: (r) => formatDate(r.tanggal) },
    { key: "jam_masuk", title: "JAM MASUK", render: (r) => (r.jam_masuk && r.jam_masuk !== "00:00" ? formatTime(r.jam_masuk) : "—") },
    { key: "jam_pulang", title: "JAM PULANG", render: (r) => (r.jam_pulang && r.jam_pulang !== "00:00" ? formatTime(r.jam_pulang) : "—") },
    {
      key: "foto_masuk" as keyof Kehadiran,
      title: "FOTO MASUK",
      render: (r) =>
        r.foto_masuk ? (
          <div className="relative group w-10 h-10 shrink-0">
            <img
              src={getDirectImageUrl(r.foto_masuk)}
              alt="Foto Masuk"
              className="w-10 h-10 object-cover rounded-lg border border-border shadow-xs cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setPreviewImage(r.foto_masuk || null)}
            />
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "foto_pulang" as keyof Kehadiran,
      title: "FOTO PULANG",
      render: (r) =>
        r.foto_pulang ? (
          <div className="relative group w-10 h-10 shrink-0">
            <img
              src={getDirectImageUrl(r.foto_pulang)}
              alt="Foto Pulang"
              className="w-10 h-10 object-cover rounded-lg border border-border shadow-xs cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setPreviewImage(r.foto_pulang || null)}
            />
          </div>
        ) : (
          "—"
        ),
    },
    { key: "jenis_izin" as keyof Kehadiran, title: "JENIS IZIN", render: (r) => r.jenis_izin || "—" },
    {
      key: "dokumen_izin" as keyof Kehadiran,
      title: "DOKUMEN",
      render: (r) =>
        r.dokumen_izin ? (
          <a
            href={r.dokumen_izin}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            Dokumen
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "status" as keyof Kehadiran,
      title: "STATUS",
      render: (r) => {
        if (r.status) return <StatusBadge status={r.status} />;
        if (r.jam_masuk && r.jam_masuk !== "00:00") return <StatusBadge status="hadir" />;
        return "—";
      },
    },
    {
      key: "keterangan",
      title: "KETERANGAN ALASAN",
      render: (r) => r.keterangan || "—",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Absensi" description="Absensi harian dan pengajuan izin magang">
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </PageHeader>

      {/*Banner Ketentuan Jam Kerja Harian*/}
      <div className="bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-4 text-sm text-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base text-sky-950 dark:text-sky-100">Ketentuan Jam Kerja Kantor PLN</p>
            <p className="text-xs text-sky-800/80 dark:text-sky-300/80">Pastikan absen sesuai dengan jam masuk dan jam pulang yang ditentukan.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-sky-900/80 text-sky-900 dark:text-sky-100 border border-sky-200 dark:border-sky-700 font-semibold shadow-2xs">
            <strong>Senin – Kamis:</strong> Masuk 08:00 (Toleransi s/d 08:10) · Pulang 17:00
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-sky-900/80 text-sky-900 dark:text-sky-100 border border-sky-200 dark:border-sky-700 font-semibold shadow-2xs">
            <strong>Jumat:</strong> Masuk 07:30 (Toleransi s/d 07:40) · Pulang 17:00
          </span>
        </div>
      </div>


      {/*Section Absen Masuk & Absen Pulang*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box Absen Masuk */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-center font-bold text-base flex items-center justify-center gap-2 text-emerald-500">
              <LogIn className="w-5 h-5" /> Absen Masuk
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div
              onClick={() => {
                if (!fotoMasuk && canCheckIn) uploadMasukRef.current?.click();
              }}
              className={`relative bg-muted/40 rounded-xl aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-border transition-all overflow-hidden ${
                !fotoMasuk && canCheckIn ? "hover:border-emerald-500/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer group" : ""
              }`}
            >
              {fotoMasuk ? (
                <div className="relative w-full h-full">
                  <img src={fotoMasuk} alt="Preview Selfie Masuk" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFotoMasuk("");
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow"
                    title="Hapus Foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-foreground">Klik di sini untuk upload foto selfie</p>
                  <p className="text-[11px] text-muted-foreground">atau gunakan tombol kamera di bawah</p>
                </div>
              )}
            </div>

            <input
              ref={uploadMasukRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, "masuk")}
              disabled={!canCheckIn}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setShowCameraMasuk(true)}
                disabled={!canCheckIn}
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Aktifkan Kamera
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => uploadMasukRef.current?.click()}
                disabled={!canCheckIn}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload Foto
              </Button>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (!fotoMasuk) {
                  toast.error("Harap ambil foto selfie atau upload foto terlebih dahulu!");
                  return;
                }
                checkInMutation.mutate();
              }}
              disabled={!canCheckIn || !fotoMasuk || checkInMutation.isPending}
              id="absen-masuk-btn"
            >
              {todayStatus?.jenis_izin
                ? "Sudah Mengajukan Izin/Sakit"
                : hasCheckedIn
                ? `Sudah Absen Masuk (${todayStatus?.jam_masuk && todayStatus.jam_masuk !== "00:00" ? formatTime(todayStatus.jam_masuk) : "Selesai"})`
                : "Absen Masuk"}
            </Button>
          </CardContent>
        </Card>

        {/* Box Absen Pulang */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-center font-bold text-base flex items-center justify-center gap-2 text-rose-500">
              <LogOut className="w-5 h-5" /> Absen Pulang
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div
              onClick={() => {
                if (!fotoPulang && canCheckOut) uploadPulangRef.current?.click();
              }}
              className={`relative bg-muted/40 rounded-xl aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-border transition-all overflow-hidden ${
                !fotoPulang && canCheckOut ? "hover:border-rose-500/60 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 cursor-pointer group" : ""
              }`}
            >
              {fotoPulang ? (
                <div className="relative w-full h-full">
                  <img src={fotoPulang} alt="Preview Selfie Pulang" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFotoPulang("");
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow"
                    title="Hapus Foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-foreground">Klik di sini untuk upload foto selfie</p>
                  <p className="text-[11px] text-muted-foreground">atau gunakan tombol kamera di bawah</p>
                </div>
              )}
            </div>

            <input
              ref={uploadPulangRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, "pulang")}
              disabled={!canCheckOut}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setShowCameraPulang(true)}
                disabled={!canCheckOut}
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Aktifkan Kamera
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => uploadPulangRef.current?.click()}
                disabled={!canCheckOut}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload Foto
              </Button>
            </div>

            <Button
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (!fotoPulang) {
                  toast.error("Harap ambil foto selfie atau upload foto terlebih dahulu!");
                  return;
                }
                checkOutMutation.mutate();
              }}
              disabled={!canCheckOut || !fotoPulang || checkOutMutation.isPending}
              id="absen-pulang-btn"
            >
              {hasCheckedOut
                ? `Sudah Absen Pulang (${todayStatus?.jam_pulang && todayStatus.jam_pulang !== "00:00" ? formatTime(todayStatus.jam_pulang) : "Selesai"})`
                : isAfter8PM
                ? "Batas Waktu Absen Pulang Berakhir (Pukul 20:00)"
                : !hasCheckedIn
                ? "Absen Pulang (Belum Absen Masuk)"
                : "Absen Pulang"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section Ajukan Izin */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-500">
            <FileText className="w-5 h-5" /> Ajukan Izin
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              izinMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Jenis Izin</Label>
                <Select value={jenisIzin} onValueChange={(v) => setJenisIzin(v as JenisIzin)} disabled={!canSubmitIzin}>
                  <SelectTrigger id="jenis-izin-select">
                    <SelectValue placeholder="Pilih Jenis Izin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Izin Sehari">Izin Sehari</SelectItem>
                    <SelectItem value="Izin Setengah Hari">Izin Setengah Hari</SelectItem>
                    <SelectItem value="Sakit">Sakit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Dokumen Pendukung <span className="text-xs text-muted-foreground">(PDF / Foto)</span></Label>
                <div className="relative flex items-center h-10 w-full rounded-xl border border-border bg-background overflow-hidden shadow-2xs focus-within:ring-1 focus-within:ring-primary">
                  <button
                    type="button"
                    onClick={() => dokumenInputRef.current?.click()}
                    disabled={!canSubmitIzin}
                    className="h-full px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-foreground text-xs font-semibold border-r border-border flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Choose File
                  </button>
                  <input
                    ref={dokumenInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    id="dokumen-izin-file"
                    className="hidden"
                    disabled={!canSubmitIzin}
                  />
                  <div
                    onClick={() => canSubmitIzin && dokumenInputRef.current?.click()}
                    className="flex-1 px-3 text-xs text-foreground truncate cursor-pointer select-none bg-background h-full flex items-center"
                  >
                    {fileName ? (
                      <span className="font-medium text-foreground">{fileName}</span>
                    ) : (
                      <span className="text-muted-foreground">Tidak ada file dipilih</span>
                    )}
                  </div>
                  {fileName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileName("");
                        setDokumenFile("");
                        if (dokumenInputRef.current) dokumenInputRef.current.value = "";
                      }}
                      className="px-2.5 h-full flex items-center justify-center text-red-500 hover:text-red-600 transition-colors shrink-0 bg-background"
                      title="Hapus file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Keterangan Alasan</Label>
                <Input
                  placeholder="Contoh: Sakit demam tinggi, Izin keperluan..."
                  value={keteranganIzin}
                  onChange={(e) => setKeteranganIzin(e.target.value)}
                  id="keterangan-izin-input"
                  disabled={!canSubmitIzin}
                />
              </div>
            </div>

            <div className="flex justify-start pt-1">
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:opacity-50"
                disabled={izinMutation.isPending || !keteranganIzin || !canSubmitIzin}
                id="submit-izin-btn"
              >
                <FileText className="w-4 h-4 mr-2" />
                {!canSubmitIzin ? "Sudah Melakukan Absensi / Izin Hari Ini" : "Ajukan Izin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Section Riwayat Absensi */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-bold text-base flex items-center gap-2 text-foreground">
            <History className="w-5 h-5 text-primary" />
            Riwayat Absensi
          </h2>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Dropdown Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9 text-xs bg-background" id="filter-absensi-status-select">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="terlambat">Terlambat</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
              </SelectContent>
            </Select>

            {/* Dropdown Urutan */}
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
              <SelectTrigger className="w-32 h-9 text-xs bg-background" id="filter-absensi-sort-select">
                <SelectValue placeholder="Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "all" || sortOrder !== "newest") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setSortOrder("newest");
                }}
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
                id="filter-absensi-reset-btn"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <DataTable
          data={filteredItems}
          columns={columns}
          loading={isLoading}
          page={page}
          limit={limit}
          total={filteredItems.length}
          onPageChange={setPage}
          onLimitChange={setLimit}
          rowKey="id"
          emptyState={<EmptyState icon={Clock} title="Belum ada riwayat absensi" description="Riwayat kehadiran Anda akan muncul di sini" />}
        />
      </div>

      {/* Camera Modals */}
      <CameraModal
        open={showCameraMasuk}
        onClose={() => setShowCameraMasuk(false)}
        onCapture={(b64) => setFotoMasuk(b64)}
      />
      <CameraModal
        open={showCameraPulang}
        onClose={() => setShowCameraPulang(false)}
        onCapture={(b64) => setFotoPulang(b64)}
      />

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-lg p-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="w-4 h-4 text-primary" />
              Preview Foto Absen
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="relative aspect-auto max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img src={getDirectImageUrl(previewImage)} alt="Foto Absen" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
