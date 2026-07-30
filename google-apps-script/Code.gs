/**
 * Code.gs
 */


function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doOptions(e) {
  return buildCorsResponse();
}

function handleRequest(e, method) {
  try {
    var params = {};

    if (method === 'GET') {
      params = e.parameter || {};
    } else {
      // POST — parse JSON body
      try {
        params = JSON.parse(e.postData.contents);
      } catch (_) {
        params = e.parameter || {};
      }
    }

    var action = params.action || '';

    // Rate limiting
    if (!RateLimiter.check()) {
      return jsonResponse({ success: false, message: 'Too many requests', error: 'RATE_LIMIT' }, 429);
    }

    // Public routes
    if (action === 'login') {
      return AuthService.login(params);
    }

    if (action === 'checkRole') {
      return AuthService.checkRole(params);
    }

    if (action === 'daftarAkun') {
      return AuthService.daftarAkun(params);
    }

    if (action === 'sendEmail') {
      return EmailService.sendEmail(params);
    }

    // verify JWT
    var authHeader = (e.parameter && e.parameter.Authorization) ||
                     (params.Authorization) || '';
    var token = authHeader.replace('Bearer ', '').trim();

    if (!token && e.headers) {
      try { token = e.headers['Authorization'].replace('Bearer ', '').trim(); } catch(_){}
    }

    if (!token) {
      return jsonResponse({ success: false, message: 'Unauthorized', error: 'NO_TOKEN' }, 401);
    }

    var decoded = JWT.verify(token);
    if (!decoded) {
      return jsonResponse({ success: false, message: 'Token tidak valid atau kadaluarsa', error: 'INVALID_TOKEN' }, 401);
    }

    var currentUser = decoded.user;
    Logger.log('[%s] action=%s user=%s', new Date().toISOString(), action, currentUser.email);

    // Route dispatch
    switch (action) {

      // Auth
      case 'me':             return AuthService.me(currentUser);
      case 'logout':         return AuthService.logout(currentUser);
      case 'updateProfile':  return AuthService.updateProfile(params, currentUser);
      case 'changePassword': return AuthService.changePassword(params, currentUser);

      case 'daftarMagang': return requireRole(currentUser, ['mahasiswa'], function() {
        return AuthService.daftarMagang(params, currentUser);
      });

      // Dashboard
      case 'getAdminStats':       return requireRole(currentUser, ['admin','admin_ulp'], function() { return DashboardService.getAdminStats(params, currentUser); });
      case 'getPembimbingStats':  return requireRole(currentUser, ['pembimbing'], function() { return DashboardService.getPembimbingStats(currentUser); });
      case 'getMahasiswaStats':   return requireRole(currentUser, ['mahasiswa'], function() { return DashboardService.getMahasiswaStats(currentUser); });
      case 'getNotifications':    return DashboardService.getNotifications(currentUser);

      // Mahasiswa
      case 'getMahasiswa':       return requireRole(currentUser, ['admin','admin_ulp','pembimbing'], function() { return MahasiswaService.getAll(params, currentUser); });
      case 'getMahasiswaById':   return MahasiswaService.getById(params.id, currentUser);
      case 'createMahasiswa':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return MahasiswaService.create(params, currentUser); });
      case 'updateMahasiswa':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return MahasiswaService.update(params, currentUser); });
      case 'deleteMahasiswa':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return MahasiswaService.remove(params.id, currentUser); });
      case 'importMahasiswa':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return MahasiswaService.importBulk(params.rows, currentUser); });
      case 'exportMahasiswa':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return MahasiswaService.exportData(params); });
      case 'getPembimbingList':  return requireRole(currentUser, ['admin','admin_ulp'], function() { return MahasiswaService.getPembimbingList(); });
      case 'checkDivisiCapacity': return requireRole(currentUser, ['admin','admin_ulp'], function() { return DivisiService.checkCapacity(params.id); });

      // Divisi
      case 'getDivisi':       return DivisiService.getAll(params, currentUser);
      case 'getDivisiById':   return DivisiService.getById(params.id);
      case 'createDivisi':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return DivisiService.create(params, currentUser); });
      case 'updateDivisi':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return DivisiService.update(params, currentUser); });
      case 'deleteDivisi':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return DivisiService.remove(params.id, currentUser); });

      // Cabang
      case 'getCabang':       return CabangService.getAll();
      case 'getCabangById':   return CabangService.getById(params.id);
      case 'createCabang':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return CabangService.create(params, currentUser); });
      case 'updateCabang':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return CabangService.update(params, currentUser); });
      case 'deleteCabang':    return requireRole(currentUser, ['admin','admin_ulp'], function() { return CabangService.remove(params.id, currentUser); });

      // Jurnal
      case 'getJurnal':      return requireRole(currentUser, ['admin','admin_ulp','pembimbing'], function() { return JurnalService.getAll(params, currentUser); });

      case 'getMyJurnal':    return requireRole(currentUser, ['mahasiswa'], function() { return JurnalService.getMy(params, currentUser); });
      case 'getJurnalById':  return JurnalService.getById(params.id, currentUser);
      case 'createJurnal':   return requireRole(currentUser, ['mahasiswa'], function() { return JurnalService.create(params, currentUser); });
      case 'updateJurnal':   return requireRole(currentUser, ['mahasiswa'], function() { return JurnalService.update(params, currentUser); });
      case 'deleteJurnal':   return requireRole(currentUser, ['mahasiswa','admin','admin_ulp'], function() { return JurnalService.remove(params.id, currentUser); });
      case 'verifyJurnal':   return requireRole(currentUser, ['admin','admin_ulp','pembimbing'], function() { return JurnalService.verify(params, currentUser); });

      // Profile
      case 'updateProfile':   return AuthService.updateProfile(params, currentUser);
      case 'changePassword':  return AuthService.changePassword(params, currentUser);

      // Absensi
      case 'getAbsensi':       return requireRole(currentUser, ['admin','admin_ulp','pembimbing'], function() { return AbsensiService.getAll(params, currentUser); });
      case 'getMyAbsensi':     return requireRole(currentUser, ['mahasiswa'], function() { return AbsensiService.getMy(params, currentUser); });
      case 'getTodayAbsensi':  return requireRole(currentUser, ['mahasiswa'], function() { return AbsensiService.getToday(currentUser); });
      case 'checkIn':          return requireRole(currentUser, ['mahasiswa'], function() { return AbsensiService.checkIn(params, currentUser); });
      case 'checkOut':         return requireRole(currentUser, ['mahasiswa'], function() { return AbsensiService.checkOut(params, currentUser); });
      case 'ajukanIzin':        return requireRole(currentUser, ['mahasiswa'], function() { return AbsensiService.ajukanIzin(params, currentUser); });


      // Pembimbing
      case 'getPembimbing':     return requireRole(currentUser, ['admin','admin_ulp'], function() { return PembimbingService.getAll(params, currentUser); });
      case 'createPembimbing':  return requireRole(currentUser, ['admin','admin_ulp'], function() { return PembimbingService.create(params, currentUser); });
      case 'updatePembimbing':  return requireRole(currentUser, ['admin','admin_ulp'], function() { return PembimbingService.update(params, currentUser); });
      case 'deletePembimbing':  return requireRole(currentUser, ['admin','admin_ulp'], function() { return PembimbingService.remove(params.id, currentUser); });

      // Lamaran Magang
      case 'getLamaran':      return requireRole(currentUser, ['admin'], function() { return LamaranService.getAll(params); });
      case 'approveLamaran':  return requireRole(currentUser, ['admin'], function() { return LamaranService.approve(params, currentUser); });
      case 'rejectLamaran':   return requireRole(currentUser, ['admin'], function() { return LamaranService.reject(params, currentUser); });

      // Log

      case 'getLog': return requireRole(currentUser, ['admin'], function() {
        var rows = SpreadsheetRepo.getAll('Log Aktivitas');
        rows.sort(function(a, b) { return b.tanggal.localeCompare(a.tanggal); });
        var result = SpreadsheetRepo.paginate(rows, params.page, params.limit);
        return paginated(result.items, result.total, result.page, result.limit);
      });

      case 'generateJurnalPDF':   return PDFService.generateJurnalPDF(params, currentUser);
      case 'generateAbsensiPDF':  return PDFService.generateAbsensiPDF(params, currentUser);

      default:
        return jsonResponse({ success: false, message: 'Action tidak dikenal: ' + action, error: 'UNKNOWN_ACTION' }, 400);
    }

  } catch (err) {
    console.error('[ERROR]', err.message, err.stack);
    return jsonResponse({ success: false, message: err.message || 'Internal server error', error: 'SERVER_ERROR' }, 500);
  }
}

// RBAC helper
function requireRole(user, roles, fn) {
  if (!user) {
    return jsonResponse({ success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' }, 401);
  }
  var userRole = (user.role || '').toLowerCase();
  var isAllowed = roles.some(function(r) {
    r = (r || '').toLowerCase();
    if (r === 'admin' && (userRole === 'admin' || userRole === 'admin_ulp')) return true;
    return r === userRole;
  });
  if (!isAllowed) {
    return jsonResponse({ success: false, message: 'Akses ditolak', error: 'FORBIDDEN' }, 403);
  }
  return fn();
}

// JSON response builder
function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function buildCorsResponse() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Success/error helpers
function success(data, message) {
  return jsonResponse({ success: true, message: message || 'OK', data: data });
}

function error(message, errorCode) {
  return jsonResponse({ success: false, message: message, error: errorCode || 'ERROR' });
}

function paginated(items, total, page, limit) {
  return jsonResponse({
    success: true,
    message: 'OK',
    data: {
      items: items,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    }
  });
}
