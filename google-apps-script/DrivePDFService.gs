/**
 * DrivePDFService.gs — Upload file ke Google Drive & Generate PDF Laporan
 */

var DriveService = (function() {

  function getFolderForType(type) {
    var props = PropertiesService.getScriptProperties();
    var rootFolderId = props.getProperty('DRIVE_FOLDER_ID');
    var rootFolder = rootFolderId ? DriveApp.getFolderById(rootFolderId) : DriveApp.getRootFolder();

    var subName = type || 'uploads';
    if (type === 'absensi') subName = 'Foto Absensi';
    else if (type === 'foto_profil') subName = 'Foto Profil';
    else if (type === 'izin') subName = 'Dokumen Izin';
    else if (type === 'jurnal') subName = 'Foto Jurnal';
    else if (type === 'lamaran') subName = 'Berkas Lamaran';

    var folders = rootFolder.getFoldersByName(subName);
    return folders.hasNext() ? folders.next() : rootFolder.createFolder(subName);
  }

  function uploadFile(base64Data, fileName, mimeType, type) {
    var cleanData = base64Data.replace(/^data:[^;]+;base64,/, '');
    var bytes = Utilities.base64Decode(cleanData);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);

    var folder = getFolderForType(type);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return 'https://drive.google.com/uc?id=' + file.getId() + '&export=view';
  }

  function deleteFile(fileId) {
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
    } catch (e) {
      Logger.log('Delete file error: ' + e.message);
    }
  }

  return { uploadFile: uploadFile, deleteFile: deleteFile };
})();


/**
 * Helper Functions Formatting Date & Names
 */
function formatIndoDate(dateVal) {
  if (!dateVal) return '-';
  var str = String(dateVal).trim();
  if (!str || str === '-') return '-';

  var isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    var year = isoMatch[1];
    var monthIdx = parseInt(isoMatch[2], 10) - 1;
    var day = parseInt(isoMatch[3], 10);
    var months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return day + ' ' + (months[monthIdx] || '') + ' ' + year;
  }

  try {
    var d = new Date(str);
    if (!isNaN(d.getTime())) {
      var months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }
  } catch (e) {}

  return str;
}

function formatHHmm(timeVal) {
  if (!timeVal) return '-';
  var str = String(timeVal).trim();
  if (!str || str === '-' || str === '00:00' || str === '00:00:00') return '-';

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    return str.substring(0, 5);
  }

  var m = str.match(/(\d{2}:\d{2})/);
  return m ? m[1] : str;
}

function extractDriveId(url) {
  if (!url) return '';
  var str = String(url);
  var fileDMatch = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch) return fileDMatch[1];
  var idMatch = str.match(/id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  var lh3Match = str.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match) return lh3Match[1];
  return '';
}

function resolveDivisiName(divisiId) {
  if (!divisiId) return '-';
  var div = SpreadsheetRepo.findOneBy('Divisi', 'id', divisiId);
  if (div && div.nama_divisi) return div.nama_divisi;
  return divisiId;
}

function resolvePembimbingName(pembimbingVal) {
  if (!pembimbingVal) return 'Pembimbing Lapangan';
  var user = SpreadsheetRepo.findOneBy('Users', 'id', pembimbingVal) ||
             SpreadsheetRepo.findOneBy('Users', 'email', pembimbingVal) ||
             SpreadsheetRepo.findOneBy('Mahasiswa', 'pembimbing', pembimbingVal);
  if (user && user.nama) return user.nama;
  return pembimbingVal;
}

function formatJurnalStatus(status) {
  var st = (status || '').toLowerCase().trim();
  if (st === 'verified' || st === 'approved' || st === 'disetujui') return 'disetujui';
  if (st === 'rejected' || st === 'ditolak') return 'ditolak';
  return 'menunggu';
}

function formatAbsensiStatus(status) {
  var st = (status || '').toLowerCase().trim();
  if (st === 'terlambat' || st === 'hadir') return 'Hadir';
  if (st === 'izin') return 'Izin';
  if (st === 'sakit') return 'Sakit';
  if (st === 'alpha') return 'Alpha';
  return 'Hadir';
}


/**
 * Helper: Borderless Metadata Table
 */
function addMetadataTable(body, mhs, divisiNama, pembimbingNama, periodeStr) {
  var data = [
    ['Nama', ':', mhs.nama || '-'],
    ['NIM', ':', mhs.nim || '-'],
    ['Universitas', ':', mhs.universitas || '-'],
    ['Program Studi', ':', mhs.program_studi || '-'],
    ['Divisi', ':', divisiNama],
    ['Periode Magang', ':', periodeStr],
    ['Supervisor', ':', pembimbingNama]
  ];

  var table = body.appendTable(data);
  table.setBorderWidth(0);

  for (var r = 0; r < table.getNumRows(); r++) {
    var row = table.getRow(r);

    // Label cell
    var c0 = row.getCell(0);
    c0.setWidth(120);
    var p0 = c0.getChild(0).asParagraph();
    p0.setFontSize(10).setBold(false).setItalic(false);

    // Colon cell
    var c1 = row.getCell(1);
    c1.setWidth(20);
    var p1 = c1.getChild(0).asParagraph();
    p1.setFontSize(10).setBold(false).setItalic(false);

    // Value cell
    var c2 = row.getCell(2);
    c2.setWidth(340);
    var p2 = c2.getChild(0).asParagraph();
    p2.setFontSize(10).setBold(false).setItalic(false);
  }
}


/**
 * PDFService.gs
 */
var PDFService = (function() {

  function generateJurnalPDF(params, currentUser) {
    try {
      var mahasiswaId = params.mahasiswa_id || 'me';
      var mhs;

      if (mahasiswaId === 'me') {
        mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
      } else {
        mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'id', mahasiswaId);
      }

      if (!mhs) return error('Data mahasiswa tidak ditemukan');

      var jurnalList = SpreadsheetRepo.getAll('Jurnal')
        .filter(function(j) { return j.mahasiswa_id === mhs.id; })
        .sort(function(a, b) { return (a.tanggal || '').localeCompare(b.tanggal || ''); });

      var doc = DocumentApp.create('Jurnal Kegiatan Harian - ' + mhs.nama);
      var body = doc.getBody();

      // Set Margins
      body.setMarginTop(36).setMarginBottom(36).setMarginLeft(36).setMarginRight(36);

      // Header Titles
      var h1 = body.appendParagraph('Jurnal Kegiatan Harian');
      h1.setFontSize(14).setBold(true).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

      var h2 = body.appendParagraph('PIJAR – PLN UP3 PADANG');
      h2.setFontSize(12).setBold(true).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('');

      // Metadata Block (Borderless Table for Straight Colons)
      var divisiNama = resolveDivisiName(mhs.divisi);
      var pembimbingNama = resolvePembimbingName(mhs.pembimbing);
      var periodeStr = formatIndoDate(mhs.tanggal_mulai) + ' – ' + formatIndoDate(mhs.tanggal_selesai);

      addMetadataTable(body, mhs, divisiNama, pembimbingNama, periodeStr);
      body.appendParagraph('');

      // Data Table
      var table = body.appendTable();
      table.setBorderWidth(1);

      // Header Row
      var headerRow = table.appendTableRow();
      var headers = ['No', 'Tanggal', 'Foto Kegiatan', 'Judul', 'Deskripsi', 'Status'];
      headers.forEach(function(hText, i) {
        var cell = headerRow.appendTableCell(hText);
        var p = cell.getChild(0).asParagraph();
        p.setFontSize(10).setBold(true).setItalic(false);
        p.setAlignment(i === 3 || i === 4 ? DocumentApp.HorizontalAlignment.LEFT : DocumentApp.HorizontalAlignment.CENTER);
      });

      // Data Rows
      jurnalList.forEach(function(j, idx) {
        var tr = table.appendTableRow();

        // No
        var c0 = tr.appendTableCell(String(idx + 1));
        c0.getChild(0).asParagraph().setFontSize(9).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

        // Tanggal
        var c1 = tr.appendTableCell(formatIndoDate(j.tanggal));
        c1.getChild(0).asParagraph().setFontSize(9).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

        // Foto Kegiatan
        var cFoto = tr.appendTableCell();
        var pFoto = cFoto.getChild(0).asParagraph();
        pFoto.setFontSize(9).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        if (j.foto && j.foto !== '-') {
          try {
            var fileId = extractDriveId(j.foto);
            if (fileId) {
              var imageFile = DriveApp.getFileById(fileId);
              var imgBlob = imageFile.getBlob();
              var img = pFoto.appendImage(imgBlob);
              img.setWidth(90);
              img.setHeight(65);
            } else {
              pFoto.setText('-');
            }
          } catch (e) {
            pFoto.setText('-');
          }
        } else {
          pFoto.setText('-');
        }

        // Judul
        var c3 = tr.appendTableCell(j.judul || '-');
        c3.getChild(0).asParagraph().setFontSize(9).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.LEFT);

        // Deskripsi
        var c4 = tr.appendTableCell(j.deskripsi || '-');
        c4.getChild(0).asParagraph().setFontSize(9).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.LEFT);

        // Status (disetujui / menunggu / ditolak)
        var c5 = tr.appendTableCell(formatJurnalStatus(j.status));
        c5.getChild(0).asParagraph().setFontSize(9).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      });

      body.appendParagraph('');
      body.appendParagraph('');

      // Signature Block
      var p1 = body.appendParagraph('Diketahui Oleh,');
      p1.setFontSize(10).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

      var p2 = body.appendParagraph('Pembimbing Lapangan');
      p2.setFontSize(10).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

      body.appendParagraph('');
      body.appendParagraph('');

      var p3 = body.appendParagraph(pembimbingNama);
      p3.setFontSize(10).setBold(true).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

      doc.saveAndClose();

      var file = DriveApp.getFileById(doc.getId());
      var pdfBlob = file.getAs('application/pdf');
      var fileName = 'Jurnal_PLN_' + (mhs.nama || 'Mahasiswa').replace(/\s+/g, '_') + '.pdf';
      pdfBlob.setName(fileName);

      var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
      file.setTrashed(true);

      ActivityLogger.log(currentUser, 'Generate PDF jurnal: ' + mhs.nama);
      return success({ pdf_base64: pdfBase64, filename: fileName, url: '' }, 'PDF berhasil dibuat');
    } catch (e) {
      return error('Gagal generate PDF Jurnal: ' + e.message);
    }
  }

  function generateAbsensiPDF(params, currentUser) {
    try {
      var mahasiswaId = params.mahasiswa_id || 'me';
      var mhs;

      if (mahasiswaId === 'me') {
        mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'email', currentUser.email);
      } else {
        mhs = SpreadsheetRepo.findOneBy('Mahasiswa', 'id', mahasiswaId);
      }

      if (!mhs) return error('Data mahasiswa tidak ditemukan');

      var absensiList = SpreadsheetRepo.getAll('Kehadiran')
        .filter(function(k) { return k.mahasiswa_id === mhs.id; })
        .sort(function(a, b) { return (a.tanggal || '').localeCompare(b.tanggal || ''); });

      var doc = DocumentApp.create('Daftar Hadir Kegiatan Harian - ' + mhs.nama);
      var body = doc.getBody();

      body.setMarginTop(36).setMarginBottom(36).setMarginLeft(36).setMarginRight(36);

      // Header Titles
      var h1 = body.appendParagraph('Daftar Hadir Kegiatan Harian');
      h1.setFontSize(14).setBold(true).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

      var h2 = body.appendParagraph('PIJAR – PLN UP3 PADANG');
      h2.setFontSize(12).setBold(true).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('');

      // Metadata Block
      var divisiNama = resolveDivisiName(mhs.divisi);
      var pembimbingNama = resolvePembimbingName(mhs.pembimbing);
      var periodeStr = formatIndoDate(mhs.tanggal_mulai) + ' – ' + formatIndoDate(mhs.tanggal_selesai);

      addMetadataTable(body, mhs, divisiNama, pembimbingNama, periodeStr);
      body.appendParagraph('');

      // Data Table
      var table = body.appendTable();
      table.setBorderWidth(1);

      // Header Row
      var headerRow = table.appendTableRow();
      var headers = ['No', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Jenis Izin', 'Keterangan'];
      headers.forEach(function(hText, i) {
        var cell = headerRow.appendTableCell(hText);
        var p = cell.getChild(0).asParagraph();
        p.setFontSize(10).setBold(true).setItalic(false);
        p.setAlignment(i === 6 ? DocumentApp.HorizontalAlignment.LEFT : DocumentApp.HorizontalAlignment.CENTER);
      });

      var hadirCount = 0;
      var terlambatCount = 0;
      var izinSakitCount = 0;
      var alphaCount = 0;

      absensiList.forEach(function(k, idx) {
        var tr = table.appendTableRow();

        var st = (k.status || 'hadir').toLowerCase();
        var statusLabel = 'Hadir';
        if (st === 'terlambat') { statusLabel = 'Hadir'; terlambatCount++; }
        else if (st === 'hadir') { hadirCount++; }
        else if (st === 'izin' || st === 'sakit') { statusLabel = st === 'sakit' ? 'Sakit' : 'Izin'; izinSakitCount++; }
        else if (st === 'alpha') { statusLabel = 'Alpha'; alphaCount++; }

        var rowValues = [
          String(idx + 1),
          formatIndoDate(k.tanggal),
          formatHHmm(k.jam_masuk),
          formatHHmm(k.jam_pulang),
          statusLabel,
          k.jenis_izin || '-',
          k.keterangan || '-'
        ];

        rowValues.forEach(function(val, i) {
          var cell = tr.appendTableCell(val);
          var p = cell.getChild(0).asParagraph();
          p.setFontSize(9).setBold(false).setItalic(false);
          p.setAlignment(i === 6 ? DocumentApp.HorizontalAlignment.LEFT : DocumentApp.HorizontalAlignment.CENTER);
        });
      });

      body.appendParagraph('');

      // Ringkasan Kehadiran
      var pSummaryTitle = body.appendParagraph('RINGKASAN KEHADIRAN');
      pSummaryTitle.setFontSize(10).setBold(true).setItalic(false);
      body.appendParagraph('');

      var sumData = [
        ['Hadir', ':', String(hadirCount + terlambatCount)],
        ['Terlambat', ':', String(terlambatCount)],
        ['Izin/Sakit', ':', String(izinSakitCount)],
        ['Alpha', ':', String(alphaCount > 0 ? alphaCount : '-')],
        ['', '', ''],
        ['Total Kehadiran', ':', String(absensiList.length)]
      ];

      var sumTable = body.appendTable(sumData);
      sumTable.setBorderWidth(0);

      for (var r = 0; r < sumTable.getNumRows(); r++) {
        var sRow = sumTable.getRow(r);
        var isTotal = (r === 5);

        var sc0 = sRow.getCell(0);
        sc0.setWidth(120);
        sc0.getChild(0).asParagraph().setFontSize(10).setBold(isTotal).setItalic(false);

        var sc1 = sRow.getCell(1);
        sc1.setWidth(20);
        sc1.getChild(0).asParagraph().setFontSize(10).setBold(isTotal).setItalic(false);

        var sc2 = sRow.getCell(2);
        sc2.setWidth(340);
        sc2.getChild(0).asParagraph().setFontSize(10).setBold(isTotal).setItalic(false);
      }

      body.appendParagraph('');
      body.appendParagraph('');

      // Signature Block
      var p1 = body.appendParagraph('Diketahui Oleh,');
      p1.setFontSize(10).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

      var p2 = body.appendParagraph('Pembimbing Lapangan');
      p2.setFontSize(10).setBold(false).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

      body.appendParagraph('');
      body.appendParagraph('');

      var p3 = body.appendParagraph(pembimbingNama);
      p3.setFontSize(10).setBold(true).setItalic(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

      doc.saveAndClose();

      var file = DriveApp.getFileById(doc.getId());
      var pdfBlob = file.getAs('application/pdf');
      var fileName = 'Absensi_PLN_' + (mhs.nama || 'Mahasiswa').replace(/\s+/g, '_') + '.pdf';
      pdfBlob.setName(fileName);

      var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
      file.setTrashed(true);

      ActivityLogger.log(currentUser, 'Generate PDF absensi: ' + mhs.nama);
      return success({ pdf_base64: pdfBase64, filename: fileName, url: '' }, 'PDF berhasil dibuat');
    } catch (e) {
      return error('Gagal generate PDF Absensi: ' + e.message);
    }
  }

  return { generateJurnalPDF: generateJurnalPDF, generateAbsensiPDF: generateAbsensiPDF };
})();
