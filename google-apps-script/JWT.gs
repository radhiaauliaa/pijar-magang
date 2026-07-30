/**
 * JWT.gs
 * 
 */

var JWT = (function() {

  function getSecret() {
    return PropertiesService.getScriptProperties().getProperty('JWT_SECRET') || 'fallback-secret-change-this';
  }

  function base64UrlEncode(str) {
    return Utilities.base64EncodeWebSafe(str).replace(/=+$/, '');
  }

  function base64UrlDecode(str) {
    // Pad to multiple of 4
    var padded = str + '===='.slice(0, (4 - str.length % 4) % 4);
    return Utilities.base64DecodeWebSafe(padded);
  }

  function sign(header, payload) {
    var data = base64UrlEncode(JSON.stringify(header)) + '.' + base64UrlEncode(JSON.stringify(payload));
    var secret = getSecret();
    var sig = Utilities.computeHmacSha256Signature(data, secret);
    var sigB64 = base64UrlEncode(Utilities.newBlob(sig).getDataAsString() || arrayToString(sig));
    // Use raw bytes
    var bytes = sig;
    var encoded = Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
    return data + '.' + encoded;
  }

  function arrayToString(arr) {
    return arr.map(function(b) { return String.fromCharCode(b < 0 ? b + 256 : b); }).join('');
  }

  return {
    /**
     * Generate JWT token
     * @param {Object} payload - e.g. { user: {...}, exp: timestamp }
     */
    sign: function(payload) {
      var header = { alg: 'HS256', typ: 'JWT' };
      var exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
      var fullPayload = Object.assign({}, payload, { exp: exp, iat: Math.floor(Date.now() / 1000) });

      var headerB64 = base64UrlEncode(JSON.stringify(header));
      var payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
      var sigData = headerB64 + '.' + payloadB64;

      var secret = getSecret();
      var sigBytes = Utilities.computeHmacSha256Signature(sigData, secret);
      var sigB64 = Utilities.base64EncodeWebSafe(sigBytes).replace(/=+$/, '');

      return sigData + '.' + sigB64;
    },

    /**
     * Verify JWT and return payload, or null if invalid
     */
    verify: function(token) {
      try {
        var parts = token.split('.');
        if (parts.length !== 3) return null;

        var secret = getSecret();
        var sigData = parts[0] + '.' + parts[1];
        var sigBytes = Utilities.computeHmacSha256Signature(sigData, secret);
        var expectedSig = Utilities.base64EncodeWebSafe(sigBytes).replace(/=+$/, '');

        if (expectedSig !== parts[2]) {
          Logger.log('JWT signature mismatch');
          return null;
        }

        // Decode payload
        var payloadBytes = base64UrlDecode(parts[1]);
        var payloadStr = Utilities.newBlob(payloadBytes).getDataAsString();
        var payload = JSON.parse(payloadStr);

        // Check expiry
        if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
          Logger.log('JWT expired');
          return null;
        }

        return payload;
      } catch (e) {
        Logger.log('JWT verify error: ' + e.message);
        return null;
      }
    }
  };
})();
