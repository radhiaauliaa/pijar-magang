/**
 * JurnalAbsensiService.gs — Jurnal dan Absensi services
 */

// Jurnal
var JurnalService = (function() {
  var SHEET = 'Jurnal';

  function getAll(params, currentUser) {
    var rows = SpreadsheetRepo.getAll(SHEET);
    var search = (params.search || '').toLowerCase();
    var status = params.status || '';
    var mhsId = params.mahasiswa_id || '';

    // Enrich with mahasiswa data
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');
    var mhsMap = {};
    allMhs.forEach(function(m) { mhsMap[m.id] = m; });

    // Filter by currentUser role
    if (currentUser && currentUser.role === 'pembimbing') {
      rows = rows.filter(function(r) {
        var m = mhsMap[r.mahasiswa_id];
        if (!m) return false;
        return (m.pembimbing === currentUser.id) ||
               (m.pembimbing === currentUser.email) ||
               (m.divisi === currentUser.divisi && currentUser.divisi !== '');
      });
    }

    if (search) rows = rows.filter(function(r) { return (r.judul + (r.mahasiswa_nama || '')).toLowerCase().indexOf(search) !== -1; });
    if (status) rows = rows.filter(function(r) { return r.status === status; });
    if (mhsId) rows = rows.filter(function(r) { return r.mahasiswa_id === mhsId; });

    rows = rows.map(function(r) {
      var m = mhsMap[r.mahasiswa_id];
      return Object.assign({}, r, {
        mahasiswa_nama: m ? m.nama : r.mahasiswa_id,
        mahasiswa_universitas: m ? m.universitas : '',
      });
    });

    rows.sort(function(a, b) { return (b.tanggal || '').localeCompare(a.tanggal || ''); });

    var result = SpreadsheetRepo.paginate(rows, params.page, params.limit);
    return paginated(result.items, result.total, result.page, result.limit);
  }

  function getMy(params, currentUser) {
    var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
    if (!mhs) return error('Data mahasiswa tidak ditemukan');
    return getAll(Object.assign({}, params, { mahasiswa_id: mhs.id }), currentUser);
  }

  function getById(id, currentUser) {
    var j = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!j) return error('Jurnal tidak ditemukan');
    return success(j, 'OK');
  }

  function create(params, currentUser) {
    var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
    if (!mhs) return error('Data mahasiswa tidak ditemukan');

    if (!params.judul) return error('Judul wajib diisi');
    if (!params.deskripsi) return error('Deskripsi wajib diisi');
    if (!params.tanggal) return error('Tanggal wajib diisi');

    var fotoUrl = '';
    var fotoData = params.foto || params.foto_base64;
    if (fotoData) {
      var mime = params.foto_type || 'image/jpeg';
      fotoUrl = DriveService.uploadFile(fotoData, 'jurnal_' + mhs.id + '_' + params.tanggal + '.jpg', mime, 'jurnal');
    }

    var id = SpreadsheetRepo.generateId();
    var jurnal = {
      id: id,
      mahasiswa_id: mhs.id,
      tanggal: params.tanggal,
      judul: params.judul,
      deskripsi: params.deskripsi,
      foto: fotoUrl,
      status: 'submitted',
      created_at: new Date().toISOString(),
      catatan_revisi: '',
      divisi: mhs.divisi || '',
      cabang: mhs.cabang || '',
    };

    SpreadsheetRepo.append(SHEET, jurnal);
    ActivityLogger.log(currentUser, 'Buat jurnal: ' + params.judul);
    return success(jurnal, 'Jurnal berhasil dikirim');
  }

  function update(params, currentUser) {
    var j = SpreadsheetRepo.findOneBy(SHEET, 'id', params.id);
    if (!j) return error('Jurnal tidak ditemukan');

    var updates = { judul: params.judul, deskripsi: params.deskripsi, tanggal: params.tanggal };
    var fotoData = params.foto || params.foto_base64;
    if (fotoData) {
      var mime = params.foto_type || 'image/jpeg';
      updates.foto = DriveService.uploadFile(fotoData, 'jurnal_' + params.id + '.jpg', mime, 'jurnal');
    }

    var updated = SpreadsheetRepo.updateById(SHEET, params.id, updates);
    ActivityLogger.log(currentUser, 'Update jurnal: ' + params.id);
    return success(updated, 'Jurnal berhasil diperbarui');
  }

  function verify(params, currentUser) {
    var id = typeof params === 'object' && params ? params.id : params;
    var status = (typeof params === 'object' && params ? params.status : arguments[1]) || 'verified';
    var catatRevisi = (typeof params === 'object' && params ? params.catatan_revisi : arguments[2]) || '';

    var j = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!j) return error('Jurnal tidak ditemukan');
    var updated = SpreadsheetRepo.updateById(SHEET, id, {
      status: status,
      catatan_revisi: catatRevisi,
    });
    ActivityLogger.log(currentUser, 'Verifikasi jurnal: ' + id + ' -> ' + status);
    return success(updated, 'Status jurnal berhasil diverifikasi');
  }

  function remove(id, currentUser) {
    var j = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!j) return error('Jurnal tidak ditemukan');
    SpreadsheetRepo.deleteById(SHEET, id);
    ActivityLogger.log(currentUser, 'Hapus jurnal: ' + id);
    return success(null, 'Jurnal berhasil dihapus');
  }

  return { getAll: getAll, getMy: getMy, getById: getById, create: create, update: update, verify: verify, remove: remove };
})();

// Absensi
var AbsensiService = (function() {
  var SHEET = 'Kehadiran';

  function getAll(params, currentUser) {
    params = params || {};
    var rows = SpreadsheetRepo.getAll(SHEET);
    var mhsId = params.mahasiswa_id || '';
    var status = params.status || '';

    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');
    var mhsMap = {};
    allMhs.forEach(function(m) {
      if (m.id) mhsMap[m.id] = m;
      if (m.email) mhsMap[m.email] = m;
      if (m.user_id) mhsMap[m.user_id] = m;
    });

    if (mhsId) {
      var targetMhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'id', mhsId);
      rows = rows.filter(function(r) {
        if (r.mahasiswa_id === mhsId) return true;
        if (targetMhs && (r.mahasiswa_id === targetMhs.user_id || r.mahasiswa_id === targetMhs.email)) return true;
        var m = mhsMap[r.mahasiswa_id];
        return m && (m.id === mhsId || (targetMhs && m.id === targetMhs.id));
      });
    } else {
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

      if (userCabangId && userCabangId !== 'NO_ULP_CABANG_FOUND') {
        rows = rows.filter(function(r) {
          var m = mhsMap[r.mahasiswa_id];
          if (!m) return false;
          return typeof DivisiService !== 'undefined' && DivisiService.isCabangMatch ? DivisiService.isCabangMatch(m.cabang, userCabangId) : m.cabang === userCabangId;
        });
      } else if (isUlpAdmin) {
        rows = [];
      }
    }

    // Filter by currentUser role (pembimbing)
    if (currentUser && currentUser.role === 'pembimbing') {
      rows = rows.filter(function(r) {
        var m = mhsMap[r.mahasiswa_id];
        if (!m) return false;
        return (m.pembimbing === currentUser.id) ||
               (m.pembimbing === currentUser.email) ||
               (m.divisi === currentUser.divisi && currentUser.divisi !== '');
      });
    }

    if (status) {
      rows = rows.filter(function(r) {
        var s = String(r.status || '').toLowerCase();
        return s === status.toLowerCase() || String(r.jenis_izin || '').toLowerCase() === status.toLowerCase();
      });
    }

    rows = rows.map(function(r) {
      var m = mhsMap[r.mahasiswa_id];
      return Object.assign({}, r, {
        mahasiswa_nama: m ? m.nama : r.mahasiswa_id,
        mahasiswa_universitas: m ? m.universitas : '',
      });
    });

    var monthMap = {
      januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
      juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
    };
    var getTs = function(item) {
      var rawDate = String(item.tanggal || '').trim();
      var jamStr = item.jam_masuk && item.jam_masuk !== '00:00' && item.jam_masuk !== '-' ? item.jam_masuk : '00:00';
      if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
        var ymd = rawDate.slice(0, 10);
        var d = new Date(ymd + 'T' + jamStr + ':00');
        if (!isNaN(d.getTime())) return d.getTime();
      }
      var parts = rawDate.toLowerCase().split(/\s+/);
      if (parts.length >= 3) {
        var day = (parts[0].length < 2 ? '0' + parts[0] : parts[0]);
        var month = monthMap[parts[1]] || '01';
        var year = parts[2];
        var d2 = new Date(year + '-' + month + '-' + day + 'T' + jamStr + ':00');
        if (!isNaN(d2.getTime())) return d2.getTime();
      }
      var parsed = Date.parse(rawDate);
      return isNaN(parsed) ? 0 : parsed;
    };

    rows.sort(function(a, b) {
      return getTs(b) - getTs(a);
    });

    var result = SpreadsheetRepo.paginate(rows, params.page, params.limit);
    return paginated(result.items, result.total, result.page, result.limit);
  }

  function getMy(params, currentUser) {
    var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
    if (!mhs) {
      var userDb = SpreadsheetRepo.findOneBy('Users', 'email', currentUser.email);
      if (userDb) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'user_id', userDb.id);
    }
    if (!mhs) return error('Data mahasiswa tidak ditemukan');
    return getAll(Object.assign({}, params, { mahasiswa_id: mhs.id }), currentUser);
  }

  function getToday(currentUser) {
    var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
    if (!mhs) {
      var userDb = SpreadsheetRepo.findOneBy('Users', 'email', currentUser.email);
      if (userDb) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'user_id', userDb.id);
    }
    if (!mhs) return success(null, 'OK');
    var todayStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
    var list = SpreadsheetRepo.getAll(SHEET).filter(function(k) {
      var isMhs = k.mahasiswa_id === mhs.id || (mhs.user_id && k.mahasiswa_id === mhs.user_id) || k.mahasiswa_id === mhs.email;
      if (!isMhs) return false;
      var kDate = String(k.tanggal || '').slice(0, 10);
      try {
        var d = new Date(k.tanggal);
        var dStr = Utilities.formatDate(d, "GMT+7", "yyyy-MM-dd");
        if (dStr === todayStr) return true;
      } catch(e){}
      return kDate === todayStr;
    });
    return success(list.length > 0 ? list[list.length - 1] : null, 'OK');
  }

  function checkIn(params, currentUser) {
    var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
    if (!mhs) {
      var userDb = SpreadsheetRepo.findOneBy('Users', 'email', currentUser.email);
      if (userDb) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'user_id', userDb.id);
    }
    if (!mhs) return error('Data mahasiswa tidak ditemukan');

    var today = new Date().toISOString().split('T')[0];
    var existing = SpreadsheetRepo.getAll(SHEET).filter(function(k) {
      var kDate = String(k.tanggal || '').slice(0, 10);
      var isMhs = k.mahasiswa_id === mhs.id || (mhs.user_id && k.mahasiswa_id === mhs.user_id) || k.mahasiswa_id === mhs.email;
      return isMhs && kDate === today;
    });
    if (existing.length > 0) {
      var ex = existing[0];
      if ((ex.jam_masuk && ex.jam_masuk !== '00:00' && ex.jam_masuk !== '-') || ex.jenis_izin || ex.status) {
        return error('Anda sudah melakukan absensi masuk atau mengajukan izin hari ini!');
      }
    }

    var now = new Date();
    var jamMasuk = now.toTimeString().slice(0, 5);
    var hour = now.getHours();
    var minute = now.getMinutes();
    var day = now.getDay();

    var isLate = false;
    if (day === 5) {
      if (hour > 7 || (hour === 7 && minute > 40)) isLate = true;
    } else {
      if (hour > 8 || (hour === 8 && minute > 10)) isLate = true;
    }
    var status = isLate ? 'terlambat' : 'hadir';

    var fotoUrl = '';
    if (params.foto) {
      fotoUrl = DriveService.uploadFile(params.foto, 'selfie_masuk_' + mhs.id + '_' + today + '.jpg', 'image/jpeg', 'absensi');
    }

    var id = SpreadsheetRepo.generateId();
    var kehadiran = {
      id: id,
      mahasiswa_id: mhs.id,
      tanggal: today,
      jam_masuk: jamMasuk,
      jam_pulang: '',
      status: status,
      keterangan: params.keterangan || '',
      foto_masuk: fotoUrl,
      foto_pulang: '',
      jenis_izin: '',
      dokumen_izin: '',
      divisi: mhs.divisi || '',
      cabang: mhs.cabang || '',
    };

    SpreadsheetRepo.append(SHEET, kehadiran);
    ActivityLogger.log(currentUser, 'Check-in: ' + jamMasuk);
    return success(kehadiran, 'Check-in berhasil pada ' + jamMasuk);
  }

  function checkOut(params, currentUser) {
    var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
    if (!mhs) {
      var userDb = SpreadsheetRepo.findOneBy('Users', 'email', currentUser.email);
      if (userDb) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'user_id', userDb.id);
    }
    if (!mhs) return error('Data mahasiswa tidak ditemukan');

    var today = new Date().toISOString().split('T')[0];
    var list = SpreadsheetRepo.getAll(SHEET).filter(function(k) {
      var kDate = String(k.tanggal || '').slice(0, 10);
      var isMhs = k.mahasiswa_id === mhs.id || (mhs.user_id && k.mahasiswa_id === mhs.user_id) || k.mahasiswa_id === mhs.email;
      return isMhs && kDate === today;
    });
    if (list.length === 0) return error('Anda belum melakukan check-in hari ini');
    var existing = list[0];
    if (existing.jam_pulang && existing.jam_pulang !== '00:00' && existing.jam_pulang !== '-') {
      return error('Anda sudah melakukan absensi pulang hari ini!');
    }

    var now = new Date();
    var hour = now.getHours();
    if (hour >= 20) {
      return error('Batas waktu absen pulang (pukul 20:00) telah berakhir!');
    }
    var jamPulang = now.toTimeString().slice(0, 5);

    var fotoUrl = '';
    if (params.foto) {
      fotoUrl = DriveService.uploadFile(params.foto, 'selfie_pulang_' + mhs.id + '_' + today + '.jpg', 'image/jpeg', 'absensi');
    }

    var updated = SpreadsheetRepo.updateById(SHEET, existing.id, {
      jam_pulang: jamPulang,
      foto_pulang: fotoUrl || existing.foto_pulang || '',
    });

    ActivityLogger.log(currentUser, 'Check-out: ' + jamPulang);
    return success(updated, 'Check-out berhasil pada ' + jamPulang);
  }

  function ajukanIzin(params, currentUser) {
    var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
    if (!mhs) {
      var userDb = SpreadsheetRepo.findOneBy('Users', 'email', currentUser.email);
      if (userDb) mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'user_id', userDb.id);
    }
    if (!mhs) return error('Data mahasiswa tidak ditemukan');

    var today = new Date().toISOString().split('T')[0];
    var existing = SpreadsheetRepo.getAll(SHEET).filter(function(k) {
      var kDate = String(k.tanggal || '').slice(0, 10);
      var isMhs = k.mahasiswa_id === mhs.id || (mhs.user_id && k.mahasiswa_id === mhs.user_id) || k.mahasiswa_id === mhs.email;
      return isMhs && kDate === today;
    });
    if (existing.length > 0) {
      return error('Anda sudah melakukan absensi atau mengajukan izin hari ini!');
    }

    var docUrl = '';
    if (params.dokumen) {
      var isPdf = String(params.dokumen).indexOf('data:application/pdf') === 0;
      var mime = isPdf ? 'application/pdf' : 'image/jpeg';
      var ext = isPdf ? '.pdf' : '.jpg';
      docUrl = DriveService.uploadFile(params.dokumen, 'izin_' + mhs.id + '_' + today + ext, mime, 'izin');
    }

    var jenis = params.jenis_izin || 'Izin Sehari';
    var status = jenis === 'Sakit' ? 'sakit' : 'izin';

    var id = SpreadsheetRepo.generateId();
    var kehadiran = {
      id: id,
      mahasiswa_id: mhs.id,
      tanggal: today,
      jam_masuk: '',
      jam_pulang: '',
      status: status,
      keterangan: params.keterangan || '',
      foto_masuk: '',
      foto_pulang: '',
      jenis_izin: jenis,
      dokumen_izin: docUrl,
      divisi: mhs.divisi || '',
      cabang: mhs.cabang || '',
    };

    SpreadsheetRepo.append(SHEET, kehadiran);
    ActivityLogger.log(currentUser, 'Ajukan Izin: ' + jenis);
    return success(kehadiran, 'Pengajuan izin berhasil dikirim.');
  }

  return { getAll: getAll, getMy: getMy, getToday: getToday, checkIn: checkIn, checkOut: checkOut, ajukanIzin: ajukanIzin };
})();
