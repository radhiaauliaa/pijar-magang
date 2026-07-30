// features/jurnal/components/JurnalForm.tsx
"use client";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ImagePlus, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { jurnalSchema, type JurnalFormValues } from "@/lib/validations";
import { jurnalService } from "@/services/jurnal.service";
import { dashboardService } from "@/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/services/api";
import { CONFIG } from "@/constants/config";
import type { Jurnal } from "@/types";
import { useState } from "react";

interface JurnalFormProps {
  defaultValues?: Jurnal;
  onSuccess: () => void;
}

export function JurnalForm({ defaultValues, onSuccess }: JurnalFormProps) {
  const isEdit = !!defaultValues;
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValues?.foto ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JurnalFormValues>({
    resolver: zodResolver(jurnalSchema),
    defaultValues: {
      tanggal: defaultValues?.tanggal ?? new Date().toISOString().split("T")[0],
      judul: defaultValues?.judul ?? "",
      deskripsi: defaultValues?.deskripsi ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: JurnalFormValues) => {
      if (isEdit) {
        return jurnalService.update(defaultValues!.id, {
          tanggal: data.tanggal,
          judul: data.judul,
          deskripsi: data.deskripsi,
          foto: selectedFile ?? undefined,
        });
      }
      return jurnalService.create({
        tanggal: data.tanggal,
        judul: data.judul,
        deskripsi: data.deskripsi,
        foto: selectedFile ?? undefined,
      });
    },
    onSuccess: () => {
      toast.success(isEdit ? "Jurnal berhasil diperbarui" : "Jurnal berhasil disimpan");
      dashboardService.pushNotification({
        title: isEdit ? "Jurnal Diperbarui" : "Jurnal Harian Dikirim",
        message: isEdit
          ? "Jurnal harian Anda telah berhasil diperbarui."
          : "Jurnal harian Anda telah berhasil dikirim dan sedang menunggu verifikasi pembimbing.",
        type: "info",
      });
      onSuccess();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
      toast.error(`Ukuran foto maksimal ${CONFIG.MAX_FILE_SIZE_MB}MB`);
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="jurnal-tanggal">Tanggal</Label>
        <div className="relative">
          <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <Input
            id="jurnal-tanggal"
            type="date"
            className="pl-9 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:opacity-0"
            onClick={(e) => {
              try {
                (e.currentTarget as HTMLInputElement).showPicker();
              } catch {
                // ignore
              }
            }}
            {...register("tanggal")}
          />
        </div>
        {errors.tanggal && <p className="text-red-500 text-xs">{errors.tanggal.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jurnal-judul">Judul Kegiatan</Label>
        <Input id="jurnal-judul" placeholder="Contoh: Membuat laporan keuangan bulanan" {...register("judul")} />
        {errors.judul && <p className="text-red-500 text-xs">{errors.judul.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jurnal-deskripsi">Deskripsi Kegiatan</Label>
        <Textarea
          id="jurnal-deskripsi"
          rows={5}
          placeholder="Ceritakan kegiatan yang dilakukan hari ini secara detail..."
          {...register("deskripsi")}
        />
        {errors.deskripsi && <p className="text-red-500 text-xs">{errors.deskripsi.message}</p>}
      </div>

      {/* Photo upload */}
      <div className="space-y-1.5">
        <Label>Foto Kegiatan <span className="text-muted-foreground text-xs">(opsional, maks. {CONFIG.MAX_FILE_SIZE_MB}MB)</span></Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          id="foto-input"
          onChange={handleFileChange}
        />


        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-sm">Klik untuk upload foto</span>
          </button>
        )}
        {errors.foto && <p className="text-red-500 text-xs">{errors.foto.message as string}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={mutation.isPending} id="submit-jurnal-btn">
          {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Simpan Jurnal"}
        </Button>
      </div>
    </form>
  );
}
