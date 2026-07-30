// features/jurnal/components/JurnalMahasiswaPage.tsx — Mahasiswa view
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Eye, Download, Trash2, Filter, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { jurnalService } from "@/services/jurnal.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JurnalForm } from "./JurnalForm";
import { usePagination } from "@/hooks/usePagination";
import { formatDate, getDirectImageUrl } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Jurnal } from "@/types";

export function JurnalMahasiswaPage() {
  const queryClient = useQueryClient();
  const { page, limit, setPage, setLimit } = usePagination();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Jurnal | null>(null);
  const [viewTarget, setViewTarget] = useState<Jurnal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Jurnal | null>(null);

  // Filter & Sort states
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["my-jurnal", page, limit],
    queryFn: () => jurnalService.getMy({ page, limit }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jurnalService.delete(id),
    onSuccess: () => {
      toast.success("Jurnal berhasil dihapus!");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["my-jurnal"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleDownloadPDF = async () => {
    try {
      const url = await jurnalService.generatePDF("me");
      window.open(url, "_blank");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const rawItems = data?.items ?? [];
  let filteredItems = rawItems.filter((item) => {
    if (statusFilter !== "all") {
      if (String(item.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    return true;
  });

  filteredItems.sort((a, b) => {
    const dA = String(a.tanggal || "").slice(0, 10);
    const dB = String(b.tanggal || "").slice(0, 10);
    if (dA !== dB) {
      return sortOrder === "newest" ? dB.localeCompare(dA) : dA.localeCompare(dB);
    }
    return 0;
  });

  const columns: Column<Jurnal>[] = [
    { key: "tanggal", title: "Tanggal", render: (r) => formatDate(r.tanggal) },
    {
      key: "foto" as keyof Jurnal,
      title: "Foto",
      render: (r) =>
        r.foto && r.foto !== "-" ? (
          <div className="relative group w-10 h-10 shrink-0">
            <img
              src={getDirectImageUrl(r.foto)}
              alt="Foto Kegiatan"
              className="w-10 h-10 object-cover rounded-lg border border-border shadow-xs cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setViewTarget(r)}
            />
          </div>
        ) : (
          "—"
        ),
    },
    { key: "judul", title: "Judul Kegiatan" },
    { key: "status", title: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions" as keyof Jurnal,
      title: "Aksi",
      className: "w-28",
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewTarget(r)} title="Detail Jurnal">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {(r.status === "draft" || r.status === "submitted") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => { setEditTarget(r); setShowForm(true); }}
              title="Edit Jurnal"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            onClick={() => setDeleteTarget(r)}
            title="Hapus Jurnal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Jurnal Saya" description="Kelola jurnal harian magang Anda">
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button size="sm" onClick={() => { setEditTarget(null); setShowForm(true); }} id="add-jurnal-btn">
          <Plus className="w-4 h-4 mr-2" />
          Isi Jurnal
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 text-xs bg-background" id="filter-jurnal-status-select">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="submitted">Menunggu</SelectItem>
            <SelectItem value="verified">Disetujui</SelectItem>
            <SelectItem value="revisi">Revisi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
          <SelectTrigger className="w-28 h-9 text-xs bg-background" id="filter-jurnal-sort-select">
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
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        )}
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
        emptyState={
          <EmptyState
            title="Belum ada jurnal"
            description="Mulai isi jurnal harian pertama Anda"
          />
        }
      />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditTarget(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Jurnal" : "Isi Jurnal Baru"}</DialogTitle>
          </DialogHeader>
          <JurnalForm
            defaultValues={editTarget ?? undefined}
            onSuccess={() => {
              setShowForm(false);
              setEditTarget(null);
              queryClient.invalidateQueries({ queryKey: ["my-jurnal"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(v) => { if (!v) setViewTarget(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Jurnal</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-base">{viewTarget.judul}</p>
                <StatusBadge status={viewTarget.status} />
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(viewTarget.tanggal)}</p>
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Deskripsi Kegiatan:</p>
                <p className="text-sm leading-relaxed whitespace-pre-line">{viewTarget.deskripsi}</p>
              </div>
              {viewTarget.foto && viewTarget.foto !== "-" && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-medium text-muted-foreground">Foto Kegiatan:</p>
                  <div className="relative w-full max-h-80 overflow-hidden rounded-xl border border-border shadow-xs">
                    <img
                      src={getDirectImageUrl(viewTarget.foto)}
                      alt="Foto Jurnal"
                      className="w-full h-auto object-cover max-h-80 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" /> Hapus Jurnal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus jurnal <strong>"{deleteTarget?.judul}"</strong> bertanggal {deleteTarget ? formatDate(deleteTarget.tanggal) : ""}?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                id="confirm-delete-jurnal-btn"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Hapus Jurnal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
