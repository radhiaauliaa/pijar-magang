/**
 * MahasiswaService.gs
 */

var MahasiswaService = (function() {

  var SHEET = 'Mahasiswa';

  function getAll(params, currentUser) {
    var rows = SpreadsheetRepo.getAll(SHEET);
    params = params || {};

    var search = (params.search || '').toLowerCase();
    var status = params.status || '';

    // Filter by cabang
    var userCabangId = params.cabang;
    if (!userCabangId && currentUser) {
      if (typeof DivisiService !== 'undefined' && DivisiService.resolveUserCabangId) {
        userCabangId = DivisiService.resolveUserCabangId(currentUser);
      }
    }

    var isUlpAdmin = currentUser && currentUser.role === 'admin_ulp';

    if (userCabangId && userCabangId !== 'NO_ULP_CABANG_FOUND') {
      rows = rows.filter(function(r) {
        return typeof DivisiService !== 'undefined' && DivisiService.isCabangMatch ? DivisiService.isCabangMatch(r.cabang, userCabangId) : (r.cabang === userCabangId);
      });
    } else if (isUlpAdmin) {
      rows = [];
    }

    // Filter by pembimbing if currentUser is pembimbing
    if (currentUser && currentUser.role === 'pembimbing') {
      rows = rows.filter(function(r) {
        var isPembimbingMatch = (r.pembimbing === currentUser.id) ||
                                (r.pembimbing === currentUser.email) ||
                                (currentUser.id && r.pembimbing && String(r.pembimbing).toLowerCase() === String(currentUser.id).toLowerCase()) ||
                                (currentUser.email && r.pembimbing && String(r.pembimbing).toLowerCase() === String(currentUser.email).toLowerCase());
        var isDivisiMatch = r.divisi && currentUser.divisi && (r.divisi === currentUser.divisi);
        return isPembimbingMatch || isDivisiMatch;
      });
    }

    if (search) {
      rows = rows.filter(function(r) {
        return (r.nama + r.nim + r.universitas + r.email).toLowerCase().indexOf(search) !== -1;
      });
    }
    if (status) {
      rows = rows.filter(function(r) { return r.status === status; });
    }

    var result = SpreadsheetRepo.paginate(rows, params.page, params.limit);
    return paginated(result.items, result.total, result.page, result.limit);
  }

  function getById(id, currentUser) {
    var m = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!m) return error('Mahasiswa tidak ditemukan');
    // Role check: mahasiswa hanya bisa lihat dirinya sendiri
    if (currentUser && currentUser.role === 'mahasiswa' && m.email !== currentUser.email) {
      return error('Akses ditolak', 'FORBIDDEN');
    }
    return success(m, 'OK');
  }

  function create(params, currentUser) {
    // Validate required fields
    var required = ['nama','nim','universitas','program_studi','email','nomor_hp','tanggal_mulai','tanggal_selesai','divisi','cabang','pembimbing'];
    for (var i = 0; i < required.length; i++) {
      if (!params[required[i]]) return error(required[i] + ' wajib diisi');
    }

    // Check duplicate NIM
    var existing = SpreadsheetRepo.findOneBy(SHEET, 'nim', params.nim);
    if (existing) return error('NIM sudah terdaftar');

    // Check divisi capacity
    var divisi = SpreadsheetRepo.findOneBy('Divisi', 'id', params.divisi);
    if (divisi) {
      var jumlah = parseInt(divisi.jumlah_mahasiswa) || 0;
      var kapasitas = parseInt(divisi.kapasitas) || 0;
      if (jumlah >= kapasitas) {
        return error('Kapasitas divisi ' + divisi.nama_divisi + ' sudah penuh (' + jumlah + '/' + kapasitas + ')');
      }
    }

    var id = SpreadsheetRepo.generateId();
    var newMahasiswa = {
      id: id,
      nama: params.nama,
      nim: params.nim,
      universitas: params.universitas,
      program_studi: params.program_studi,
      email: params.email,
      nomor_hp: params.nomor_hp,
      tanggal_mulai: params.tanggal_mulai,
      tanggal_selesai: params.tanggal_selesai,
      divisi: params.divisi,
      cabang: params.cabang,
      pembimbing: params.pembimbing,
      status: 'aktif',
    };

    SpreadsheetRepo.append(SHEET, newMahasiswa);

    // Update jumlah_mahasiswa di divisi dan cabang
    if (divisi) {
      var newCount = (parseInt(divisi.jumlah_mahasiswa) || 0) + 1;
      SpreadsheetRepo.updateById('Divisi', params.divisi, { jumlah_mahasiswa: String(newCount) });
    }
    var cabang = SpreadsheetRepo.findOneBy('Cabang', 'id', params.cabang);
    if (cabang) {
      var newCabangCount = (parseInt(cabang.jumlah_mahasiswa) || 0) + 1;
      SpreadsheetRepo.updateById('Cabang', params.cabang, { jumlah_mahasiswa: String(newCabangCount) });
    }

    // Buat user account untuk mahasiswa
    var existingUser = SpreadsheetRepo.findOneBy('Users', 'email', params.email);
    if (!existingUser) {
      SpreadsheetRepo.append('Users', {
        id: SpreadsheetRepo.generateId(),
        nama: params.nama,
        email: params.email,
        password_hash: Hash.hash(params.nim), // Default password = NIM
        role: 'mahasiswa',
        status: 'aktif',
      });
    }

    ActivityLogger.log(currentUser, 'Tambah mahasiswa: ' + params.nama);
    return success(newMahasiswa, 'Mahasiswa berhasil ditambahkan');
  }

  function update(params, currentUser) {
    var updated = SpreadsheetRepo.updateById(SHEET, params.id, {
      nama: params.nama,
      universitas: params.universitas,
      program_studi: params.program_studi,
      email: params.email,
      nomor_hp: params.nomor_hp,
      tanggal_mulai: params.tanggal_mulai,
      tanggal_selesai: params.tanggal_selesai,
      divisi: params.divisi,
      cabang: params.cabang,
      pembimbing: params.pembimbing,
      status: params.status,
    });
    ActivityLogger.log(currentUser, 'Update mahasiswa: ' + params.id);
    return success(updated, 'Mahasiswa berhasil diperbarui');
  }

  function remove(id, currentUser) {
    var mhs = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!mhs) return error('Mahasiswa tidak ditemukan');

    SpreadsheetRepo.deleteById(SHEET, id);

    // Update kapasitas divisi & cabang
    var divisi = SpreadsheetRepo.findOneBy('Divisi', 'id', mhs.divisi);
    if (divisi) {
      var newCount = Math.max(0, (parseInt(divisi.jumlah_mahasiswa) || 1) - 1);
      SpreadsheetRepo.updateById('Divisi', mhs.divisi, { jumlah_mahasiswa: String(newCount) });
    }
    var cabang = SpreadsheetRepo.findOneBy('Cabang', 'id', mhs.cabang);
    if (cabang) {
      var newC = Math.max(0, (parseInt(cabang.jumlah_mahasiswa) || 1) - 1);
      SpreadsheetRepo.updateById('Cabang', mhs.cabang, { jumlah_mahasiswa: String(newC) });
    }

    ActivityLogger.log(currentUser, 'Hapus mahasiswa: ' + mhs.nama);
    return success(null, 'Mahasiswa berhasil dihapus');
  }

  function importBulk(rows, currentUser) {
    if (!Array.isArray(rows)) return error('rows harus berupa array');
    var created = 0;
    var errors = [];
    rows.forEach(function(row, idx) {
      try {
        var result = SpreadsheetRepo.findOneBy(SHEET, 'nim', row.nim || row.NIM);
        if (!result) {
          SpreadsheetRepo.append(SHEET, {
            id: SpreadsheetRepo.generateId(),
            nama: row.nama || row.Nama || '',
            nim: row.nim || row.NIM || '',
            universitas: row.universitas || row.Universitas || '',
            program_studi: row.program_studi || row['Program Studi'] || '',
            email: row.email || row.Email || '',
            nomor_hp: row.nomor_hp || row['Nomor HP'] || '',
            tanggal_mulai: row.tanggal_mulai || row['Tanggal Mulai'] || '',
            tanggal_selesai: row.tanggal_selesai || row['Tanggal Selesai'] || '',
            divisi: row.divisi || row.Divisi || '',
            cabang: row.cabang || row.Cabang || '',
            pembimbing: row.pembimbing || row.Pembimbing || '',
            status: 'aktif',
          });
          created++;
        }
      } catch (e) {
        errors.push('Baris ' + (idx + 1) + ': ' + e.message);
      }
    });
    ActivityLogger.log(currentUser, 'Import ' + created + ' mahasiswa');
    return success({ created: created, errors: errors }, 'Import selesai');
  }

  function exportData(params, currentUser) {
    params = params || {};
    var rows = SpreadsheetRepo.getAll(SHEET);

    var userCabangId = params.cabang;
    if (!userCabangId && currentUser) {
      if (typeof DivisiService !== 'undefined' && DivisiService.resolveUserCabangId) {
        userCabangId = DivisiService.resolveUserCabangId(currentUser);
      }
    }

    if (userCabangId && userCabangId !== 'NO_ULP_CABANG_FOUND') {
      rows = rows.filter(function(r) {
        return typeof DivisiService !== 'undefined' && DivisiService.isCabangMatch ? DivisiService.isCabangMatch(r.cabang, userCabangId) : (r.cabang === userCabangId);
      });
    } else if (currentUser && currentUser.role === 'admin_ulp') {
      rows = [];
    }

    // Create temporary spreadsheet
    var ss = SpreadsheetApp.create('Export Mahasiswa ' + new Date().toLocaleDateString('id-ID'));
    var sheet = ss.getActiveSheet();
    var headers = ['id','nama','nim','universitas','program_studi','email','nomor_hp','tanggal_mulai','tanggal_selesai','divisi','cabang','status'];
    sheet.appendRow(headers);
    rows.forEach(function(r) {
      sheet.appendRow(headers.map(function(h) { return r[h] || ''; }));
    });
    var url = ss.getUrl();
    ActivityLogger.log(currentUser, 'Export ' + rows.length + ' data mahasiswa');
    return success({ url: url }, 'Export berhasil');
  }

  function getPembimbingList() {
    var users = SpreadsheetRepo.getAll('Users').filter(function(u) { return u.role === 'pembimbing' && u.status === 'aktif'; });
    var result = users.map(function(u) {
      return { id: u.id, nama: u.nama, divisi: u.divisi || '', cabang: u.cabang || '' };
    });
    return success(result, 'OK');
  }

  return { getAll: getAll, getById: getById, create: create, update: update, remove: remove, importBulk: importBulk, exportData: exportData, getPembimbingList: getPembimbingList };
})();
