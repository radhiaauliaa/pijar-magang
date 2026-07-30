// features/auth/components/AktivasiForm.tsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const aktiavasiSchema = z
  .object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    konfirmasi_password: z.string(),
  })
  .refine((d) => d.password === d.konfirmasi_password, {
    message: "Password tidak cocok",
    path: ["konfirmasi_password"],
  });

type AktivasiFormValues = z.infer<typeof aktiavasiSchema>;

export function AktivasiForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AktivasiFormValues>({
    resolver: zodResolver(aktiavasiSchema),
    defaultValues: { email: emailParam },
  });

  const onSubmit = async (data: AktivasiFormValues) => {
    setIsSubmitting(true);
    try {
      await authService.aktivasiPembimbing(data);
      toast.success("Akun berhasil diaktivasi! Silakan login.");
      router.push("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 h-11";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-white">Aktivasi Akun Pembimbing</h2>
        <p className="text-slate-400 text-sm mt-1">
          Buat password untuk mengaktifkan akunmu sebagai pembimbing.
        </p>
      </div>

      {/* Email (readonly jika ada param) */}
      <div className="space-y-1.5">
        <Label htmlFor="aktivasi-email" className="text-slate-300 text-sm">
          Email
        </Label>
        <Input
          id="aktivasi-email"
          type="email"
          placeholder="email@pembimbing.com"
          className={`${inputClass} ${emailParam ? "opacity-70 cursor-not-allowed" : ""}`}
          readOnly={!!emailParam}
          {...register("email")}
        />
        {emailParam && (
          <p className="text-slate-500 text-xs">Email diisi otomatis dari link aktivasi.</p>
        )}
        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="aktivasi-password" className="text-slate-300 text-sm">
          Buat Password Baru
        </Label>
        <div className="relative">
          <Input
            id="aktivasi-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 karakter"
            className={`${inputClass} pr-11`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
      </div>

      {/* Konfirmasi Password */}
      <div className="space-y-1.5">
        <Label htmlFor="aktivasi-confirm" className="text-slate-300 text-sm">
          Konfirmasi Password
        </Label>
        <div className="relative">
          <Input
            id="aktivasi-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Ulangi password"
            className={`${inputClass} pr-11`}
            {...register("konfirmasi_password")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.konfirmasi_password && (
          <p className="text-red-400 text-xs">{errors.konfirmasi_password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        id="aktivasi-submit-btn"
        className="w-full h-11 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 rounded-xl transition-all hover:shadow-xl hover:shadow-violet-500/25"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengaktivasi...
          </>
        ) : (
          <>
            <KeyRound className="w-4 h-4" />
            Aktifkan Akun
          </>
        )}
      </Button>
    </form>
  );
}
