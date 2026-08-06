/**
 * AuthService.gs
 */

var AuthService = (function() {

  // Login
  function login(params) {
    var email    = (params.email    || '').trim().toLowerCase();
    var password =  params.password || '';

    if (!email || !password) {
      return error('Email dan password wajib diisi');
    }

    var user = SpreadsheetRepo.findOneBy('Users', 'email', email);
    if (!user) {
      return error('Email atau password salah');
    }

    if (user.status !== 'aktif') {
      return error('Akun Anda tidak aktif. Hubungi administrator.');
    }

    if (!Hash.verify(password, user.password_hash)) {
      ActivityLogger.log(null, 'Login gagal untuk: ' + email);
      return error('Email atau password salah');
    }

    var userPayload = {
      id:     user.id,
      nama:   user.nama,
      email:  user.email,
      role:   user.role,
      status: user.status,
      divisi: user.divisi || '',
      cabang: user.cabang || '',
    };

    if (user.role === 'mahasiswa') {
      userPayload.mahasiswa_status = user.mahasiswa_status || 'belum_daftar';
    }

    var token = JWT.sign({ user: userPayload });
    ActivityLogger.log(user, 'Login berhasil');

    return success({
      token: token,
      user: userPayload,
      expiresAt: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    }, 'Login berhasil');
  }

  function me(currentUser) {
    var user = SpreadsheetRepo.findOneBy('Users', 'id', currentUser.id);
    if (!user) return error('User tidak ditemukan');

    var payload = {
      id:          user.id,
      nama:        user.nama,
      email:       user.email,
      role:        user.role,
      status:      user.status,
      foto_profil: user.foto_profil || '',
      divisi:      user.divisi || '',
      cabang:      user.cabang || '',
    };

    if (user.role === 'mahasiswa') {
      payload.mahasiswa_status = user.mahasiswa_status || 'belum_daftar';
      var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'user_id', user.id);
      if (mhs) {
        payload.program_studi = mhs.program_studi || '';
        payload.universitas = mhs.universitas || '';
        if (mhs.divisi) {
          var divM = SpreadsheetRepo.findOneBy('Divisi', 'id', mhs.divisi);
          payload.divisi_nama = divM ? divM.nama_divisi : mhs.divisi;
        }
      }
    } else if (user.role === 'pembimbing') {
      if (user.divisi) {
        var divP = SpreadsheetRepo.findOneBy('Divisi', 'id', user.divisi);
        payload.divisi_nama = divP ? divP.nama_divisi : user.divisi;
      }
    }

    return success(payload, 'OK');
  }

  // Update Profile
  function updateProfile(params, currentUser) {
    var user = SpreadsheetRepo.findOneBy('Users', 'id', currentUser.id);
    if (!user) return error('User tidak ditemukan');

    var updates = {};
    if (params.nama) updates.nama = params.nama;
    if (params.foto_profil) {
      updates.foto_profil = DriveService.uploadFile(params.foto_profil, 'avatar_' + user.id + '.jpg', 'image/jpeg', 'avatars');
    }

    SpreadsheetRepo.updateById('Users', currentUser.id, updates);
    ActivityLogger.log(currentUser, 'Update profil');
    return me(currentUser);
  }

  // Change Password
  function changePassword(params, currentUser) {
    var user = SpreadsheetRepo.findOneBy('Users', 'id', currentUser.id);
    if (!user) return error('User tidak ditemukan');

    var passwordLama = params.password_lama || '';
    var passwordBaru = params.password_baru || '';
    var konfirmasi   = params.konfirmasi_password || '';

    if (!passwordLama || !passwordBaru) return error('Password lama dan baru wajib diisi');
    if (passwordBaru !== konfirmasi) return error('Konfirmasi password tidak cocok');
    if (!Hash.verify(passwordLama, user.password_hash)) return error('Password lama salah');

    SpreadsheetRepo.updateById('Users', currentUser.id, {
      password_hash: Hash.hash(passwordBaru),
    });

    ActivityLogger.log(currentUser, 'Ubah password');
    return success(null, 'Password berhasil diubah');
  }


  // Logout
  function logout(currentUser) {
    ActivityLogger.log(currentUser, 'Logout');
    return success(null, 'Berhasil logout');
  }

  // Register
  function daftarAkun(params) {
    var nama     = (params.nama     || '').trim();
    var email    = (params.email    || '').trim().toLowerCase();
    var password = (params.password || '').trim();
    var nomor_hp = (params.nomor_hp || '').trim();

    if (!nama || !email || !password || !nomor_hp) {
      return error('Semua field wajib diisi');
    }
    if (password.length < 6) {
      return error('Password minimal 6 karakter');
    }

    var existing = SpreadsheetRepo.findOneBy('Users', 'email', email);
    if (existing) {
      return error('Email sudah terdaftar. Silakan login.');
    }

    SpreadsheetRepo.append('Users', {
      id:               SpreadsheetRepo.generateId(),
      nama:             nama,
      email:            email,
      password_hash:    Hash.hash(password),
      nomor_hp:         nomor_hp,
      role:             'mahasiswa',
      status:           'aktif',
      mahasiswa_status: 'belum_daftar',
      created_at:       new Date().toISOString(),
    });

    ActivityLogger.log(null, 'Daftar akun baru: ' + email);
    return success(null, 'Akun berhasil dibuat! Silakan login untuk melanjutkan.');
  }

  // Daftar Magang
  function daftarMagang(params, currentUser) {
    var nim           = (params.nim            || '').trim();
    var universitas   = (params.universitas    || '').trim();
    var program_studi = (params.program_studi  || '').trim();
    var tgl_mulai     =  params.tanggal_mulai  || '';
    var tgl_selesai   =  params.tanggal_selesai || '';
    var surat_b64     =  params.surat_ajuan    || '';

    if (!nim || !universitas || !program_studi || !tgl_mulai || !tgl_selesai || !surat_b64) {
      return error('NIM, universitas, prodi, periode, dan surat ajuan wajib diisi.');
    }

    // Cek sudah ada lamaran
    var user = SpreadsheetRepo.findOneBy('Users', 'id', currentUser.id);
    if (user && (user.mahasiswa_status === 'menunggu' || user.mahasiswa_status === 'aktif')) {
      return error('Kamu sudah memiliki lamaran yang ' +
        (user.mahasiswa_status === 'menunggu' ? 'sedang diproses.' : 'aktif.'));
    }

    // Cek keunikan NIM (NIM tidak boleh sama dengan mahasiswa lain yang aktif/menunggu)
    var existingLamaranNIM = SpreadsheetRepo.getAll('Lamaran').filter(function(r) {
      return (r.nim || '').trim() === nim && r.user_id !== currentUser.id && r.status !== 'ditolak';
    });
    if (existingLamaranNIM.length > 0) {
      return error('NIM ' + nim + ' sudah terdaftar pada sistem! Harap periksa kembali NIM Anda.');
    }

    var existingMahasiswaNIM = SpreadsheetRepo.getAll('Mahasiswa').filter(function(r) {
      return (r.nim || '').trim() === nim && r.user_id !== currentUser.id;
    });
    if (existingMahasiswaNIM.length > 0) {
      return error('NIM ' + nim + ' sudah terdaftar pada sistem! Harap periksa kembali NIM Anda.');
    }

    // Cek durasi magang minimal 2 bulan
    if (tgl_mulai && tgl_selesai) {
      var start = new Date(tgl_mulai);
      var end = new Date(tgl_selesai);
      var minEnd = new Date(start);
      minEnd.setMonth(minEnd.getMonth() + 2);
      if (end < minEnd) {
        return error('Durasi periode magang minimal adalah 2 bulan.');
      }
    }

    // Simpan dokumen ke Google Drive
    var suratUrl = _saveToDrive(surat_b64,       'Surat_'       + nim);
    var cvUrl    = params.cv         ? _saveToDrive(params.cv,         'CV_'         + nim) : '';
    var portUrl  = params.portofolio ? _saveToDrive(params.portofolio, 'Portofolio_' + nim) : '';

    // Simpan ke sheet Lamaran
    SpreadsheetRepo.append('Lamaran', {
      id:              SpreadsheetRepo.generateId(),
      user_id:         currentUser.id,
      nama:            currentUser.nama,
      email:           currentUser.email,
      nomor_hp:        currentUser.nomor_hp || params.nomor_hp || '',
      nim:             nim,
      universitas:     universitas,
      program_studi:   program_studi,
      tanggal_mulai:   tgl_mulai,
      tanggal_selesai: tgl_selesai,
      surat_ajuan_url: suratUrl,
      cv_url:          cvUrl,
      portofolio_url:  portUrl,
      status:          'menunggu',
      created_at:      new Date().toISOString(),
    });

    // Update mahasiswa_status user
    SpreadsheetRepo.updateById('Users', currentUser.id, { mahasiswa_status: 'menunggu' });
    ActivityLogger.log(currentUser, 'Submit lamaran magang: ' + universitas);

    return success(null, 'Lamaran berhasil dikirim! Tunggu notifikasi email dari kami.');
  }

  function _saveToDrive(base64Data, filename, folderName) {
    try {
      var parts   = base64Data.split(',');
      var mime    = (parts[0].match(/:(.*?);/) || [])[1] || 'application/pdf';
      var decoded = Utilities.base64Decode(parts.length > 1 ? parts[1] : parts[0]);
      var blob    = Utilities.newBlob(decoded, mime, filename);

      var targetFolder = folderName || 'Lamaran Magang';
      var folders = DriveApp.getFoldersByName(targetFolder);
      var folder  = folders.hasNext() ? folders.next() : DriveApp.createFolder(targetFolder);
      var file    = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      if (mime.indexOf('image/') === 0) {
        return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=s500';
      }
      return file.getUrl();
    } catch (e) {
      Logger.log('[Drive] ' + e.message);
      return '';
    }
  }

  // Update Profile
  function updateProfile(params, currentUser) {
    var nama = (params.nama || '').trim();
    var foto_profil = params.foto_profil || '';

    var user = SpreadsheetRepo.findOneBy('Users', 'id', currentUser.id);
    if (!user) return error('User tidak ditemukan');

    var updates = {};
    if (nama) updates.nama = nama;

    if (foto_profil) {
      if (foto_profil.indexOf('data:image/') === 0) {
        // Simpan foto_profil langsung di database (20KB base64) agar instant 0ms tanpa kendala CORS
        updates.foto_profil = foto_profil;
        // Simpan juga salinan backup ke Google Drive folder 'Foto Profil'
        _saveToDrive(foto_profil, 'FotoProfil_' + currentUser.id, 'Foto Profil');
      } else if (foto_profil.indexOf('http') === 0) {
        updates.foto_profil = foto_profil;
      }
    }

    if (Object.keys(updates).length > 0) {
      SpreadsheetRepo.updateById('Users', currentUser.id, updates);
      if (user.role === 'mahasiswa') {
        var mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', user.email);
        if (mhs) {
          SpreadsheetRepo.updateById('Mahasiswa', mhs.id, { nama: updates.nama || mhs.nama });
        }
      }
    }

    var updatedUser = SpreadsheetRepo.findOneBy('Users', 'id', currentUser.id);
    var payload = {
      id: updatedUser.id,
      nama: updatedUser.nama,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      foto_profil: updatedUser.foto_profil || '',
    };
    if (updatedUser.role === 'mahasiswa') {
      payload.mahasiswa_status = updatedUser.mahasiswa_status || 'belum_daftar';
    }

    var newToken = JWT.sign({ user: payload });
    ActivityLogger.log(currentUser, 'Update profil');
    return success({ user: payload, token: newToken }, 'Profil berhasil diperbarui!');
  }

  // Change Password
  function changePassword(params, currentUser) {
    var pwLama = params.password_lama || '';
    var pwBaru = params.password_baru || '';
    var konfirmasi = params.konfirmasi_password || '';

    if (!pwLama || !pwBaru || !konfirmasi) {
      return error('Password lama, password baru, dan konfirmasi password wajib diisi');
    }

    if (pwBaru.length < 8) {
      return error('Password baru minimal 8 karakter');
    }

    if (pwBaru !== konfirmasi) {
      return error('Konfirmasi password tidak cocok');
    }

    var user = SpreadsheetRepo.findOneBy('Users', 'id', currentUser.id);
    if (!user) return error('User tidak ditemukan');

    if (!Hash.verify(pwLama, user.password_hash)) {
      return error('Password saat ini salah');
    }

    SpreadsheetRepo.updateById('Users', currentUser.id, {
      password_hash: Hash.hash(pwBaru)
    });

    ActivityLogger.log(currentUser, 'Ubah password');
    return success(null, 'Password berhasil diperbarui!');
  }

  function checkRole(params) {
    var email = (params.email || '').trim().toLowerCase();
    if (!email) return error('Email required');
    var user = SpreadsheetRepo.findOneBy('Users', 'email', email);
    if (!user) return success({ role: null }, 'User not found');
    return success({ role: user.role }, 'OK');
  }

  return {
    login: login,
    checkRole: checkRole,
    me: me,
    logout: logout,
    daftarAkun: daftarAkun,
    daftarMagang: daftarMagang,
    updateProfile: updateProfile,
    changePassword: changePassword,
  };
})();
