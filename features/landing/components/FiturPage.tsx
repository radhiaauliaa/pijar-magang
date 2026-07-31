// features/landing/components/FiturPage.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Users,
  TrendingUp,
  ArrowRight,
  Mail,
  MapPin,
  Shield,
  BarChart3,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

// Navbar Component for Fitur Page
function FiturNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white md:bg-white/95 md:backdrop-blur-md shadow-xs border-b border-slate-200/80"
          : "bg-white md:bg-white/80 md:backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo-pln2.png" alt="Logo PLN" className="h-8 sm:h-9 w-auto object-contain shrink-0" style={{ height: "34px", width: "auto" }} />
          <div className="flex flex-col justify-center">
            <span className="text-[#103956] font-black text-xl tracking-tight leading-none">
              PIJAR
            </span>
            <span className="hidden sm:block text-[10px] text-sky-600 font-bold tracking-tight leading-tight">
              PT PLN (Persero) UP3 Padang
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#103956] transition-colors py-1">
            Beranda
          </Link>
          <Link href="/fitur" className="relative text-[#103956] font-bold py-1">
            Fitur
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103956] rounded-full" />
          </Link>
          <Link href="/tentang" className="hover:text-[#103956] transition-colors py-1">
            Tentang
          </Link>
        </div>

        {/* CTA Buttons (Desktop) & Hamburger Button (Mobile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-[#103956] hover:text-sky-600 transition-colors font-bold"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="px-6 py-2.5 text-sm bg-[#103956] hover:bg-[#0c2c44] text-white rounded-xl font-bold shadow-md shadow-[#103956]/20 transition-all active:scale-95"
            >
              Daftar
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-[#103956] hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 shadow-2xs"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white opacity-100 border-b border-slate-200 px-6 py-5 space-y-3.5 shadow-2xl relative z-50 animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#103956] py-2 border-b border-slate-100"
          >
            Beranda
          </Link>
          <Link
            href="/fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold text-[#103956] py-2 border-b border-slate-100"
          >
            Fitur
          </Link>
          <Link
            href="/tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#103956] py-2 border-b border-slate-100"
          >
            Tentang
          </Link>

          {/* Mobile Auth Buttons inside Drawer (Matching Gambar 2 Pertamina style) */}
          <div className="pt-2 space-y-2.5">
            <Link
              href="/daftar"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 text-center bg-[#103956] text-white font-extrabold text-sm rounded-xl shadow-md active:scale-98 transition-transform"
            >
              Daftar
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 text-center border-2 border-slate-200 text-[#103956] font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// Header Banner Section
function FiturHeaderSection() {
  return (
    <section className="relative pt-32 pb-20 bg-[#103956] text-white overflow-hidden">
      {/* Light Blue Circle Accents */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-sky-400/20 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-400/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <span className="inline-block text-sky-200 text-xs font-extrabold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-xs">
          FITUR UTAMA PLATFORM PIJAR
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mt-4 mb-4 tracking-tight leading-tight max-w-4xl mx-auto">
          Pengelolaan Magang Terpadu PLN UP3 Padang
        </h1>

        <p className="text-sky-100 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Semua kebutuhan administrasi dan evaluasi magang dikelola secara digital dan efisien.
        </p>
      </div>
    </section>
  );
}

// Features Grid Section
function FiturGridSection() {
  const features = [
    {
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      title: "Absensi Selfie & Presisi",
      desc: "Absen masuk dan pulang dilengkapi foto selfie via kamera serta aturan jam kerja PLN (Senin-Kamis 08:00 & Jumat 07:30).",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      title: "Jurnal Kegiatan Harian",
      desc: "Catat aktivitas harian magang beserta foto dokumentasi. Terhubung langsung dengan verifikasi Pembimbing Lapangan.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      title: "Filtering Divisi Pembimbing",
      desc: "Jurnal & logbook mahasiswa terisolasi sesuai divisi dan pembimbing masing-masing tanpa tertukar.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
      title: "Pengajuan Izin & Sakit",
      desc: "Form izin sehari, setengah hari, atau sakit dengan dokumen surat bukti fisik pendukung.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
      title: "Laporan PDF Resmi PLN",
      desc: "Cetak rekap absensi & jurnal otomatis berformat PDF lengkap dengan Kop PLN dan kolom tanda tangan pembimbing.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      color: "bg-violet-500/10 text-violet-600 border-violet-200",
      title: "Proteksi Masa Magang",
      desc: "Pembatasan hak akses otomatis untuk mahasiswa yang telah menyelesaikan periode magang di PLN UP3 Padang.",
    },
  ];

  return (
    <section className="py-24 bg-slate-50/60 relative overflow-hidden">
      {/* Light Blue Circle Accents */}
      <div className="absolute top-1/4 -left-32 w-[420px] h-[420px] rounded-full bg-[#eaf4fc] opacity-80 pointer-events-none z-0" />
      <div className="absolute bottom-10 -right-32 w-[420px] h-[420px] rounded-full bg-[#eaf4fc] opacity-80 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs hover:shadow-xl hover:border-sky-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className={`inline-flex p-3.5 rounded-2xl border ${f.color} mb-6 w-fit`}>
                  {f.icon}
                </div>
                <h3 className="text-[#103956] font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-[#103956] relative overflow-hidden">
      {/* Background Graphic Rings */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full border-[16px] border-sky-400/20 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border-[20px] border-sky-400/15 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-2xl border border-slate-100">
          <img src="/logo-pln2.png" alt="Logo PLN" className="h-11 w-auto object-contain mx-auto mb-6 shrink-0" />

          <h2 className="text-3xl md:text-4xl font-extrabold text-[#103956] mb-4 tracking-tight">
            Ingin Mengikuti Magang di PT PLN UP3 Padang?
          </h2>

          <p className="text-slate-600 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Daftarkan diri Anda sekarang melalui platform PIJAR untuk pengalaman magang terstruktur dan profesional.
          </p>

          <div className="flex justify-center">
            <Link
              href="/daftar"
              id="cta-daftar-btn"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#103956] hover:bg-[#0c2c44] text-white font-bold rounded-xl text-base shadow-md transition-all active:scale-95"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah pendaftaran magang di PT PLN (Persero) UP3 Padang dipungut biaya?",
      a: "Tidak. Seluruh proses pendaftaran, seleksi, hingga pelaksanaan magang di PT PLN (Persero) UP3 Padang melalui platform PIJAR adalah 100% GRATIS tanpa dipungut biaya apapun.",
    },
    {
      q: "Berapa lama durasi periode magang yang bisa diajukan?",
      a: "Durasi magang menyesuaikan dengan ketentuan resmi dari kampus/sekolah asal mahasiswa, umumnya berkisar antara 1 hingga 6 bulan.",
    },
    {
      q: "Dokumen apa saja yang wajib diunggah saat mendaftar magang?",
      a: "Dokumen utama yang diperlukan yaitu Surat Pengantar Resmi dari Perguruan Tinggi / Sekolah, CV / Resume terbaru, serta Proposal Magang.",
    },
    {
      q: "Bagaimana cara mahasiswa mengetahui status pengajuan lamaran magangnya?",
      a: "Status lamaran dapat dipantau langsung di platform PIJAR. Selain itu, Anda akan menerima email notifikasi resmi serta pesan WhatsApp Direct mengenai keputusan seleksi penerimaan.",
    },
    {
      q: "Bagaimana sistem pencatatan absensi dan jurnal harian peserta magang?",
      a: "Peserta magang melakukan absensi selfie berbasis lokasi pada jam masuk dan pulang. Selain itu, peserta menginput jurnal harian kegiatan yang nantinya diverifikasi secara berkala oleh Pembimbing Lapangan.",
    },
    {
      q: "Apakah peserta magang di ULP juga dapat menggunakan platform PIJAR?",
      a: "Ya, mahasiswa yang ditempatkan di Unit Layanan Pelanggan (ULP) seperti ULP Belanti atau ULP Tabing tetap terintegrasi penuh pada platform PIJAR dengan pengawasan Pembimbing ULP setempat.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50/70 relative overflow-hidden border-t border-slate-100 select-none">
      {/* Decorative Glowing Blue Circles Background Ornaments */}
      <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#103956] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="w-16 h-1 bg-[#103956] mx-auto rounded-full mt-3.5" />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#103956] shadow-sm ring-1 ring-[#103956]/10"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-bold text-slate-800 text-base md:text-lg hover:text-[#103956] transition-colors"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "bg-[#103956]/10 text-[#103956] rotate-180" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-600 text-sm md:text-base leading-relaxed border-t border-slate-100/80 animate-in fade-in-50 duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Footer Section
function FooterSection() {
  return (
    <footer id="tentang" className="bg-[#0a2538] text-slate-300 py-8 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header: Logo PLN & Brand Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b border-slate-800/80">
          <div className="md:col-span-6 flex items-center gap-3.5">
            <img src="/logo-pln2.png" alt="Logo PLN" className="h-9 w-auto object-contain shrink-0" />
            <div>
              <h3 className="text-xl font-black text-white tracking-tight leading-none">
                PIJAR
              </h3>
              <p className="text-xs font-bold text-sky-400 tracking-tight mt-0.5">
                PT PLN (Persero) UP3 Padang
              </p>
            </div>
          </div>

          <div className="md:col-span-6 text-xs text-slate-400 leading-relaxed md:text-right">
            Internship Management Platform PT PLN (Persero) UP3 Padang
          </div>
        </div>

        {/* Middle Content: Address & Email */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs pb-2">
          <div className="md:col-span-7 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span className="text-slate-300 leading-relaxed">
              <strong className="text-white block font-semibold mb-0.5">Alamat Kantor:</strong>
              Jalan S. Parman No. 221, Ulak Karang Utara, Kec. Padang Utara, Kota Padang, Sumatera Barat
            </span>
          </div>

          <div className="md:col-span-5 flex items-center md:justify-end gap-2.5">
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <a
              href="mailto:magangplnup3pdg@gmail.com"
              className="text-slate-200 hover:text-white font-medium transition-colors"
            >
              magangplnup3pdg@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 border-t border-slate-800/60 text-center text-[11px] text-slate-500">
          Copyright © 2026 (PT PLN UP3 Padang). All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// Main Export
export function FiturPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <FiturNavbar />
      <FiturHeaderSection />
      <FiturGridSection />
      <CTASection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
