/**
 * Hash.gs
 * 
 */

var Hash = (function() {

  var ITERATIONS = 10000;

  /**
   * Generate random salt (16 hex chars)
   */
  function generateSalt() {
    var random =
        Utilities.getUuid() +
        new Date().getTime() +
        Math.random();

    var bytes = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        random
    );

    return bytesToHex(bytes);
  }

  function bytesToHex(bytes) {
    return bytes.map(function(b) {
      var hex = (b < 0 ? b + 256 : b).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Hash password
   */
  function hashPassword(password) {
    var salt = generateSalt();
    var hash = iteratedHash(password + salt);
    return salt + ':' + hash;
  }

  function iteratedHash(input) {
    var result = input;
    for (var i = 0; i < ITERATIONS; i++) {
      var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, result);
      result = bytesToHex(bytes);
    }
    return result;
  }

  /**
   * Verify password against stored hash
   */
  function verifyPassword(password, storedHash) {
    try {
      var parts = storedHash.split(':');
      if (parts.length !== 2) return false;
      var salt = parts[0];
      var hash = parts[1];
      var computed = iteratedHash(password + salt);
      return computed === hash;
    } catch (e) {
      return false;
    }
  }

  return {
    hash: hashPassword,
    verify: verifyPassword,
    generateSalt: generateSalt,
  };
})();

/**
 * RateLimiter
 */
var RateLimiter = (function() {
  var MAX_REQUESTS = 100; // per minute per key
  var WINDOW_MS = 60 * 1000;

  function check() {
    try {
      var cache = CacheService.getScriptCache();
      var key = 'rl_' + Math.floor(Date.now() / WINDOW_MS);
      var count = parseInt(cache.get(key) || '0');
      if (count >= MAX_REQUESTS) return false;
      cache.put(key, String(count + 1), 70); // 70 seconds TTL
      return true;
    } catch (e) {
      return true; // Fail open
    }
  }

  return { check: check };
})();

/**
 * ActivityLogger
 */
var ActivityLogger = (function() {
  function log(user, aktivitas) {
    try {
      SpreadsheetRepo.append('Log Aktivitas', {
        id: SpreadsheetRepo.generateId(),
        user: user ? (user.nama || user.email) : 'System',
        aktivitas: aktivitas,
        tanggal: SpreadsheetRepo.now(),
      });
    } catch (e) {
      Logger.log('ActivityLogger error: ' + e.message);
    }
  }
  return { log: log };
})();
