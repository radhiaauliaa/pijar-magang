// features/cabang/components/CabangPage.tsx
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, AlertCircle, MapPin, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cabangService } from "@/services/cabang.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cabangSchema, type CabangFormValues } from "@/lib/validations";
import { getErrorMessage } from "@/services/api";
import type { Cabang } from "@/types";

export function CabangPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Cabang | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cabang | null>(null);

  const { data: cabangList = [], isLoading } = useQuery({
    queryKey: ["cabang"],
    queryFn: cabangService.getAll,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CabangFormValues>({
    resolver: zodResolver(cabangSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: CabangFormValues) =>
      editTarget ? cabangService.update(editTarget.id, data) : cabangService.create(data),
    onSuccess: () => {
      toast.success(editTarget ? "Unit diperbarui" : "Unit berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["cabang"] });
      setShowForm(false);
      setEditTarget(null);
      reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cabangService.delete(id),
    onSuccess: () => {
      toast.success("Unit berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["cabang"] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Kelola Unit" description="Atur unit dan kapasitas mahasiswa">
        <Button size="sm" onClick={() => { setEditTarget(null); reset({}); setShowForm(true); }} id="add-cabang-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Unit
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
      ) : cabangList.length === 0 ? (
        <EmptyState icon={MapPin} title="Belum ada unit" description="Tambahkan unit pertama">
          <Button size="sm" onClick={() => setShowForm(true)}>Tambah Unit</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cabangList.map((c) => {
            const pct = c.kapasitas > 0 ? Math.round((c.jumlah_mahasiswa / c.kapasitas) * 100) : 0;
            const full = c.jumlah_mahasiswa >= c.kapasitas;
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="font-semibold">{c.nama_cabang}</p>
                        <p className="text-sm text-muted-foreground">{c.jumlah_mahasiswa}/{c.kapasitas} mahasiswa</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setEditTarget(c); reset({ nama_cabang: c.nama_cabang, kapasitas: c.kapasitas }); setShowForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteTarget(c)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} className={`h-2 ${full ? "[&>div]:bg-red-500" : "[&>div]:bg-amber-500"}`} />
                  <p className={`text-xs mt-1 ${full ? "text-red-500" : "text-muted-foreground"}`}>
                    {full ? "Kapasitas penuh" : `Sisa ${c.kapasitas - c.jumlah_mahasiswa} slot`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) { setEditTarget(null); reset({}); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Unit" : "Tambah Unit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama-cabang">Nama Unit</Label>
              <Input id="nama-cabang" placeholder="Contoh: ULP Belanti" {...register("nama_cabang")} />
              {errors.nama_cabang && <p className="text-red-500 text-xs">{errors.nama_cabang.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kapasitas-cabang">Kapasitas</Label>
              <Input id="kapasitas-cabang" type="number" min={1} placeholder="20" {...register("kapasitas")} />
              {errors.kapasitas && <p className="text-red-500 text-xs">{errors.kapasitas.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editTarget ? "Simpan" : "Tambah"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" />Hapus Unit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin hapus unit <strong>{deleteTarget?.nama_cabang}</strong>?</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
