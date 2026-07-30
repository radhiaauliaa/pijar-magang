// app/(auth)/layout.tsx — Full-Viewport Split Screen Auth (Sticky & Fixed Left Panel)
"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthBackProvider, useAuthBack } from "@/lib/AuthBackContext";

function AuthContent({ children }: { children: React.ReactNode }) {
  const { customBackHandler } = useAuthBack();
  const router = useRouter();

  const handleBackClick = () => {
    if (customBackHandler) {
      customBackHandler();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col lg:flex-row bg-background overflow-x-hidden lg:overflow-hidden">
      {/* Left Panel: Desktop & Tablet only, hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] h-full bg-[#14355D] text-white p-8 lg:p-12 flex-col justify-between items-start text-left shrink-0 relative overflow-hidden select-none">
        {/* Background decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />

        {/* Top Header Logo PLN & PIJAR */}
        <div className="relative z-10 flex items-center gap-3.5 pt-2">
          <img
            src="/logo-pln2.png"
            alt="Logo PLN"
            className="h-12 w-auto object-contain drop-shadow-md shrink-0"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black tracking-tight leading-none text-white">
              PIJAR
            </h1>
            <p className="text-xs text-sky-200/90 font-medium tracking-tight mt-1">
              PT PLN (Persero) UP3 Padang
            </p>
          </div>
        </div>

        {/* Center Illustration (login.png) */}
        <div className="relative z-10 my-auto py-6 w-full flex items-center justify-center">
          <img
            src="/login.png"
            alt="Ilustrasi Login PIJAR"
            className="w-full max-w-md h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Bottom Headline */}
        <div className="relative z-10 pb-2">
          <p className="text-sm sm:text-base font-medium text-sky-100/90 tracking-normal leading-snug max-w-sm">
            Internship Management Platform for PT PLN (Persero) UP3 Padang
          </p>
        </div>
      </div>

      {/* Right Panel: Independent scrollable container for forms */}
      <div className="flex-1 min-h-screen lg:min-h-0 lg:h-full bg-slate-50/60 dark:bg-slate-950 flex flex-col justify-start items-center p-4 sm:p-6 md:p-8 relative overflow-y-auto">
        {/* Top Header for Mobile */}
        <div className="w-full max-w-md flex items-center justify-between pt-3 pb-6 mb-2 lg:hidden border-b border-slate-200/60 dark:border-slate-800/60">
          <button
            type="button"
            onClick={handleBackClick}
            className="w-10 h-10 rounded-xl bg-[#14355D] hover:bg-[#0F2A4A] text-white flex items-center justify-center transition-all shadow-md group shrink-0"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/logo-pln2.png" alt="Logo PLN" className="h-8.5 w-auto object-contain shrink-0" />
            <div>
              <span className="text-base font-black text-[#103956] dark:text-white leading-none block">PIJAR</span>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 leading-none block">PLN UP3 Padang</span>
            </div>
          </div>
        </div>

        {/* Desktop Back Button */}
        <div className="hidden lg:block absolute top-6 left-6 z-20">
          <button
            type="button"
            onClick={handleBackClick}
            className="w-10 h-10 rounded-xl bg-[#14355D] hover:bg-[#0F2A4A] text-white flex items-center justify-center transition-all shadow-md group"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Main Content Area (Consistently compact max-w-md matching Gambar 2) */}
        <div className="w-full max-w-md my-auto py-2 sm:py-6 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </main>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackProvider>
      <AuthContent>{children}</AuthContent>
    </AuthBackProvider>
  );
}
