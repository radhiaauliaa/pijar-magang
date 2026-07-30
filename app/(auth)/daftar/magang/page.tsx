// app/(auth)/daftar/magang/page.tsx
import type { Metadata } from "next";
import { DaftarMagangForm } from "@/features/auth/components/DaftarMagangForm";

export const metadata: Metadata = {
  title: "Data Magang — PIJAR PLN UP3 Padang",
  description: "Isi data pendaftaran magang dan upload dokumen pendukung.",
};

export default function DaftarMagangPage() {
  return (
    <div className="w-full space-y-6">
      {/* Top Header & Steps (Matching Gambar 1 with 'Pengisian Data Mahasiswa') */}
      <div className="text-center space-y-3 mb-2">
        <div className="h-10 flex items-center justify-center">
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
            Pengisian Data Mahasiswa
          </h1>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-3">
          {[
            { step: 1, label: "Buat Akun", done: true },
            { step: 2, label: "Data Magang", active: true },
            { step: 3, label: "Selesai" },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    item.done
                      ? "bg-emerald-600 text-white shadow-xs"
                      : item.active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.done ? "✓" : item.step}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    item.done
                      ? "text-emerald-600 dark:text-emerald-400"
                      : item.active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-6 h-px ${item.done ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-card rounded-2xl p-6 sm:p-7 shadow-xl border border-border mt-8 sm:mt-10">
        <DaftarMagangForm />
      </div>
    </div>
  );
}
