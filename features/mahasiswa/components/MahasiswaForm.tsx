// features/mahasiswa/components/MahasiswaForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { mahasiswaSchema, type MahasiswaFormValues } from "@/lib/validations";
import { mahasiswaService } from "@/services/mahasiswa.service";
import { dashboardService } from "@/services/dashboard.service";
import { divisiService } from "@/services/divisi.service";
import { cabangService } from "@/services/cabang.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/services/api";
import type { Mahasiswa, Divisi, Cabang } from "@/types";
import { getCurrentUser } from "@/lib/auth";

interface MahasiswaFormProps {
  defaultValues?: Mahasiswa;
  onSuccess: () => void;
}

export function MahasiswaForm({ defaultValues, onSuccess }: MahasiswaFormProps) {
  const isEdit = !!defaultValues;
  const currentUser = getCurrentUser();
  const isAdminUlp = currentUser?.role === "admin_ulp";

  const [capacityAlert, setCapacityAlert] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Divisi[]>([]);

  const { data: divisiList = [] } = useQuery({
    queryKey: ["divisi"],
    queryFn: () => divisiService.getAll(),
  });

  const { data: cabangList = [] } = useQuery({
    queryKey: ["cabang"],
    queryFn: cabangService.getAll,
  });

  const { data: pembimbingList = [] } = useQuery({
    queryKey: ["pembimbing-list"],
    queryFn: mahasiswaService.getPembimbingList,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MahasiswaFormValues>({
    resolver: zodResolver(mahasiswaSchema),
    defaultValues: defaultValues
      ? {
          nama: defaultValues.nama,
          nim: defaultValues.nim,
          universitas: defaultValues.universitas,
          program_studi: defaultValues.program_studi,
          email: defaultValues.email,
          nomor_hp: defaultValues.nomor_hp,
          tanggal_mulai: defaultValues.tanggal_mulai,
          tanggal_selesai: defaultValues.tanggal_selesai,
          divisi: defaultValues.divisi,
          cabang: defaultValues.cabang,
          pembimbing: defaultValues.pembimbing,
        }
      : undefined,
  });

  const selectedDivisi = watch("divisi");
  const selectedCabang = watch("cabang") || defaultValues?.cabang;

  // Filter Pembimbing List to show only supervisors registered to the selected / user ULP branch
  const filteredPembimbingList = pembimbingList.filter((p) => {
    if (!isAdminUlp && !selectedCabang) return true;

    const pCab = (p.cabang || "").toLowerCase();
    const selCab = (selectedCabang || "").toLowerCase();
    const userCab = (currentUser?.cabang || "").toLowerCase();

    if (!pCab) return false;
    if (pCab === selCab || (userCab && pCab === userCab)) return true;

    const matchSel = selCab && (pCab.includes(selCab) || selCab.includes(pCab));
    const matchUser = userCab && (pCab.includes(userCab) || userCab.includes(pCab));
    return matchSel || matchUser;
  });

  // Check capacity when divisi changes
  useEffect(() => {
    if (!selectedDivisi) { setCapacityAlert(null); return; }
    divisiService.checkCapacity(selectedDivisi).then((result) => {
      if (!result.available) {
        setCapacityAlert(`Kapasitas penuh (tersisa: ${result.remaining})`);
        setRecommendations(result.recommendations);
      } else {
        setCapacityAlert(null);
        setRecommendations([]);
      }
    }).catch(() => {});
  }, [selectedDivisi]);

  const mutation = useMutation({
    mutationFn: (data: MahasiswaFormValues) =>
      isEdit
        ? mahasiswaService.update(defaultValues!.id, data)
        : mahasiswaService.create(data),
    onSuccess: (_, variables) => {
      toast.success(isEdit ? "Mahasiswa berhasil diperbarui" : "Mahasiswa berhasil ditambahkan");

      // Send email & in-app notification for Update Penempatan
      if (variables.email) {
        const assignedDiv = divisiList.find((d) => d.id === variables.divisi);
        const assignedPmb = pembimbingList.find((p) => p.id === variables.pembimbing);
        const assignedCab = (cabangList as Cabang[]).find((c) => c.id === variables.cabang);

        const divisiName = assignedDiv ? assignedDiv.nama_divisi : variables.divisi;
        const pembimbingName = assignedPmb ? assignedPmb.nama : variables.pembimbing;
        const unitName = assignedCab ? assignedCab.nama_cabang : "PLN ULP";

        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "update_penempatan",
            email: variables.email,
            nama: variables.nama,
            unitName,
            divisiName,
            pembimbingName,
          }),
        }).catch((e) => console.error("Failed to send update penempatan email", e));
        dashboardService.pushNotification({
          title: isAdminUlp ? "Verifikasi Mahasiswa ULP Berhasil" : "Data Mahasiswa Diperbarui",
          message: `Data mahasiswa ${variables.nama} berhasil diverifikasi (Pembimbing: ${pembimbingName}).`,
          type: "success",
          role: isAdminUlp ? "admin_ulp" : "admin",
        });
      }

      onSuccess();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const fields: { id: keyof MahasiswaFormValues; label: string; placeholder?: string; type?: string }[] = [
    { id: "nama", label: "Nama Lengkap", placeholder: "Masukkan nama lengkap" },
    { id: "nim", label: "NIM", placeholder: "Masukkan NIM" },
    { id: "universitas", label: "Universitas", placeholder: "Nama universitas" },
    { id: "program_studi", label: "Program Studi", placeholder: "Nama program studi" },
    { id: "email", label: "Email", placeholder: "email@contoh.com", type: "email" },
    { id: "nomor_hp", label: "Nomor HP", placeholder: "08xxxxxxxxxx" },
    { id: "tanggal_mulai", label: "Tanggal Mulai", type: "date" },
    { id: "tanggal_selesai", label: "Tanggal Selesai", type: "date" },
  ];

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.id} className="space-y-1.5">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input
              id={f.id}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              {...register(f.id)}
            />
            {errors[f.id] && (
              <p className="text-red-500 text-xs">{errors[f.id]?.message}</p>
            )}
          </div>
        ))}
      </div>

      {/* Divisi */}
      <div className="space-y-1.5">
        <Label>Divisi</Label>
        <Select
          value={watch("divisi")}
          onValueChange={(v) => setValue("divisi", v, { shouldValidate: true })}
        >
          <SelectTrigger id="divisi-select">
            <SelectValue placeholder="Pilih divisi" />
          </SelectTrigger>
          <SelectContent>
            {divisiList.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.nama_divisi} ({d.jumlah_mahasiswa}/{d.kapasitas})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.divisi && <p className="text-red-500 text-xs">{errors.divisi.message}</p>}

        {/* Capacity warning */}
        {capacityAlert && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">{capacityAlert}</p>
              {recommendations.length > 0 && (
                <p className="text-amber-600 dark:text-amber-500 text-xs mt-1">
                  Rekomendasi: {recommendations.map((r) => `${r.nama_divisi} (${r.jumlah_mahasiswa}/${r.kapasitas})`).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unit */}
      <div className="space-y-1.5">
        <Label>Unit {isAdminUlp && <span className="text-xs text-muted-foreground font-normal">(Terkunci di ULP Anda)</span>}</Label>
        <Select
          value={watch("cabang")}
          disabled={isAdminUlp}
          onValueChange={(v) => setValue("cabang", v, { shouldValidate: true })}
        >
          <SelectTrigger id="cabang-select" className={isAdminUlp ? "bg-muted cursor-not-allowed opacity-80" : ""}>
            <SelectValue placeholder="Pilih unit" />
          </SelectTrigger>
          <SelectContent>
            {(cabangList as Cabang[]).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nama_cabang} ({c.jumlah_mahasiswa}/{c.kapasitas})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cabang && <p className="text-red-500 text-xs">{errors.cabang.message}</p>}
      </div>

      {/* Pembimbing */}
      <div className="space-y-1.5">
        <Label>Pembimbing</Label>
        <Select
          value={watch("pembimbing")}
          onValueChange={(v) => setValue("pembimbing", v, { shouldValidate: true })}
        >
          <SelectTrigger id="pembimbing-select">
            <SelectValue placeholder="Pilih pembimbing" />
          </SelectTrigger>
          <SelectContent>
            {filteredPembimbingList.length === 0 ? (
              <SelectItem value="none" disabled>
                Belum ada pembimbing terdaftar di ULP ini
              </SelectItem>
            ) : (
              filteredPembimbingList.map((p) => {
                const divName = divisiList.find((d) => d.id === p.divisi)?.nama_divisi;
                return (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nama}{divName ? ` (${divName})` : ""}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        {errors.pembimbing && <p className="text-red-500 text-xs">{errors.pembimbing.message}</p>}
      </div>


      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={mutation.isPending} id="submit-mahasiswa-btn">
          {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Tambah Mahasiswa"}
        </Button>
      </div>
    </form>
  );
}
