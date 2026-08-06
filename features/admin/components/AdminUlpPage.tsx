// features/admin/components/AdminUlpPage.tsx — Dedicated Admin ULP Account Management Page
"use client";
import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Pencil, Trash2, AlertCircle, Loader2, ShieldCheck,
  Copy, CheckCircle2, Phone,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { pembimbingService } from "@/services/pembimbing.service";
import { dashboardService } from "@/services/dashboard.service";
import { cabangService } from "@/services/cabang.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { pembimbingSchema, type PembimbingFormValues } from "@/lib/validations";
import { getErrorMessage } from "@/services/api";
import type { Cabang, Pembimbing } from "@/types";

// Temp Password Dialog
function TempPasswordDialog({
  open,
  onClose,
  nama,
  password,
  email,
  nomorHp,
}: {
  open: boolean;
  onClose: () => void;
  nama: string;
  password: string;
  email?: string;
  nomorHp?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWA = () => {
    let rawHp = String(nomorHp || "").replace(/[^0-9]/g, "");
    if (rawHp.startsWith("0")) rawHp = "62" + rawHp.substring(1);
    if (rawHp && !rawHp.startsWith("62")) rawHp = "62" + rawHp;

    const text = `*AKUN ADMIN ULP PIJAR PLN UP3 PADANG*\n\n` +
      `Halo *${nama}*,\nAkun Admin ULP Anda di sistem PIJAR telah resmi aktif.\n\n` +
      `• Email Login: *${email || "-"}*\n` +
      `• Password Sementara: *${password}*\n\n` +
      `Silakan login ke aplikasi PIJAR dan ubah password Anda:\n` +
      `https://pijar-magang.vercel.app/login`;

    const waUrl = rawHp
      ? `https://wa.me/${rawHp}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <CheckCircle2 className="w-5 h-5" />
            Akun Admin ULP Berhasil Ditambahkan
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Akun Admin ULP untuk <span className="font-semibold text-foreground">{nama}</span> telah dibuat.
            Bagikan password sementara ini kepada pihak ULP:
          </p>
          <div className="bg-muted rounded-xl p-4 flex items-center justify-between gap-3 border border-border">
            <code className="font-mono text-lg font-bold tracking-wider text-foreground">
              {password}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleCopy}
              title="Salin password"
            >
              {copied
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <Copy className="w-4 h-4" />
              }
            </Button>
          </div>
          <Button
            type="button"
            onClick={handleOpenWA}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs"
          >
            Kirim Kredensial via WA Direct
          </Button>
          <p className="text-xs text-muted-foreground bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
            Salin password ini sekarang. Pihak Admin ULP dapat mengubah password setelah login pertama.
          </p>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={onClose} id="close-temp-password-btn" className="bg-purple-600 hover:bg-purple-700 text-white">Selesai</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminUlpPage() {
  const queryClient = useQueryClient();
  const { page, limit, setPage, setLimit, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "aktif" | "nonaktif">("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Pembimbing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pembimbing | null>(null);
  const [tempPassword, setTempPassword] = useState<{ nama: string; password: string; email?: string; nomorHp?: string } | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ulp-list", page, limit, debouncedSearch, statusFilter],
    queryFn: async () => {
      const res = await pembimbingService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        role: "admin_ulp",
      });
      return res;
    },
  });

  const { data: cabangList = [] } = useQuery({ queryKey: ["cabang"], queryFn: cabangService.getAll });

  const { register, handleSubmit, reset: resetForm, setValue, watch, formState: { errors } } = useForm<PembimbingFormValues>({
    resolver: zodResolver(pembimbingSchema),
    defaultValues: { nama: "", email: "", nomor_hp: "", divisi: "ULP", cabang: "", status: "aktif", role: "admin_ulp" },
  });

  const handleOpen = useCallback((item?: Pembimbing) => {
    if (item) {
      setEditTarget(item);
      resetForm({
        nama: item.nama,
        email: item.email,
        nomor_hp: "",
        divisi: item.divisi || "ULP",
        cabang: item.cabang,
        status: item.status,
        role: "admin_ulp",
      });
    } else {
      setEditTarget(null);
      resetForm({ nama: "", email: "", nomor_hp: "", divisi: "ULP", cabang: "", status: "aktif", role: "admin_ulp" });
    }
    setShowForm(true);
  }, [resetForm]);

  const mutation = useMutation({
    mutationFn: (values: PembimbingFormValues) =>
      editTarget
        ? pembimbingService.update(editTarget.id, { ...values, role: "admin_ulp" })
        : pembimbingService.create({ ...values, role: "admin_ulp" }),
    onSuccess: (result, values) => {
      if (!editTarget) {
        const tempPwd = (result as { temp_password?: string }).temp_password;
        if (tempPwd) {
          setTempPassword({ nama: values.nama, password: tempPwd, email: values.email, nomorHp: values.nomor_hp });
        } else {
          toast.success("Akun Admin ULP berhasil ditambahkan");
        }

        // Send Email notification to newly created Admin ULP
        const assignedCabang = (cabangList as Cabang[]).find((c) => c.id === values.cabang);
        const unitName = assignedCabang ? assignedCabang.nama_cabang : "PT PLN (Persero) UP3 Padang";
        const pwdToSend = tempPwd || (result as any)?.temp_password || "Password terlampir";

        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "account_created",
            email: values.email,
            nama: values.nama,
            password: pwdToSend,
            roleLabel: "Admin ULP",
            creatorName: "Super Admin UP3 Padang",
            unitName,
          }),
        }).catch((e) => console.error("Failed to send admin ULP account email", e));
        dashboardService.pushNotification({
          title: "Sukses Pembuatan Akun Admin ULP",
          message: `Akun Admin ULP untuk ${values.nama} berhasil dibuat.`,
          type: "success",
          role: "admin",
        });
      } else {
        toast.success("Akun Admin ULP berhasil diperbarui");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-ulp-list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setShowForm(false);
      setEditTarget(null);
      resetForm();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pembimbingService.delete(id),
    onSuccess: () => {
      toast.success("Akun Admin ULP berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-ulp-list"] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const cabangMap = useMemo(() => {
    const map = new Map<string, string>();
    (cabangList as Cabang[]).forEach((c) => {
      if (c.id) map.set(c.id, c.nama_cabang);
      if (c.id) map.set(c.id.toLowerCase(), c.nama_cabang);
    });
    return map;
  }, [cabangList]);

  const columns: Column<Pembimbing>[] = [
    { key: "nama", title: "Nama Penanggung Jawab ULP" },
    { key: "email", title: "Email Resmi ULP" },
    {
      key: "cabang",
      title: "Unit ULP Yang Dikelola",
      render: (row) => {
        const name = (row as any).nama_cabang || cabangMap.get(row.cabang) || cabangMap.get(String(row.cabang || "").toLowerCase()) || row.cabang || "-";
        return <span className="font-semibold text-foreground">{name}</span>;
      },
    },
    { key: "status", title: "Status Akun", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions" as keyof Pembimbing,
      title: "Aksi",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpen(row)} title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => setDeleteTarget(row)} title="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Admin ULP"
        description="Daftarkan dan atur penanggung jawab Admin ULP per unit ULP"
      >
        <Button size="sm" className="bg-black hover:bg-black-700 text-white font-medium shadow-xs" onClick={() => handleOpen()} id="add-admin-ulp-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Admin ULP
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email Admin ULP..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); reset(); }}
            id="admin-ulp-search"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v as "aktif" | "nonaktif"); reset(); }}>
          <SelectTrigger className="w-40" id="status-filter">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        loading={isLoading}
        page={page}
        limit={limit}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={setLimit}
        rowKey="id"
        emptyState={
          <EmptyState
            icon={ShieldCheck}
            title="Belum ada Admin ULP"
            description="Tambahkan penanggung jawab Admin ULP pertama dengan mengklik tombol Tambah Admin ULP Baru"
          />
        }
      />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditTarget(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black-600 dark:text-black-400">
              <ShieldCheck className="w-5 h-5" />
              {editTarget ? "Edit Akun Admin ULP" : "Tambah Akun Admin ULP Baru"}
            </DialogTitle>
          </DialogHeader>

          {!editTarget && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Password akan <strong>di-generate otomatis</strong> oleh sistem. Setelah disimpan, Anda dapat menyalinnya dan mengirimkannya ke penanggung jawab ULP.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ulp-nama">Nama Penanggung Jawab</Label>
                <Input id="ulp-nama" placeholder="Contoh: Admin ULP Belanti" {...register("nama")} />
                {errors.nama && <p className="text-red-500 text-xs">{errors.nama.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ulp-email">Email Resmi ULP</Label>
                <Input id="ulp-email" type="email" placeholder="admin.ulp@gmail.com" {...register("email")} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ulp-hp" className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> No. HP / WhatsApp <span className="text-muted-foreground">(opsional)</span>
                </Label>
                <Input id="ulp-hp" type="tel" placeholder="08xxxxxxxxxx" {...register("nomor_hp")} />
              </div>

              <div className="space-y-1.5">
                <Label>Unit ULP Yang Dikelola</Label>
                <Select value={watch("cabang") || ""} onValueChange={(v) => setValue("cabang", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Pilih Unit ULP" /></SelectTrigger>
                  <SelectContent>
                    {(cabangList as Cabang[]).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cabang && <p className="text-red-500 text-xs">{errors.cabang.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status Akun</Label>
              <Select
                value={watch("status") || "aktif"}
                onValueChange={(v) => setValue("status", v as "aktif" | "nonaktif", { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editTarget ? "Simpan Perubahan" : "Buat Akun Admin ULP"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Hapus Admin ULP
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus akun Admin ULP <strong>{deleteTarget?.nama}</strong>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Temp Password Dialog */}
      {tempPassword && (
        <TempPasswordDialog
          open={!!tempPassword}
          onClose={() => setTempPassword(null)}
          nama={tempPassword.nama}
          password={tempPassword.password}
          email={tempPassword.email}
          nomorHp={tempPassword.nomorHp}
        />
      )}
    </div>
  );
}
