// lib/email-templates.ts
const PLN_BLUE = "#005BAC";
const PLN_YELLOW = "#FFD100";

interface BaseEmailWrapperProps {
  title: string;
  bodyContent: string;
}

function getBaseWrapper({ title, bodyContent }: BaseEmailWrapperProps): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border: 1px solid #e1e8ed;
    }
    .top-accent-bar {
      height: 6px;
      background: linear-gradient(90deg, ${PLN_YELLOW} 0%, ${PLN_BLUE} 100%);
    }
    .email-header {
      background-color: ${PLN_BLUE};
      padding: 24px 30px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      margin: 8px 0 0 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .email-header p {
      margin: 4px 0 0 0;
      font-size: 11px;
      color: #e2f1fd;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .email-content {
      padding: 32px 30px;
      font-size: 15px;
      line-height: 1.6;
      color: #4a5568;
    }
    .otp-box {
      background-color: #ebf8ff;
      border: 2px dashed ${PLN_BLUE};
      border-radius: 10px;
      padding: 18px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: ${PLN_BLUE};
      font-family: monospace;
    }
    .info-card {
      background-color: #f8fafc;
      border-left: 4px solid ${PLN_BLUE};
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
    .btn-action {
      display: inline-block;
      background-color: ${PLN_BLUE};
      color: #ffffff !important;
      text-decoration: none;
      font-weight: bold;
      padding: 12px 28px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 14px;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 20px 30px;
      border-top: 1px solid #edf2f7;
      text-align: center;
      font-size: 12px;
      color: #a0aec0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="top-accent-bar"></div>
    <div class="email-header">
      <h1>PIJAR</h1>
      <p>Internship Management Platform — PT PLN (Persero) UP3 Padang</p>
    </div>
    <div class="email-content">
      ${bodyContent}
    </div>
    <div class="email-footer">
      <p style="margin: 0; font-weight: 600; color: #718096;">Tim PIJAR — PT PLN (Persero) UP3 Padang</p>
      <p style="margin: 6px 0 0 0;">Email ini dikirim secara otomatis oleh sistem PIJAR. Mohon tidak membalas email ini.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Template OTP Verification Email
export function getOTPEmailTemplate(otpCode: string): { subject: string; html: string } {
  const subject = "Kode Verifikasi Akun PIJAR";
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo,</p>
    <p>Terima kasih telah mendaftar pada aplikasi <strong>PIJAR (Internship Management Platform for PT PLN (Persero) UP3 Padang)</strong>.</p>
    <p>Gunakan kode berikut untuk memverifikasi akun Anda:</p>
    
    <div class="otp-box">
      <div style="font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Kode OTP</div>
      <div class="otp-code">${otpCode}</div>
      <div style="font-size: 12px; color: #e53e3e; margin-top: 6px; font-weight: 600;">Kode hanya berlaku selama 5 menit.</div>
    </div>

    <p style="font-size: 13px; color: #718096;">Apabila Anda tidak melakukan pendaftaran akun, abaikan email ini.</p>
    <br>
    <p style="margin-bottom: 0;">Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

// Template Lamaran Dikirim Email
export function getLamaranSubmittedTemplate(nama: string): { subject: string; html: string } {
  const subject = "Lamaran Magang Berhasil Dikirim";
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${nama},</p>
    <p>Lamaran magang Anda telah berhasil dikirim ke sistem PIJAR PT PLN (Persero) UP3 Padang.</p>
    
    <div class="info-card">
      <p style="margin: 0; font-weight: bold; color: #2b6cb0;">Status Saat Ini:</p>
      <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #2d3748;">Menunggu Verifikasi</p>
    </div>

    <p>Silakan menunggu proses verifikasi dokumen dan berkas magang oleh Tim Admin PT PLN (Persero) UP3 Padang. Anda akan menerima email pemberitahuan kembali ketika admin memberikan keputusan hasil seleksi.</p>
    <br>
    <p style="margin-bottom: 0;">Terima kasih.<br><br>Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

export function formatDateIndonesian(dateStr?: string): string {
  if (!dateStr || !dateStr.trim() || dateStr === "-") return "-";
  try {
    const raw = dateStr.trim();
    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const parts = raw.split("-");
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return raw;

    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const dayName = days[d.getDay()];
    const dayDate = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();

    return `${dayName}, ${dayDate} ${monthName} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

// Template Lamaran Diterima Email
export function getLamaranAcceptedTemplate(
  nama: string,
  tanggalMulai?: string,
  tanggalSelesai?: string,
  unitName?: string,
  divisiName?: string,
  pembimbingName?: string,
  suratPenerimaanUrl?: string
): { subject: string; html: string } {
  const subject = "Selamat! Lamaran Magang Anda Diterima";
  const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://pijar-magang.vercel.app";
  const downloadLink = (suratPenerimaanUrl && suratPenerimaanUrl.trim()) ? suratPenerimaanUrl : `${APP_BASE}/login`;

  const fmtMulai = formatDateIndonesian(tanggalMulai);
  const fmtSelesai = formatDateIndonesian(tanggalSelesai);

  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${nama},</p>
    <p style="font-size: 18px; font-weight: 800; color: #2b6cb0; margin-bottom: 8px;">Selamat!</p>
    <p>Lamaran magang Anda di <strong>PT PLN (Persero) UP3 Padang</strong> telah resmi <strong>DITERIMA</strong>.</p>
    
    <div class="info-card">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #2d3748;">Detail Penempatan & Periode Magang Anda:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #718096; width: 140px;">Unit / Cabang:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${unitName || "PT PLN (Persero) UP3 Padang"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Divisi:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${divisiName || "Belum Ditentukan"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Pembimbing Lapangan:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${pembimbingName || "Belum Ditentukan"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Tanggal Mulai:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${fmtMulai}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Tanggal Selesai:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${fmtSelesai}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 800; color: #15803d;">📌 Petunjuk Kehadiran Hari Pertama Magang:</p>
      <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #166534; line-height: 1.6;">
        <li style="margin-bottom: 6px;"><strong>Waktu Kehadiran:</strong> Hadir pada hari pertama magang (<strong>${fmtMulai}</strong>) pukul <strong>08:00 WIB</strong>.</li>
        <li style="margin-bottom: 6px;"><strong>Pakaian / Seragam:</strong> Menggunakan kemeja putih dan celana/rok hitam (Hitam-Putih) rapi serta bersepatu.</li>
        <li><strong>Lokasi Tujuan:</strong> Melapor ke Satpam / Resepsionis di kantor <strong>${unitName || "PT PLN (Persero) UP3 Padang"}</strong>.</li>
      </ul>
    </div>

    <div style="background-color: #ebf8ff; border: 1px dashed #2b6cb0; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #2b6cb0;">📄 Surat Balasan Resmi Penerimaan Magang</p>
      <p style="margin: 0 0 14px 0; font-size: 13px; color: #4a5568;">Berikut terlampir dokumen Surat Penerimaan Resmi dari PT PLN (Persero) UP3 Padang. Klik tombol di bawah ini untuk melihat/mengunduh surat Anda:</p>
      <a href="${downloadLink}" class="btn-action" style="background-color: #2b6cb0; font-size: 14px;" target="_blank">📄 Unduh Surat Penerimaan (PDF)</a>
    </div>

    <p>Silakan login ke aplikasi <strong>PIJAR</strong> untuk mulai menggunakan seluruh fitur magang terpadu:</p>
    <ul style="padding-left: 20px; color: #4a5568;">
      <li>Dashboard Monitoring Progress</li>
      <li>Absensi Selfie Digital</li>
      <li>Jurnal Harian Magang</li>
    </ul>

    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://pijar-magang.vercel.app"}/login" class="btn-action" target="_blank">Login ke PIJAR</a>
    </div>

    <br>
    <p style="margin-bottom: 0;">Selamat bergabung dan semoga sukses menjalani program magang!<br><br>Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

// Template Akun Baru Dibuat (Pembimbing & Admin ULP)
export function getAccountCreatedTemplate({
  nama,
  email,
  password,
  roleLabel,
  creatorName,
  unitName,
}: {
  nama: string;
  email: string;
  password: string;
  roleLabel: string;
  creatorName?: string;
  unitName?: string;
}): { subject: string; html: string } {
  const subject = `Akun ${roleLabel} PIJAR Anda Telah Aktif!`;
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${nama},</p>
    <p>Akun Anda sebagai <strong>${roleLabel}</strong> pada sistem <strong>PIJAR (PT PLN (Persero) UP3 Padang)</strong> telah resmi diaktifkan.</p>
    
    ${
      creatorName || unitName
        ? `<div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
             <p style="margin: 0; font-size: 14px; color: #065f46;">
               ${creatorName ? `Dibuat oleh: <strong>${creatorName}</strong><br>` : ""}
               ${unitName ? `Unit Penempatan: <strong>${unitName}</strong>` : ""}
             </p>
           </div>`
        : ""
    }

    <div class="info-card">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #2d3748;">Kredensial Akun Anda:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #718096; width: 140px;">Email Login:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Password Sementara:</td>
          <td style="padding: 6px 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #005BAC;">${password}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #e53e3e; font-weight: 600;">
      Demi keamanan akun Anda, silakan ubah password sementara ini setelah berhasil login untuk pertama kali.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://pijar-magang.vercel.app"}/login" class="btn-action" target="_blank">Login ke Aplikasi PIJAR</a>
    </div>
 
    <br>
    <p style="margin-bottom: 0;">Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

// Template Update Penempatan Email (Update Divisi / Pembimbing oleh Admin ULP)
export function getUpdatePenempatanTemplate({
  nama,
  unitName,
  divisiName,
  pembimbingName,
}: {
  nama: string;
  unitName?: string;
  divisiName?: string;
  pembimbingName?: string;
}): { subject: string; html: string } {
  const subject = "Update Penempatan Magang";
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${nama},</p>
    <p>Informasi penempatan divisi dan pembimbing magang Anda pada sistem <strong>PIJAR (PT PLN (Persero) UP3 Padang)</strong> telah resmi diperbarui oleh Admin Unit.</p>
    
    <div class="info-card">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #2d3748;">Detail Penempatan Magang Terbaru:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #718096; width: 140px;">Unit / Cabang:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${unitName || "PT PLN (Persero) UP3 Padang"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Divisi Penempatan:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #005BAC;">${divisiName || "Belum Ditentukan"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Pembimbing Lapangan:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #005BAC;">${pembimbingName || "Belum Ditentukan"}</td>
        </tr>
      </table>
    </div>

    <p>Silakan login ke aplikasi <strong>PIJAR</strong> untuk melihat detail tugas dan melakukan koordinasi dengan Pembimbing Lapangan Anda.</p>

    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://pijar-magang.vercel.app"}/login" class="btn-action" target="_blank">Login ke PIJAR</a>
    </div>

    <br>
    <p style="margin-bottom: 0;">Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

// Template Lamaran Ditolak Email
export function getLamaranRejectedTemplate(nama: string): { subject: string; html: string } {
  const subject = "Informasi Hasil Seleksi Magang";
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${nama},</p>
    <p>Terima kasih telah mendaftar program magang PT PLN (Persero) UP3 Padang melalui aplikasi PIJAR.</p>
    
    <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; color: #9b2c2c; font-weight: 600;">Mohon maaf.</p>
      <p style="margin: 4px 0 0 0; color: #742a2a;">Berdasarkan hasil proses seleksi berkas dan kuota magang, lamaran Anda saat ini <strong>belum dapat diterima</strong>.</p>
    </div>

    <p>Kami sangat mengapresiasi minat dan usaha Anda. Semoga sukses pada kesempatan berikutnya!</p>
    <br>
    <p style="margin-bottom: 0;">Terima kasih.<br><br>Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

// Template Pengingat 7 Hari Magang Berakhir Email
export function get7DaysReminderTemplate(nama: string): { subject: string; html: string } {
  const subject = "Periode Magang Akan Berakhir";
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${nama},</p>
    <p>Kami ingin menginformasikan bahwa periode magang Anda di PT PLN (Persero) UP3 Padang akan <strong>berakhir dalam 7 hari</strong>.</p>
    
    <div class="info-card">
      <p style="margin: 0 0 8px 0; font-weight: bold; color: #2b6cb0;">Silakan pastikan beberapa hal berikut:</p>
      <ul style="margin: 0; padding-left: 18px; color: #2d3748; line-height: 1.6;">
        <li>Seluruh jurnal harian telah terisi lengkap.</li>
        <li>Absensi harian telah terverifikasi dengan sesuai.</li>
        <li>Seluruh kewajiban dan tugas magang telah diselesaikan.</li>
      </ul>
    </div>

    <p>Terima kasih atas kerja keras dan dedikasi Anda selama masa magang.</p>
    <br>
    <p style="margin-bottom: 0;">Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

// Template Akun Dinonaktifkan Email
export function getAccountDeactivatedTemplate(nama: string): { subject: string; html: string } {
  const subject = "Akun PIJAR Dinonaktifkan";
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${nama},</p>
    <p>Periode magang Anda di PT PLN (Persero) UP3 Padang telah selesai.</p>
    
    <div style="background-color: #edf2f7; border-left: 4px solid #718096; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; color: #2d3748; font-weight: 600;">Status Akun: Nonaktif</p>
      <p style="margin: 4px 0 0 0; color: #4a5568; font-size: 14px;">Akun PIJAR Anda telah dinonaktifkan secara otomatis sesuai dengan periode akhir magang.</p>
    </div>

    <p>Apabila diperlukan akses kembali atau berkas surat keterangan magang, silakan menghubungi Admin PT PLN (Persero) UP3 Padang.</p>
    <br>
    <p style="margin-bottom: 0;">Terima kasih atas kontribusi Anda.<br><br>Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

export function getUlpTransferNoticeTemplate({
  adminName,
  ulpName,
  mhsNama,
  mhsUniversitas,
  mhsProdi,
  tanggalMulai,
  tanggalSelesai,
}: {
  adminName: string;
  ulpName: string;
  mhsNama: string;
  mhsUniversitas: string;
  mhsProdi: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
}): { subject: string; html: string } {
  const subject = `[PIJAR] Disposisi Mahasiswa Magang Baru di ${ulpName}`;
  const fmtMulai = formatDateIndonesian(tanggalMulai);
  const fmtSelesai = formatDateIndonesian(tanggalSelesai);
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${adminName},</p>
    <p>Admin UP3 Padang telah mendisposisikan 1 mahasiswa magang baru ke unit Anda (<strong>${ulpName}</strong>).</p>
    
    <div class="info-card">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #2d3748;">Detail Mahasiswa Magang:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #718096; width: 140px;">Nama Mahasiswa:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${mhsNama}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Kampus / Prodi:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${mhsUniversitas} (${mhsProdi})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Periode Magang:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #005BAC;">${fmtMulai} s/d ${fmtSelesai}</td>
        </tr>
      </table>
    </div>

    <p>Silakan login ke aplikasi <strong>PIJAR</strong> untuk menentukan Divisi Penempatan & Pembimbing Lapangan bagi mahasiswa tersebut.</p>

    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://pijar-magang.vercel.app"}/login" class="btn-action" target="_blank">Login ke Dashboard PIJAR</a>
    </div>

    <br>
    <p style="margin-bottom: 0;">Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}

// Template Notifikasi Mahasiswa Bimbingan Baru ke Pembimbing
export function getNewStudentAssignedToPembimbingTemplate({
  pembimbingNama,
  mhsNama,
  mhsUniversitas,
  mhsProdi,
  divisiName,
  unitName,
  tanggalMulai,
  tanggalSelesai,
}: {
  pembimbingNama: string;
  mhsNama: string;
  mhsUniversitas: string;
  mhsProdi: string;
  divisiName?: string;
  unitName?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
}): { subject: string; html: string } {
  const subject = `[PIJAR] Mahasiswa Bimbingan Magang Baru: ${mhsNama}`;
  const fmtMulai = formatDateIndonesian(tanggalMulai);
  const fmtSelesai = formatDateIndonesian(tanggalSelesai);
  const bodyContent = `
    <p style="font-size: 16px; font-weight: 600; color: #2d3748;">Halo ${pembimbingNama},</p>
    <p>Anda telah ditunjuk sebagai Pembimbing Lapangan untuk mahasiswa magang baru pada sistem <strong>PIJAR (PT PLN (Persero) UP3 Padang)</strong>.</p>
    
    <div class="info-card">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #2d3748;">Detail Mahasiswa Bimbingan Anda:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #718096; width: 140px;">Nama Mahasiswa:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${mhsNama}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Kampus / Prodi:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${mhsUniversitas} (${mhsProdi})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Unit & Divisi:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #005BAC;">${unitName || "PT PLN UP3 Padang"} - ${divisiName || "Umum"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Periode Magang:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${fmtMulai} s/d ${fmtSelesai}</td>
        </tr>
      </table>
    </div>

    <p>Silakan login ke aplikasi <strong>PIJAR</strong> untuk memantau rekap absensi selfie GPS & memverifikasi laporan jurnal harian mahasiswa bimbingan Anda.</p>

    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://pijar-magang.vercel.app"}/login" class="btn-action" target="_blank">Login ke Dashboard Pembimbing</a>
    </div>

    <br>
    <p style="margin-bottom: 0;">Salam,<br><strong>Tim PIJAR</strong><br>PT PLN (Persero) UP3 Padang</p>
  `;

  return { subject, html: getBaseWrapper({ title: subject, bodyContent }) };
}
