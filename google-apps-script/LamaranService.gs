/**
 * LamaranService.gs
 */

var LamaranService = (function() {
  function getAll(params) {
    var rows = SpreadsheetRepo.getAll('Lamaran');

    // Filter status
    if (params.status) {
      rows = rows.filter(function(r) { return r.status === params.status; });
    }

    rows.sort(function(a, b) {
      var order = { menunggu: 0, diterima: 1, ditolak: 2 };
      var ao = order[a.status] !== undefined ? order[a.status] : 3;
      var bo = order[b.status] !== undefined ? order[b.status] : 3;
      if (ao !== bo) return ao - bo;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });

    var users = SpreadsheetRepo.getAll('Users');
    var userMap = {};
    for (var u = 0; u < users.length; u++) {
      if (users[u].id) userMap[users[u].id] = users[u];
      if (users[u].email) userMap[users[u].email.toLowerCase().trim()] = users[u];
    }

    for (var i = 0; i < rows.length; i++) {
      if (!rows[i].nomor_hp) {
        var usr = userMap[rows[i].user_id] || userMap[(rows[i].email || '').toLowerCase().trim()];
        if (usr && usr.nomor_hp) {
          rows[i].nomor_hp = usr.nomor_hp;
        }
      }
    }

    var result = SpreadsheetRepo.paginate(rows, params.page || 1, params.limit || 100);
    return paginated(result.items, result.total, result.page, result.limit);
  }

  // Approve
  function approve(params, currentUser) {
    var id         = params.id;
    var cabang     = params.cabang || '';
    var divisi     = params.divisi || 'Belum Ditentukan';
    var pembimbing = params.pembimbing || 'Belum Ditentukan';

    if (!id || !cabang) {
      return error('id dan Unit/Cabang wajib diisi');
    }

    var isUp3 = cabang === 'c8690edf-123e-4d43-85b5-aa6bb3988e0b' || cabang === 'UP3' || cabang === '';
    if (isUp3) {
      if (!params.divisi || params.divisi === 'Belum Ditentukan') {
        return error('Divisi wajib diisi untuk penempatan UP3');
      }
      if (!params.pembimbing || params.pembimbing === 'Belum Ditentukan') {
        return error('Pembimbing wajib diisi untuk penempatan UP3');
      }
    }

    var lamaran = SpreadsheetRepo.findOneBy('Lamaran', 'id', id);
    if (!lamaran) return error('Lamaran tidak ditemukan');
    if (lamaran.status !== 'menunggu') return error('Lamaran sudah diproses sebelumnya');

    var user = SpreadsheetRepo.findOneBy('Users', 'id', lamaran.user_id);
    var nomorHp = user ? (user.nomor_hp || '') : '';

    SpreadsheetRepo.append('Mahasiswa', {
      id:              SpreadsheetRepo.generateId(),
      user_id:         lamaran.user_id,
      nama:            lamaran.nama,
      nim:             lamaran.nim,
      universitas:     lamaran.universitas,
      program_studi:   lamaran.program_studi,
      email:           lamaran.email,
      nomor_hp:        nomorHp,
      tanggal_mulai:   lamaran.tanggal_mulai,
      tanggal_selesai: lamaran.tanggal_selesai,
      divisi:          divisi,
      cabang:          cabang,
      pembimbing:      pembimbing,
      status:          'aktif',
      created_at:      new Date().toISOString(),
    });

    var suratUrl = '';
    var fileData = params.surat_penerimaan_base64 || params.surat_penerimaan;
    if (fileData) {
      var mime = params.surat_penerimaan_type || 'application/pdf';
      suratUrl = DriveService.uploadFile(fileData, 'surat_penerimaan_' + id + '.pdf', mime, 'dokumen');
    }

    // Update status lamaran
    SpreadsheetRepo.updateById('Lamaran', id, {
      status: 'diterima',
      divisi: divisi,
      cabang: cabang,
      pembimbing: pembimbing,
      surat_penerimaan_url: suratUrl,
    });

    // Update mahasiswa_status di Users 'aktif'
    SpreadsheetRepo.updateById('Users', lamaran.user_id, {
      mahasiswa_status: 'aktif',
      cabang: cabang,
      divisi: divisi,
    });

    if (typeof syncJumlahMahasiswaSheetCells === 'function') {
      syncJumlahMahasiswaSheetCells();
    }

    ActivityLogger.log(currentUser, 'Approve lamaran: ' + lamaran.nama + ' (' + lamaran.universitas + ')');
    return success(null, 'Lamaran berhasil diterima. Mahasiswa sekarang aktif.');
  }

  // Reject
  function reject(params, currentUser) {
    var id    = params.id;
    var alasan = params.alasan || '';

    if (!id) return error('id wajib diisi');

    var lamaran = SpreadsheetRepo.findOneBy('Lamaran', 'id', id);
    if (!lamaran) return error('Lamaran tidak ditemukan');
    if (lamaran.status !== 'menunggu') return error('Lamaran sudah diproses sebelumnya');

    // Update status lamaran
    SpreadsheetRepo.updateById('Lamaran', id, {
      status:       'ditolak',
      alasan_tolak: alasan,
    });

    // Update mahasiswa_status di Users 'ditolak'
    SpreadsheetRepo.updateById('Users', lamaran.user_id, { mahasiswa_status: 'ditolak' });

    ActivityLogger.log(currentUser, 'Tolak lamaran: ' + lamaran.nama);
    return success(null, 'Lamaran ditolak.');
  }

  return {
    getAll:  getAll,
    approve: approve,
    reject:  reject,
  };
})();
