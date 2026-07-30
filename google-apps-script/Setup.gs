/**
 * Setup.gs
 */

function setupSpreadsheet() {
  var TARGET_ID = '19yE6rAYxQEbSMuiiDXkiCtkUGTY2S790NDiwSLxkOso';
  var ss = null;

  try {
    ss = SpreadsheetApp.openById(TARGET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    var newSS = SpreadsheetApp.create('Monitoring Magang Database');
    ss = newSS;
  }

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  // Buat semua sheet
  createSheetIfNotExists(ss, 'Users', ['id','nama','email','password_hash','role','divisi','cabang','status']);
  createSheetIfNotExists(ss, 'Mahasiswa', ['id','nama','nim','universitas','program_studi','email','nomor_hp','tanggal_mulai','tanggal_selesai','divisi','cabang','pembimbing','status']);
  createSheetIfNotExists(ss, 'Pembimbing', ['id','nama','email','divisi','cabang','nomor_hp','status']);
  createSheetIfNotExists(ss, 'Admin_ULP', ['id','nama','email','cabang','nomor_hp','status']);
  createSheetIfNotExists(ss, 'Divisi', ['id','nama_divisi','kapasitas','jumlah_mahasiswa','cabang']);
  createSheetIfNotExists(ss, 'Cabang', ['id','nama_cabang','kapasitas','jumlah_mahasiswa']);
  createSheetIfNotExists(ss, 'Jurnal', ['id','mahasiswa_id','tanggal','judul','deskripsi','foto','status','created_at','catatan_revisi','divisi','cabang']);
  createSheetIfNotExists(ss, 'Kehadiran', ['id','mahasiswa_id','tanggal','jam_masuk','jam_pulang','status','keterangan','foto_masuk','foto_pulang','jenis_izin','dokumen_izin','divisi','cabang']);
  createSheetIfNotExists(ss, 'Log Aktivitas', ['id','user','aktivitas','tanggal']);

  // Buat admin user default & sinkronkan data pembimbing & admin ULP
  createDefaultAdmin();
  syncPembimbingSheet();
  syncAdminUlpSheet();
  fixDivisiSheetCabangColumn(ss);
  fixJurnalAbsensiDivisiCabangColumns(ss);
  fixUsersAndAdminUlpCabang(ss);
  if (typeof syncJumlahMahasiswaSheetCells === 'function') {
    syncJumlahMahasiswaSheetCells();
  }

  Logger.log('Setup selesai! Spreadsheet ID: ' + ss.getId());
  SpreadsheetApp.getUi().alert(
    'Setup & Sinkronisasi Berhasil!\n\n' +
    'Spreadsheet ID: ' + ss.getId() + '\n\n' +
    'Sheet Pembimbing, Admin_ULP, Divisi, Jurnal, dan Kehadiran telah ter-update!'
  );
}

function fixUsersAndAdminUlpCabang(ss) {
  try {
    var allCabang = SpreadsheetRepo.getAll('Cabang');
    ['Users', 'Admin_ULP'].forEach(function(sheetName) {
      var users = SpreadsheetRepo.getAll(sheetName);
      users.forEach(function(u) {
        if (!u.cabang || u.cabang === 'UP3' || u.cabang === '') {
          var userText = ((u.nama || '') + ' ' + (u.email || '')).toLowerCase();
          for (var i = 0; i < allCabang.length; i++) {
            var c = allCabang[i];
            var cName = String(c.nama_cabang || '').toLowerCase().replace('pln', '').replace('ulp', '').trim();
            if (cName && userText.indexOf(cName) !== -1) {
              SpreadsheetRepo.updateById(sheetName, u.id, { cabang: c.id });
              break;
            }
          }
        }
      });
    });
  } catch (e) {
    Logger.log('fixUsersAndAdminUlpCabang error: ' + e);
  }
}

function fixDivisiSheetCabangColumn(ss) {
  try {
    var sheet = ss.getSheetByName('Divisi');
    if (!sheet) return;

    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, Math.max(lastCol, 1)).getValues()[0];

    var cabangColIndex = headers.indexOf('cabang');
    if (cabangColIndex === -1) {
      sheet.getRange(1, 5).setValue('cabang');
      cabangColIndex = 4;
    }

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var range = sheet.getRange(2, cabangColIndex + 1, lastRow - 1, 1);
      var values = range.getValues();
      var up3Cabang = SpreadsheetRepo.findOneBy('Cabang', 'nama_cabang', 'PLN UP3 Padang');
      var defaultCabangId = up3Cabang ? up3Cabang.id : 'c8690edf-123e-4d43-85b5-aa6bb3988e0b';

      for (var i = 0; i < values.length; i++) {
        if (!values[i][0]) {
          values[i][0] = defaultCabangId;
        }
      }
      range.setValues(values);
    }
  } catch (e) {
    Logger.log('fixDivisiSheetCabangColumn error: ' + e);
  }
}

function fixJurnalAbsensiDivisiCabangColumns(ss) {
  try {
    var allMhs = SpreadsheetRepo.getAll('Mahasiswa');
    var mhsMap = {};
    allMhs.forEach(function(m) { mhsMap[m.id] = m; });

    ['Jurnal', 'Kehadiran'].forEach(function(sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;

      var lastCol = sheet.getLastColumn();
      var headers = sheet.getRange(1, 1, 1, Math.max(lastCol, 1)).getValues()[0];

      var divIdx = headers.indexOf('divisi');
      if (divIdx === -1) {
        lastCol++;
        sheet.getRange(1, lastCol).setValue('divisi');
        divIdx = lastCol - 1;
      }

      var cabIdx = headers.indexOf('cabang');
      if (cabIdx === -1) {
        lastCol++;
        sheet.getRange(1, lastCol).setValue('cabang');
        cabIdx = lastCol - 1;
      }

      var mhsIdx = headers.indexOf('mahasiswa_id');
      var lastRow = sheet.getLastRow();
      if (lastRow > 1 && mhsIdx !== -1) {
        var mhsIds = sheet.getRange(2, mhsIdx + 1, lastRow - 1, 1).getValues();
        var divValues = sheet.getRange(2, divIdx + 1, lastRow - 1, 1).getValues();
        var cabValues = sheet.getRange(2, cabIdx + 1, lastRow - 1, 1).getValues();

        for (var i = 0; i < mhsIds.length; i++) {
          var mId = String(mhsIds[i][0] || '').trim();
          var mhs = mhsMap[mId];
          if (mhs) {
            if (!divValues[i][0]) divValues[i][0] = mhs.divisi || '';
            if (!cabValues[i][0]) cabValues[i][0] = mhs.cabang || '';
          }
        }
        sheet.getRange(2, divIdx + 1, lastRow - 1, 1).setValues(divValues);
        sheet.getRange(2, cabIdx + 1, lastRow - 1, 1).setValues(cabValues);
      }
    });
  } catch (e) {
    Logger.log('fixJurnalAbsensiDivisiCabangColumns error: ' + e);
  }
}

function syncPembimbingSheet() {
  var users = SpreadsheetRepo.getAll('Users');
  var pembimbingUsers = users.filter(function(u) { return u.role === 'pembimbing'; });

  var existingPembimbing = SpreadsheetRepo.getAll('Pembimbing');
  var existingMap = {};
  existingPembimbing.forEach(function(p) { existingMap[p.id] = p; });

  pembimbingUsers.forEach(function(u) {
    var data = {
      id: u.id,
      nama: u.nama || '',
      email: u.email || '',
      divisi: u.divisi || '',
      cabang: u.cabang || '',
      nomor_hp: u.nomor_hp || '',
      status: u.status || 'aktif'
    };
    if (existingMap[u.id]) {
      SpreadsheetRepo.updateById('Pembimbing', u.id, data);
    } else {
      SpreadsheetRepo.append('Pembimbing', data);
    }
  });

  Logger.log('Sinkronisasi Pembimbing Selesai: ' + pembimbingUsers.length + ' data.');
}

function syncAdminUlpSheet() {
  var users = SpreadsheetRepo.getAll('Users');
  var adminUlpUsers = users.filter(function(u) {
    var r = (u.role || '').toLowerCase();
    var isSuperAdmin = (u.email || '').toLowerCase() === 'magangplnup3pdg@gmail.com' || (u.email || '').toLowerCase() === 'admin@monitoring.com';
    return r === 'admin_ulp' || (r === 'admin' && !isSuperAdmin);
  });

  var existingAdminUlp = SpreadsheetRepo.getAll('Admin_ULP');
  var existingMap = {};
  existingAdminUlp.forEach(function(a) { existingMap[a.id] = a; });

  adminUlpUsers.forEach(function(u) {
    var data = {
      id: u.id,
      nama: u.nama || '',
      email: u.email || '',
      cabang: u.cabang || '',
      nomor_hp: u.nomor_hp || '',
      status: u.status || 'aktif'
    };
    if (existingMap[u.id]) {
      SpreadsheetRepo.updateById('Admin_ULP', u.id, data);
    } else {
      SpreadsheetRepo.append('Admin_ULP', data);
    }
  });

  Logger.log('Sinkronisasi Admin ULP Selesai: ' + adminUlpUsers.length + ' data.');
}

function createSheetIfNotExists(ss, name, headers) {
  var existing = ss.getSheetByName(name);
  if (!existing) {
    var sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log('Sheet "' + name + '" dibuat');
  } else {
    Logger.log('Sheet "' + name + '" sudah ada');
  }
}

function createDefaultAdmin() {
  var users = SpreadsheetRepo.getAll('Users');
  var admin = users.find(function(u) { return u.role === 'admin'; });
  if (!admin) {
    SpreadsheetRepo.append('Users', {
      id: SpreadsheetRepo.generateId(),
      nama: 'Administrator',
      email: 'magangplnup3pdg@gmail.com',
      password_hash: Hash.hash('admin123'),
      role: 'admin',
      divisi: '',
      cabang: '',
      status: 'aktif',
    });
    Logger.log('Admin default dibuat');
  } else {
    Logger.log('Admin sudah ada: ' + admin.email);
  }
}

// function createPembimbing() {
//   var config = {
//     nama: 'Nama Pembimbing',
//     email: 'pembimbing@perusahaan.com',
//     password: 'password123',
//     divisi: '', 
//     cabang: '', 
//   };

//   SpreadsheetRepo.append('Users', {
//     id: SpreadsheetRepo.generateId(),
//     nama: config.nama,
//     email: config.email,
//     password_hash: Hash.hash(config.password),
//     role: 'pembimbing',
//     divisi: config.divisi,
//     cabang: config.cabang,
//     status: 'aktif',
//   });

//   Logger.log('Pembimbing berhasil dibuat: ' + config.email);
// }

/**
 * Reset password user
 */
function resetPassword() {
  var email = 'user@example.com'; 
  var newPassword = 'newpassword123';

  var user = SpreadsheetRepo.findOneBy('Users', 'email', email);
  if (!user) {
    Logger.log('User tidak ditemukan: ' + email);
    return;
  }

  SpreadsheetRepo.updateById('Users', user.id, {
    password_hash: Hash.hash(newPassword),
  });

  Logger.log('Password berhasil direset untuk: ' + email);
}

/**
 * Test JWT
 */
function testJWT() {
  var token = JWT.sign({ user: { id: '123', email: 'test@test.com', role: 'admin' } });
  Logger.log('Token: ' + token);
  var decoded = JWT.verify(token);
  Logger.log('Decoded: ' + JSON.stringify(decoded));
}
