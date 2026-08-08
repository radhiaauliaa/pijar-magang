// app/(dashboard)/mahasiswa/surat-penerimaan/page.tsx
import { Metadata } from "next";
import { SuratPenerimaanMahasiswaPage } from "@/features/mahasiswa/components/SuratPenerimaanMahasiswaPage";

export const metadata: Metadata = {
  title: "Surat Persetujuan Magang",
};

export default function Page() {
  return <SuratPenerimaanMahasiswaPage />;
}
