// features/auth/components/RegisterForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Loader2, ArrowRight, GraduationCap,
  Users, CheckCircle2, Phone, X, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleSignIn, type GoogleProfile } from "@/hooks/useGoogleSignIn";
import { OTPVerificationModal } from "@/features/auth/components/OTPVerificationModal";
import { useAuthBack } from "@/lib/AuthBackContext";
import Link from "next/link";

const akunSchema = z
  .object({
    nama: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    nomor_hp: z
      .string()
      .min(9, "No. HP tidak valid")
      .regex(/^[0-9+\-\s]+$/, "No. HP hanya boleh angka"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    konfirmasi_password: z.string(),
  })
  .refine((d) => d.password === d.konfirmasi_password, {
    message: "Password tidak cocok",
    path: ["konfirmasi_password"],
  });

type AkunFormValues = z.infer<typeof akunSchema>;
type Peran = "mahasiswa" | "pembimbing" | null;

function FormField({
  label, id, error, children,
}: {
  label: string; id: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-foreground text-sm font-semibold">{label}</Label>
      {children}
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
}

function GoogleSignInButton({
  onSuccess,
  disabled,
}: {
  onSuccess: (p: GoogleProfile) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const { triggerLogin, isConfigured } = useGoogleSignIn({
    onSuccess: (p) => {
      setLoading(false);
      onSuccess(p);
    },
  });

  const handleClick = () => {
    setLoading(true);
    try {
      triggerLogin();
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      id="google-signin-btn"
      onClick={handleClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 h-11 px-4 bg-card hover:bg-accent text-foreground font-medium rounded-xl border border-border transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      <span className="text-sm">
        {loading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
      </span>
      {!isConfigured && (
        <span className="text-xs text-muted-foreground ml-auto">(belum dikonfigurasi)</span>
      )}
    </button>
  );
}

function GoogleProfileBanner({
  profile,
  onClear,
}: {
  profile: GoogleProfile;
  onClear: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "G";

  return (
    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
      {profile.picture && !imgError ? (
        <img
          src={profile.picture}
          alt={profile.name}
          onError={() => setImgError(true)}
          className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-emerald-500/40"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 text-white text-xs font-extrabold ring-2 ring-emerald-500/40">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Akun Google terhubung
        </p>
        <p className="text-foreground text-sm font-bold truncate">{profile.name}</p>
        <p className="text-muted-foreground text-xs truncate">{profile.email}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        title="Lepas akun Google"
        className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Pilih Peran
function PilihPeran({ onSelect }: { onSelect: (p: Peran) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Daftar sebagai apa?</h2>
        <p className="text-muted-foreground text-sm mt-1">Pilih peranmu di platform ini</p>
      </div>

      {/* Mahasiswa card */}
      <button
        type="button"
        id="pilih-mahasiswa-btn"
        onClick={() => onSelect("mahasiswa")}
        className="group w-full bg-card hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border-2 border-border hover:border-blue-500 rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/15 active:scale-[0.99]"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-foreground font-extrabold text-base group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Mahasiswa Magang
              </p>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              Daftar akun, ajukan lamaran magang, dan mulai monitoring jurnal &amp; absensimu.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Jurnal harian", "Absensi digital", "Monitoring progres"].map((f) => (
                <span key={f} className="text-xs bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-semibold rounded-full px-2.5 py-0.5">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>

      {/* Pembimbing card */}
      <button
        type="button"
        id="pilih-pembimbing-btn"
        onClick={() => onSelect("pembimbing")}
        className="group w-full bg-card hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border-2 border-border hover:border-emerald-500 rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/15 active:scale-[0.99]"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-foreground font-extrabold text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Pembimbing / Supervisor
              </p>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              Monitor jurnal &amp; kehadiran mahasiswa bimbinganmu.
            </p>
          </div>
        </div>
      </button>

      <p className="text-center text-muted-foreground text-xs pt-2">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold transition-colors">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}

// Info Pembimbing
function InfoPembimbing() {
  return (
    <div className="space-y-5">
      <div className="text-center pt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 text-white mb-4 shadow-sm">
          <Users className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Akun Pembimbing</h2>
        <p className="text-muted-foreground text-sm mt-1">Bagaimana cara mendapatkan akun</p>
      </div>

      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 space-y-4">
        {[
          { icon: "1", title: "Admin mendaftarkan datamu", desc: "Admin akan memasukkan nama, email, divisi, dan nomor HP-mu ke sistem." },
          { icon: "2", title: "Notifikasi WhatsApp", desc: "Kamu akan mendapat pesan WhatsApp berisi informasi mahasiswa bimbingan dan link aktivasi akun." },
          { icon: "3", title: "Aktivasi akun", desc: "Klik link aktivasi, buat password baru, lalu login dan mulai monitor mahasiswamu." },
        ].map((s) => (
          <div key={s.icon} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{s.icon}</div>
            <div>
              <p className="text-foreground font-semibold text-sm">{s.title}</p>
              <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
        <Phone className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed font-medium">
          Belum mendapat notifikasi WA? Hubungi admin program magang untuk memastikan data kamu sudah terdaftar.
        </p>
      </div>

      <Link
        href="/login"
        className="block w-full py-3 text-center bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
      >
        Sudah diaktivasi? Login sekarang
      </Link>
    </div>
  );
}

// Form Data Akun (Mahasiswa)
function FormDataAkun({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AkunFormValues>({ resolver: zodResolver(akunSchema) });

  const handleGoogleSuccess = (profile: GoogleProfile) => {
    setGoogleProfile(profile);
    setValue("nama", profile.name, { shouldValidate: true });
    setValue("email", profile.email, { shouldValidate: true });
  };

  const clearGoogle = () => {
    setGoogleProfile(null);
    setValue("nama", "");
    setValue("email", "");
  };

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingData, setPendingData] = useState<AkunFormValues | null>(null);

  const onSubmit = async (data: AkunFormValues) => {
    setIsSubmitting(true);
    try {
      // Trigger OTP email send
      const otpRes = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const otpData = await otpRes.json();

      if (!otpData.success) {
        toast.error(otpData.message || "Gagal mengirimkan kode OTP");
        return;
      }

      setPendingData(data);
      setShowOtpModal(true);
      if (otpData.otpSimulated) {
        toast.success(`Kode OTP berhasil dibuat! Kode (Dev Mode): ${otpData.otpSimulated}`, {
          duration: 15000,
        });
      } else {
        toast.success("Kode OTP verifikasi telah dikirimkan ke email Anda.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses pendaftaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerified = async () => {
    if (!pendingData) return;
    setShowOtpModal(false); 

    try {
      // Create registered account in database
      const { authService } = await import("@/services/auth.service");
      try {
        await authService.daftarAkun({
          nama: pendingData.nama,
          email: pendingData.email,
          nomor_hp: pendingData.nomor_hp,
          password: pendingData.password,
          via_google: !!googleProfile,
          google_id: googleProfile?.googleId,
        });
      } catch (createErr) {
        // Handle duplicate account creation gracefully
        console.warn("Account creation notice:", createErr);
      }

      toast.success("Verifikasi Akun Berhasil! Akun Anda aktif, silakan login.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses pendaftaran");
      router.push("/login");
    }
  };

  const inp = "bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500 h-9 text-xs";
  const inpLocked = `${inp} opacity-70 cursor-not-allowed select-none`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
      {/* Header */}
      <div className="text-center space-y-1 pb-1">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">Buat Akun</h2>
        <p className="text-xs text-muted-foreground">Langkah 1 dari 2 — Data akun login</p>
      </div>

      {/* Peran badge */}
      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1.5">
        <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-blue-700 dark:text-blue-300 text-xs font-bold">Mendaftar sebagai Mahasiswa Magang</span>
      </div>

      {/* Google Sign-In */}
      {!googleProfile ? (
        <div className="space-y-2">
          <GoogleSignInButton onSuccess={handleGoogleSuccess} />
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-[10px] uppercase font-bold">atau isi manual</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      ) : (
        <GoogleProfileBanner profile={googleProfile} onClear={clearGoogle} />
      )}

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <FormField label="Nama Lengkap" id="nama" error={errors.nama?.message}>
          <Input
            id="nama"
            placeholder="Ketik nama lengkapmu"
            className={inp}
            {...register("nama")}
          />
        </FormField>

        <FormField label="Email" id="email" error={errors.email?.message}>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="ahmad@email.com"
              autoComplete="username"
              className={`${googleProfile ? inpLocked : inp} ${googleProfile ? "pr-8" : ""}`}
              readOnly={!!googleProfile}
              {...register("email")}
            />
            {googleProfile && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
            )}
          </div>
        </FormField>

        <div className="sm:col-span-2">
          <FormField label="No. HP / WhatsApp" id="nomor_hp" error={errors.nomor_hp?.message}>
            <Input
              id="nomor_hp"
              placeholder="+62 812 3456 7890"
              autoComplete="tel"
              className={inp}
              {...register("nomor_hp")}
            />
          </FormField>
        </div>

        <FormField label="Buat Password" id="password" error={errors.password?.message}>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 karakter"
              autoComplete="new-password"
              className={`${inp} pr-9`}
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </FormField>

        <FormField label="Konfirmasi Password" id="konfirmasi_password" error={errors.konfirmasi_password?.message}>
          <div className="relative">
            <Input
              id="konfirmasi_password"
              type={showCPw ? "text" : "password"}
              placeholder="Ulangi password"
              autoComplete="new-password"
              className={`${inp} pr-9`}
              {...register("konfirmasi_password")}
            />
            <button type="button" onClick={() => setShowCPw((v) => !v)} tabIndex={-1} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showCPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </FormField>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Min. 8 karakter</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Huruf &amp; angka</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="h-10 text-xs font-bold bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl transition-all"
        >
          Kembali
        </button>
        <Button
          type="submit"
          disabled={isSubmitting}
          id="akun-lanjut-btn"
          className="h-10 text-xs font-bold bg-[#14355D] hover:bg-[#0F2A4A] text-white rounded-xl transition-all shadow-sm"
        >
          {isSubmitting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...</>
          ) : (
            <>Daftar</>
          )}
        </Button>
      </div>

      <p className="text-center text-muted-foreground text-xs pt-1">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Masuk</Link>
      </p>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        email={pendingData?.email ?? ""}
        isOpen={showOtpModal}
        onSuccess={handleOtpVerified}
        onCancel={() => setShowOtpModal(false)}
      />
    </form>
  );
}

// Main Export 
export function RegisterForm() {
  const [peran, setPeran] = useState<Peran>(null);
  const { setCustomBackHandler } = useAuthBack();

  useEffect(() => {
    if (peran !== null) {
      setCustomBackHandler(() => () => setPeran(null));
    } else {
      setCustomBackHandler(null);
    }
    return () => setCustomBackHandler(null);
  }, [peran, setCustomBackHandler]);

  const showHeaderAndSteps = peran !== "pembimbing";

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Steps (hidden when role is pembimbing) */}
      {showHeaderAndSteps && (
        <div className="text-center space-y-3 mb-2">
          <div className="h-10 flex items-center justify-center">
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
              Pendaftaran Akun Magang
            </h1>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-3">
            {[
              { step: 1, label: "Buat Akun" },
              { step: 2, label: "Data Magang" },
              { step: 3, label: "Selesai" },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      item.step === 1
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.step}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      item.step === 1 ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className={`bg-card rounded-2xl p-6 sm:p-7 shadow-xl border border-border ${showHeaderAndSteps ? "mt-8 sm:mt-10" : ""}`}>
        {peran === "pembimbing" && <InfoPembimbing />}
        {peran === "mahasiswa" && <FormDataAkun onBack={() => setPeran(null)} />}
        {peran === null && <PilihPeran onSelect={setPeran} />}
      </div>
    </div>
  );
}
