// features/mahasiswa/components/MahasiswaPage.tsx
"use client";
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Download, Upload, Trash2, Pencil, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { mahasiswaService } from "@/services/mahasiswa.service";
import { divisiService } from "@/services/divisi.service";
import { cabangService } from "@/services/cabang.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { MahasiswaForm } from "./MahasiswaForm";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/utils";
import type { Mahasiswa, MahasiswaStatus, Divisi, Cabang } from "@/types";
import { getErrorMessage } from "@/services/api";

export function MahasiswaPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { page, limit, setPage, setLimit, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MahasiswaStatus | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Mahasiswa | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mahasiswa | null>(null);

  const [showAllDivisi, setShowAllDivisi] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["mahasiswa", page, limit, debouncedSearch, statusFilter],
    queryFn: () =>
      mahasiswaService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
  });

  const rawItems = data?.items ?? [];
  const displayItems = useMemo(() => {
    if (user?.role === "pembimbing") {
      return rawItems.filter((mhs) => {
        const isPembimbingMatch =
          mhs.pembimbing === user.id ||
          mhs.pembimbing === user.email ||
          mhs.pembimbing === user.nama ||
          (user.id && mhs.pembimbing && String(mhs.pembimbing).toLowerCase() === String(user.id).toLowerCase()) ||
          (user.email && mhs.pembimbing && String(mhs.pembimbing).toLowerCase() === String(user.email).toLowerCase()) ||
          (user.nama && mhs.pembimbing && String(mhs.pembimbing).toLowerCase() === String(user.nama).toLowerCase());

        if (showAllDivisi) {
          const isDivisiMatch = user.divisi && (mhs.divisi === user.divisi || (mhs as any).divisi_id === user.divisi);
          return isPembimbingMatch || isDivisiMatch;
        }

        return isPembimbingMatch;
      });
    }
    return rawItems;
  }, [rawItems, user, showAllDivisi]);

  const { data: divisiList = [] } = useQuery({
    queryKey: ["divisi"],
    queryFn: () => divisiService.getAll(),
  });

  const { data: cabangList = [] } = useQuery({
    queryKey: ["cabang"],
    queryFn: cabangService.getAll,
  });

  const divisiMap = new Map((divisiList as Divisi[]).map((d) => [d.id, d.nama_divisi]));
  const cabangMap = new Map((cabangList as Cabang[]).map((c) => [c.id, c.nama_cabang]));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mahasiswaService.delete(id),
    onSuccess: () => {
      toast.success("Mahasiswa berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["mahasiswa"] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    reset();
  }, [reset]);

  const handleFilterStatus = useCallback((v: string) => {
    setStatusFilter(v === "all" ? "" : v as MahasiswaStatus);
    reset();
  }, [reset]);

  // Excel import
  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws) as Record<string, string>[];
      if (rows.length === 0) { toast.error("File kosong"); return; }
      const result = await mahasiswaService.importBulk(rows as any);
      toast.success(`${result.created} mahasiswa berhasil diimpor`);
      if (result.errors.length > 0) toast.warning(`${result.errors.length} baris gagal`);
      queryClient.invalidateQueries({ queryKey: ["mahasiswa"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    e.target.value = "";
  }, [queryClient]);

  // Excel export for active students with formatted headers and readable names
  const handleExport = useCallback(async () => {
    try {
      const res = await mahasiswaService.getAll({ page: 1, limit: 1000 });
      const allStudents = res.items || [];
      const activeStudents = allStudents.filter((m) => {
        const st = String(m.status || "").toLowerCase().trim();
        return st === "aktif" || st === "diterima" || st === "";
      });

      if (activeStudents.length === 0) {
        toast.error("Tidak ada data mahasiswa aktif untuk di-export");
        return;
      }

      const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

      const headerRow = [
        "No", "Nama Mahasiswa", "NIM", "Universitas", "Program Studi",
        "Email", "Nomor HP", "Divisi", "Unit / Cabang", "Tanggal Mulai", "Tanggal Selesai", "Status"
      ];

      const rowsData = activeStudents.map((mhs, idx) => {
        const divName = divisiMap.get(mhs.divisi) || mhs.divisi || "-";
        const cabName = cabangMap.get(mhs.cabang) || mhs.cabang || "-";
        return [
          idx + 1,
          mhs.nama,
          mhs.nim,
          mhs.universitas,
          mhs.program_studi,
          mhs.email,
          mhs.nomor_hp || "-",
          divName,
          cabName,
          mhs.tanggal_mulai ? formatDate(mhs.tanggal_mulai) : "-",
          mhs.tanggal_selesai ? formatDate(mhs.tanggal_selesai) : "-",
          mhs.status ? mhs.status.charAt(0).toUpperCase() + mhs.status.slice(1) : "Aktif",
        ];
      });

      const sheetData = [
        ["Daftar Mahasiswa Magang PIJAR - PT PLN (Persero)"],
        [`Tanggal Export: ${todayStr}`],
        [],
        headerRow,
        ...rowsData,
      ];

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
      ];

      ws["!cols"] = [
        { wch: 6 },  // No
        { wch: 28 }, // Nama
        { wch: 16 }, // NIM
        { wch: 32 }, // Universitas
        { wch: 22 }, // Prodi
        { wch: 28 }, // Email
        { wch: 16 }, // HP
        { wch: 24 }, // Divisi
        { wch: 24 }, // Unit
        { wch: 18 }, // Mulai
        { wch: 18 }, // Selesai
        { wch: 12 }, // Status
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa Aktif");
      XLSX.writeFile(wb, `Daftar_Mahasiswa_Aktif_${new Date().toISOString().slice(0, 10)}.xlsx`);

      toast.success("Daftar Mahasiswa Aktif berhasil di-export ke Excel Spreadsheet!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [divisiMap, cabangMap]);

  const columns: Column<Mahasiswa>[] = [
    { key: "nama", title: "Nama" },
    { key: "nim", title: "NIM" },
    { key: "universitas", title: "Universitas" },
    {
      key: "divisi",
      title: "Divisi",
      render: (row) => divisiMap.get(row.divisi) ?? row.divisi ?? "-",
    },
    {
      key: "cabang",
      title: "Unit",
      render: (row) => cabangMap.get(row.cabang) ?? row.cabang ?? "-",
    },

    {
      key: "tanggal_mulai",
      title: "Mulai",
      render: (row) => formatDate(row.tanggal_mulai),
    },
    {
      key: "tanggal_selesai",
      title: "Selesai",
      render: (row) => formatDate(row.tanggal_selesai),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions" as keyof Mahasiswa,
      title: "Aksi",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => { setEditTarget(row); setShowForm(true); }}
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => setDeleteTarget(row)}
            title="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Kelola Mahasiswa" description="Manajemen data mahasiswa magang">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button size="sm" onClick={() => { setEditTarget(null); setShowForm(true); }} id="add-mahasiswa-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIM, universitas..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            id="mahasiswa-search"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={handleFilterStatus}>
          <SelectTrigger className="w-40" id="status-filter">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Selesai">Selesai</SelectItem>
            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>

        {user?.role === "pembimbing" && (
          <Button
            variant="outline"
            size="sm"
            className="h-10 text-xs font-bold border-sky-600/40 text-sky-700 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20 shrink-0"
            onClick={() => setShowAllDivisi(!showAllDivisi)}
          >
            {showAllDivisi ? "🏢 Tampil: Semua Divisi" : "👤 Tampil: Bimbingan Saya"}
          </Button>
        )}
      </div>

      <DataTable
        data={displayItems}
        columns={columns}
        loading={isLoading}
        page={page}
        limit={limit}
        total={user?.role === "pembimbing" ? displayItems.length : (data?.total ?? 0)}
        onPageChange={setPage}
        onLimitChange={setLimit}
        rowKey="id"
        emptyState={
          <EmptyState
            title="Belum ada mahasiswa"
            description="Tambahkan mahasiswa pertama dengan klik tombol Tambah"
          />
        }
      />

      {/* Add/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditTarget(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</DialogTitle>
          </DialogHeader>
          <MahasiswaForm
            defaultValues={editTarget ?? undefined}
            onSuccess={() => {
              setShowForm(false);
              setEditTarget(null);
              queryClient.invalidateQueries({ queryKey: ["mahasiswa"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Hapus Mahasiswa
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              id="confirm-delete-btn"
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
