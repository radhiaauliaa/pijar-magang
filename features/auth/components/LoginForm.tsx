// features/auth/components/LoginForm.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleType = "Admin" | "Pembimbing" | "Mahasiswa";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [dbRole, setDbRole] = useState<RoleType | null>(null);
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email") || "";

  // Fetch live role from Database API based on entered email
  useEffect(() => {
    const clean = emailValue.trim().toLowerCase();
    if (!clean || clean.length < 3 || !clean.includes("@")) {
      setDbRole(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-role?email=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.role) {
            if (json.role === "admin" || json.role === "admin_ulp") {
              setDbRole("Admin");
            } else if (json.role === "pembimbing") {
              setDbRole("Pembimbing");
            } else {
              setDbRole("Mahasiswa");
            }
          }
        }
      } catch {
        // ignore fetch error
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [emailValue]);

  // Automatically detect active role from DB response or pattern heuristics
  const activeRole = useMemo<RoleType | null>(() => {
    if (dbRole) return dbRole;

    const clean = emailValue.toLowerCase().trim();
    if (!clean || clean.length < 3) return null;

    // Check Admin Email Patterns & Known Admin Accounts
    const isAdmin =
      clean === "magangplnup3pdg@gmail.com" ||
      clean.includes("admin") ||
      clean.includes("up3") ||
      clean.includes("plnup3") ||
      clean.includes("magangpln") ||
      clean.includes("manager") ||
      clean.endsWith("@admin.pln.co.id");

    if (isAdmin) {
      return "Admin";
    }

    // Check Pembimbing Email Patterns & Known Accounts
    const isPembimbing =
      clean === "archivepage00@gmail.com" ||
      clean === "nanda@gmail.com" ||
      clean === "panjul@gmail.com" ||
      clean.includes("pembimbing") ||
      clean.includes("supervisor") ||
      clean.includes("mentor") ||
      clean.includes("dosen") ||
      clean.includes("bimbingan") ||
      clean.endsWith("@pln.co.id");

    if (isPembimbing) {
      return "Pembimbing";
    }

    // Default for student email formats
    return "Mahasiswa";
  }, [emailValue, dbRole]);

  const onSubmit = (data: LoginFormValues) => login(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-foreground">Masuk ke Akun Anda</h2>
        <p className="text-muted-foreground text-sm mt-1">Gunakan email dan password terdaftar Anda</p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-foreground text-sm font-semibold">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="username"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500 h-11"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-foreground text-sm font-semibold">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500 h-11 pr-11"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Read-Only Role Indicator Badges */}
      <div className="flex gap-2 text-xs pt-1 select-none">
        {(["Admin", "Pembimbing", "Mahasiswa"] as RoleType[]).map((role) => {
          const isActive = activeRole === role;

          let activeStyle = "";
          if (role === "Mahasiswa") {
            activeStyle =
              "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold border-2 border-blue-500 shadow-sm shadow-blue-500/10 scale-[1.02]";
          } else if (role === "Pembimbing") {
            activeStyle =
              "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border-2 border-emerald-500 shadow-sm shadow-emerald-500/10 scale-[1.02]";
          } else if (role === "Admin") {
            activeStyle =
              "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold border-2 border-purple-500 shadow-sm shadow-purple-500/10 scale-[1.02]";
          }

          const inactiveStyle =
            "bg-slate-50/70 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 font-medium border border-slate-200/80 dark:border-slate-800 opacity-60";

          return (
            <div
              key={role}
              className={`flex-1 text-center py-2 rounded-xl transition-all duration-300 cursor-default ${
                isActive ? activeStyle : inactiveStyle
              }`}
            >
              {role}
            </div>
          );
        })}
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        disabled={isLoggingIn}
        id="login-submit-btn"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Masuk
          </>
        )}
      </Button>
    </form>
  );
}
