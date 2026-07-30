/**
 * PembimbingService.gs
 */

var PembimbingService = (function() {
  var SHEET = 'Users';

  function toPembimbing(user) {
    var mahasiswaCount = SpreadsheetRepo.getAll('Mahasiswa').filter(function(m) {
      return m.pembimbing === user.id;
    }).length;

    return {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role || 'pembimbing',
      divisi: user.divisi || '',
      cabang: user.cabang || '',
      status: user.status || 'aktif',
      jumlah_mahasiswa: mahasiswaCount,
    };
  }

  function getAll(params, currentUser) {
    params = params || {};
    var targetRole = params.role || 'pembimbing';
    var rows = [];

    if (targetRole === 'admin_ulp') {
      var adminUlpSheetRows = SpreadsheetRepo.getAll('Admin_ULP');
      var userRows = SpreadsheetRepo.getAll(SHEET).filter(function(u) {
        var r = (u.role || '').toLowerCase();
        var isSuperAdmin = (u.email || '').toLowerCase() === 'magangplnup3pdg@gmail.com' || (u.email || '').toLowerCase() === 'admin@monitoring.com';
        return r === 'admin_ulp' || (r === 'admin' && !isSuperAdmin);
      });

      var mapByEmail = {};
      userRows.forEach(function(u) {
        if (u.email) mapByEmail[u.email.toLowerCase()] = u;
      });

      adminUlpSheetRows.forEach(function(au) {
        var emailKey = (au.email || '').toLowerCase();
        if (emailKey && !mapByEmail[emailKey]) {
          mapByEmail[emailKey] = {
            id: au.id,
            nama: au.nama,
            email: au.email,
            role: 'admin_ulp',
            divisi: au.divisi || '',
            cabang: au.cabang || '',
            status: au.status || 'aktif',
            nomor_hp: au.nomor_hp || ''
          };
        } else if (emailKey && mapByEmail[emailKey]) {
          if (!mapByEmail[emailKey].cabang && au.cabang) mapByEmail[emailKey].cabang = au.cabang;
          if (!mapByEmail[emailKey].nama && au.nama) mapByEmail[emailKey].nama = au.nama;
        }
      });

      rows = Object.keys(mapByEmail).map(function(k) { return mapByEmail[k]; });

      var allCab = SpreadsheetRepo.getAll('Cabang');
      var cabMap = {};
      allCab.forEach(function(c) {
        if (c.id) cabMap[c.id] = c.nama_cabang;
      });

      rows.forEach(function(r) {
        if (r.cabang && cabMap[r.cabang]) {
          r.nama_cabang = cabMap[r.cabang];
        }
      });
    } else {
      rows = SpreadsheetRepo.getAll(SHEET).filter(function(u) {
        return u.role === targetRole;
      });

      // Filter by cabang for Pembimbing
      var userCabangId = params.cabang;
      if (!userCabangId && currentUser) {
        if (typeof DivisiService !== 'undefined' && DivisiService.resolveUserCabangId) {
          userCabangId = DivisiService.resolveUserCabangId(currentUser);
        }
      }

      var isUlpAdmin = currentUser && currentUser.role === 'admin_ulp';
      if (userCabangId && userCabangId !== 'NO_ULP_CABANG_FOUND') {
        rows = rows.filter(function(u) {
          return typeof DivisiService !== 'undefined' && DivisiService.isCabangMatch ? DivisiService.isCabangMatch(u.cabang, userCabangId) : u.cabang === userCabangId;
        });
      } else if (isUlpAdmin) {
        rows = [];
      }
    }

    var search = (params.search || '').toLowerCase();
    var status = params.status || '';

    if (search) {
      rows = rows.filter(function(u) {
        return [u.nama, u.email, u.divisi, u.cabang].join(' ').toLowerCase().indexOf(search) !== -1;
      });
    }

    if (status) {
      rows = rows.filter(function(u) { return u.status === status; });
    }

    rows.sort(function(a, b) {
      return (a.nama || '').localeCompare(b.nama || '');
    });

    var mapped = rows.map(toPembimbing);
    var result = SpreadsheetRepo.paginate(mapped, params.page, params.limit);
    return paginated(result.items, result.total, result.page, result.limit);
  }

  function create(params, currentUser) {
    if (!params.nama) return error('Nama wajib diisi');
    if (!params.email) return error('Email wajib diisi');

    var email = String(params.email).trim().toLowerCase();
    var existing = SpreadsheetRepo.findOneBy(SHEET, 'email', email);
    if (existing) return error('Email sudah terdaftar');

    // Auto-generate password
    var words = ['Magang', 'Monitoring', 'Intern', 'Sistem', 'Data', 'Portal', 'Kerja', 'Aktif'];
    var randWord = words[Math.floor(Math.random() * words.length)];
    var randNum  = Math.floor(1000 + Math.random() * 9000);
    var tempPassword = randWord + randNum + '!';

    var targetRole = params.role || 'pembimbing';

    var user = {
      id:               SpreadsheetRepo.generateId(),
      nama:             params.nama,
      email:            email,
      nomor_hp:         params.nomor_hp || '',
      password_hash:    Hash.hash(tempPassword),
      role:             targetRole,
      status:           params.status || 'aktif',
      divisi:           params.divisi || '',
      cabang:           params.cabang || '',
      mahasiswa_status: '',
      created_at:       new Date().toISOString(),
    };

    SpreadsheetRepo.append(SHEET, user);

    // Sync to Pembimbing / Admin_ULP sheet
    if (targetRole === 'pembimbing') {
      try {
        var existingPembimbing = SpreadsheetRepo.findOneBy('Pembimbing', 'id', user.id);
        if (!existingPembimbing) {
          SpreadsheetRepo.append('Pembimbing', {
            id: user.id,
            nama: user.nama,
            email: user.email,
            divisi: user.divisi || '',
            cabang: user.cabang || '',
            nomor_hp: user.nomor_hp || '',
            status: user.status || 'aktif',
          });
        }
      } catch (e) {
        Logger.log('Error syncing to Pembimbing sheet: ' + e);
      }
    } else if (targetRole === 'admin_ulp') {
      try {
        var existingAdminUlp = SpreadsheetRepo.findOneBy('Admin_ULP', 'id', user.id);
        if (!existingAdminUlp) {
          SpreadsheetRepo.append('Admin_ULP', {
            id: user.id,
            nama: user.nama,
            email: user.email,
            cabang: user.cabang || '',
            nomor_hp: user.nomor_hp || '',
            status: user.status || 'aktif',
          });
        }
      } catch (e) {
        Logger.log('Error syncing to Admin_ULP sheet: ' + e);
      }
    }

    // Kirim Email Notifikasi Pembuatan Akun
    sendAccountCreatedEmail(user, tempPassword, currentUser);

    ActivityLogger.log(currentUser, 'Tambah ' + targetRole + ': ' + params.nama);

    var responseData = toPembimbing(user);
    responseData.temp_password = tempPassword;
    return success(responseData, 'Akun ' + targetRole + ' berhasil ditambahkan. Email pemberitahuan telah dikirimkan.');
  }

  function resolveCabangNama(cabangId) {
    if (!cabangId) return 'ULP';
    var found = SpreadsheetRepo.findOneBy('Cabang', 'id', cabangId);
    if (found && found.nama_cabang) return found.nama_cabang;
    return cabangId;
  }

  function sendAccountCreatedEmail(user, tempPassword, currentUser) {
    try {
      var creatorName = 'Admin PLN UP3 Padang';
      if (currentUser) {
        if (currentUser.role === 'admin_ulp') {
          var namaCabang = currentUser.cabang ? resolveCabangNama(currentUser.cabang) : 'ULP';
          creatorName = 'Admin PLN ' + (namaCabang.indexOf('ULP') === -1 ? 'ULP ' + namaCabang : namaCabang);
        } else if (currentUser.role === 'admin') {
          creatorName = 'Admin PLN UP3 Padang';
        } else if (currentUser.nama) {
          creatorName = 'Admin ' + currentUser.nama;
        }
      }

      var roleDisplay = user.role === 'admin_ulp' ? 'Admin ULP' : (user.role === 'pembimbing' ? 'Pembimbing Magang' : 'Pengguna');

      var subject = 'Akun Anda Telah Aktif - PIJAR PLN UP3 Padang';
      var html = '<div style="font-family: \'Segoe UI\', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">' +
        '<div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">' +
          '<h2 style="color: #091A28; margin: 0; font-size: 22px; font-weight: 800;">PIJAR - PT PLN (Persero)</h2>' +
          '<p style="color: #0284c7; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">Sistem Monitoring Magang</p>' +
        '</div>' +
        '<div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #0284c7;">' +
          '<h3 style="color: #0f172a; margin: 0 0 8px 0; font-size: 16px;">Akun Anda Telah Aktif! 🎉</h3>' +
          '<p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0;">' +
            'Halo <strong>' + user.nama + '</strong>,<br>' +
            'Akun Anda telah berhasil dibuat oleh <strong>' + creatorName + '</strong>. Anda kini dapat masuk ke platform PIJAR sebagai <strong>' + roleDisplay + '</strong>.' +
          '</p>' +
        '</div>' +
        '<div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">' +
          '<p style="color: #475569; font-size: 13px; font-weight: 700; margin: 0 0 8px 0; text-transform: uppercase;">Kredensial Login Anda:</p>' +
          '<div style="margin-bottom: 8px;"><span style="color: #64748b; font-size: 13px;">Email:</span> <strong style="color: #0f172a; font-size: 14px; margin-left: 6px;">' + user.email + '</strong></div>' +
          '<div><span style="color: #64748b; font-size: 13px;">Password Sementara:</span> <strong style="color: #0284c7; font-size: 16px; font-family: monospace; margin-left: 6px; background-color: #e0f2fe; padding: 2px 8px; border-radius: 4px;">' + tempPassword + '</strong></div>' +
        '</div>' +
        '<p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">Harap gunakan password di atas untuk masuk ke sistem dan segera perbarui password Anda demi keamanan akun.</p>' +
        '<div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;"><p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 PT PLN (Persero) UP3 Padang. All rights reserved.</p></div>' +
      '</div>';

      MailApp.sendEmail({
        to: user.email,
        subject: subject,
        htmlBody: html,
        name: 'PIJAR PLN UP3 Padang'
      });
      Logger.log('[AccountCreatedEmail] Email dikirim ke ' + user.email);
    } catch (e) {
      Logger.log('[AccountCreatedEmail Error] ' + e);
    }
  }

  function update(params, currentUser) {
    if (!params.id) return error('ID wajib diisi');

    var existing = SpreadsheetRepo.findOneBy(SHEET, 'id', params.id);
    if (!existing) return error('User tidak ditemukan');

    var email = params.email ? String(params.email).trim().toLowerCase() : existing.email;
    if (email !== existing.email) {
      var duplicated = SpreadsheetRepo.findOneBy(SHEET, 'email', email);
      if (duplicated && duplicated.id !== existing.id) return error('Email sudah terdaftar');
    }

    var updates = {
      nama: params.nama || existing.nama,
      email: email,
      role: params.role || existing.role,
      divisi: params.divisi !== undefined ? params.divisi : existing.divisi,
      cabang: params.cabang !== undefined ? params.cabang : existing.cabang,
      status: params.status || existing.status,
    };

    if (params.password) {
      updates.password_hash = Hash.hash(params.password);
    }

    var updated = SpreadsheetRepo.updateById(SHEET, params.id, updates);

    // Sync update to Pembimbing or Admin_ULP sheet
    if (updated.role === 'pembimbing') {
      try {
        SpreadsheetRepo.updateById('Pembimbing', updated.id, {
          nama: updated.nama,
          email: updated.email,
          divisi: updated.divisi || '',
          cabang: updated.cabang || '',
          status: updated.status || 'aktif',
        });
      } catch (e) {}
    } else if (updated.role === 'admin_ulp') {
      try {
        SpreadsheetRepo.updateById('Admin_ULP', updated.id, {
          nama: updated.nama,
          email: updated.email,
          cabang: updated.cabang || '',
          status: updated.status || 'aktif',
        });
      } catch (e) {}
    }

    ActivityLogger.log(currentUser, 'Update user: ' + params.id);
    return success(toPembimbing(updated), 'User berhasil diperbarui');
  }

  function remove(id, currentUser) {
    var existing = SpreadsheetRepo.findOneBy(SHEET, 'id', id);
    if (!existing) return error('User tidak ditemukan');

    var assigned = SpreadsheetRepo.getAll('Mahasiswa').filter(function(m) {
      return m.pembimbing === id;
    });

    if (assigned.length > 0) {
      return error('Tidak dapat menghapus pembimbing yang masih memiliki mahasiswa binaan');
    }

    SpreadsheetRepo.deleteById(SHEET, id);

    if (existing.role === 'pembimbing') {
      try {
        SpreadsheetRepo.deleteById('Pembimbing', id);
      } catch (e) {}
    } else if (existing.role === 'admin_ulp') {
      try {
        SpreadsheetRepo.deleteById('Admin_ULP', id);
      } catch (e) {}
    }

    ActivityLogger.log(currentUser, 'Hapus user: ' + existing.nama);
    return success(null, 'User berhasil dihapus');
  }

  return { getAll: getAll, create: create, update: update, remove: remove };
})();