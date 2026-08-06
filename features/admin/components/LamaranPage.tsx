// features/admin/components/LamaranPage.tsx
"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList, CheckCircle2, XCircle, Eye, ExternalLink,
  User, GraduationCap, Calendar, FileText, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { lamaranService } from "@/services/lamaran.service";
import { dashboardService } from "@/services/dashboard.service";
import { divisiService } from "@/services/divisi.service";
import { cabangService } from "@/services/cabang.service";
import { pembimbingService } from "@/services/pembimbing.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/services/api";
import { formatDate, getWhatsAppNotificationLink } from "@/lib/utils";
import { CONFIG } from "@/constants/config";
import type { Lamaran, Divisi, Cabang, Pembimbing, LamaranStatus } from "@/types";

// Status badge
const statusConfig: Record<LamaranStatus, { label: string; className: string }> = {
  menunggu: { label: "Menunggu", className: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  diterima: { label: "Diterima", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  ditolak:  { label: "Ditolak",  className: "bg-red-500/15 text-red-400 border border-red-500/30" },
};

function StatusBadge({ status }: { status: LamaranStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.menunggu;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}



// Approve Modal 
interface ApproveModalProps {
  lamaran: Lamaran | null;
  onClose: () => void;
  onSuccessOpenWA?: (waUrl: string, nama: string) => void;
}
function ApproveModal({ lamaran, onClose, onSuccessOpenWA }: ApproveModalProps) {
  const queryClient = useQueryClient();
  const [divisi, setDivisi] = useState("");
  const [cabang, setCabang] = useState("");
  const [pembimbing, setPembimbing] = useState("");
  const [suratFile, setSuratFile] = useState<File | null>(null);

  const { data: divisiList = [] } = useQuery({ queryKey: ["divisi"], queryFn: () => divisiService.getAll() });
  const { data: cabangList = [] } = useQuery({ queryKey: ["cabang"], queryFn: cabangService.getAll });
  const { data: pembimbingData } = useQuery({
    queryKey: ["pembimbing", 1, 100],
    queryFn: () => pembimbingService.getAll({ page: 1, limit: 100 }),
  });
  const pembimbingList = pembimbingData?.items ?? [];

  // Determine if chosen unit is a ULP (non-UP3 Padang / unit cabang)
  const selectedCabangObj = (cabangList as Cabang[]).find((c) => c.id === cabang);
  const isUlpTransfer = selectedCabangObj
    ? !selectedCabangObj.nama_cabang.toLowerCase().includes("up3")
    : false;

  // Quota formatting & sorting for Cabang (Unit) List
  const sortedCabangList = [...(cabangList as Cabang[])].sort((a, b) => {
    const fullA = (a.jumlah_mahasiswa ?? 0) >= (a.kapasitas ?? 0) && (a.kapasitas ?? 0) > 0;
    const fullB = (b.jumlah_mahasiswa ?? 0) >= (b.kapasitas ?? 0) && (b.kapasitas ?? 0) > 0;
    if (fullA === fullB) return a.nama_cabang.localeCompare(b.nama_cabang);
    return fullA ? 1 : -1;
  });

  // Quota formatting & sorting for Divisi List
  const sortedDivisiList = [...(divisiList as Divisi[])].sort((a, b) => {
    const fullA = (a.jumlah_mahasiswa ?? 0) >= (a.kapasitas ?? 0) && (a.kapasitas ?? 0) > 0;
    const fullB = (b.jumlah_mahasiswa ?? 0) >= (b.kapasitas ?? 0) && (b.kapasitas ?? 0) > 0;
    if (fullA === fullB) return a.nama_divisi.localeCompare(b.nama_divisi);
    return fullA ? 1 : -1;
  });

  // Filter supervisors strictly by chosen Divisi and Cabang
  const filteredPembimbingList = pembimbingList.filter((p) => {
    if (divisi && p.divisi !== divisi && (p as any).divisi_id !== divisi) return false;
    if (cabang && p.cabang !== cabang && (p as any).cabang_id !== cabang && (p as any).ulp_id !== cabang) return false;
    return true;
  });

  const mutation = useMutation({
    mutationFn: () =>
      lamaranService.approve({
        id: lamaran!.id,
        divisi: isUlpTransfer ? "Belum Ditentukan" : divisi,
        cabang,
        pembimbing: isUlpTransfer ? "Belum Ditentukan" : pembimbing,
        surat_penerimaan: suratFile || undefined,
      }),
    onSuccess: (res) => {
      onClose(); // Close modal immediately for fast UI response

      const selectedDivObj = (divisiList as Divisi[]).find((d) => d.id === divisi);
      const selectedPmbObj = pembimbingList.find((p) => p.id === pembimbing);

      const unitName = selectedCabangObj ? selectedCabangObj.nama_cabang : "PT PLN (Persero) UP3 Padang";
      const divisiName = isUlpTransfer ? "Akan Ditentukan oleh Admin ULP" : (selectedDivObj ? selectedDivObj.nama_divisi : "Umum");
      const pembimbingName = isUlpTransfer ? "Akan Ditentukan oleh Admin ULP" : (selectedPmbObj ? selectedPmbObj.nama : "Belum Ditentukan");

      toast.success(
        isUlpTransfer
          ? `Lamaran ${lamaran?.nama} berhasil didisposisikan ke ${selectedCabangObj?.nama_cabang}.`
          : `Lamaran ${lamaran?.nama} berhasil diterima.`
      );
      dashboardService.pushNotification({
        title: isUlpTransfer ? "Mahasiswa Baru Ditransfer ke ULP" : "Lamaran Diterima",
        message: isUlpTransfer
          ? `Mahasiswa ${lamaran?.nama} telah berhasil didisposisikan ke ${selectedCabangObj?.nama_cabang}.`
          : `Mahasiswa ${lamaran?.nama} telah diterima di ${selectedCabangObj?.nama_cabang || "UP3 Padang"}.`,
        type: "success",
        role: isUlpTransfer ? "admin_ulp" : "admin",
      });
      queryClient.invalidateQueries({ queryKey: ["lamaran"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      const finalPdfUrl = (res as any)?.data?.surat_penerimaan_url || (res as any)?.surat_penerimaan_url || lamaran?.surat_penerimaan_url || "";

      // Email saat Lamaran Diterima / Didisposisikan
      if (lamaran?.email) {
        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "lamaran_accepted",
            email: lamaran.email,
            nama: lamaran.nama,
            tanggalMulai: lamaran.tanggal_mulai,
            tanggalSelesai: lamaran.tanggal_selesai,
            unitName,
            divisiName,
            pembimbingName,
            suratPenerimaanUrl: finalPdfUrl,
          }),
        }).catch((e) => console.error("Failed to send acceptance email", e));
      }

      // Email Notifikasi ke Pembimbing Lapangan
      if (!isUlpTransfer && selectedPmbObj && selectedPmbObj.email && lamaran) {
        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "pembimbing_student_assigned",
            email: selectedPmbObj.email,
            nama: selectedPmbObj.nama,
            mhsNama: lamaran.nama,
            mhsUniversitas: lamaran.universitas,
            mhsProdi: lamaran.program_studi,
            unitName,
            divisiName,
            tanggalMulai: lamaran.tanggal_mulai,
            tanggalSelesai: lamaran.tanggal_selesai,
          }),
        }).catch((e) => console.error("Failed to send student assigned email to Pembimbing", e));
      }

      // Email Notifikasi Khusus ke Admin ULP Unit yang ditunjuk
      if (isUlpTransfer && selectedCabangObj && lamaran) {
        const targetUlpAdmins = pembimbingList.filter((p) => {
          const isRoleMatch = (p as any).role === "admin_ulp";
          const isCabangMatch =
            p.cabang === selectedCabangObj.id ||
            (p as any).cabang_id === selectedCabangObj.id ||
            (p as any).ulp_id === selectedCabangObj.id ||
            p.cabang === selectedCabangObj.nama_cabang ||
            String(p.cabang).toLowerCase().includes(selectedCabangObj.nama_cabang.toLowerCase()) ||
            String(selectedCabangObj.nama_cabang).toLowerCase().includes(String(p.cabang).toLowerCase());
          return isRoleMatch && isCabangMatch;
        });

        targetUlpAdmins.forEach((adminUlp) => {
          if (adminUlp.email) {
            fetch("/api/email/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "ulp_transfer_notice",
                email: adminUlp.email,
                adminName: adminUlp.nama,
                ulpName: selectedCabangObj.nama_cabang,
                mhsNama: lamaran.nama,
                mhsUniversitas: lamaran.universitas,
                mhsProdi: lamaran.program_studi,
                tanggalMulai: lamaran.tanggal_mulai,
                tanggalSelesai: lamaran.tanggal_selesai,
              }),
            }).catch((e) => console.error("Failed to send ULP transfer notice email to Admin ULP", e));
          }
        });
      }

      // Generate WhatsApp Link & Trigger Modal
      if (lamaran && onSuccessOpenWA) {
        const waUrl = getWhatsAppNotificationLink({
          nomorHp: lamaran.nomor_hp,
          nama: lamaran.nama,
          type: "diterima",
          unitName,
          divisiName,
          pembimbingName,
          tanggalMulai: lamaran.tanggal_mulai,
          tanggalSelesai: lamaran.tanggal_selesai,
        });
        onSuccessOpenWA(waUrl, lamaran.nama);
      }

      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!lamaran) return null;

  return (
    <Dialog open={!!lamaran} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            Terima Lamaran Magang
          </DialogTitle>
        </DialogHeader>

        {/* Ringkasan data pelamar */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <User className="w-4 h-4 text-muted-foreground" />
            {lamaran.nama}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            {lamaran.nim} · {lamaran.universitas} · {lamaran.program_studi}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formatDate(lamaran.tanggal_mulai)} → {formatDate(lamaran.tanggal_selesai)}
          </div>
        </div>

        {/* Assignment (Unit -> Upload Surat Penerimaan -> Divisi -> Pembimbing) */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Tentukan penempatan mahasiswa:</p>
          <div className="grid grid-cols-1 gap-4">
            
            {/* 1. Unit / ULP (PERTAMA) */}
            <div className="space-y-1.5">
              <Label>Unit / ULP <span className="text-red-500">*</span></Label>
              <Select
                value={cabang}
                onValueChange={(val) => {
                  setCabang(val);
                  const chosenObj = (cabangList as Cabang[]).find((c) => c.id === val);
                  const isUlp = chosenObj ? !chosenObj.nama_cabang.toLowerCase().includes("up3") : false;
                  if (isUlp) {
                    setDivisi("");
                    setPembimbing("");
                  }
                }}
              >
                <SelectTrigger id="approve-cabang"><SelectValue placeholder="Pilih unit / ULP" /></SelectTrigger>
                <SelectContent>
                  {sortedCabangList.map((c) => {
                    const isFull = (c.jumlah_mahasiswa ?? 0) >= (c.kapasitas ?? 0) && (c.kapasitas ?? 0) > 0;
                    return (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        disabled={isFull}
                        className={isFull ? "opacity-50 text-muted-foreground line-through cursor-not-allowed bg-muted/30" : ""}
                      >
                        {c.nama_cabang} ({c.jumlah_mahasiswa ?? 0}/{c.kapasitas ?? 0})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Upload Surat Balasan Penerimaan Magang */}
            <div className="space-y-1.5">
              <Label>Upload Surat Balasan Penerimaan Magang (PDF / Image) <span className="text-red-500">*</span></Label>
              <Input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0];
                  if (f) setSuratFile(f);
                }}
                className="cursor-pointer text-xs"
                id="upload-surat-penerimaan"
              />
              {suratFile ? (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  File: {suratFile.name} ({(suratFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Upload surat balasan penerimaan resmi dari PLN untuk diunduh mahasiswa.</p>
              )}
            </div>

            {/* 3. Divisi */}
            <div className="space-y-1.5">
              <Label className={isUlpTransfer ? "opacity-50" : ""}>Divisi <span className="text-red-500">*</span></Label>
              <Select
                value={divisi}
                onValueChange={(val) => {
                  setDivisi(val);
                  setPembimbing("");
                }}
                disabled={isUlpTransfer || !cabang}
              >
                <SelectTrigger id="approve-divisi" className={isUlpTransfer ? "bg-muted/50 text-muted-foreground opacity-70" : ""}>
                  <SelectValue placeholder={
                    isUlpTransfer
                      ? "Ditentukan oleh Admin ULP"
                      : !cabang
                      ? "Pilih unit / ULP dahulu"
                      : "Pilih divisi"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sortedDivisiList.map((d) => {
                    const isFull = (d.jumlah_mahasiswa ?? 0) >= (d.kapasitas ?? 0) && (d.kapasitas ?? 0) > 0;
                    return (
                      <SelectItem
                        key={d.id}
                        value={d.id}
                        disabled={isFull}
                        className={isFull ? "opacity-50 text-muted-foreground line-through cursor-not-allowed bg-muted/30" : ""}
                      >
                        {d.nama_divisi} ({d.jumlah_mahasiswa ?? 0}/{d.kapasitas ?? 0})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Pembimbing */}
            <div className="space-y-1.5">
              <Label className={isUlpTransfer ? "opacity-50" : ""}>Pembimbing <span className="text-red-500">*</span></Label>
              <Select value={pembimbing} onValueChange={setPembimbing} disabled={isUlpTransfer || !divisi || !cabang}>
                <SelectTrigger id="approve-pembimbing" className={isUlpTransfer ? "bg-muted/50 text-muted-foreground opacity-70" : ""}>
                  <SelectValue placeholder={
                    isUlpTransfer
                      ? "Ditentukan oleh Admin ULP"
                      : !divisi || !cabang
                      ? "Pilih divisi & unit dahulu"
                      : "Pilih pembimbing"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredPembimbingList.length > 0 ? (
                    filteredPembimbingList.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-muted-foreground text-center font-medium">
                      Belum ada pembimbing di divisi &amp; unit ini
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
            disabled={
              !cabang ||
              (!isUlpTransfer && (!divisi || !pembimbing || !suratFile)) ||
              mutation.isPending
            }
            onClick={() => mutation.mutate()}
            id="confirm-approve-btn"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            {isUlpTransfer ? "Konfirmasi Terima & Transfer ULP" : "Konfirmasi Terima"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reject Modal 
interface RejectModalProps {
  lamaran: Lamaran | null;
  onClose: () => void;
  onSuccessOpenWA?: (waUrl: string, nama: string) => void;
}
function RejectModal({ lamaran, onClose, onSuccessOpenWA }: RejectModalProps) {
  const queryClient = useQueryClient();
  const [alasan, setAlasan] = useState("");

  const mutation = useMutation({
    mutationFn: () => lamaranService.reject({ id: lamaran!.id, alasan }),
    onSuccess: () => {
      toast.success(`Lamaran ${lamaran?.nama} ditolak.`);
      dashboardService.pushNotification({
        title: "Data Lamaran Ditolak",
        message: `Lamaran mahasiswa ${lamaran?.nama} telah ditolak.`,
        type: "warning",
        role: "admin",
      });
      queryClient.invalidateQueries({ queryKey: ["lamaran"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // Email saat Lamaran Ditolak
      if (lamaran?.email) {
        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "lamaran_rejected",
            email: lamaran.email,
            nama: lamaran.nama,
          }),
        }).catch((e) => console.error("Failed to send rejection email", e));
      }

      if (lamaran && onSuccessOpenWA) {
        const waUrl = getWhatsAppNotificationLink({
          nomorHp: lamaran.nomor_hp,
          nama: lamaran.nama,
          type: "ditolak",
          unitName: "PT PLN (Persero) UP3 Padang",
          alasanTolak: alasan,
        });
        onSuccessOpenWA(waUrl, lamaran.nama);
      }

      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!lamaran) return null;

  return (
    <Dialog open={!!lamaran} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            Tolak Lamaran
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Yakin menolak lamaran dari <span className="font-semibold text-foreground">{lamaran.nama}</span>?
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="alasan-tolak">Alasan penolakan (opsional)</Label>
            <Textarea
              id="alasan-tolak"
              rows={3}
              placeholder="Contoh: Kuota divisi sudah penuh..."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            id="confirm-reject-btn"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Tolak Lamaran
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Detail Modal
function DetailModal({ lamaran, onClose }: { lamaran: Lamaran | null; onClose: () => void }) {
  if (!lamaran) return null;
  return (
    <Dialog open={!!lamaran} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Lamaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {[
            ["Nama", lamaran.nama],
            ["Email", lamaran.email],
            ["NIM", lamaran.nim],
            ["Universitas", lamaran.universitas],
            ["Program Studi", lamaran.program_studi],
            ["Periode", `${formatDate(lamaran.tanggal_mulai)} → ${formatDate(lamaran.tanggal_selesai)}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-muted-foreground w-32 shrink-0">{k}</span>
              <span className="font-medium text-right">{v}</span>
            </div>
          ))}
          {lamaran.surat_ajuan_url && (
            <a
              href={lamaran.surat_ajuan_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FileText className="w-4 h-4" /> Surat Ajuan
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {lamaran.cv_url && (
            <a href={lamaran.cv_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
              <FileText className="w-4 h-4" /> CV / Resume <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {lamaran.proposal_url && (
            <a href={lamaran.proposal_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
              <FileText className="w-4 h-4" /> Proposal Magang <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {lamaran.alasan_tolak && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-xs font-semibold mb-1">Alasan Penolakan</p>
              <p className="text-muted-foreground">{lamaran.alasan_tolak}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// WhatsApp Action Dialog component
function WhatsAppActionDialog({
  open,
  onClose,
  waUrl,
  nama,
}: {
  open: boolean;
  onClose: () => void;
  waUrl: string;
  nama: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
            Status Lamaran Diperbarui
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Status lamaran mahasiswa <span className="font-semibold text-foreground">{nama}</span> telah berhasil diperbarui dan notifikasi email telah dikirim.
          </p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              📱 Kirim Pesan Konfirmasi WhatsApp ke Mahasiswa:
            </p>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2"
              onClick={() => {
                window.open(waUrl, "_blank");
                onClose();
              }}
              id="send-wa-direct-btn"
            >
              <ExternalLink className="w-4 h-4" />
              Kirim Notifikasi WhatsApp Direct
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export function LamaranPage() {
  const [statusFilter, setStatusFilter] = useState<LamaranStatus | "">("");
  const [approveTarget, setApproveTarget] = useState<Lamaran | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Lamaran | null>(null);
  const [detailTarget, setDetailTarget] = useState<Lamaran | null>(null);
  const [waData, setWaData] = useState<{ waUrl: string; nama: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["lamaran", statusFilter],
    queryFn: () => lamaranService.getAll({ status: statusFilter || undefined, page: 1, limit: 100 }),
    refetchInterval: 30_000,
  });

  const items = data?.items ?? [];
  const pending = items.filter((l) => l.status === "menunggu");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lamaran Masuk"
        description="Verifikasi pendaftaran magang mahasiswa"
      >
        {pending.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-sm font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {pending.length} menunggu
          </span>
        )}
      </PageHeader>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["", "menunggu", "diterima", "ditolak"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === s
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "" ? "Semua" : statusConfig[s]?.label}
            {s === "menunggu" && pending.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">NIM</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Universitas</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Periode</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-red-400">
                    Gagal memuat data lamaran
                  </td>
                </tr>
              )}
              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground">Belum ada lamaran masuk</p>
                  </td>
                </tr>
              )}
              {items.map((lmr) => (
                <tr key={lmr.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{lmr.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lmr.nim}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[180px] truncate">{lmr.universitas}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    {formatDate(lmr.tanggal_mulai)} → {formatDate(lmr.tanggal_selesai)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lmr.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => setDetailTarget(lmr)} title="Lihat detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {lmr.status === "menunggu" && (
                        <>
                          <Button
                            size="sm"
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                            onClick={() => setApproveTarget(lmr)}
                            id={`approve-${lmr.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Terima
                          </Button>
                          <Button
                            variant="destructive" size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setRejectTarget(lmr)}
                            id={`reject-${lmr.id}`}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Tolak
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ApproveModal
        lamaran={approveTarget}
        onClose={() => setApproveTarget(null)}
        onSuccessOpenWA={(waUrl, nama) => setWaData({ waUrl, nama })}
      />
      <RejectModal
        lamaran={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSuccessOpenWA={(waUrl, nama) => setWaData({ waUrl, nama })}
      />
      <DetailModal lamaran={detailTarget} onClose={() => setDetailTarget(null)} />
      
      {waData && (
        <WhatsAppActionDialog
          open={!!waData}
          onClose={() => setWaData(null)}
          waUrl={waData.waUrl}
          nama={waData.nama}
        />
      )}
    </div>
  );
}
