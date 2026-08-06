/**
 * DashboardService.gs � Perhitungan statistik & dashboard
 */

var DashboardService = (function() {

  function getAdminStats(params, currentUser) {
    params = params || {};
    var mhs = SpreadsheetRepo.getAll('Mahasiswa');
    var lmr = SpreadsheetRepo.getAll('Lamaran');
    var cbg = SpreadsheetRepo.getAll('Cabang');
    var pmb = SpreadsheetRepo.getAll('Users').filter(function(u) { return u.role === 'pembimbing'; });

    var userCabangId = params.cabang;
    if (!userCabangId && currentUser) {
      if (typeof DivisiService !== 'undefined' && DivisiService.resolveUserCabangId) {
        userCabangId = DivisiService.resolveUserCabangId(currentUser);
      }
    }

    var isUlpAdmin = currentUser && currentUser.role === 'admin_ulp';
    if (isUlpAdmin && (!userCabangId || userCabangId === 'UP3' || userCabangId === 'c8690edf-123e-4d43-85b5-aa6bb3988e0b')) {
      var allCab = SpreadsheetRepo.getAll('Cabang');
      var ulpObj = null;
      for (var i = 0; i < allCab.length; i++) {
        if (allCab[i].id !== 'c8690edf-123e-4d43-85b5-aa6bb3988e0b' && String(allCab[i].nama_cabang || '').toLowerCase().indexOf('up3') === -1) {
          ulpObj = allCab[i];
          break;
        }
      }
      userCabangId = ulpObj ? ulpObj.id : 'NO_ULP_CABANG_FOUND';
    }

    // For Super Admin (role === 'admin'), do NOT filter by cabang for lamaran, show all lamaran & pending
    var isSuperAdmin = currentUser && currentUser.role === 'admin';

    if (!isSuperAdmin && userCabangId && userCabangId !== 'UP3' && userCabangId !== 'c8690edf-123e-4d43-85b5-aa6bb3988e0b' && userCabangId !== 'NO_ULP_CABANG_FOUND') {
      var cabObj = SpreadsheetRepo.findOneBy('Cabang', 'id', userCabangId);
      var cabName = cabObj ? String(cabObj.nama_cabang || '').toLowerCase() : '';

      mhs = mhs.filter(function(r) {
        var mCab = String(r.cabang || '').trim();
        return mCab === userCabangId || (cabName && mCab.toLowerCase() === cabName);
      });
      lmr = lmr.filter(function(r) {
        var lCab = String(r.unit_pilihan || r.cabang || '').trim();
        return lCab === userCabangId || (cabName && lCab.toLowerCase() === cabName) || r.status === 'menunggu';
      });
      pmb = pmb.filter(function(r) {
        var pCab = String(r.cabang || '').trim();
        return pCab === userCabangId || (cabName && pCab.toLowerCase() === cabName);
      });
    } else if (isUlpAdmin) {
      mhs = [];
      lmr = [];
      pmb = [];
    }

    var totalMahasiswa = mhs.length;
    var totalLamaran = lmr.length;
    var lamaranMenunggu = lmr.filter(function(r) { return r.status === 'menunggu'; }).length;
    var totalCabang = cbg.length;
    var totalPembimbing = pmb.length;
    var mahasiswaAktif = mhs.filter(function(r) { return r.status === 'aktif'; }).length;
    var mahasiswaSelesai = mhs.filter(function(r) { return r.status === 'selesai'; }).length;

    return success({
      total_mahasiswa: totalMahasiswa,
      total_lamaran: totalLamaran,
      lamaran_menunggu: lamaranMenunggu,
      total_cabang: totalCabang,
      total_pembimbing: totalPembimbing,
      mahasiswa_aktif: mahasiswaAktif,
      mahasiswa_selesai: mahasiswaSelesai,
    });
  }

  function getPembimbingStats(currentUser) {
    var mhs = SpreadsheetRepo.getAll('Mahasiswa').filter(function(m) {
      return m.pembimbing === currentUser.id;
    });
    var mhsIds = mhs.map(function(m) { return m.id; });
    var jrn = SpreadsheetRepo.getAll('Jurnal').filter(function(j) {
      return mhsIds.indexOf(j.mahasiswa_id) !== -1;
    });

    return success({
      jumlah_mahasiswa: mhs.length,
      mahasiswa_aktif: mhs.filter(function(m) { return m.status === 'aktif'; }).length,
      mahasiswa_selesai: mhs.filter(function(m) { return m.status === 'selesai'; }).length,
      total_jurnal: jrn.length,
      jurnal_pending: jrn.filter(function(j) { return j.status === 'submitted'; }).length,
    });
  }

  function getMahasiswaStats(currentUser) {
    if (!currentUser) {
      return success({
        progress_magang: 0,
        total_jurnal: 0,
        total_hadir: 0,
        sisa_hari: 0,
        divisi: '',
        cabang: '',
        pembimbing_nama: '',
      });
    }

    var email = currentUser.email || '';
    var userId = currentUser.id || '';

    // Search Mahasiswa row by email first, fallback to id/user_id
    var mhs = null;
    if (email) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', email);
    if (!mhs && userId) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'id', userId);
    if (!mhs && userId) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'user_id', userId);

    function resolveDivisi(val) {
      if (!val) return '';
      var d = SpreadsheetRepo.findOneBy('Divisi', 'id', val);
      return d ? (d.nama_divisi || d.nama || val) : val;
    }

    function resolveCabang(val) {
      if (!val) return '';
      var c = SpreadsheetRepo.findOneBy('Cabang', 'id', val);
      return c ? (c.nama_cabang || c.nama || val) : val;
    }

    function resolvePembimbing(val) {
      if (!val) return '';
      var p = SpreadsheetRepo.findOneBy('Pembimbing', 'id', val);
      if (!p) p = SpreadsheetRepo.findOneBy('Users', 'id', val);
      if (!p) p = SpreadsheetRepo.findOneBy('Users', 'email', val);
      return p ? (p.nama || val) : val;
    }

    var lmr = null;
    if (email) lmr = SpreadsheetRepo.findOneBy('Lamaran', 'email', email);
    if (!lmr && userId) lmr = SpreadsheetRepo.findOneBy('Lamaran', 'user_id', userId);
    var suratPenerimaanUrl = (mhs && mhs.surat_penerimaan_url) ? mhs.surat_penerimaan_url : (lmr ? (lmr.surat_penerimaan_url || '') : '');

    if (!mhs) {
      return success({
        progress_magang: 0,
        total_jurnal: 0,
        total_hadir: 0,
        sisa_hari: 0,
        divisi: lmr ? resolveDivisi(lmr.divisi) : '',
        cabang: lmr ? resolveCabang(lmr.cabang) : '',
        pembimbing_nama: lmr ? resolvePembimbing(lmr.pembimbing) : '',
        surat_penerimaan_url: suratPenerimaanUrl,
      });
    }

    var jrn = SpreadsheetRepo.findBy('Jurnal', 'mahasiswa_id', mhs.id) || [];
    var abs = SpreadsheetRepo.findBy('Kehadiran', 'mahasiswa_id', mhs.id) || [];
    var hadir = abs.filter(function(a) { return a.status === 'hadir'; }).length;

    var progress = 0;
    var remainingDays = 0;

    if (mhs.tanggal_mulai && mhs.tanggal_selesai) {
      var start = new Date(mhs.tanggal_mulai).getTime();
      var end = new Date(mhs.tanggal_selesai).getTime();
      var now = Date.now();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        var totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
        var passedDays = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
        progress = Math.min(100, Math.round((passedDays / totalDays) * 100));
        remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
      }
    }

    return success({
      progress_magang: progress,
      total_jurnal: jrn.length,
      total_hadir: hadir,
      sisa_hari: remainingDays,
      divisi: resolveDivisi(mhs.divisi),
      cabang: resolveCabang(mhs.cabang),
      pembimbing_nama: resolvePembimbing(mhs.pembimbing),
      surat_penerimaan_url: suratPenerimaanUrl,
    });
  }

  function getNotifications(currentUser) {
    if (!currentUser) return success([]);

    var notifs = [];
    var role = currentUser.role || "mahasiswa";
    var email = currentUser.email || "";
    var now = new Date();
    var currentHour = now.getHours();
    var currentDay = now.getDate();

    // Common Welcome Notif
    notifs.push({
      id: "notif-welcome",
      type: "info",
      title: "Selamat Datang di PIJAR",
      message: "Platform terpadu monitoring magang PT PLN (Persero) UP3 Padang.",
      read: false,
      created_at: new Date().toISOString(),
    });

    if (role === "mahasiswa") {
      var mhs = SpreadsheetRepo.findOneBy("Mahasiswa", "email", email);
      if (!mhs && currentUser.id) {
        mhs = SpreadsheetRepo.findOneBy("Mahasiswa", "user_id", currentUser.id);
      }

      if (mhs) {
        var today = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");
        var absensiToday = SpreadsheetRepo.getAll("Kehadiran").filter(function(k) {
          var kDate = String(k.tanggal || "").slice(0, 10);
          var isMhs = k.mahasiswa_id === mhs.id || k.mahasiswa_id === mhs.email || k.mahasiswa_id === mhs.user_id;
          return isMhs && kDate === today;
        });

        var hasCheckedIn = absensiToday.length > 0 && (
          (absensiToday[0].jam_masuk && absensiToday[0].jam_masuk !== "00:00" && absensiToday[0].jam_masuk !== "-") ||
          absensiToday[0].jenis_izin || absensiToday[0].status
        );
        var hasCheckedOut = absensiToday.length > 0 && (
          absensiToday[0].jam_pulang && absensiToday[0].jam_pulang !== "00:00" && absensiToday[0].jam_pulang !== "-"
        );

        // 1. Reminder Absen Masuk (07:00 - 11:59)
        if (currentHour >= 7 && currentHour < 12 && !hasCheckedIn) {
          notifs.push({
            id: "notif-mhs-absen-masuk-" + today,
            type: "warning",
            title: "Reminder Absen Masuk",
            message: "Jangan lupa untuk melakukan Absen Masuk hari ini sebelum jam 08:00 WIB!",
            read: false,
            created_at: new Date().toISOString(),
          });
        }

        // 2. Reminder Absen Pulang (16:00 - 20:00)
        if (currentHour >= 16 && hasCheckedIn && !hasCheckedOut) {
          notifs.push({
            id: "notif-mhs-absen-pulang-" + today,
            type: "warning",
            title: "Reminder Absen Pulang",
            message: "Sudah menunjukkan jam kerja selesai. Silakan lakukan Absen Pulang!",
            read: false,
            created_at: new Date().toISOString(),
          });
        }

        // 3. Status Jurnal (Submitted / Verified / Disetujui)
        var jrnList = SpreadsheetRepo.getAll("Jurnal").filter(function(j) {
          return j.mahasiswa_id === mhs.id || j.mahasiswa_id === mhs.email;
        });
        var pendingJurnal = jrnList.filter(function(j) {
          var s = String(j.status || "").toLowerCase();
          return s === "submitted" || s === "menunggu";
        });
        var verifiedJurnal = jrnList.filter(function(j) {
          var s = String(j.status || "").toLowerCase();
          return s === "verified" || s === "disetujui" || s === "approved";
        });

        if (pendingJurnal.length > 0) {
          notifs.push({
            id: "notif-mhs-jrn-pending-" + pendingJurnal.length,
            type: "info",
            title: "Jurnal Menunggu Verifikasi",
            message: "Terdapat " + pendingJurnal.length + " jurnal harian Anda yang sedang menunggu verifikasi pembimbing.",
            read: false,
            created_at: new Date().toISOString(),
          });
        }
        if (verifiedJurnal.length > 0) {
          notifs.push({
            id: "notif-mhs-jrn-verified-" + verifiedJurnal.length,
            type: "success",
            title: "Jurnal Diverifikasi",
            message: "Terdapat " + verifiedJurnal.length + " jurnal harian Anda yang telah diverifikasi & disetujui oleh pembimbing.",
            read: false,
            created_at: new Date().toISOString(),
          });
        }

        // 4. Hitung Mundur Sisa Magang & Selesai Magang (+ 7 Hari unduh)
        if (mhs.tanggal_selesai) {
          var endDate = new Date(mhs.tanggal_selesai);
          var diffTime = endDate.getTime() - now.getTime();
          var remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (remainingDays > 0 && remainingDays <= 14) {
            notifs.push({
              id: "notif-mhs-countdown",
              type: "warning",
              title: "Informasi Masa Magang",
              message: "Periode magang Anda tersisa " + remainingDays + " hari lagi (Selesai tanggal " + String(mhs.tanggal_selesai).slice(0, 10) + ").",
              read: false,
              created_at: new Date().toISOString(),
            });
          } else if (remainingDays <= 0) {
            notifs.push({
              id: "notif-mhs-completed",
              type: "success",
              title: "Periode Magang Selesai 🎉",
              message: "Selamat! Periode magang Anda telah selesai. Anda memiliki waktu tambahan 7 hari untuk mengunduh rekap riwayat absensi & jurnal.",
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      }
    } else if (role === "pembimbing") {
      var allMhs = SpreadsheetRepo.getAll("Mahasiswa").filter(function(m) {
        return m.pembimbing === currentUser.id || m.pembimbing === currentUser.email || (currentUser.divisi && m.divisi === currentUser.divisi);
      });

      if (allMhs.length > 0) {
        notifs.push({
          id: "notif-pemb-mhs-count",
          type: "info",
          title: "Mahasiswa Bimbingan",
          message: "Anda mengampu " + allMhs.length + " mahasiswa magang aktif.",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      var mhsIds = allMhs.map(function(m) { return m.id; });
      var pendingJurnalCount = SpreadsheetRepo.getAll("Jurnal").filter(function(j) {
        var s = String(j.status || "").toLowerCase();
        return mhsIds.indexOf(j.mahasiswa_id) !== -1 && (s === "submitted" || s === "menunggu");
      }).length;

      var verifiedJurnalCount = SpreadsheetRepo.getAll("Jurnal").filter(function(j) {
        var s = String(j.status || "").toLowerCase();
        return mhsIds.indexOf(j.mahasiswa_id) !== -1 && (s === "verified" || s === "disetujui" || s === "approved");
      }).length;

      if (pendingJurnalCount > 0) {
        notifs.push({
          id: "notif-pemb-jrn-pending-" + pendingJurnalCount,
          type: "warning",
          title: "Verifikasi Jurnal Harian",
          message: "Terdapat " + pendingJurnalCount + " jurnal harian mahasiswa bimbingan yang menunggu verifikasi Anda.",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      if (verifiedJurnalCount > 0) {
        notifs.push({
          id: "notif-pemb-jrn-verified-" + verifiedJurnalCount,
          type: "success",
          title: "Jurnal Harian Disetujui",
          message: "Anda telah menyetujui " + verifiedJurnalCount + " jurnal harian mahasiswa bimbingan.",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      allMhs.forEach(function(m) {
        if (m.tanggal_selesai) {
          var endDate = new Date(m.tanggal_selesai);
          var diffTime = endDate.getTime() - now.getTime();
          var remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (remainingDays > 0 && remainingDays <= 7) {
            notifs.push({
              id: "notif-pemb-h7-" + m.id,
              type: "warning",
              title: "Peringatan Magang Berakhir",
              message: "Periode magang " + m.nama + " akan berakhir dalam " + remainingDays + " hari.",
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      });
    } else if (role === "admin") {
      var pendingLamaran = SpreadsheetRepo.getAll("Lamaran").filter(function(l) { return l.status === "menunggu"; }).length;
      if (pendingLamaran > 0) {
        notifs.push({
          id: "notif-admin-lamaran-pending",
          type: "info",
          title: "Lamaran Magang Baru",
          message: "Terdapat " + pendingLamaran + " lamaran magang baru yang perlu diverifikasi.",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      if (currentDay >= 25) {
        notifs.push({
          id: "notif-admin-rekap-bulanan",
          type: "warning",
          title: "Reminder Rekap Absensi Bulanan",
          message: "Pengingat rekapitulasi kehadiran bulanan seluruh mahasiswa magang unit UP3 sebelum bulan baru dimulai.",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      var activeMhs = SpreadsheetRepo.getAll("Mahasiswa").filter(function(m) { return m.status === "aktif"; });
      activeMhs.forEach(function(m) {
        if (m.tanggal_selesai) {
          var endDate = new Date(m.tanggal_selesai);
          var diffTime = endDate.getTime() - now.getTime();
          var remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (remainingDays > 0 && remainingDays <= 7) {
            notifs.push({
              id: "notif-admin-h7-" + m.id,
              type: "warning",
              title: "Peringatan Magang Berakhir",
              message: "Periode magang " + m.nama + " (" + (m.universitas || "UP3") + ") akan berakhir dalam " + remainingDays + " hari.",
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      });
    } else if (role === "admin_ulp") {
      var userCabangId = currentUser.cabang;
      var ulpMhs = SpreadsheetRepo.getAll("Mahasiswa").filter(function(m) {
        return typeof DivisiService !== "undefined" && DivisiService.isCabangMatch ? DivisiService.isCabangMatch(m.cabang, userCabangId) : (m.cabang === userCabangId);
      });

      if (ulpMhs.length > 0) {
        notifs.push({
          id: "notif-ulp-mhs-count",
          type: "info",
          title: "Mahasiswa Unit ULP",
          message: "Terdapat " + ulpMhs.length + " mahasiswa magang terdaftar di unit ULP Anda.",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      if (currentDay >= 25) {
        notifs.push({
          id: "notif-ulp-rekap-bulanan",
          type: "warning",
          title: "Reminder Rekap Absensi Bulanan ULP",
          message: "Pengingat rekapitulasi kehadiran bulanan mahasiswa magang ULP sebelum bulan baru dimulai.",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      ulpMhs.forEach(function(m) {
        if (m.tanggal_selesai) {
          var endDate = new Date(m.tanggal_selesai);
          var diffTime = endDate.getTime() - now.getTime();
          var remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (remainingDays > 0 && remainingDays <= 7) {
            notifs.push({
              id: "notif-ulp-h7-" + m.id,
              type: "warning",
              title: "Peringatan Magang Berakhir (ULP)",
              message: "Periode magang " + m.nama + " di ULP akan berakhir dalam " + remainingDays + " hari.",
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      });
    }

    return success(notifs);
  }

  return {
    getAdminStats: getAdminStats,
    getPembimbingStats: getPembimbingStats,
    getMahasiswaStats: getMahasiswaStats,
    getNotifications: getNotifications,
  };
})();
