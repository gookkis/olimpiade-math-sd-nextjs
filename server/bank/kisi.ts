// Kisi-kisi "Lomba Matematika SD" (individu, 20 PG + 10 isian, 90 menit).
// Maps each generator (by base key; -kab/-prov variants inherit) to one kisi category.

export const KISI_LOMBA_SD = [
  'Operasi Hitung Pecahan & Persen',
  'Teori Bilangan (FPB, KPK, Sifat Keterbagian)',
  'Keliling & Luas Bangun Datar',
  'Bangun Ruang Sederhana',
  'Rata-rata, Median, Modus & Diagram',
  'Pola Bilangan & Kaidah Pencacahan',
] as const;
export type Kisi = (typeof KISI_LOMBA_SD)[number];

const [PECAHAN, TEORI, DATAR, RUANG, STAT, POLA] = KISI_LOMBA_SD;

const MAP: Record<string, Kisi> = {
  // 1) Operasi hitung pecahan & persen
  'bil-banding-pecahan': PECAHAN, 'bil-persen-bilangan': PECAHAN, 'bil-diskon': PECAHAN,
  'bil-perkalian-pecahan': PECAHAN, 'bil-teleskopik': PECAHAN, 'alj-pecahan-sisa': PECAHAN,
  'geo-persen-luas': PECAHAN, 'log-untung-rugi': PECAHAN, 'log-campuran': PECAHAN,
  'pec-jumlah-campuran': PECAHAN, 'pec-kali-bagi': PECAHAN, 'pec-desimal-persen': PECAHAN,
  'pec-persen-cerita': PECAHAN, 'pec-harga-awal': PECAHAN, 'pec-perkalian-berantai': PECAHAN,
  'pec-pecahan-bagian': PECAHAN,

  // 2) Teori bilangan
  'bil-fpb-bingkisan': TEORI, 'bil-kpk-hari': TEORI, 'bil-prima-antara': TEORI, 'bil-banyak-faktor': TEORI,
  'bil-digit-hilang': TEORI, 'bil-sisa-konstan': TEORI, 'bil-fpb-kpk-balik': TEORI,
  'bil-kelipatan-inklusi': TEORI, 'bil-angka-satuan': TEORI, 'bil-sisa-pangkat': TEORI,
  'bil-nol-faktorial': TEORI, 'bil-crt-umum': TEORI, 'bil-tiga-faktor': TEORI,

  // 3) Keliling & luas bangun datar
  'geo-persegi': DATAR, 'geo-persegi-panjang': DATAR, 'geo-segitiga-trapesium': DATAR, 'geo-lingkaran': DATAR,
  'geo-keliling-potong': DATAR, 'geo-arsiran': DATAR, 'geo-jalan-taman': DATAR, 'geo-persegi-tengah': DATAR,
  'geo-jarak-titik-grid': DATAR, 'geo-skala-luas': DATAR, 'bd-gabungan': DATAR, 'bd-ubin-lantai': DATAR,

  // 4) Bangun ruang sederhana
  'geo-volume': RUANG, 'geo-euler': RUANG, 'geo-kubus-dicat': RUANG, 'geo-luas-permukaan-susun': RUANG,
  'geo-air-naik': RUANG, 'geo-kardus': RUANG, 'geo-kerangka': RUANG, 'geo-kubus-rusuk-terpotong': RUANG,
  'br-luas-permukaan': RUANG, 'br-tabung': RUANG, 'br-volume-balik': RUANG, 'br-kubus-satuan': RUANG,

  // 5) Rata-rata, median, modus & diagram
  'bil-rata-hilang': STAT, 'bil-median-modus': STAT, 'bil-frekuensi-rata': STAT, 'bil-rata-berubah': STAT,
  'log-rata-umur-keluarga': STAT, 'stat-diagram-gambar': STAT, 'stat-diagram-batang': STAT,
  'stat-diagram-lingkaran': STAT, 'stat-rata-gabungan': STAT, 'stat-median-tabel': STAT,
  'stat-data-hilang-diagram': STAT,

  // 6) Pola bilangan & kaidah pencacahan
  'alj-pola-berikut': POLA, 'alj-suku-ke-n': POLA, 'alj-jumlah-deret': POLA, 'alj-korek-api': POLA,
  'alj-pola-ubin': POLA, 'alj-pola-huruf': POLA, 'alj-selang-seling': POLA, 'alj-bakteri': POLA,
  'alj-segitiga-ganjil': POLA, 'bil-angka-halaman': POLA,
  'kom-pakaian': POLA, 'kom-jabat-tangan': POLA, 'kom-turnamen': POLA, 'kom-susun-angka': POLA,
  'kom-pilih-tim': POLA, 'kom-rute-kota': POLA, 'kom-foto-berjajar': POLA, 'kom-rute-grid': POLA,
  'kom-digit-syarat': POLA, 'kom-susun-huruf': POLA, 'kom-melingkar': POLA, 'kom-panitia': POLA,
  'kom-titik-garis': POLA,
};

export function kisiOf(generatorKey: string): Kisi | null {
  return MAP[generatorKey.replace(/-(kab|prov)$/, '')] ?? null;
}

/** Keys referenced by the map, for validation. */
export const KISI_KEYS = Object.keys(MAP);
