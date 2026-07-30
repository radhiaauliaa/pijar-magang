// features/divisi/components/DivisiPage.tsx
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, AlertCircle, Building2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { divisiService } from "@/services/divisi.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { divisiSchema, type DivisiFormValues } from "@/lib/validations";
import { getErrorMessage } from "@/services/api";
import { getCurrentUser } from "@/lib/auth";
import type { Divisi } from "@/types";

export function DivisiPage() {
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Divisi | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Divisi | null>(null);

  const { data: divisiList = [], isLoading } = useQuery({
    queryKey: ["divisi", currentUser?.role, currentUser?.cabang],
    queryFn: () => divisiService.getAll(currentUser?.role === "admin_ulp" && currentUser?.cabang ? { cabang: currentUser.cabang } : undefined),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DivisiFormValues>({
    resolver: zodResolver(divisiSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: DivisiFormValues) =>
      editTarget
        ? divisiService.update(editTarget.id, data)
        : divisiService.create({
            ...data,
            cabang: currentUser?.role === "admin_ulp" ? currentUser?.cabang : undefined,
          }),
    onSuccess: () => {
      toast.success(editTarget ? "Divisi diperbarui" : "Divisi berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
      setShowForm(false);
      setEditTarget(null);
      reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => divisiService.delete(id),
    onSuccess: () => {
      toast.success("Divisi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleOpen = (divisi?: Divisi) => {
    if (divisi) {
      setEditTarget(divisi);
      reset({ nama_divisi: divisi.nama_divisi, kapasitas: divisi.kapasitas });
    } else {
      setEditTarget(null);
      reset({});
    }
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Kelola Divisi" description="Atur divisi dan kapasitas mahasiswa">
        <Button size="sm" onClick={() => handleOpen()} id="add-divisi-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Divisi
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
      ) : divisiList.length === 0 ? (
        <EmptyState icon={Building2} title="Belum ada divisi" description="Tambahkan divisi pertama">
          <Button size="sm" onClick={() => handleOpen()}>Tambah Divisi</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisiList.map((d) => {
            const pct = d.kapasitas > 0 ? Math.round((d.jumlah_mahasiswa / d.kapasitas) * 100) : 0;
            const full = d.jumlah_mahasiswa >= d.kapasitas;
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{d.nama_divisi}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {d.jumlah_mahasiswa}/{d.kapasitas} mahasiswa
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpen(d)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteTarget(d)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <Progress value={pct} className={`h-2 ${full ? "[&>div]:bg-red-500" : ""}`} />
                  <p className={`text-xs mt-1 font-medium ${full ? "text-red-500" : "text-muted-foreground"}`}>
                    {full ? "Kapasitas penuh" : `Sisa ${d.kapasitas - d.jumlah_mahasiswa} slot`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) { setEditTarget(null); reset({}); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Divisi" : "Tambah Divisi"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama-divisi">Nama Divisi</Label>
              <Input id="nama-divisi" placeholder="Contoh: IT Development" {...register("nama_divisi")} />
              {errors.nama_divisi && <p className="text-red-500 text-xs">{errors.nama_divisi.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kapasitas-divisi">Kapasitas Mahasiswa</Label>
              <Input id="kapasitas-divisi" type="number" min={1} placeholder="10" {...register("kapasitas")} />
              {errors.kapasitas && <p className="text-red-500 text-xs">{errors.kapasitas.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editTarget ? "Simpan" : "Tambah"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Hapus Divisi
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin hapus divisi <strong>{deleteTarget?.nama_divisi}</strong>?</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
