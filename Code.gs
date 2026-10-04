/**
 * BACKEND - GOOGLE APPS SCRIPT
 * EduRapor v5.6 (With Timestamps & Audit Trail)
 */

const TABLES = {
  'Users': ['username', 'password', 'role', 'nama_lengkap'],
  // --- TABEL REFERENSI & KEPENDUDUKAN (BARU) ---
  'MasterAgama': ['id_agama', 'nama_agama'],
  'MasterSuku': ['id_suku', 'nama_suku'],
  'MasterPekerjaan': ['id_pekerjaan', 'nama_pekerjaan'],
  'MasterWilayah': ['id_wilayah', 'provinsi', 'kabupaten_kota', 'kecamatan', 'kelurahan_desa', 'kode_pos'],
  'MasterSekolahAsal': ['id_sekolah_asal', 'npsn_sekolah', 'nama_sekolah', 'jenjang_sekolah', 'alamat_sekolah'],

  // --- TABEL ENTITAS KELUARGA (BARU) ---
  'MasterOrtu': ['id_ortu', 'nama_ayah', 'id_pekerjaan_ayah', 'nama_ibu', 'id_pekerjaan_ibu', 'jalan_ortu', 'id_wilayah_ortu'],
  'MasterWali': ['id_wali', 'nama_wali', 'id_pekerjaan_wali', 'jalan_wali', 'id_wilayah_wali'],

  // --- TABEL SISWA (DIEKSPANSI & TERRELASI) ---
  'MasterSiswa': ['id_siswa', 'nisn', 'nama_siswa', 'panggilan', 'id_kelas', 'jenis_kelamin', 'tempat_lahir', 'tgl_lahir', 'id_suku', 'id_agama', 'id_sekolah_asal', 'status_tempat_tinggal', 'jalan_siswa', 'id_wilayah_siswa', 'id_ortu', 'id_wali'],

  'MasterGuru': ['id_guru', 'nama_guru', 'nip_nik'],
  'MasterMapel': ['id_mapel', 'nama_mapel', 'kelompok', 'id_guru'],
  'MasterKelas': ['id_kelas', 'nama_kelas', 'wali_kelas'],
  'MasterPeriode': ['id_periode', 'tahun_ajaran', 'semester', 'status_aktif'],
  'MasterMBK': ['id_jenis', 'kategori_penilaian', 'keterangan', 'mat_S', 'mat_T', 'mat_N', 'mat_K', 'mat_M'],

  // Tabel Baru: Kategori & Materi Kompetensi
  'MasterKategoriPenilaian': ['id_kategori', 'nama_kategori', 'keterangan'],
  // DIPERBARUI: Penambahan 5 kolom matriks STNKM
  'MasterMateri': ['id_materi', 'id_mapel', 'id_kelas', 'id_periode', 'id_kategori', 'nama_materi', 'deskripsi_kompetensi', 'mat_S', 'mat_T', 'mat_N', 'mat_K', 'mat_M'],
  // TABEL BARU: Bank Pengetahuan Kurikulum
  'MasterBankPengetahuan': ['id_bank', 'kategori_aset', 'nama_topik', 'deskripsi', 'base_S', 'base_T', 'base_N', 'base_K', 'base_M'],
  // Tabel Transaksi Diperbarui
  'TransNilai': ['id_nilai', 'tanggal', 'id_siswa', 'id_mapel', 'id_guru', 'id_periode', 'id_jenis', 'id_materi', 'id_kelas', 'nilai', 'timestamp_simpan', 'poin_S', 'poin_T', 'poin_N', 'poin_K', 'poin_M'],
  'TransPresensi': ['id_presensi', 'tanggal', 'id_siswa', 'id_kelas', 'id_periode', 'status_kehadiran', 'timestamp_simpan'],

  'RekapRaporAkhir': ['id_rekap', 'id_siswa', 'id_periode', 'id_mapel', 'rata_harian', 'nilai_uts', 'nilai_uas', 'nilai_akhir_proyeksi', 'predikat', 'status', 'timestamp_simpan'],

  // MODUL P5
  'MasterProyek': ['id_proyek', 'judul_proyek', 'deskripsi_proyek', 'fase', 'id_kelas', 'id_periode'],
  'MasterTargetP5': ['id_target', 'id_proyek', 'id_kategori', 'dimensi', 'elemen', 'sub_elemen', 'capaian_akhir_fase', 'relasi_stnkm'],
  'TransCatatanP5': ['id_catatan_p5', 'id_siswa', 'id_proyek', 'catatan_proses', 'timestamp_simpan'],
  'TransNilaiP5': ['id_nilaip5', 'id_periode', 'id_kelas', 'id_proyek', 'id_siswa', 'id_target', 'skor_rata2', 'predikat', 'timestamp_simpan'],

  // TABEL BARU: Variabel Global Sekolah
  'PengaturanSekolah': ['id_pengaturan', 'nama_sekolah', 'alamat_sekolah', 'kota', 'nama_kepsek', 'nip_kepsek', 'kkm_global', 'npsn', 'api_key_gemini', 'ai_model_name'],

  // TABEL BARU: Modul Jurnal Anekdotal
  'TransJurnal': ['id_jurnal', 'tanggal', 'id_siswa', 'id_guru', 'id_jenis', 'id_materi', 'narasi_kejadian', 'lampiran_url', 'mode_dampak', 'val_S', 'val_T', 'val_N', 'val_K', 'val_M', 'timestamp_simpan'],

  // TABEL BARU: Penampung Catatan Final Wali Kelas
  'TransCatatanWali': ['id_catatan_wali', 'id_siswa', 'id_periode', 'catatan_final', 'timestamp_simpan']
};

function doGet(e) {
  initDatabase();

  let page = e.parameter.page || 'login';
  let html;
  try {
    html = HtmlService.createTemplateFromFile(page);
    html.scriptUrl = ScriptApp.getService().getUrl();
  } catch (error) {
    html = HtmlService.createTemplateFromFile('login');
    html.scriptUrl = ScriptApp.getService().getUrl();
  }

  let output = html.evaluate();
  output.setTitle('EduRapor v6');
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  return output;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const [sheetName, headers] of Object.entries(TABLES)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#3f51b5").setFontColor("#ffffff");
      sheet.setFrozenRows(1);

      if (sheetName === 'Users') sheet.appendRow(['guru', '12345', 'guru', 'Administrator']);
      if (sheetName === 'MasterPeriode') sheet.appendRow(['PER-1', '2026/2027', 'Ganjil', 'AKTIF']);
      if (sheetName === 'MasterMBK') {
        sheet.appendRow(['JEN-1', 'Proses/Harian', 'Rata-rata Harian']);
        sheet.appendRow(['JEN-2', 'UTS/PTS', 'Tengah Semester']);
        sheet.appendRow(['JEN-3', 'UAS/PAS', 'Akhir Semester']);
      }
      if (sheetName === 'PengaturanSekolah') {
        sheet.appendRow(['SET-1', 'SD Sekolah Kita', 'Jl. Pendidikan No. 1, Papua', 'Jayapura', 'Nama Kepsek, S.Pd', '198001012005011001', '75']);
      }
    }
  }
}

function verifyUser(u, p, r) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const targetRole = r ? String(r).toLowerCase().trim() : '';
    const usernameInput = String(u || '').trim();
    const passwordInput = String(p || '').trim();

    if (!usernameInput || !passwordInput) {
      return { success: false, message: "Username dan password wajib diisi!" };
    }

    // =========================================================================
    // 1. OTENTIKASI ROLE: SISWA (DARI TABEL MasterSiswa)
    // =========================================================================
    if (targetRole === 'siswa') {
      const sSheet = ss.getSheetByName('MasterSiswa');
      if (sSheet && sSheet.getLastRow() > 1) {
        const dataS = sSheet.getDataRange().getValues();
        const headersS = dataS[0];
        const idxIdSiswa = headersS.indexOf('id_siswa');
        const idxNisn = headersS.indexOf('nisn');
        const idxNama = headersS.indexOf('nama_siswa');
        const idxKelas = headersS.indexOf('id_kelas');

        for (let i = 1; i < dataS.length; i++) {
          const idSiswaVal = String(dataS[i][idxIdSiswa] || '').trim();
          const nisnVal = String(dataS[i][idxNisn] || '').trim();
          const namaVal = String(dataS[i][idxNama] || '').trim();
          const kelasVal = String(dataS[i][idxKelas] || '').trim();

          // Siswa dapat login dengan NISN atau ID Siswa
          const matchUser = (idSiswaVal === usernameInput || nisnVal === usernameInput);
          const matchPass = (passwordInput === idSiswaVal || passwordInput === nisnVal || passwordInput === usernameInput);

          if (matchUser && matchPass) {
            return {
              success: true,
              role: 'siswa',
              name: namaVal || idSiswaVal,
              id_siswa: idSiswaVal,
              nisn: nisnVal,
              id_kelas: kelasVal,
              username: usernameInput
            };
          }
        }
      }
      return { success: false, message: "NISN / ID Siswa atau password tidak cocok!" };
    }

    // =========================================================================
    // 2. OTENTIKASI DARI TABEL Users (ADMIN, KEPSEK, GURU SISTEM)
    // =========================================================================
    const uSheet = ss.getSheetByName('Users');
    if (uSheet && uSheet.getLastRow() > 1) {
      const dataU = uSheet.getDataRange().getValues();
      const headersU = dataU[0];
      const idxUser = headersU.indexOf('username');
      const idxPass = headersU.indexOf('password');
      const idxRole = headersU.indexOf('role');
      const idxNama = headersU.indexOf('nama_lengkap');

      for (let i = 1; i < dataU.length; i++) {
        const uVal = String(dataU[i][idxUser] || '').trim();
        const pVal = String(dataU[i][idxPass] || '').trim();
        const rVal = String(dataU[i][idxRole] || '').toLowerCase().trim();
        const nVal = String(dataU[i][idxNama] || '').trim();

        if (uVal === usernameInput && pVal === passwordInput) {
          // Normalisasi nama role
          let resolvedRole = 'admin';
          if (rVal.includes('kepsek') || rVal.includes('kepala')) resolvedRole = 'kepsek';
          else if (rVal.includes('guru') || rVal.includes('pengajar')) resolvedRole = 'guru';
          else if (rVal.includes('admin') || rVal.includes('operator')) resolvedRole = 'admin';
          else resolvedRole = rVal || 'admin';

          // Jika form login mengirim targetRole spesifik, pastikan role sesuai
          if (targetRole && targetRole !== 'guru') {
            if (resolvedRole !== targetRole) {
              return { success: false, message: `Akun ini terdaftar sebagai role '${resolvedRole}', bukan '${targetRole}'.` };
            }
          }

          const idPrefix = resolvedRole.toUpperCase() + '-' + uVal;
          return {
            success: true,
            role: resolvedRole,
            name: nVal || uVal,
            id_guru: idPrefix,
            username: uVal
          };
        }
      }
    }

    // =========================================================================
    // 3. FALLBACK ROLE: KEPSEK (DARI TABEL PengaturanSekolah)
    // =========================================================================
    if (targetRole === 'kepsek' || !targetRole) {
      const pSheet = ss.getSheetByName('PengaturanSekolah');
      if (pSheet && pSheet.getLastRow() > 1) {
        const dataP = pSheet.getDataRange().getValues();
        const headersP = dataP[0];
        const idxNamaKep = headersP.indexOf('nama_kepsek');
        const idxNipKep = headersP.indexOf('nip_kepsek');

        const namaKepsek = String(dataP[1][idxNamaKep] || '').trim();
        const nipKepsek = String(dataP[1][idxNipKep] || '').trim();

        // Login Kepala Sekolah menggunakan NIP
        if (nipKepsek && (usernameInput === nipKepsek || usernameInput.toLowerCase() === 'kepsek') && passwordInput === nipKepsek) {
          return {
            success: true,
            role: 'kepsek',
            name: namaKepsek || 'Kepala Sekolah',
            id_guru: 'KEPSEK-' + nipKepsek,
            username: nipKepsek
          };
        }
      }
    }

    // =========================================================================
    // 4. OTENTIKASI ROLE: GURU (DARI TABEL MasterGuru)
    // =========================================================================
    if (targetRole === 'guru' || !targetRole) {
      const gSheet = ss.getSheetByName('MasterGuru');
      if (gSheet && gSheet.getLastRow() > 1) {
        const dataG = gSheet.getDataRange().getValues();
        const headersG = dataG[0];
        const idxIdGuru = headersG.indexOf('id_guru');
        const idxNamaGuru = headersG.indexOf('nama_guru');
        const idxNip = headersG.indexOf('nip_nik');

        for (let i = 1; i < dataG.length; i++) {
          const idGVal = String(dataG[i][idxIdGuru] || '').trim();
          const namaGVal = String(dataG[i][idxNamaGuru] || '').trim();
          const nipVal = String(dataG[i][idxNip] || '').trim();

          // Guru login menggunakan ID Guru / NIP sebagai username, dan NIP / ID Guru sebagai password
          const matchUser = (idGVal === usernameInput || nipVal === usernameInput);
          const matchPass = (nipVal === passwordInput || (idGVal === usernameInput && passwordInput === idGVal));

          if (matchUser && matchPass) {
            // Deteksi Wali Kelas dari MasterKelas
            const kSheet = ss.getSheetByName('MasterKelas');
            const kelasBinaan = [];
            if (kSheet) {
              const kData = kSheet.getDataRange().getValues();
              const kHeaders = kData[0];
              const idxKlsId = kHeaders.indexOf('id_kelas');
              const idxWali = kHeaders.indexOf('wali_kelas');
              for (let k = 1; k < kData.length; k++) {
                const waliVal = String(kData[k][idxWali] || '').trim();
                if (waliVal === idGVal || waliVal === namaGVal) {
                  kelasBinaan.push(String(kData[k][idxKlsId]));
                }
              }
            }

            // Deteksi Mapel yang Diampu dari MasterMapel
            const mSheet = ss.getSheetByName('MasterMapel');
            const mapelAmpu = [];
            if (mSheet) {
              const mData = mSheet.getDataRange().getValues();
              const mHeaders = mData[0];
              const idxMapelId = mHeaders.indexOf('id_mapel');
              const idxMapelGuru = mHeaders.indexOf('id_guru');
              for (let m = 1; m < mData.length; m++) {
                const guruPengampu = String(mData[m][idxMapelGuru] || '').trim();
                if (guruPengampu === idGVal || guruPengampu === namaGVal) {
                  mapelAmpu.push(String(mData[m][idxMapelId]));
                }
              }
            }

            return {
              success: true,
              role: 'guru',
              name: namaGVal,
              id_guru: idGVal,
              username: idGVal,
              is_wali_kelas: kelasBinaan.length > 0,
              kelas_binaan: kelasBinaan,
              mapel_diampu: mapelAmpu
            };
          }
        }
      }
    }

    return { success: false, message: "Kredensial atau peran (role) tidak valid!" };
  } catch (err) {
    return { success: false, message: "Terjadi kesalahan sistem: " + err.toString() };
  }
}

function getRelationalData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let db = {};
  for (const sheetName of Object.keys(TABLES)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    let data = sheet.getDataRange().getDisplayValues();
    if (data.length <= 1) { db[sheetName] = []; continue; }
    let headers = data.shift();
    db[sheetName] = data.map(row => { let obj = {}; headers.forEach((h, i) => { obj[h] = row[i]; }); return obj; });
  }
  return db;
}

const STATIC_TABLES = [
  'MasterAgama', 'MasterSuku', 'MasterPekerjaan', 'MasterWilayah', 'MasterSekolahAsal',
  'MasterGuru', 'MasterMapel', 'MasterKelas', 'MasterPeriode', 'MasterKategoriPenilaian',
  'MasterBankPengetahuan', 'MasterOrtu', 'MasterWali', 'MasterSiswa', 'PengaturanSekolah',
  'MasterProyek', 'MasterTargetP5', 'MasterMateri', 'MasterMBK'
];

function fetchTableData_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data.shift();
  const timezone = Session.getScriptTimeZone();

  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      if (row[i] instanceof Date) {
        obj[h] = Utilities.formatDate(row[i], timezone, "yyyy-MM-dd");
      } else {
        obj[h] = row[i];
      }
    });
    return obj;
  });
}

function getMasterReferences() {
  let db = {};
  STATIC_TABLES.forEach(tbl => {
    db[tbl] = fetchTableData_(tbl);
  });
  return db;
}

function getDashboardMetrics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    totalSiswa: Math.max(0, (ss.getSheetByName('MasterSiswa')?.getLastRow() || 1) - 1),
    totalGuru: Math.max(0, (ss.getSheetByName('MasterGuru')?.getLastRow() || 1) - 1),
    totalMapel: Math.max(0, (ss.getSheetByName('MasterMapel')?.getLastRow() || 1) - 1),
    totalNilai: Math.max(0, (ss.getSheetByName('TransNilai')?.getLastRow() || 1) - 1),
    totalJurnal: Math.max(0, (ss.getSheetByName('TransJurnal')?.getLastRow() || 1) - 1)
  };
}

/**
 * Dipanggil oleh harian.html, rapor.html, presensi.html, dan jurnal.html.
 * Lazy Loading: Klien mengirimkan ID Kelas & ID Periode, Server memfilter 
 * jutaan baris dan hanya mereturn data yang relevan dengan kelas tersebut.
 */
function getTransactionalDataByContext(id_kelas, id_periode, includeP5 = false) {
  let db = getMasterReferences(); // Tarik metadata dasar

  let allNilai = fetchTableData_('TransNilai');
  db.TransNilai = allNilai.filter(n => String(n.id_kelas) === String(id_kelas) && String(n.id_periode) === String(id_periode));

  let allPresensi = fetchTableData_('TransPresensi');
  db.TransPresensi = allPresensi.filter(p => String(p.id_kelas) === String(id_kelas) && String(p.id_periode) === String(id_periode));

  let allJurnal = fetchTableData_('TransJurnal');
  db.TransJurnal = allJurnal.filter(j => {
    let s = db.MasterSiswa.find(sis => String(sis.id_siswa) === String(j.id_siswa));
    return s && String(s.id_kelas) === String(id_kelas);
  });

  // ---> PEMBARUAN: Penarikan Data TransCatatanWali <---
  let allCatatanWali = fetchTableData_('TransCatatanWali');
  db.TransCatatanWali = allCatatanWali.filter(cw => {
    let s = db.MasterSiswa.find(sis => String(sis.id_siswa) === String(cw.id_siswa));
    return s && String(s.id_kelas) === String(id_kelas) && String(cw.id_periode) === String(id_periode);
  });
  // ----------------------------------------------------

  if (includeP5) {
    let allCatatanP5 = fetchTableData_('TransCatatanP5');
    db.TransCatatanP5 = allCatatanP5.filter(c => {
      let s = db.MasterSiswa.find(sis => String(sis.id_siswa) === String(c.id_siswa));
      return s && String(s.id_kelas) === String(id_kelas);
    });

    let allNilaiP5 = fetchTableData_('TransNilaiP5');
    db.TransNilaiP5 = allNilaiP5.filter(n => String(n.id_kelas) === String(id_kelas) && String(n.id_periode) === String(id_periode));
  }

  return db;
}

function getPaginatedMasterTable(tableName, page = 1, limit = 10, searchQuery = "", sortCol = "", sortAsc = true, schema = null) {
  let records = fetchTableData_(tableName);

  let relatedData = {};
  if (schema && schema.fields) {
    schema.fields.forEach(f => {
      if (f.src && !relatedData[f.src]) {
        relatedData[f.src] = fetchTableData_(f.src);
      }
    });
  }

  const getRealValue = (row, fieldDef) => {
    let val = row[fieldDef.n];
    if (fieldDef.src && relatedData[fieldDef.src]) {
      let found = relatedData[fieldDef.src].find(x => String(x[fieldDef.v]) === String(val));
      if (found) return found[fieldDef.txt];
    }
    return val;
  };

  if (searchQuery) {
    let q = searchQuery.toLowerCase();
    records = records.filter(r => {
      if (schema) {
        return schema.fields.some(f => {
          if (f.t.startsWith('virtual')) return false;
          let val = getRealValue(r, f);
          return String(val).toLowerCase().includes(q);
        });
      } else {
        return Object.values(r).some(val => String(val).toLowerCase().includes(q));
      }
    });
  }

  if (sortCol) {
    let fieldDef = schema ? schema.fields.find(f => f.n === sortCol) : null;
    if (sortCol === 'stnkm_badge') {
      let prf = tableName === 'MasterBankPengetahuan' ? 'base_' : 'mat_';
      records.sort((a, b) => {
        let sumA = (parseFloat(a[prf + 'S']) || 0) + (parseFloat(a[prf + 'T']) || 0) + (parseFloat(a[prf + 'N']) || 0) + (parseFloat(a[prf + 'K']) || 0) + (parseFloat(a[prf + 'M']) || 0);
        let sumB = (parseFloat(b[prf + 'S']) || 0) + (parseFloat(b[prf + 'T']) || 0) + (parseFloat(b[prf + 'N']) || 0) + (parseFloat(b[prf + 'K']) || 0) + (parseFloat(b[prf + 'M']) || 0);
        if (sumA < sumB) return sortAsc ? -1 : 1;
        if (sumA > sumB) return sortAsc ? 1 : -1;
        return 0;
      });
    } else {
      records.sort((a, b) => {
        let valA = fieldDef ? getRealValue(a, fieldDef) : a[sortCol];
        let valB = fieldDef ? getRealValue(b, fieldDef) : b[sortCol];

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (!isNaN(valA) && !isNaN(valB) && valA !== "" && valB !== "") {
          valA = Number(valA); valB = Number(valB);
        } else {
          valA = String(valA).toLowerCase(); valB = String(valB).toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }
  }

  let totalRecords = records.length;
  let start = (page - 1) * limit;
  let paginatedData = records.slice(start, start + limit);

  return {
    data: paginatedData,
    totalRows: totalRecords,
    totalPages: Math.ceil(totalRecords / limit) || 1,
    currentPage: page
  };
}

function getExportMasterData(tableName, searchQuery = "", sortCol = "", sortAsc = true, schema = null) {
  return getPaginatedMasterTable(tableName, 1, 999999, searchQuery, sortCol, sortAsc, schema).data;
}

function getDashboardChartData() {
  const db = getMasterReferences();
  const allNilai = fetchTableData_('TransNilai').filter(n => n.tanggal && !isNaN(Number(n.nilai)));

  allNilai.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  let dMapel = {}, dJenis = {}, dSuku = {}, dBulan = {}, dMinggu = {};
  let dBulanMapel = {}, dMingguMapel = {}, allMapel = new Set(), allBulan = new Set(), allMinggu = new Set();

  allNilai.forEach(n => {
    let nilai = Number(n.nilai);
    let nmMapel = (db.MasterMapel || []).find(m => String(m.id_mapel) === String(n.id_mapel))?.nama_mapel || n.id_mapel;
    let nmJenis = (db.MasterMBK || []).find(j => String(j.id_jenis) === String(n.id_jenis))?.kategori_penilaian || n.id_jenis;
    let siswa = (db.MasterSiswa || []).find(s => String(s.id_siswa) === String(n.id_siswa));
    let suku = (siswa && siswa.suku) ? siswa.suku : 'Lainnya';

    allMapel.add(nmMapel);

    if (!dMapel[nmMapel]) dMapel[nmMapel] = { sum: 0, count: 0 };
    dMapel[nmMapel].sum += nilai; dMapel[nmMapel].count++;

    if (!dJenis[nmJenis]) dJenis[nmJenis] = { sum: 0, count: 0 };
    dJenis[nmJenis].sum += nilai; dJenis[nmJenis].count++;

    if (!dSuku[suku]) dSuku[suku] = { sum: 0, count: 0 };
    dSuku[suku].sum += nilai; dSuku[suku].count++;

    let d = new Date(n.tanggal);
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    let blnLabel = months[d.getMonth()] + ' ' + d.getFullYear();
    let pekanKe = Math.ceil(d.getDate() / 7);
    let mggLabel = `Mg ${pekanKe} ${blnLabel}`;

    allBulan.add(blnLabel);
    allMinggu.add(mggLabel);

    if (!dBulan[blnLabel]) dBulan[blnLabel] = { sum: 0, count: 0 };
    dBulan[blnLabel].sum += nilai; dBulan[blnLabel].count++;

    if (!dMinggu[mggLabel]) dMinggu[mggLabel] = { sum: 0, count: 0 };
    dMinggu[mggLabel].sum += nilai; dMinggu[mggLabel].count++;

    if (!dBulanMapel[blnLabel]) dBulanMapel[blnLabel] = {};
    if (!dBulanMapel[blnLabel][nmMapel]) dBulanMapel[blnLabel][nmMapel] = { sum: 0, count: 0 };
    dBulanMapel[blnLabel][nmMapel].sum += nilai; dBulanMapel[blnLabel][nmMapel].count++;

    if (!dMingguMapel[mggLabel]) dMingguMapel[mggLabel] = {};
    if (!dMingguMapel[mggLabel][nmMapel]) dMingguMapel[mggLabel][nmMapel] = { sum: 0, count: 0 };
    dMingguMapel[mggLabel][nmMapel].sum += nilai; dMingguMapel[mggLabel][nmMapel].count++;
  });

  const calcAvg = (obj) => {
    let res = {};
    for (let k in obj) res[k] = parseFloat((obj[k].sum / obj[k].count).toFixed(1));
    return res;
  };

  const calcLineAvg = (timeObj) => {
    let res = {};
    for (let time in timeObj) {
      res[time] = {};
      for (let m in timeObj[time]) {
        res[time][m] = parseFloat((timeObj[time][m].sum / timeObj[time][m].count).toFixed(1));
      }
    }
    return res;
  };

  return {
    barMapel: calcAvg(dMapel),
    barJenis: calcAvg(dJenis),
    barSuku: calcAvg(dSuku),
    barBulan: calcAvg(dBulan),
    barMinggu: calcAvg(dMinggu),
    lineLabelsBulan: Array.from(allBulan),
    lineLabelsMinggu: Array.from(allMinggu),
    mapels: Array.from(allMapel),
    lineBulan: calcLineAvg(dBulanMapel),
    lineMinggu: calcLineAvg(dMingguMapel)
  };
}

function saveMasterData(sheetName, record, idField, oldId) {
  try {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    let data = sheet.getDataRange().getValues();
    let headers = data[0];
    let rowIndex = -1;
    let targetId = oldId ? oldId : record[idField];

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][headers.indexOf(idField)]) === String(targetId)) {
        rowIndex = i + 1; break;
      }
    }

    if (!record[idField] || record[idField].toString().trim() === "") {
      let prefix = sheetName.replace('Master', '').replace('Trans', '').substring(0, 3).toUpperCase();
      if (!prefix) prefix = "ID";
      record[idField] = prefix + "-" + new Date().getTime() + "-" + Math.floor(Math.random() * 100);
    }

    if (headers.includes('timestamp_simpan')) {
      record['timestamp_simpan'] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    }

    let rowData = headers.map(h => record[h] !== undefined ? record[h] : "");

    if (rowIndex !== -1) {
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
      return { success: true, message: "Data berhasil diperbarui!" };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: "Data berhasil ditambahkan!" };
    }
  } catch (err) { return { success: false, message: err.toString() }; }
}

// ==============================================================================
// BLOK PERBAIKAN: FUNGSI DELETE MASTER DATA YANG LEBIH TANGGUH
// ==============================================================================
function deleteMasterData(sheetName, idValue, idField) {
  try {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return { success: false, message: "Tabel " + sheetName + " tidak ditemukan." };

    let data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: "Tabel kosong." };

    let headers = data[0];

    // PERBAIKAN: Pencarian Index Kolom yang lebih tahan banting (Case-Insensitive & Trim)
    let colIndex = -1;
    for (let h = 0; h < headers.length; h++) {
      if (String(headers[h]).trim().toLowerCase() === String(idField).trim().toLowerCase()) {
        colIndex = h;
        break;
      }
    }

    if (colIndex === -1) {
      return { success: false, message: "Kolom ID (" + idField + ") tidak ditemukan di tabel." };
    }

    // Melakukan pencarian dari baris terbawah ke atas untuk menghindari pergeseran index saat baris dihapus
    let deletedCount = 0;
    for (let i = data.length - 1; i > 0; i--) {
      // PERBAIKAN: Pencocokan Nilai yang lebih tahan banting
      if (String(data[i][colIndex]).trim() === String(idValue).trim()) {
        sheet.deleteRow(i + 1);
        deletedCount++;
        // Asumsi ID unik, hentikan loop jika sudah ketemu 1. 
        // Jika ada duplikasi, hapus 'break' agar semua duplikasi terhapus.
        break;
      }
    }

    if (deletedCount > 0) {
      return { success: true, message: "Data berhasil dihapus." };
    } else {
      return { success: false, message: "ID '" + idValue + "' tidak ditemukan di database." };
    }

  } catch (err) {
    return { success: false, message: "Kesalahan Sistem: " + err.toString() };
  }
}

// ==============================================================================
// BLOK PERBAIKAN: FUNGSI MENGHAPUS JURNAL
// ==============================================================================
function deleteJurnalDanLampiran(id_jurnal, lampiran_url) {
  try {
    // 1. Eksekusi hapus file dari Google Drive (Jika ada)
    if (lampiran_url && lampiran_url.includes('drive.google.com')) {
      var fileIdMatch = lampiran_url.match(/[-\w]{25,}/); // Deteksi ID File Drive
      if (fileIdMatch && fileIdMatch[0]) {
        try {
          DriveApp.getFileById(fileIdMatch[0]).setTrashed(true); // Buang ke Trash
        } catch (e) {
          Logger.log("Gagal hapus file drive: " + e.message);
          // Abaikan jika file sudah tidak ada (sudah terhapus manual sebelumnya)
        }
      }
    }

    // 2. Eksekusi hapus data teks di Spreadsheet
    // (Memanggil deleteMasterData yang sudah kita perkuat di atas)
    return deleteMasterData('TransJurnal', id_jurnal, 'id_jurnal');

  } catch (e) {
    return { success: false, message: e.message };
  }
}



function saveRekapBatch(records) {
  try {
    if (!records || records.length === 0) return { success: false, message: "Tidak ada data untuk disimpan." };

    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RekapRaporAkhir');
    let data = sheet.getDataRange().getValues();
    let headers = data[0];

    let idSiswa = records[0].id_siswa;
    let idPeriode = records[0].id_periode;

    for (let i = data.length - 1; i > 0; i--) {
      if (String(data[i][1]) === String(idSiswa) && String(data[i][2]) === String(idPeriode)) {
        sheet.deleteRow(i + 1);
      }
    }

    let timeNow = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

    records.forEach(rec => {
      rec.id_rekap = "RAP-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      rec.timestamp_simpan = timeNow;

      let rowData = headers.map(h => rec[h] !== undefined ? rec[h] : "");
      sheet.appendRow(rowData);
    });

    return { success: true, message: "Nilai Rapor berhasil disimpan permanen di Database!" };
  } catch (err) { return { success: false, message: err.toString() }; }
}

function savePresensiBatch(records) {
  try {
    if (!records || records.length === 0) return { success: false, message: "Tidak ada data presensi." };

    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TransPresensi');
    let data = sheet.getDataRange().getValues();
    let headers = data[0];
    let idIndex = headers.indexOf('id_presensi');

    let timeNow = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

    records.forEach(rec => {
      let rowIndex = -1;

      if (rec.id_presensi) {
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][idIndex]) === String(rec.id_presensi)) { rowIndex = i + 1; break; }
        }
      } else {
        rec.id_presensi = "PRS-" + new Date().getTime() + "-" + Math.floor(Math.random() * 10000);
      }

      rec.timestamp_simpan = timeNow;
      let rowData = headers.map(h => rec[h] !== undefined ? rec[h] : "");

      if (rowIndex !== -1) {
        sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    });

    return { success: true, message: "Presensi kelas berhasil disimpan!" };
  } catch (err) { return { success: false, message: err.toString() }; }
}

function saveNilaiBatch(records) {
  try {
    if (!records || records.length === 0) return { success: false, message: 'Tidak ada data nilai yang dikirim.' };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetTrans = ss.getSheetByName('TransNilai');
    const sheetJenis = ss.getSheetByName('MasterKategoriPenilaian');
    const sheetMateri = ss.getSheetByName('MasterMateri');

    if (!sheetTrans || !sheetJenis || !sheetMateri) throw new Error("Database tabel tidak lengkap.");

    let meta = records[0];

    let dataJenis = sheetJenis.getDataRange().getValues();
    let headJenis = dataJenis[0];
    let recJenis = dataJenis.slice(1).find(r => String(r[headJenis.indexOf('id_kategori')]) === String(meta.id_jenis));

    let j_S = recJenis ? parseFloat(recJenis[headJenis.indexOf('mat_S')]) : 1.0;
    let j_T = recJenis ? parseFloat(recJenis[headJenis.indexOf('mat_T')]) : 1.0;
    let j_N = recJenis ? parseFloat(recJenis[headJenis.indexOf('mat_N')]) : 1.0;
    let j_K = recJenis ? parseFloat(recJenis[headJenis.indexOf('mat_K')]) : 1.0;
    let j_M = recJenis ? parseFloat(recJenis[headJenis.indexOf('mat_M')]) : 1.0;

    let dataMateri = sheetMateri.getDataRange().getValues();
    let headMateri = dataMateri[0];
    let recMateri = dataMateri.slice(1).find(r => String(r[headMateri.indexOf('id_materi')]) === String(meta.id_materi));

    let m_S = recMateri ? parseFloat(recMateri[headMateri.indexOf('mat_S')]) : 1.0;
    let m_T = recMateri ? parseFloat(recMateri[headMateri.indexOf('mat_T')]) : 1.0;
    let m_N = recMateri ? parseFloat(recMateri[headMateri.indexOf('mat_N')]) : 1.0;
    let m_K = recMateri ? parseFloat(recMateri[headMateri.indexOf('mat_K')]) : 1.0;
    let m_M = recMateri ? parseFloat(recMateri[headMateri.indexOf('mat_M')]) : 1.0;

    const transData = sheetTrans.getDataRange().getValues();
    const transHeaders = transData[0];
    let timestamp = new Date().toISOString();

    records.forEach(g => {
      if (g.nilai === "" || g.nilai === null) return;

      let nilaiMentah = parseFloat(g.nilai);

      let poin_S = (nilaiMentah * j_S * m_S).toFixed(2);
      let poin_T = (nilaiMentah * j_T * m_T).toFixed(2);
      let poin_N = (nilaiMentah * j_N * m_N).toFixed(2);
      let poin_K = (nilaiMentah * j_K * m_K).toFixed(2);
      let poin_M = (nilaiMentah * j_M * m_M).toFixed(2);

      let rowData = transHeaders.map(h => {
        if (h === 'id_nilai') return g.id_nilai || 'NIL-' + Utilities.getUuid();
        if (h === 'tanggal') return g.tanggal;
        if (h === 'id_siswa') return g.id_siswa;
        if (h === 'id_mapel') return g.id_mapel;
        if (h === 'id_guru') return g.id_guru;
        if (h === 'id_periode') return g.id_periode;
        if (h === 'id_jenis') return g.id_jenis;
        if (h === 'id_materi') return g.id_materi;
        if (h === 'id_kelas') return g.id_kelas;
        if (h === 'nilai') return nilaiMentah;
        if (h === 'timestamp_simpan') return timestamp;

        if (h === 'poin_S') return poin_S;
        if (h === 'poin_T') return poin_T;
        if (h === 'poin_N') return poin_N;
        if (h === 'poin_K') return poin_K;
        if (h === 'poin_M') return poin_M;

        return "";
      });

      if (g.id_nilai) {
        let rowIndex = transData.findIndex(r => String(r[0]) === String(g.id_nilai));
        if (rowIndex > -1) {
          sheetTrans.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
          return;
        }
      }

      sheetTrans.appendRow(rowData);
    });

    return { success: true, message: 'Nilai dan Poin Matriks berhasil diekstraksi & disimpan.' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function saveCatatanP5Batch(records) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('TransCatatanP5');
    let data = sheet.getDataRange().getValues();

    let timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

    records.forEach(rec => {
      let isUpdate = false;
      if (rec.id_catatan_p5) {
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] == rec.id_catatan_p5) {
            sheet.getRange(i + 1, 4).setValue(rec.catatan_proses);
            sheet.getRange(i + 1, 5).setValue(timestamp);
            isUpdate = true;
            break;
          }
        }
      }

      if (!isUpdate && rec.catatan_proses.trim() !== "") {
        let newId = "CP5-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
        sheet.appendRow([newId, rec.id_siswa, rec.id_proyek, rec.catatan_proses, timestamp]);
      }
    });

    return { success: true, message: "Catatan Proses P5 berhasil disimpan!" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function saveBankPengetahuan(dataObj) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('MasterBankPengetahuan');
    if (!sheet) return { success: false, message: 'Sheet MasterBankPengetahuan tidak ditemukan.' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(dataObj.id_bank)) {
        rowIndex = i + 1;
        break;
      }
    }

    let rowData = headers.map(header => {
      return dataObj.hasOwnProperty(header) ? dataObj[header] : "";
    });

    if (rowIndex > -1) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return { success: true, message: 'Data Bank Pengetahuan berhasil disimpan.' };

  } catch (e) {
    return { success: false, message: e.message };
  }
}

function kalkulasiOtomatisP5(id_periode, id_kelas, id_proyek) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const db = getRelationalData();

    let targetList = (db.MasterTargetP5 || []).filter(t => String(t.id_proyek) === String(id_proyek));
    let siswaList = (db.MasterSiswa || []).filter(s => String(s.id_kelas) === String(id_kelas));
    let nilaiAkademik = (db.TransNilai || []).filter(n => String(n.id_periode) === String(id_periode) && String(n.id_kelas) === String(id_kelas));

    if (targetList.length === 0) return { success: false, message: 'Belum ada target P5 yang didefinisikan untuk proyek ini.' };
    if (siswaList.length === 0) return { success: false, message: 'Tidak ada siswa di kelas ini.' };

    const sheetNilaiP5 = ss.getSheetByName('TransNilaiP5');
    if (!sheetNilaiP5) throw new Error("Sheet TransNilaiP5 tidak ditemukan.");

    const p5Data = sheetNilaiP5.getDataRange().getValues();
    const p5Headers = p5Data[0];
    let timestamp = new Date().toISOString();

    let recordsProcessed = 0;

    siswaList.forEach(siswa => {
      let riwayatSiswa = nilaiAkademik.filter(n => String(n.id_siswa) === String(siswa.id_siswa));

      targetList.forEach(target => {

        let relasiString = target.relasi_stnkm || "";
        let relasiArray = relasiString.split(',').map(s => s.trim()).filter(s => s !== "");

        let skorRata2 = 0;
        let predikat = 'BB';

        if (relasiArray.length > 0 && riwayatSiswa.length > 0) {
          let totalPoin = 0;
          let countValid = 0;

          riwayatSiswa.forEach(n => {
            relasiArray.forEach(rel => {
              let poin = parseFloat(n[rel]);
              if (!isNaN(poin)) {
                totalPoin += poin;
                countValid++;
              }
            });
          });

          if (countValid > 0) {
            skorRata2 = parseFloat((totalPoin / countValid).toFixed(2));
          }
        }

        if (skorRata2 >= 90) predikat = 'SB';
        else if (skorRata2 >= 75) predikat = 'BSH';
        else if (skorRata2 >= 60) predikat = 'MB';
        else predikat = 'BB';

        let rowData = p5Headers.map(h => {
          if (h === 'id_nilaip5') return 'P5-' + Utilities.getUuid();
          if (h === 'id_periode') return id_periode;
          if (h === 'id_kelas') return id_kelas;
          if (h === 'id_proyek') return id_proyek;
          if (h === 'id_siswa') return siswa.id_siswa;
          if (h === 'id_target') return target.id_target;
          if (h === 'skor_rata2') return skorRata2;
          if (h === 'predikat') return predikat;
          if (h === 'timestamp_simpan') return timestamp;
          return "";
        });

        let existingIndex = p5Data.findIndex(r =>
          String(r[p5Headers.indexOf('id_proyek')]) === String(id_proyek) &&
          String(r[p5Headers.indexOf('id_siswa')]) === String(siswa.id_siswa) &&
          String(r[p5Headers.indexOf('id_target')]) === String(target.id_target)
        );

        if (existingIndex > 0) {
          rowData[p5Headers.indexOf('id_nilaip5')] = p5Data[existingIndex][0];
          sheetNilaiP5.getRange(existingIndex + 1, 1, 1, rowData.length).setValues([rowData]);
        } else {
          sheetNilaiP5.appendRow(rowData);
          p5Data.push(rowData);
        }

        recordsProcessed++;
      });
    });

    return { success: true, message: `Berhasil mengekstrak ${recordsProcessed} nilai predikat P5 secara otomatis.` };
  } catch (e) {
    return { success: false, message: 'Gagal kalkulasi P5: ' + e.message };
  }
}

function uploadFileToDrive(base64Data, fileName, mimeType) {
  try {
    let folderName = "Lampiran_Jurnal_EduRapor";
    let folders = DriveApp.getFoldersByName(folderName);
    let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    let data = Utilities.base64Decode(base64Data);
    let blob = Utilities.newBlob(data, mimeType, fileName);
    let file = folder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return { success: true, url: file.getUrl() };
  } catch (e) {
    return { success: false, message: 'Gagal mengunggah lampiran: ' + e.toString() };
  }
}

// ==============================================================================
// BLOK 1: MESIN AI - ANALISIS JURNAL DENGAN QWEN
// ==============================================================================
function analyzeJurnalWithQwen(narasi) {
  try {
    let apiKey = PropertiesService.getScriptProperties().getProperty("OPENROUTER_API_KEY");

    if (!apiKey || apiKey.trim() === "") {
      return { success: false, message: "API Key OpenRouter belum dikonfigurasi di Script Properties." };
    }

    const url = "https://openrouter.ai/api/v1/chat/completions";
    const systemPrompt = `Anda adalah sistem NLP analisis perilaku siswa untuk EduRapor. Tugas Anda adalah menganalisis narasi kejadian/perilaku siswa dan memberikan poin numerik untuk 5 dimensi STNKM:
    - S (Skill/Praktik/Kecakapan Teknis)
    - T (Teori/Konsep Akademis)
    - N (Nalar/Analisis/Problem Solving)
    - K (Karakter/Etika/Sikap/Disiplin)
    - M (Minat/Antusiasme/Eksplorasi)

    Aturan Penilaian:
    1. Rentang skor berkisar antara -5.0 sampai +5.0.
    2. Perilaku positif berikan nilai positif (+1.0 s/d +5.0).
    3. Perilaku negatif / pelanggaran berikan nilai negatif (-1.0 s/d -5.0).
    4. Jika tidak ada indikasi pada dimensi tertentu, beri nilai 0.
    5. WAJIB merespons HANYA dalam format JSON murni tanpa teks/markdown tambahan:
    {"S": 0, "T": 0, "N": 0, "K": 0, "M": 0}`;

    const payload = {
      "model": "qwen/qwen3.8-27b-20260814:free",
      "messages": [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": "Analisis narasi berikut:\n\"" + narasi + "\"" }
      ],
      "response_format": { "type": "json_object" }
    };

    const options = {
      "method": "post",
      "contentType": "application/json",
      "headers": {
        "Authorization": "Bearer " + apiKey,
        "HTTP-Referer": "https://edurapor.app",
        "X-Title": "EduRapor"
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    const response = UrlFetchApp.fetch(url, options);
    const resCode = response.getResponseCode();
    const resText = response.getContentText();

    if (resCode !== 200) {
      if (resText.includes("429") || resText.includes("rate-limited")) {
        return { success: false, message: "Server AI Qwen (Gratis) sedang penuh/sibuk. Sistem akan otomatis beralih ke Mode Lokal." };
      }
      return { success: false, message: "HTTP Error " + resCode + ": " + resText };
    }

    const json = JSON.parse(resText);
    if (json.choices && json.choices.length > 0) {
      let content = json.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsedData = JSON.parse(content);
      return {
        success: true,
        data: {
          S: parseFloat(parsedData.S) || 0, T: parseFloat(parsedData.T) || 0,
          N: parseFloat(parsedData.N) || 0, K: parseFloat(parsedData.K) || 0,
          M: parseFloat(parsedData.M) || 0
        }
      };
    } else {
      return { success: false, message: "Respon AI kosong atau format tidak valid." };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}
// ==============================================================================
// BLOK 1-D: MESIN AI - ANALISIS JURNAL DENGAN DEEPSEEK
// ==============================================================================
function analyzeJurnalWithDeepSeek(narasi) {
  try {
    // 1. Ambil API Key dari Script Properties
    let apiKey = PropertiesService.getScriptProperties().getProperty("DEEPSEEK_API_KEY");

    if (!apiKey || apiKey.trim() === "") {
      return { success: false, message: "API Key DeepSeek belum dikonfigurasi di Script Properties." };
    }

    // 2. Tentukan Endpoint dan Model
    const url = "https://api.deepseek.com/chat/completions";
    // Gunakan 'deepseek-flash' untuk model yang lebih cepat/ekonomis,
    // atau 'deepseek-v4-pro' untuk model yang lebih canggih.
    const modelName = "deepseek-v4-pro"; 

    // 3. Susun Prompt (dapat disesuaikan)
    const systemPrompt = `Anda adalah sistem NLP analisis perilaku siswa untuk EduRapor. Tugas Anda adalah menganalisis narasi kejadian/perilaku siswa dan memberikan poin numerik untuk 5 dimensi STNKM:
    - S (Skill/Praktik/Kecakapan Teknis)
    - T (Teori/Konsep Akademis)
    - N (Nalar/Analisis/Problem Solving)
    - K (Karakter/Etika/Sikap/Disiplin)
    - M (Minat/Antusiasme/Eksplorasi)

    Aturan Penilaian:
    1. Rentang skor berkisar antara -5.0 sampai +5.0.
    2. Perilaku positif berikan nilai positif (+1.0 s/d +5.0).
    3. Perilaku negatif / pelanggaran berikan nilai negatif (-1.0 s/d -5.0).
    4. Jika tidak ada indikasi pada dimensi tertentu, beri nilai 0.
    5. WAJIB merespons HANYA dalam format JSON murni tanpa teks/markdown tambahan:
    {"S": 0, "T": 0, "N": 0, "K": 0, "M": 0}`;

    // 4. Susun Payload (sesuai format OpenAI-compatible)
    const payload = {
      "model": modelName,
      "messages": [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": "Analisis narasi berikut:\n\"" + narasi + "\"" }
      ],
      // Aktifkan JSON Output untuk memastikan respons terstruktur
      "response_format": { "type": "json_object" },
      // Atur max_tokens agar cukup untuk output JSON
      "max_tokens": 500 
    };

    // 5. Konfigurasi Permintaan HTTP
    const options = {
      "method": "post",
      "contentType": "application/json",
      "headers": {
        "Authorization": "Bearer " + apiKey
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    // 6. Eksekusi Permintaan
    const response = UrlFetchApp.fetch(url, options);
    const resCode = response.getResponseCode();
    const resText = response.getContentText();

    // 7. Penanganan Error (termasuk Rate Limit 429)
    if (resCode !== 200) {
      if (resCode === 429) {
         return { success: false, message: "Batas konkurensi DeepSeek tercapai. Sistem akan beralih ke Mode Lokal." };
      }
      return { success: false, message: "HTTP Error " + resCode + ": " + resText };
    }

    // 8. Parsing Respons
    const json = JSON.parse(resText);
    if (json.choices && json.choices.length > 0) {
      // Bersihkan potensi pembungkus markdown (meskipun JSON mode seharusnya murni)
      let content = json.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsedData = JSON.parse(content);
      return {
        success: true,
        data: {
          S: parseFloat(parsedData.S) || 0, T: parseFloat(parsedData.T) || 0,
          N: parseFloat(parsedData.N) || 0, K: parseFloat(parsedData.K) || 0,
          M: parseFloat(parsedData.M) || 0
        }
      };
    } else {
      return { success: false, message: "Respon AI kosong atau format tidak valid." };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// ==============================================================================
// BLOK 1-B: MESIN AI - ANALISIS JURNAL DENGAN CLAUDE
// ==============================================================================
function analyzeJurnalWithClaude(narasi) {
  try {
    let apiKey = PropertiesService.getScriptProperties().getProperty("CLAUDE_API_KEY");
    if (!apiKey) return { success: false, message: "API Key Claude belum dikonfigurasi di Script Properties." };

    const url = "https://api.anthropic.com/v1/messages";
    const systemPrompt = `Anda adalah sistem NLP analisis perilaku siswa untuk EduRapor. Tugas Anda adalah menganalisis narasi kejadian/perilaku siswa dan memberikan poin numerik untuk 5 dimensi STNKM:
    - S (Skill/Praktik/Kecakapan Teknis)
    - T (Teori/Konsep Akademis)
    - N (Nalar/Analisis/Problem Solving)
    - K (Karakter/Etika/Sikap/Disiplin)
    - M (Minat/Antusiasme/Eksplorasi)

    Aturan Penilaian:
    1. Rentang skor berkisar antara -5.0 sampai +5.0.
    2. Perilaku positif berikan nilai positif (+1.0 s/d +5.0).
    3. Perilaku negatif / pelanggaran berikan nilai negatif (-1.0 s/d -5.0).
    4. Jika tidak ada indikasi pada dimensi tertentu, beri nilai 0.
    5. WAJIB merespons HANYA dalam format JSON murni tanpa teks/markdown tambahan:
    {"S": 0, "T": 0, "N": 0, "K": 0, "M": 0}`;

    const payload = {
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 1024,
      "system": systemPrompt,
      "messages": [
        { "role": "user", "content": "Analisis narasi berikut:\n\"" + narasi + "\"" }
      ]
    };

    const options = {
      "method": "post",
      "contentType": "application/json",
      "headers": {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      return { success: false, message: "HTTP Error " + response.getResponseCode() + ": " + response.getContentText() };
    }

    const json = JSON.parse(response.getContentText());
    if (json.content && json.content.length > 0) {
      let content = json.content[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsedData = JSON.parse(content);
      return {
        success: true,
        data: {
          S: parseFloat(parsedData.S) || 0, T: parseFloat(parsedData.T) || 0,
          N: parseFloat(parsedData.N) || 0, K: parseFloat(parsedData.K) || 0,
          M: parseFloat(parsedData.M) || 0
        }
      };
    } else {
      return { success: false, message: "Respon AI kosong atau format tidak valid." };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// ==============================================================================
// BLOK 1-C: MESIN AI - ANALISIS JURNAL DENGAN GEMINI
// ==============================================================================
function analyzeJurnalWithGemini(narasi) {
  const db = getRelationalData();
  let settings = (db.PengaturanSekolah && db.PengaturanSekolah.length > 0) ? db.PengaturanSekolah[0] : {};
  let propertyKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  let apiKey = propertyKey || settings.api_key_gemini;
  let modelName = settings.ai_model_name || "gemini-1.5-flash";

  if (!apiKey || apiKey.trim() === "") {
    return { success: false, message: "Kunci API kosong di Pengaturan Sekolah. Beralih ke mode Heuristik Lokal." };
  }

  let url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

  let prompt = `Anda adalah ahli psikologi pendidikan dan penyusun Kurikulum Pengkajian Budaya Papua dan Modernisasi Berbasis Aset (Manusia, Budaya dan Alam). Tugas Anda adalah menganalisis catatan observasi/anekdotal guru terhadap siswa dan mengevaluasi dampaknya ke dalam Matriks STNKM dengan skala nilai float dari -5.0 (Sangat Negatif) hingga 5.0 (Sangat Positif). Berikan nilai 0.0 jika aspek tidak relevan.
  ### ACUAN MATRIKS STNKM:
  1. S (Skill / Keterampilan): Penguasaan keterampilan teknis, pembuatan karya/produk, praktik langsung, serta kecintaan pada kehidupan, pelestarian alam, dan kearifan budaya Papua.
  2. T (Teori / Konsep): Pemahaman konsep akademik dasar (Matematika, Bahasa, Algoritma/Komputer, Sains, serta literasi).
  3. N (Nalar / Berpikir Kritis): Kemampuan pemecahan masalah (problem solving), analisis situasi, evaluasi, serta penyampaian gagasan/ide kreatif.
  4. K (Karakter / Etika): Sikap, kedisiplinan, kejujuran, integritas, tanggung jawab, pengendalian emosi, toleransi, kepemimpinan, dan gotong-royong.
  5. M (Keberminatan / Motivasi): Antusiasme, rasa ingin tahu (curiosity), inisiatif mandiri, ketekunan, dan ketertarikan pada topik/aktivitas.
  ### PANDUAN EVALUASI KONTEKSTUAL:
  - Pahami narasi dalam konteks bahasa guru sehari-hari, termasuk teks bertele-tele, gaya chat WhatsApp, singkatan, bahasa gaul, maupun typo.
  - Jika terdapat dinamika konflik (misal: dari berkelahi lalu berdamai/meminta maaf), hitung dampak secara komprehensif.
  ### FORMAT KELUARAN:
  Kembalikan HANYA teks JSON valid tanpa pembungkus markdown (tanpa json ... ) dan tanpa kalimat pengantar/penutup apa pun.
  Gunakan struktur persis berikut:
  {"S": 0.0, "T": 0.0, "N": 0.0, "K": 0.0, "M": 0.0}
  Catatan Guru: "${narasi}"`;

  let payload = {
    "contents": [{ "parts": [{ "text": prompt }] }],
    "generationConfig": { "temperature": 0.1 }
  };

  let options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    let response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      return { success: false, message: "Koneksi API ditolak/bermasalah. Otomatis beralih ke mode Heuristik Offline." };
    }
    let json = JSON.parse(response.getContentText());
    let textRes = json.candidates[0].content.parts[0].text.trim();
    textRes = textRes.replace(/^```json/g, "").replace(/```$/g, "").trim();
    let result = JSON.parse(textRes);
    return { success: true, data: result };
  } catch (e) {
    return { success: false, message: "Gagal memproses data AI. Mengabaikan API dan beralih ke mode Heuristik Lokal." };
  }
}

// ==============================================================================
// BLOK 1-D: MESIN AI - ANALISIS JURNAL DENGAN OPENKEY
// ==============================================================================
function analyzeJurnalWithOpenkey(narasi) {
  try {
    // 1. Ambil API Key dari Script Properties
    let apiKey = PropertiesService.getScriptProperties().getProperty("OPENKEY_API_KEY");

    if (!apiKey || apiKey.trim() === "") {
      return { success: false, message: "API Key OPenkey belum dikonfigurasi di Script Properties." };
    }

    // 2. Tentukan Endpoint dan Model
    const url = "https://open.api-github.com/v1/chat/completions";
    // Gunakan 'gpt-4o' untuk model yang lebih cepat/ekonomis,
    // atau model lain untuk model yang lebih canggih.
    const modelName = "gpt-5.4-mini"; //gpt-40; claude-sonnet-5

    // 3. Susun Prompt (dapat disesuaikan)
    const systemPrompt = `Anda adalah sistem NLP (Natural Language Processor) analisis perilaku siswa untuk EduRapor. Tugas Anda adalah menganalisis narasi kejadian/perilaku siswa dan memberikan poin numerik untuk 5 dimensi STNKM:
    - S (Skill/Praktik/Kecakapan Teknis)
    - T (Teori/Konsep Akademis)
    - N (Nalar/Analisis/Problem Solving)
    - K (Karakter/Etika/Sikap/Disiplin)
    - M (Minat/Antusiasme/Eksplorasi)

    Aturan Penilaian:
    1. Rentang skor berkisar antara -5.0 sampai +5.0.
    2. Perilaku positif berikan nilai positif (+1.0 s/d +5.0).
    3. Perilaku negatif / pelanggaran berikan nilai negatif (-1.0 s/d -5.0).
    4. Jika tidak ada indikasi pada dimensi tertentu, beri nilai 0.
    5. WAJIB merespons HANYA dalam format JSON murni tanpa teks/markdown tambahan:
    {"S": 0, "T": 0, "N": 0, "K": 0, "M": 0}`;

    // 4. Susun Payload (sesuai format OpenAI-compatible)
    const payload = {
      "model": modelName,
      "messages": [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": "Analisis narasi berikut:\n\"" + narasi + "\"" }
      ],
      // Aktifkan JSON Output untuk memastikan respons terstruktur
      "response_format": { "type": "json_object" },
      // Atur max_tokens agar cukup untuk output JSON
      "max_tokens": 500 
    };

    // 5. Konfigurasi Permintaan HTTP
    const options = {
      "method": "post",
      "contentType": "application/json",
      "headers": {
        "Authorization": "Bearer " + apiKey
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    // 6. Eksekusi Permintaan
    const response = UrlFetchApp.fetch(url, options);
    const resCode = response.getResponseCode();
    const resText = response.getContentText();

    // 7. Penanganan Error (termasuk Rate Limit 429)
    if (resCode !== 200) {
      if (resCode === 429) {
         return { success: false, message: "Batas konkurensi OpenKey tercapai. Sistem akan beralih ke Mode Lokal." };
      }
      return { success: false, message: "HTTP Error " + resCode + ": " + resText };
    }

    // 8. Parsing Respons
    const json = JSON.parse(resText);
    if (json.choices && json.choices.length > 0) {
      // Bersihkan potensi pembungkus markdown (meskipun JSON mode seharusnya murni)
      let content = json.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsedData = JSON.parse(content);
      return {
        success: true,
        data: {
          S: parseFloat(parsedData.S) || 0, T: parseFloat(parsedData.T) || 0,
          N: parseFloat(parsedData.N) || 0, K: parseFloat(parsedData.K) || 0,
          M: parseFloat(parsedData.M) || 0
        }
      };
    } else {
      return { success: false, message: "Respon AI kosong atau format tidak valid." };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function updateJurnalAnekdotal(record) {
  return saveJurnalAnekdotal(record);
}

function saveJurnalAnekdotal(record) {
  return saveMasterData('TransJurnal', record, 'id_jurnal', record.id_jurnal);
}

// ==============================================================================
// BLOK 2: SINTESIS CATATAN WALI KELAS (TRI-MODE: GEMINI, QWEN, CLAUDE)
// ==============================================================================
function generateCatatanAI(id_siswa, id_periode, aiMode = 'GEMINI') {
  try {
    const db = getRelationalData();
    let siswa = (db.MasterSiswa || []).find(s => String(s.id_siswa) === String(id_siswa));
    let namaSiswa = siswa ? siswa.nama_siswa : "Peserta didik";

    let jurnalSiswa = (db.TransJurnal || []).filter(j => String(j.id_siswa) === String(id_siswa));
    let teksJurnal = jurnalSiswa.map(j => "- " + j.narasi_kejadian).join("\n");
    if (!teksJurnal || teksJurnal.trim() === "") { teksJurnal = "Tidak ada catatan observasi khusus. Siswa mengikuti pembelajaran dengan normal."; }

    let prompt = `Sebagai Wali Kelas, susunlah narasi deskripsi rapor (maksimal 3 kalimat) untuk siswa bernama ${namaSiswa}. 
    Gunakan bahasa baku, formal, apresiatif, dan memotivasi untuk dicetak di dokumen resmi.
    Berdasarkan kompilasi rekam jejak observasi berikut:
    ${teksJurnal}
    Tulis langsung paragraf deskripsinya tanpa basa-basi, tanpa markdown, dan tanpa label pembuka.`;

    if (aiMode === 'QWEN') {
      let apiKey = PropertiesService.getScriptProperties().getProperty("OPENROUTER_API_KEY");
      if (!apiKey) return { success: false, message: "API Key OpenRouter kosong di Script Properties." };

      let payload = { "model": "qwen/qwen3.8-27b-20260814:free", "messages": [{ "role": "user", "content": prompt }] };
      let options = {
        "method": "post", "contentType": "application/json",
        "headers": { "Authorization": "Bearer " + apiKey, "HTTP-Referer": "https://edurapor.app", "X-Title": "EduRapor" },
        "payload": JSON.stringify(payload), "muteHttpExceptions": true
      };
      let response = UrlFetchApp.fetch("https://openrouter.ai/api/v1/chat/completions", options);

      if (response.getResponseCode() !== 200) {
        let errText = response.getContentText();
        if (errText.includes("429") || errText.includes("rate-limited")) {
          return { success: false, message: "Server AI Qwen (Gratis) sedang penuh/sibuk. Silakan ganti pilihan mesin AI ke 'Google Gemini' atau 'Claude' dan coba lagi." };
        }
        return { success: false, message: "Gagal memanggil Qwen: " + errText };
      }
      let json = JSON.parse(response.getContentText());
      return { success: true, data: json.choices[0].message.content.trim() };
    }
    else if (aiMode === 'CLAUDE') {
      let apiKey = PropertiesService.getScriptProperties().getProperty("CLAUDE_API_KEY");
      if (!apiKey) return { success: false, message: "API Key Claude belum dikonfigurasi di Script Properties." };

      let payload = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1024,
        "messages": [{ "role": "user", "content": prompt }]
      };
      let options = {
        "method": "post", "contentType": "application/json",
        "headers": { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        "payload": JSON.stringify(payload), "muteHttpExceptions": true
      };
      let response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", options);

      if (response.getResponseCode() !== 200) return { success: false, message: "Gagal memanggil Claude: " + response.getContentText() };
      let json = JSON.parse(response.getContentText());
      return { success: true, data: json.content[0].text.trim() };
    }
    else {
      // MODE GEMINI
      let settings = (db.PengaturanSekolah && db.PengaturanSekolah.length > 0) ? db.PengaturanSekolah[0] : {};
      let propertyKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      let apiKey = propertyKey || settings.api_key_gemini;
      let modelName = settings.ai_model_name || "gemini-1.5-flash";

      if (!apiKey) return { success: false, message: "Kunci API Gemini belum diatur di Pengaturan." };
      let url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
      let payload = { "contents": [{ "parts": [{ "text": prompt }] }], "generationConfig": { "temperature": 0.4 } };

      let response = UrlFetchApp.fetch(url, { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true });
      if (response.getResponseCode() !== 200) return { success: false, message: "Server AI Google penuh/gagal: " + response.getContentText() };

      let json = JSON.parse(response.getContentText());
      return { success: true, data: json.candidates[0].content.parts[0].text.trim() };
    }
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function saveCatatanWaliFinal(record) {
  try {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TransCatatanWali');
    let data = sheet.getDataRange().getValues();
    let timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

    let isUpdate = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]) === String(record.id_siswa) && String(data[i][2]) === String(record.id_periode)) {
        sheet.getRange(i + 1, 4).setValue(record.catatan_final);
        sheet.getRange(i + 1, 5).setValue(timestamp);
        isUpdate = true;
        break;
      }
    }

    if (!isUpdate) {
      let newId = "CWL-" + new Date().getTime();
      sheet.appendRow([newId, record.id_siswa, record.id_periode, record.catatan_final, timestamp]);
    }
    return { success: true, message: "Catatan Rapor final berhasil disimpan." };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// ==============================================================================
// BLOK 3: SINTESIS CATATAN P5 (TRI-MODE: GEMINI, QWEN, CLAUDE)
// ==============================================================================
function generateCatatanP5_AI(id_siswa, id_proyek, id_periode, drafKasar, aiMode = 'GEMINI') {
  try {
    const db = getRelationalData();
    let siswa = (db.MasterSiswa || []).find(s => String(s.id_siswa) === String(id_siswa));
    let namaSiswa = siswa ? siswa.nama_siswa : "Peserta didik";
    let proyek = (db.MasterProyek || []).find(p => String(p.id_proyek) === String(id_proyek));
    let namaProyek = proyek ? proyek.judul_proyek : "Proyek P5";
    let deskripsiProyek = proyek ? proyek.deskripsi_proyek : "";

    let prompt = "";
    if (drafKasar && drafKasar.trim() !== "") {
      prompt = `Sebagai Guru Wali Kelas, ubahlah catatan singkat kasar berikut menjadi satu paragraf deskripsi rapor Proyek Penguatan Profil Pelajar Pancasila (P5) yang baku, formal, apresiatif, dan memotivasi untuk peserta didik bernama ${namaSiswa} pada proyek "${namaProyek}".\n\nCatatan kasar guru:\n"${drafKasar}"\n\nSyarat Keluaran:\n- Maksimal 3 kalimat.\n- Gunakan bahasa baku untuk rapor pendidikan.\n- Jangan gunakan awalan/akhiran seperti "Berikut adalah catatannya...". Langsung berikan hasil narasinya.`;
    } else {
      let jurnalSiswa = (db.TransJurnal || []).filter(j => String(j.id_siswa) === String(id_siswa));
      let teksJurnal = jurnalSiswa.map(j => "- " + j.narasi_kejadian).join("\n");
      if (!teksJurnal || teksJurnal.trim() === "") teksJurnal = "Siswa mengikuti aktivitas proyek dengan baik, dan menyelesaikannya tepat waktu.";

      prompt = `Sebagai Guru Wali Kelas, buatlah satu paragraf deskripsi rapor Proyek Penguatan Profil Pelajar Pancasila (P5) yang baku, formal, apresiatif, dan memotivasi untuk peserta didik bernama ${namaSiswa} pada proyek "${namaProyek}" (Fokus Proyek: ${deskripsiProyek}).\n\nJadikan catatan observasi berikut sebagai referensi perilaku anak:\n${teksJurnal}\n\nSyarat Keluaran:\n- Maksimal 3 kalimat.\n- Gunakan bahasa baku untuk rapor pendidikan.\n- Jangan gunakan awalan/akhiran apapun. Langsung berikan hasil narasinya.`;
    }

    if (aiMode === 'QWEN') {
      let apiKey = PropertiesService.getScriptProperties().getProperty("OPENROUTER_API_KEY");
      if (!apiKey) return { success: false, message: "API Key OpenRouter kosong di Script Properties." };

      let payload = { "model": "qwen/qwen3.8-27b-20260814:free", "messages": [{ "role": "user", "content": prompt }] };
      let options = {
        "method": "post", "contentType": "application/json",
        "headers": { "Authorization": "Bearer " + apiKey, "HTTP-Referer": "https://edurapor.app", "X-Title": "EduRapor" },
        "payload": JSON.stringify(payload), "muteHttpExceptions": true
      };
      let response = UrlFetchApp.fetch("https://openrouter.ai/api/v1/chat/completions", options);

      if (response.getResponseCode() !== 200) {
        let errText = response.getContentText();
        if (errText.includes("429") || errText.includes("rate-limited")) {
          return { success: false, message: "Server AI Qwen (Gratis) sedang penuh/sibuk saat ini. Silakan ganti pilihan mesin AI ke 'Google Gemini' atau 'Claude'." };
        }
        return { success: false, message: "Gagal memanggil Qwen: " + errText };
      }
      let json = JSON.parse(response.getContentText());
      return { success: true, data: json.choices[0].message.content.trim() };
    }
    else if (aiMode === 'CLAUDE') {
      let apiKey = PropertiesService.getScriptProperties().getProperty("CLAUDE_API_KEY");
      if (!apiKey) return { success: false, message: "API Key Claude belum dikonfigurasi di Script Properties." };

      let payload = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1024,
        "messages": [{ "role": "user", "content": prompt }]
      };
      let options = {
        "method": "post", "contentType": "application/json",
        "headers": { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        "payload": JSON.stringify(payload), "muteHttpExceptions": true
      };
      let response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", options);

      if (response.getResponseCode() !== 200) return { success: false, message: "Gagal memanggil Claude: " + response.getContentText() };
      let json = JSON.parse(response.getContentText());
      return { success: true, data: json.content[0].text.trim() };
    }
    else {
      // MODE GEMINI
      let settings = (db.PengaturanSekolah && db.PengaturanSekolah.length > 0) ? db.PengaturanSekolah[0] : {};
      let propertyKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      let apiKey = propertyKey || settings.api_key_gemini;
      let modelName = settings.ai_model_name || "gemini-1.5-flash";

      if (!apiKey) return { success: false, message: "Kunci API Gemini belum diatur." };
      let url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
      let payload = { "contents": [{ "parts": [{ "text": prompt }] }], "generationConfig": { "temperature": 0.4 } };

      let response = UrlFetchApp.fetch(url, { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true });
      if (response.getResponseCode() !== 200) return { success: false, message: "Server AI Google penuh/gagal." };

      let json = JSON.parse(response.getContentText());
      return { success: true, data: json.candidates[0].content.parts[0].text.trim() };
    }
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function arsipkanDatabaseTahunan() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timeString = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm");
    const fileAsli = DriveApp.getFileById(ss.getId());
    const namaBackup = "Arsip_EduRapor_" + timeString;
    const fileBackup = fileAsli.makeCopy(namaBackup);
    const TRANSAKSI_TABLES = ['TransNilai', 'TransPresensi', 'TransJurnal', 'TransCatatanP5', 'TransNilaiP5', 'TransCatatanWali', 'RekapRaporAkhir'];
    let logPembersihan = [];

    TRANSAKSI_TABLES.forEach(sheetName => {
      let sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        let lastRow = sheet.getLastRow();
        let lastCol = sheet.getLastColumn();
        if (lastRow > 1) {
          sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
          logPembersihan.push(sheetName);
        }
      }
    });

    Logger.log("BERHASIL! File arsip dibuat di: " + fileBackup.getUrl());
    return { success: true, message: "Database diarsipkan!", urlArsip: fileBackup.getUrl() };
  } catch (e) {
    return { success: false, message: "Gagal arsip: " + e.message };
  }
}