/**
 * DivisiCabangService.gs
 */

// Divisi
var DivisiService = (function() {
  var SHEET = 'Divisi';

  function isStudentActive(m) {
    var st = String(m.status || m.mahasiswa_status || 'aktif').toLowerCase().trim();
    return st === 'aktif' || st === 'diterima' || st === 'menunggu' || st === '';
  }

  function getUp3CabangId() {
    var allCab = SpreadsheetRepo.getAll('Cabang');
    for (var i = 0; i < allCab.length; i++) {
      var n = String(allCab[i].nama_cabang || '').toLowerCase();
      var cid = String(allCab[i].id || '').toLowerCase();
      if (n.indexOf('up3') !== -1 || cid.indexOf('c8690edf-123e-4837') !== -1) {
        return allCab[i].id;
      }
    }
    return 'c8690edf-123e-4837-bd04-8bc16962c6b5';
  }

  function resolveUserCabangId(user) {
    if (!user) return '';
    var userDb = null;
    if (user.id) userDb = SpreadsheetRepo.findOneBy('Users', 'id', user.id);
    if (!userDb && user.email) userDb = SpreadsheetRepo.findOneBy('Users', 'email', user.email);

    var email = (user.email || (userDb ? userDb.email : '') || '').toLowerCase();
    var role = (user.role || (userDb ? userDb.role : '') || '').toLowerCase();
    var isSuperAdmin = email === 'magangplnup3pdg@gmail.com' || email === 'admin@monitoring.com';
    if ((isSuperAdmin || role === 'admin') && role !== 'admin_ulp') {
      return getUp3CabangId();
    }

    var cab = String(user.cabang || (userDb ? userDb.cabang : '') || '').trim();

    var adminUlpDb = null;
    if (email) adminUlpDb = SpreadsheetRepo.findOneBy('Admin_ULP', 'email', email);
    if (!adminUlpDb && userDb) adminUlpDb = SpreadsheetRepo.findOneBy('Admin_ULP', 'user_id', userDb.id);
    if (!cab && adminUlpDb && adminUlpDb.cabang) {
      cab = String(adminUlpDb.cabang || '').trim();
    }

    if (cab) {
      var cObj = SpreadsheetRepo.findOneBy('Cabang', 'id', cab);
      if (cObj) return cObj.id;
      var cNameObj = SpreadsheetRepo.findOneBy('Cabang', 'nama_cabang', cab);
      if (cNameObj) return cNameObj.id;

      var allCab = SpreadsheetRepo.getAll('Cabang');
      var cabLower = cab.toLowerCase();
      for (var k = 0; k < allCab.length; k++) {
        var cName = String(allCab[k].nama_cabang || '').toLowerCase();
        var cClean = cName.replace('pln', '').replace('ulp', '').replace('up3', '').trim();
        if (cName.indexOf(cabLower) !== -1 || (cClean && cabLower.indexOf(cClean) !== -1)) {
          return allCab[k].id;
        }
      }
      return cab;
    }

    // Dynamic Fallback: match user nama / email / admin_ulp nama with Cabang list (e.g. "Admin ULP Belanti" -> "PLN ULP Belanti")
    var userText = ((user.nama || '') + ' ' + (user.email || '') + ' ' + (userDb ? userDb.nama : '') + ' ' + (adminUlpDb ? adminUlpDb.nama : '')).toLowerCase();
    var allCabang = SpreadsheetRepo.getAll('Cabang');

    for (var i = 0; i < allCabang.length; i++) {
      var c = allCabang[i];
      var cNameClean = String(c.nama_cabang || '').toLowerCase().replace('pln', '').replace('ulp', '').replace('up3', '').trim();
      if (cNameClean && cNameClean.length > 2 && userText.indexOf(cNameClean) !== -1) {
        if (userDb && userDb.id) {
          try { SpreadsheetRepo.updateById('Users', userDb.id, { cabang: c.id }); } catch(e){}
        }
        if (adminUlpDb && adminUlpDb.id) {
          try { SpreadsheetRepo.updateById('Admin_ULP', adminUlpDb.id, { cabang: c.id }); } catch(e){}
        }
        return c.id;
      }
    }

    if (role === 'admin_ulp' || userText.indexOf('ulp') !== -1) {
      var up3Id = getUp3CabangId();
      var ulpBranches = allCabang.filter(function(cb) {
        return cb.id !== up3Id && String(cb.nama_cabang || '').toLowerCase().indexOf('up3') === -1;
      });
      if (ulpBranches.length === 1) {
        return ulpBranches[0].id;
      }
      return 'NO_ULP_CABANG_FOUND';
    }

    return getUp3CabangId();
  }

  function isCabangMatch(cab1, cab2) {
    if (!cab1 || !cab2) return false;
    var c1 = String(cab1).trim().toLowerCase();
    var c2 = String(cab2).trim().toLowerCase();
    if (c1 === c2) return true;

    var up3Id = getUp3CabangId().toLowerCase();
    var isUp3_1 = c1 === 'up3' || c1 === up3Id || c1 === 'c8690edf-123e-4d43-85b5-aa6bb3988e0b' || c1.indexOf('up3') !== -1;
    var isUp3_2 = c2 === 'up3' || c2 === up3Id || c2 === 'c8690edf-123e-4d43-85b5-aa6bb3988e0b' || c2.indexOf('up3') !== -1;
    if (isUp3_1 && isUp3_2) return true;
    if (isUp3_1 !== isUp3_2) return false;

    var allCab = SpreadsheetRepo.getAll('Cabang');
    var id1 = '', id2 = '';

    for (var i = 0; i < allCab.length; i++) {
      var c = allCab[i];
      var cid = String(c.id || '').toLowerCase();
      var cname = String(c.nama_cabang || '').toLowerCase();
      var clean = cname.replace('pln', '').replace('ulp', '').replace('up3', '').trim();

      if (c1 === cid || c1 === cname || (clean && clean.length > 2 && c1.indexOf(clean) !== -1)) {
        id1 = c.id;
      }
      if (c2 === cid || c2 === cname || (clean && clean.length > 2 && c2.indexOf(clean) !== -1)) {
        id2 = c.id;
      }
    }

    if (id1 && id2) {
      return id1 === id2;
    }
    return false;
  }

  function getAll(params, currentUser) {
    var divList = SpreadsheetRepo.getAll(SHEET);
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');

    params = params || {};
    var targetCabang = params.cabang;
    if (!targetCabang && currentUser) {
      targetCabang = resolveUserCabangId(currentUser);
    }

    if (targetCabang) {
      divList = divList.filter(function(d) {
        var dCab = String(d.cabang || '').trim();
        if (targetCabang === 'UP3' || targetCabang === 'c8690edf-123e-4d43-85b5-aa6bb3988e0b') {
          return !dCab || dCab === 'UP3' || dCab === 'c8690edf-123e-4d43-85b5-aa6bb3988e0b';
        }
        return dCab === targetCabang;
      });
    } else if (currentUser && currentUser.role === 'admin_ulp') {
      divList = [];
    } else {
      // Default UP3 view
      divList = divList.filter(function(d) {
        var dCab = String(d.cabang || '').trim();
        return !dCab || dCab === 'UP3' || dCab === 'c8690edf-123e-4d43-85b5-aa6bb3988e0b';
      });
    }

    var result = divList.map(function(d) {
      var count = allMhs.filter(function(m) {
        var mDiv = String(m.divisi || '').trim();
        var isMatch = (mDiv === d.id) || (mDiv.toLowerCase() === String(d.nama_divisi || '').toLowerCase());
        return isMatch && isStudentActive(m);
      }).length;
      d.jumlah_mahasiswa = count;
      return d;
    });

    return success(result, 'OK');
  }

  function getById(id) {
    var d = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!d) return error('Divisi tidak ditemukan');
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');
    d.jumlah_mahasiswa = allMhs.filter(function(m) {
      var mDiv = String(m.divisi || '').trim();
      var isMatch = (mDiv === d.id) || (mDiv.toLowerCase() === String(d.nama_divisi || '').toLowerCase());
      return isMatch && isStudentActive(m);
    }).length;
    return success(d, 'OK');
  }

  function create(params, currentUser) {
    if (!params.nama_divisi) return error('Nama divisi wajib diisi');

    var userCabang = params.cabang || resolveUserCabangId(currentUser) || 'c8690edf-123e-4d43-85b5-aa6bb3988e0b';

    var d = {
      id: SpreadsheetRepo.generateId(),
      nama_divisi: params.nama_divisi,
      kapasitas: String(parseInt(params.kapasitas) || 0),
      jumlah_mahasiswa: '0',
      cabang: userCabang,
    };
    SpreadsheetRepo.append(SHEET, d);
    ActivityLogger.log(currentUser, 'Buat divisi: ' + params.nama_divisi + ' (Cabang: ' + userCabang + ')');
    return success(d, 'Divisi berhasil dibuat');
  }

  function update(params, currentUser) {
    var updated = SpreadsheetRepo.updateById(SHEET, params.id, {
      nama_divisi: params.nama_divisi,
      kapasitas: params.kapasitas,
    });
    ActivityLogger.log(currentUser, 'Update divisi: ' + params.id);
    return success(updated, 'Divisi berhasil diperbarui');
  }

  function remove(id, currentUser) {
    // Check if any mahasiswa assigned
    var mhs = SpreadsheetRepo.getAll('Mahasiswa').filter(function(m) { return m.divisi === id && isStudentActive(m); });
    if (mhs.length > 0) return error('Tidak dapat menghapus divisi yang masih memiliki mahasiswa aktif');
    SpreadsheetRepo.deleteById(SHEET, id);
    ActivityLogger.log(currentUser, 'Hapus divisi: ' + id);
    return success(null, 'Divisi berhasil dihapus');
  }

  function checkCapacity(id) {
    var d = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!d) return error('Divisi tidak ditemukan');
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');
    var jumlah = allMhs.filter(function(m) {
      var mDiv = String(m.divisi || '').trim();
      var isMatch = (mDiv === d.id) || (mDiv.toLowerCase() === String(d.nama_divisi || '').toLowerCase());
      return isMatch && isStudentActive(m);
    }).length;
    var kapasitas = parseInt(d.kapasitas) || 0;
    var remaining = kapasitas - jumlah;
    var available = remaining > 0;

    var recommendations = [];
    if (!available) {
      recommendations = SpreadsheetRepo.getAll(SHEET).filter(function(div) {
        var j = allMhs.filter(function(m) { return m.divisi === div.id && isStudentActive(m); }).length;
        var k = parseInt(div.kapasitas) || 0;
        return div.id !== id && j < k;
      }).slice(0, 3);
    }

    return success({ available: available, remaining: remaining, recommendations: recommendations }, 'OK');
  }

  return { getAll: getAll, getById: getById, create: create, update: update, remove: remove, checkCapacity: checkCapacity, resolveUserCabangId: resolveUserCabangId, isCabangMatch: isCabangMatch };
})();

// Cabang
var CabangService = (function() {
  var SHEET = 'Cabang';

  function isStudentActive(m) {
    var st = String(m.status || m.mahasiswa_status || 'aktif').toLowerCase().trim();
    return st === 'aktif' || st === 'diterima' || st === 'menunggu' || st === '';
  }

  function getAll() {
    if (typeof syncJumlahMahasiswaSheetCells === 'function') {
      syncJumlahMahasiswaSheetCells();
    }
    var cabangList = SpreadsheetRepo.getAll(SHEET);
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');

    var result = cabangList.map(function(c) {
      var count = allMhs.filter(function(m) {
        var mCab = String(m.cabang || '').trim();
        var isMatch = (mCab === c.id) || (mCab.toLowerCase() === String(c.nama_cabang || '').toLowerCase());
        return isMatch && isStudentActive(m);
      }).length;
      c.jumlah_mahasiswa = count;
      return c;
    });

    return success(result, 'OK');
  }

  function getById(id) {
    var c = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!c) return error('Cabang tidak ditemukan');
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');
    c.jumlah_mahasiswa = allMhs.filter(function(m) {
      var mCab = String(m.cabang || '').trim();
      var isMatch = (mCab === c.id) || (mCab.toLowerCase() === String(c.nama_cabang || '').toLowerCase());
      var isAktif = !m.status || String(m.status).toLowerCase() === 'aktif';
      return isMatch && isAktif;
    }).length;
    return success(c, 'OK');
  }

  function create(params, currentUser) {
    if (!params.nama_cabang) return error('Nama cabang wajib diisi');
    var c = {
      id: SpreadsheetRepo.generateId(),
      nama_cabang: params.nama_cabang,
      kapasitas: String(parseInt(params.kapasitas) || 0),
      jumlah_mahasiswa: '0',
    };
    SpreadsheetRepo.append(SHEET, c);
    ActivityLogger.log(currentUser, 'Buat cabang: ' + params.nama_cabang);
    return success(c, 'Cabang berhasil dibuat');
  }

  function update(params, currentUser) {
    var updated = SpreadsheetRepo.updateById(SHEET, params.id, {
      nama_cabang: params.nama_cabang,
      kapasitas: params.kapasitas,
    });
    ActivityLogger.log(currentUser, 'Update cabang: ' + params.id);
    return success(updated, 'Cabang berhasil diperbarui');
  }

  function remove(id, currentUser) {
    var mhs = SpreadsheetRepo.getAll('Mahasiswa').filter(function(m) { return m.cabang === id && m.status === 'aktif'; });
    if (mhs.length > 0) return error('Tidak dapat menghapus cabang yang masih memiliki mahasiswa aktif');
    SpreadsheetRepo.deleteById(SHEET, id);
    ActivityLogger.log(currentUser, 'Hapus cabang: ' + id);
    return success(null, 'Cabang berhasil dihapus');
  }

  return { getAll: getAll, getById: getById, create: create, update: update, remove: remove };
})();

function syncJumlahMahasiswaSheetCells() {
  try {
    var divList = SpreadsheetRepo.getAll('Divisi');
    var cabangList = SpreadsheetRepo.getAll('Cabang');
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');

    divList.forEach(function(d) {
      var count = allMhs.filter(function(m) {
        var mDiv = String(m.divisi || '').trim();
        var isMatch = (mDiv === d.id) || (mDiv.toLowerCase() === String(d.nama_divisi || '').toLowerCase());
        var st = String(m.status || m.mahasiswa_status || 'aktif').toLowerCase().trim();
        var isAktif = st === 'aktif' || st === 'diterima' || st === 'menunggu' || st === '';
        return isMatch && isAktif;
      }).length;
      SpreadsheetRepo.updateById('Divisi', d.id, { jumlah_mahasiswa: String(count) });
    });

    cabangList.forEach(function(c) {
      var count = allMhs.filter(function(m) {
        var mCab = String(m.cabang || '').trim();
        var isMatch = (mCab === c.id) || (mCab.toLowerCase() === String(c.nama_cabang || '').toLowerCase());
        var st = String(m.status || m.mahasiswa_status || 'aktif').toLowerCase().trim();
        var isAktif = st === 'aktif' || st === 'diterima' || st === 'menunggu' || st === '';
        return isMatch && isAktif;
      }).length;
      SpreadsheetRepo.updateById('Cabang', c.id, { jumlah_mahasiswa: String(count) });
    });
  } catch (e) {
    Logger.log('syncJumlahMahasiswaSheetCells error: ' + e);
  }
}


