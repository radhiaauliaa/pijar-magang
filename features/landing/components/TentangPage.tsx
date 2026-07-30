// features/landing/components/TentangPage.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MapPin,
  Mail,
  ExternalLink,
  Navigation,
  Building2,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

// ULP Data List
const ULP_LIST = [
  {
    id: "sicincin",
    name: "ULP Sicincin",
    address: "Jl. Raya Padang – Bukittinggi No. 16, Sicincin",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Sicincin",
    top: "7%",
    left: "37.5%",
    color: "bg-emerald-500",
  },
  {
    id: "pariaman",
    name: "ULP Pariaman",
    address: "Jl. A. Yani No. 1, Kota Pariaman",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Pariaman",
    top: "14.5%",
    left: "36.5%",
    color: "bg-blue-500",
  },
  {
    id: "lubuk-alung",
    name: "ULP Lubuk Alung",
    address: "Jl. Sintuak, Toboh Gadang, Kabupaten Padang Pariaman",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Lubuk+Alung",
    top: "15.5%",
    left: "50.5%",
    color: "bg-orange-500",
  },
  {
    id: "tabing",
    name: "ULP Tabing",
    address: "Jl. Sapek Raya, Lubuk Buaya, Kota Padang",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Tabing",
    top: "26.5%",
    left: "52%",
    color: "bg-purple-500",
  },
  {
    id: "kuranji",
    name: "ULP Kuranji",
    address: "Jl. By Pass Sungai Sapih, Kuranji, Kota Padang",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Kuranji",
    top: "30%",
    left: "59.2%",
    color: "bg-red-500",
  },
  {
    id: "belanti",
    name: "ULP Belanti",
    address: "Jl. Khatib Sulaiman No. 44, Kota Padang",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Belanti",
    top: "35.5%",
    left: "54.5%",
    color: "bg-sky-500",
  },
  {
    id: "indarung",
    name: "ULP Indarung",
    address: "Jl. Lubuk Begalung, Kota Padang",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Indarung",
    top: "40.5%",
    left: "61.5%",
    color: "bg-amber-500",
  },
  {
    id: "mentawai",
    name: "ULP Mentawai",
    address: "Jl. Tuapejat, Kabupaten Kepulauan Mentawai",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Mentawai",
    top: "59.5%",
    left: "37.8%",
    color: "bg-[#103956]",
  },
  {
    id: "painan",
    name: "ULP Painan",
    address: "Jl. Painan, Kabupaten Pesisir Selatan",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Painan",
    top: "63%",
    left: "73.5%",
    color: "bg-indigo-500",
  },
  {
    id: "balai-selasa",
    name: "ULP Balai Selasa",
    address: "Jl. Limau Sundai, Balai Selasa, Kabupaten Pesisir Selatan",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PLN+ULP+Balai+Selasa",
    top: "84%",
    left: "84%",
    color: "bg-teal-500",
  },
];

// Navbar Component for Tentang Page
function TentangNavbar() {
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
          ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80"
          : "bg-white/80 backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo PLN & PIJAR */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-pln2.png" alt="Logo PLN" className="h-9 w-auto object-contain shrink-0" />
          <div className="flex flex-col justify-center">
            <span className="text-[#103956] font-black text-xl tracking-tight leading-none">
              PIJAR
            </span>
            <span className="text-[10px] text-sky-600 font-bold tracking-tight leading-tight">
              PT PLN (Persero) UP3 Padang
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#103956] transition-colors py-1">
            Beranda
          </Link>
          <Link href="/fitur" className="hover:text-[#103956] transition-colors py-1">
            Fitur
          </Link>
          <Link href="/tentang" className="relative text-[#103956] font-bold py-1">
            Tentang
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103956] rounded-full" />
          </Link>
        </div>

        {/* CTA Buttons & Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#103956] hover:text-sky-600 transition-colors font-bold"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm bg-[#103956] hover:bg-[#0c2c44] text-white rounded-xl font-bold shadow-md shadow-[#103956]/20 transition-all active:scale-95"
          >
            Daftar
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-[#103956] hover:bg-slate-100 rounded-lg transition-colors ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 border-b border-slate-200 px-6 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-600 hover:text-[#103956] py-2 border-b border-slate-100"
          >
            Beranda
          </Link>
          <Link
            href="/fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-600 hover:text-[#103956] py-2 border-b border-slate-100"
          >
            Fitur
          </Link>
          <Link
            href="/tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-[#103956] py-2"
          >
            Tentang
          </Link>
        </div>
      )}
    </nav>
  );
}

// Hero Section 
function TentangHeroSection() {
  return (
    <section className="relative pt-36 pb-36 md:py-44 min-h-[88vh] flex items-center overflow-hidden bg-white">
      {/* Background Circle Accents */}
      <div className="absolute -bottom-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#eaf4fc] opacity-80 pointer-events-none z-0" />
      <div className="absolute -top-40 -right-28 w-[420px] h-[420px] rounded-full bg-[#eaf4fc] opacity-90 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="flex flex-col gap-4 items-end">
                <div className="w-[170px] sm:w-[190px] md:w-[210px] rounded-[22px] overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/ilustrasi_5.png"
                    alt="Dua Pekerja Wanita PLN Lapangan"
                    className="w-full h-[115px] sm:h-[130px] md:h-[145px] object-cover"
                  />
                </div>
                <div className="w-[190px] sm:w-[215px] md:w-[235px] rounded-[22px] overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/ilustrasi_4.png"
                    alt="Barisan Pekerja PLN di Depan Gedung"
                    className="w-full h-[130px] sm:h-[145px] md:h-[160px] object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 items-start">
                <div className="w-[210px] sm:w-[240px] md:w-[270px] rounded-[22px] overflow-hidden shadow-xl border-2 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/ilustrasi_2.png"
                    alt="Pekerja PLN di Gardu Listrik"
                    className="w-full h-[140px] sm:h-[160px] md:h-[180px] object-cover"
                  />
                </div>
                <div className="w-[200px] sm:w-[225px] md:w-[250px] rounded-[22px] overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/ilustrasi_3.png"
                    alt="Tim Teknisi Rompi Biru PLN"
                    className="w-full h-[135px] sm:h-[150px] md:h-[170px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* <span className="text-sky-600 font-extrabold text-sm uppercase tracking-wider bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
              Siapa kami?
            </span> */}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#103956] tracking-tight leading-tight">
              PT PLN (Persero) UP3 Padang
            </h1>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
              PT PLN (Persero) UP3 Padang adalah Unit Pelaksana Pelayanan Pelanggan yang berada di bawah Unit Induk Distribusi (UID) Sumatera Barat. Unit ini bertanggung jawab langsung dalam mengelola dan menyalurkan pasokan listrik, pemeliharaan jaringan, serta memberikan layanan pelanggan di wilayah Kota Padang dan sekitarnya.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-[#103956] bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Unit Induk Distribusi (UID) Sumatera Barat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Visi dan Misi Section
function VisiMisiSection() {
  const misiList = [
    "Menjalankan bisnis kelistrikan dan bidang lain yang terkait dengan berorientasi pada kepuasan pelanggan, anggota perusahaan, dan pemegang saham.",
    "Menjadikan tenaga listrik sebagai media untuk meningkatkan kualitas kehidupan masyarakat.",
    "Mengupayakan agar tenaga listrik menjadi pendorong kegiatan ekonomi.",
    "Menjalankan kegiatan usaha yang berwawasan lingkungan.",
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          {/* Left Column: Visi dan Misi Text */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#103956] tracking-tight">
              Visi dan Misi PT PLN (Persero)
            </h2>

            <div className="p-6 bg-slate-50 border-l-4 border-[#103956] rounded-r-2xl">
              <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">VISI</p>
              <p className="italic font-extrabold text-[#103956] text-lg md:text-xl leading-snug">
                “Menjadi Perusahaan Global Top 500 dan Pilihan Nomor Satu Pelanggan untuk Solusi Energi”
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-xs font-bold text-[#103956] uppercase tracking-widest">MISI</p>
              <div className="space-y-3.5">
                {misiList.map((misi, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#103956] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 font-medium text-base leading-relaxed">
                      {misi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[480px]">
              <img
                src="/ilustrasi_1.png"
                alt="Visi Misi PLN Personel"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Wilayah Kerja Section
function WilayahKerjaSection() {
  const [activeUlp, setActiveUlp] = useState<(typeof ULP_LIST)[0] | null>(ULP_LIST[5]); // Default Belanti

  return (
    <section className="py-24 bg-[#eaf4fc] relative overflow-hidden">
      {/* Background Graphic Rings */}
      <div className="absolute top-1/2 -left-20 w-96 h-96 rounded-full border-[16px] border-sky-300/30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full border-[20px] border-sky-300/25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#103956] tracking-tight mb-2">
            Wilayah Kerja
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-[#103956]">
            PT PLN (Persero) UP3 Padang
          </p>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mt-3">
            Arahkan kursor atau klik titik lokasi ULP pada peta di bawah ini untuk membuka navigasi alamat di Google Maps.
          </p>
        </div>

        {/* Map Container and Interactive Overlay */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Map Image Column with Hotspots */}
            <div className="lg:col-span-7 relative flex justify-center items-center">
              <div className="relative w-full max-w-[580px] select-none">
                <img
                  src="/lokasi-ulp.png"
                  alt="Peta Wilayah Kerja PLN UP3 Padang"
                  className="w-full h-auto object-contain drop-shadow-md"
                />

                {/* Interactive Hotspot Areas for Map Pins */}
                {ULP_LIST.map((ulp) => (
                  <button
                    key={ulp.id}
                    type="button"
                    style={{ top: ulp.top, left: ulp.left }}
                    onMouseEnter={() => setActiveUlp(ulp)}
                    onClick={() => window.open(ulp.mapUrl, "_blank")}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer p-2 rounded-full group"
                    title={`${ulp.name} — Klik untuk buka Google Maps (${ulp.address})`}
                  >
                    {/* Pulsing Highlight Ring when Selected */}
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      {activeUlp?.id === ulp.id && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#103956] border-2 border-white shadow-lg" />
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Active ULP Info & Quick List */}
            <div className="lg:col-span-5 space-y-6">
              {/* Active Selected Card */}
              {activeUlp && (
                <div className="bg-slate-50 border-2 border-sky-200 rounded-2xl p-6 shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
                      ULP Terpilih
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Navigation className="w-3.5 h-3.5 text-sky-500" />
                      Navigasi Peta
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-[#103956] mb-2">
                    {activeUlp.name}
                  </h3>

                  <div className="flex items-start gap-2.5 text-slate-600 text-sm mb-5 leading-relaxed">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>{activeUlp.address}</span>
                  </div>

                  <a
                    href={activeUlp.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#103956] hover:bg-[#0c2c44] text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-95 w-full justify-center"
                  >
                    <span>Buka di Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Grid List of All 10 ULPs */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
                  Daftar 10 Unit Pelaksana Pelanggan (ULP)
                </p>
                <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                  {ULP_LIST.map((ulp) => (
                    <div
                      key={ulp.id}
                      onClick={() => setActiveUlp(ulp)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${activeUlp?.id === ulp.id
                        ? "bg-sky-50 border-sky-300 text-[#103956] font-bold shadow-xs"
                        : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${ulp.color} shrink-0`} />
                        <div>
                          <p className="text-sm font-bold leading-none">{ulp.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-1">
                            {ulp.address}
                          </p>
                        </div>
                      </div>
                      <a
                        href={ulp.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Buka Google Maps"
                        className="p-1.5 hover:bg-sky-100 rounded-lg text-sky-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
    <section className="py-20 bg-slate-50/70 relative overflow-hidden border-t border-slate-100">
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

// Main Export
export function TentangPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <TentangNavbar />
      <TentangHeroSection />
      <VisiMisiSection />
      <WilayahKerjaSection />
      <CTASection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
