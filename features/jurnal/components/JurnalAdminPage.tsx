// features/jurnal/components/JurnalPage.tsx — Admin view
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { jurnalService } from "@/services/jurnal.service";
import { dashboardService } from "@/services/dashboard.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate, getDirectImageUrl } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Jurnal, JurnalStatus } from "@/types";

/** Helper to robustly compare item.tanggal with date input value (YYYY-MM-DD) */
function isSameDateStr(itemDate: any, filterDate: string): boolean {
  if (!filterDate) return true;
  if (!itemDate) return false;

  const raw = String(itemDate).trim();
  if (raw.startsWith(filterDate)) return true;

  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const isoDate = `${year}-${month}-${day}`;
      if (isoDate === filterDate) return true;
    }
  } catch {}

  return false;
}

export function JurnalAdminPage() {
  const queryClient = useQueryClient();
  const { page, limit, setPage, setLimit, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JurnalStatus | "">("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewTarget, setViewTarget] = useState<Jurnal | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["jurnal-admin", page, limit, debouncedSearch, statusFilter],
    queryFn: () =>
      jurnalService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => jurnalService.verify(id, "verified"),
    onSuccess: () => {
      toast.success("Jurnal berhasil diverifikasi");
      dashboardService.pushNotification({
        title: "Jurnal Diverifikasi",
        message: "Jurnal harian mahasiswa bimbingan telah berhasil diverifikasi.",
        type: "success",
        role: "pembimbing",
      });
      queryClient.invalidateQueries({ queryKey: ["jurnal-admin"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rawItems = data?.items ?? [];

  // Filter local items by selected date and search text
  let filteredItems = rawItems.filter((item) => {
    const matchDate = isSameDateStr(item.tanggal, selectedDate);
    const mName = String((item as any).mahasiswa_nama || item.mahasiswa_id || "").toLowerCase();
    const jTitle = String(item.judul || "").toLowerCase();
    const jDesc = String(item.deskripsi || "").toLowerCase();
    const q = debouncedSearch.toLowerCase().trim();
    const matchQuery = !q || mName.includes(q) || jTitle.includes(q) || jDesc.includes(q);
    return matchDate && matchQuery;
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
    { key: "mahasiswa_id", title: "Mahasiswa", render: (r) => (r as any).mahasiswa_nama || r.mahasiswa_id },
    { key: "tanggal", title: "Tanggal", render: (r) => formatDate(r.tanggal) },
    { key: "judul", title: "Judul", render: (r) => r.judul },
    { key: "status", title: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "id",
      title: "Aksi",
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewTarget(r)} title="Detail Jurnal">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {r.status === "submitted" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => verifyMutation.mutate(r.id)}
              title="Verifikasi Jurnal"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Jurnal Mahasiswa" description="Pantau dan verifikasi jurnal harian mahasiswa" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau mahasiswa..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); reset(); }}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v as JurnalStatus); reset(); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="submitted">Menunggu</SelectItem>
            <SelectItem value="verified">Terverifikasi</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
          </SelectContent>
        </Select>

        {/* Single Date Filter */}
        <div className="flex items-center gap-2">
          <div
            className="relative flex items-center cursor-pointer group"
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input && "showPicker" in input) (input as any).showPicker();
            }}
          >
            <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors absolute left-3 pointer-events-none z-10" />
            <Input
              type="date"
              className="pl-9 pr-3 text-xs h-10 w-44 cursor-pointer rounded-xl bg-background border-border shadow-2xs"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); reset(); }}
            />
          </div>

          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedDate(""); reset(); }}
              className="text-xs text-muted-foreground hover:text-foreground h-10 px-2.5"
              title="Reset Tanggal"
            >
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
        emptyState={<EmptyState title="Belum ada jurnal" description="Jurnal mahasiswa akan muncul di sini" />}
      />

      {/* Detail Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(v) => { if (!v) setViewTarget(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Jurnal</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Mahasiswa</p>
                  <p className="font-medium">{(viewTarget as any).mahasiswa_nama || viewTarget.mahasiswa_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{formatDate(viewTarget.tanggal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={viewTarget.status} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Judul</p>
                <p className="font-medium">{viewTarget.judul}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Deskripsi</p>
                <p className="text-sm leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-lg border">
                  {viewTarget.deskripsi}
                </p>
              </div>

              {viewTarget.foto && viewTarget.foto !== "-" && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Foto</p>
                  <div className="relative w-full max-h-80 overflow-hidden rounded-xl border border-border shadow-xs">
                    <img
                      src={getDirectImageUrl(viewTarget.foto)}
                      alt="Foto Jurnal"
                      className="w-full h-auto object-cover max-h-80 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {viewTarget.status === "submitted" && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  onClick={() => { verifyMutation.mutate(viewTarget.id); setViewTarget(null); }}
                  disabled={verifyMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verifikasi Jurnal
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
