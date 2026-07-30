/**
 * SpreadsheetRepo.gs
 */

var SpreadsheetRepo = (function() {

  function getSpreadsheet() {
    var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!id) {
      try {
        var active = SpreadsheetApp.getActiveSpreadsheet();
        if (active && active.getId()) {
          PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', active.getId());
          return active;
        }
      } catch (e) {}
      throw new Error('SPREADSHEET_ID tidak dikonfigurasi di Script Properties. Silakan jalankan fungsi setupSpreadsheet() atau isi SPREADSHEET_ID di Project Settings -> Script Properties.');
    }
    return SpreadsheetApp.openById(id);
  }

  function getSheet(name) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(name);
    if (!sheet) throw new Error('Sheet "' + name + '" tidak ditemukan');
    return sheet;
  }

  function getAll(sheetName) {
    var sheet = getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    var headers = data[0];
    return data.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? String(row[i]) : ''; });
      return obj;
    });
  }

  function append(sheetName, obj) {
    var sheet = getSheet(sheetName);
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var headersData = sheet.getRange(1, 1, 1, lastCol).getValues();
    var headers = headersData.length > 0 ? headersData[0].map(function(h) { return String(h).trim(); }) : [];

    // Auto add any missing object keys to header row
    var modified = false;
    Object.keys(obj).forEach(function(k) {
      if (k && headers.indexOf(k) === -1) {
        headers.push(k);
        modified = true;
      }
    });

    if (modified) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    var row = headers.map(function(h) { return obj[h] !== undefined ? obj[h] : ''; });
    sheet.appendRow(row);
    return obj;
  }

  function findBy(sheetName, column, value) {
    var rows = getAll(sheetName);
    return rows.filter(function(r) { return String(r[column]) === String(value); });
  }

  function findOneBy(sheetName, column, value) {
    var results = findBy(sheetName, column, value);
    return results.length > 0 ? results[0] : null;
  }

  function updateById(sheetName, id, updates) {
    var sheet = getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    if (idCol === -1) throw new Error('Kolom id tidak ditemukan di ' + sheetName);

    Object.keys(updates).forEach(function(key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key);
      }
    });

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(id)) {
        Object.keys(updates).forEach(function(key) {
          var col = headers.indexOf(key);
          if (col !== -1) {
            sheet.getRange(i + 1, col + 1).setValue(updates[key]);
          }
        });
        var updatedRow = sheet.getRange(i + 1, 1, 1, headers.length).getValues()[0];
        var obj = {};
        headers.forEach(function(h, idx) { obj[h] = String(updatedRow[idx]); });
        return obj;
      }
    }
    throw new Error('Data dengan id ' + id + ' tidak ditemukan di ' + sheetName);
  }

  function deleteById(sheetName, id) {
    var sheet = getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    if (idCol === -1) throw new Error('Kolom id tidak ditemukan');

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(id)) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    throw new Error('Data dengan id ' + id + ' tidak ditemukan');
  }

  function paginate(rows, page, limit) {
    var p = parseInt(page) || 1;
    var l = parseInt(limit) || 10;
    var start = (p - 1) * l;
    return {
      items: rows.slice(start, start + l),
      total: rows.length,
      page: p,
      limit: l
    };
  }

  function generateId() {
    return Utilities.getUuid();
  }

  function now() {
    return new Date().toISOString();
  }

  return {
    getAll: getAll,
    append: append,
    findBy: findBy,
    findOneBy: findOneBy,
    updateById: updateById,
    deleteById: deleteById,
    paginate: paginate,
    generateId: generateId,
    now: now,
    getSheet: getSheet,
  };
})();
