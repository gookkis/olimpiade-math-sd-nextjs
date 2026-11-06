// "Olimpiade Obor Langit" Kategori C (SD/MI kelas 5–6): 30 pilihan ganda + 2 esai, 40 menit.
// Kisi-kisi categories are derived from the generator key (the question id minus its
// "-NNN" suffix), so no extra database column is needed.

export const KISI_OBOR_LANGIT_C = [
  'Bilangan: Operasi Bilangan Bulat',
  'FPB & KPK dalam Soal Cerita',
  'Pecahan: Operasi Semua Bentuk Pecahan',
  'Persentase: Diskon, Untung-Rugi, Bunga',
  'Perbandingan: Rasio & Skala',
  'Kecepatan: Jarak, Waktu & Kecepatan',
  'Geometri: Luas Bangun Datar',
  'Bangun Ruang: Volume & Luas Permukaan',
  'Statistika: Mean, Median, Modus',
  'Peluang Sederhana',
] as const;
export type OborKisi = (typeof KISI_OBOR_LANGIT_C)[number];

const [BULAT, FPB, PECAHAN, PERSEN, RASIO, KECEPATAN, DATAR, RUANG, STAT, PELUANG] = KISI_OBOR_LANGIT_C;

const MAP: Record<string, OborKisi> = {
  'bil-suhu': BULAT, 'bil-hitung-cerdik': BULAT, 'log-skor-osn': BULAT,
  'ob-bulat-operasi': BULAT, 'ob-bulat-campuran': BULAT, 'ob-bulat-cerita': BULAT,

  'bil-fpb-bingkisan': FPB, 'bil-kpk-hari': FPB, 'bil-fpb-kpk-balik': FPB, 'bil-sisa-konstan': FPB,

  'pec-jumlah-campuran': PECAHAN, 'pec-kali-bagi': PECAHAN, 'pec-desimal-persen': PECAHAN,
  'pec-perkalian-berantai': PECAHAN, 'pec-pecahan-bagian': PECAHAN, 'bil-banding-pecahan': PECAHAN,
  'bil-perkalian-pecahan': PECAHAN, 'alj-pecahan-sisa': PECAHAN,

  'bil-diskon': PERSEN, 'pec-harga-awal': PERSEN, 'log-untung-rugi': PERSEN, 'pec-persen-cerita': PERSEN,
  'bil-persen-bilangan': PERSEN, 'ob-bunga-tunggal': PERSEN,

  'bil-perbandingan': RASIO, 'bil-skala': RASIO, 'alj-umur-rasio': RASIO,
  'ob-rasio-tiga': RASIO, 'ob-skala-denah': RASIO,

  'log-kecepatan-dasar': KECEPATAN, 'log-papasan': KECEPATAN, 'log-menyusul': KECEPATAN,
  'log-kecepatan-rata': KECEPATAN, 'log-kereta': KECEPATAN,

  'geo-persegi': DATAR, 'geo-persegi-panjang': DATAR, 'geo-segitiga-trapesium': DATAR, 'geo-lingkaran': DATAR,
  'bd-gabungan': DATAR, 'bd-ubin-lantai': DATAR, 'geo-arsiran': DATAR, 'geo-jalan-taman': DATAR,

  'geo-volume': RUANG, 'br-luas-permukaan': RUANG, 'br-tabung': RUANG, 'br-volume-balik': RUANG,
  'geo-air-naik': RUANG, 'geo-kardus': RUANG, 'geo-luas-permukaan-susun': RUANG,

  'bil-rata-hilang': STAT, 'bil-median-modus': STAT, 'bil-frekuensi-rata': STAT, 'bil-rata-berubah': STAT,
  'stat-rata-gabungan': STAT, 'stat-median-tabel': STAT, 'log-rata-umur-keluarga': STAT,

  'kom-peluang-kelereng': PELUANG, 'kom-peluang-dadu': PELUANG, 'kom-koin': PELUANG,
  'kom-peluang-pq': PELUANG, 'kom-ambil-dua': PELUANG, 'ob-peluang-kartu': PELUANG, 'ob-frekuensi-harapan': PELUANG,
};

/** Generator key of a question id like "bil-suhu-012" or "log-kereta-kab-003". */
export const generatorKeyOf = (id: string) => id.replace(/-\d{3}$/, '');

export function oborKisiOf(id: string): OborKisi | null {
  return MAP[generatorKeyOf(id).replace(/-(kab|prov)$/, '')] ?? null;
}

export const OBOR_KISI_KEYS = Object.keys(MAP);

export const OBOR_LANGIT_BLUEPRINT = {
  pg: 30,
  esai: 2,
  pgPerKisi: 3,
  /** Soft difficulty targets for the multiple-choice section. */
  pgDifficulty: { Mudah: 10, Sedang: 14, HOTS: 6 } as Record<string, number>,
};

export interface OborRow {
  id: string;
  level: string;
  format: string;
  difficulty: string;
  subtopic: string;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const RANK: Record<string, number> = { Mudah: 0, Sedang: 1, HOTS: 2 };

/**
 * Section A: 30 multiple-choice items, 3 per kisi-kisi category, easy → hard.
 * Section B: 2 essay items (short-answer items with a worked solution) from two different
 * categories, preferring HOTS. Nasional items are left out. Each returned row carries
 * its category in `oborKisi`.
 */
export function selectOborLangitPaper<T extends OborRow>(
  rows: T[],
  rand: () => number = Math.random,
): (T & { oborKisi: OborKisi })[] {
  const pool = shuffle(
    rows
      .filter((r) => r.level !== 'Nasional')
      .map((r) => ({ ...r, oborKisi: oborKisiOf(r.id) }))
      .filter((r): r is T & { oborKisi: OborKisi } => r.oborKisi !== null),
    rand,
  );
  const pgPool = pool.filter((r) => r.format === 'pilihan_ganda');
  const esaiPool = pool.filter((r) => r.format === 'isian');

  const usedSub = new Set<string>();
  const ids = new Set<string>();

  // Section A. Category quota is hard; distinct subtopic and difficulty targets are relaxed.
  const pg: (T & { oborKisi: OborKisi })[] = [];
  const kisiCount: Record<string, number> = {};
  const diffCount: Record<string, number> = {};
  const passes = [
    { sub: true, diff: true },
    { sub: false, diff: true },
    { sub: true, diff: false },
    { sub: false, diff: false },
  ];
  for (const pass of passes) {
    for (const r of pgPool) {
      if (pg.length >= OBOR_LANGIT_BLUEPRINT.pg) break;
      if (ids.has(r.id)) continue;
      if ((kisiCount[r.oborKisi] ?? 0) >= OBOR_LANGIT_BLUEPRINT.pgPerKisi) continue;
      if (pass.sub && usedSub.has(r.subtopic)) continue;
      if (pass.diff && (diffCount[r.difficulty] ?? 0) >= (OBOR_LANGIT_BLUEPRINT.pgDifficulty[r.difficulty] ?? 0)) continue;
      pg.push(r);
      ids.add(r.id);
      usedSub.add(r.subtopic);
      kisiCount[r.oborKisi] = (kisiCount[r.oborKisi] ?? 0) + 1;
      diffCount[r.difficulty] = (diffCount[r.difficulty] ?? 0) + 1;
    }
  }
  pg.sort((a, b) => (RANK[a.difficulty] ?? 1) - (RANK[b.difficulty] ?? 1));

  // Section B: two essays from different categories, HOTS first, then Sedang, then Mudah.
  const esai: (T & { oborKisi: OborKisi })[] = [];
  const esaiKisi = new Set<string>();
  const byDiff = [...esaiPool].sort((a, b) => (RANK[b.difficulty] ?? 1) - (RANK[a.difficulty] ?? 1));
  for (const strictSub of [true, false]) {
    for (const r of byDiff) {
      if (esai.length >= OBOR_LANGIT_BLUEPRINT.esai) break;
      if (ids.has(r.id) || esaiKisi.has(r.oborKisi)) continue;
      if (strictSub && usedSub.has(r.subtopic)) continue;
      esai.push(r);
      ids.add(r.id);
      esaiKisi.add(r.oborKisi);
      usedSub.add(r.subtopic);
    }
  }
  esai.sort((a, b) => (RANK[a.difficulty] ?? 1) - (RANK[b.difficulty] ?? 1));

  return [...pg, ...esai];
}
