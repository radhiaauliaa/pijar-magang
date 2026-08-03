// features/landing/components/LandingPage.tsx
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
  Building2,
  GraduationCap,
  UserCheck,
  Clock,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

// Navbar Component
function Navbar() {
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
        {/* Logo PLN & PIJAR */}
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
          <Link href="/" className="relative text-[#103956] font-bold py-1">
            Beranda
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103956] rounded-full" />
          </Link>
          <Link href="/fitur" className="hover:text-[#103956] transition-colors py-1">
            Fitur
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
            className="block text-base font-bold text-[#103956] py-2 border-b border-slate-100"
          >
            Beranda
          </Link>
          <Link
            href="/fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#103956] py-2 border-b border-slate-100"
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

// Hero Section
function HeroSection() {
  return (
    <section id="beranda" className="relative pt-32 pb-24 overflow-hidden bg-white">
      <div className="absolute -top-44 -right-28 w-[420px] h-[420px] rounded-full bg-[#eaf4fc] opacity-90 pointer-events-none z-0" />
      <div className="absolute -bottom-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#eaf4fc] opacity-80 pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-12 pt-2">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#103956] tracking-tight leading-none">
              PIJAR
            </h1>

            <div className="space-y-3">
              <p className="text-2xl md:text-3xl font-extrabold text-[#103956] leading-tight max-w-lg">
                Internship Management Platform for{" "}
                <span className="relative inline-block text-sky-600">
                  PT PLN (Persero) UP3 Padang
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-sky-400 rounded-full" />
                </span>
              </p>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg pt-1">
                Satu platform terpadu untuk pendaftaran magang, verifikasi peserta, absensi selfie digital, jurnal harian, hingga evaluasi program magang.
              </p>
            </div>

            {/* Buttons & Info */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href="/daftar"
                  id="hero-daftar-btn"
                  className="group inline-flex items-center gap-3 px-8 py-3.5 bg-[#103956] hover:bg-[#0c2c44] text-white font-bold rounded-xl text-base shadow-lg shadow-[#103956]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-slate-200 hover:border-slate-300 text-[#103956] hover:bg-slate-50/80 font-bold rounded-xl text-base transition-all"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>

              {/* Status info line */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Pendaftaran Buka Setiap Hari Kerja · Proses Cepat &amp; Transparan</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Illustration (Raised to match top title) */}
          <div className="lg:col-span-6 flex items-center justify-center lg:-mt-8">
            <div className="relative w-full max-w-[540px] flex justify-center items-center">
              <img
                src="/ilustrasi_pijar3.png"
                alt="Ilustrasi PIJAR PLN UP3 Padang"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>


  );
}


// Cara Kerja Section
function CaraKerjaSection() {
  const flows = [
    {
      role: "Mahasiswa Magang",
      icon: <GraduationCap className="w-5 h-5 text-[#103956]" />,
      steps: [
        {
          no: "1",
          title: "Daftar Akun & Pengajuan",
          desc: "Registrasi akun lalu isi formulir lamaran magang beserta universitas dan divisi pilihan.",
        },
        {
          no: "2",
          title: "Verifikasi Admin PLN",
          desc: "Tunggu admin memverifikasi dan menyetujui lamaran magang Anda.",
        },
        {
          no: "3",
          title: "Absen & Isi Jurnal",
          desc: "Catat kehadiran harian via foto selfie dan input jurnal harian pekerjaan.",
        },
      ],
    },
    {
      role: "Pembimbing / Mentor",
      icon: <UserCheck className="w-5 h-5 text-[#103956]" />,
      steps: [
        {
          no: "1",
          title: "Aktivasi Akun WA",
          desc: "Menerima pesan WhatsApp kredensial login dan daftar mahasiswa bimbingan.",
        },
        {
          no: "2",
          title: "Verifikasi Logbook",
          desc: "Memeriksa dan menyetujui jurnal harian mahasiswa di divisinya.",
        },
        {
          no: "3",
          title: "Monitoring Kehadiran",
          desc: "Memantau ketepatan jam absen datang dan pulang peserta magang.",
        },
      ],
    },
    {
      role: "Administrator PLN",
      icon: <Building2 className="w-5 h-5 text-[#103956]" />,
      steps: [
        {
          no: "1",
          title: "Seleksi Peserta",
          desc: "Menerima, meneliti, menyetujui atau menolak calon peserta magang.",
        },
        {
          no: "2",
          title: "Plotting Divisi & Mentor",
          desc: "Menentukan cabang, divisi, serta pembimbing untuk setiap mahasiswa.",
        },
        {
          no: "3",
          title: "Cetak Laporan PDF",
          desc: "Mencetak laporan akhir absensi dan jurnal bertanda tangan resmi.",
        },
      ],
    },
  ];

  return (
    <section id="alur" className="py-24 bg-[#eaf4fc] relative overflow-hidden">
      {/* Background soft circle accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-white/40 rounded-full blur-3xl -translate-y-1/2 -z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#103956] tracking-tight">
            Cara Kerja
          </h2>
          <div className="w-16 h-1.5 bg-[#103956] mx-auto rounded-full mt-3 mb-6" />
          <p className="text-[#103956] font-bold text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Memudahkan interaksi antara Mahasiswa, Pembimbing Lapangan, dan Tim Admin PLN UP3 Padang
          </p>
        </div>

        {/* 3 Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {flows.map((flow) => (
            <div
              key={flow.role}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-[#103956] font-bold text-lg mb-6 pb-4 border-b border-slate-100 flex items-center gap-2.5">
                  {flow.icon}
                  <span>{flow.role}</span>
                </h3>

                <div className="space-y-6">
                  {flow.steps.map((step) => (
                    <div key={step.no} className="flex gap-3.5 items-start">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {step.no}
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold text-sm mb-1">
                          {step.title}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
      {/* Decorative Glowing Blue Circles Background Ornaments (Gambar 4) */}
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

// ── Main Export ───────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <HeroSection />
      <CaraKerjaSection />
      <CTASection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
