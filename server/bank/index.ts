import { Generator, Problem, Rng, Retry, buildOptions, hashString, makeRng } from './core';
import { bilangan } from './bilangan';
import { aljabar } from './aljabar';
import { geometri } from './geometri';
import { kombinatorika } from './kombinatorika';
import { logika } from './logika';
import { lomba } from './lomba';
import { kisiOf } from './kisi';

/** Bump whenever generators change so existing databases are re-seeded. */
export const QUESTION_BANK_VERSION = '2026.11-v4-kisi-lomba-sd';
export const TARGET_TOTAL = 1500;

const BASE_GENERATORS: Generator[] = [...bilangan, ...aljabar, ...geometri, ...kombinatorika, ...logika, ...lomba];

/**
 * OSN SD 2026 composition: OSN-K = 8 mudah / 14 sedang / 8 sukar (pilihan ganda),
 * OSN-P = 4 mudah / 8 sedang / 8 sukar (isian singkat). To give every level all three
 * difficulty bands, some Provinsi problem types are also offered at Kabupaten/Kota as
 * hard multiple-choice items (as in OSN-K 2025: kubus dicat, foto berjajar, ...), and
 * some Kabupaten/Kota types are offered at Provinsi as easy short-answer items.
 */
const PROV_TO_KAB_HARD = [
  'bil-angka-satuan', 'bil-sisa-konstan', 'bil-nol-faktorial', 'bil-perkalian-pecahan',
  'alj-pola-huruf', 'alj-korek-api', 'alj-umur-rasio',
  'geo-kubus-dicat', 'geo-luas-permukaan-susun', 'geo-arsiran',
  'kom-foto-berjajar', 'kom-rute-grid', 'kom-susun-huruf',
  'log-kecepatan-rata', 'log-kereta', 'log-skor-osn',
];
const KAB_TO_PROV_EASY = [
  'bil-banyak-faktor', 'bil-rata-hilang', 'bil-perbandingan',
  'alj-kaki-hewan', 'alj-mundur', 'alj-bilangan-berurutan',
  'geo-diagonal-poligon', 'geo-volume', 'geo-persegi-panjang',
  'kom-jabat-tangan', 'kom-turnamen', 'kom-venn',
  'log-antrian', 'log-kalender-kotak', 'log-kecepatan-dasar',
];

function variantOf(key: string, level: Generator['level'], diff: Generator['diff'], suffix: string): Generator {
  const g = BASE_GENERATORS.find((x) => x.key === key);
  if (!g) throw new Error(`Unknown generator ${key}`);
  return { ...g, key: `${g.key}-${suffix}`, level, diff };
}

/**
 * Extra variants so every "Lomba Matematika SD" kisi-kisi category has both multiple-choice
 * (Kabupaten/Kota) and short-answer (Provinsi) items.
 */
const LOMBA_VARIANTS: [string, Generator['level'], Generator['diff'], string][] = [
  ['pec-persen-cerita', 'Provinsi', 'Mudah', 'prov'],
  ['bd-gabungan', 'Provinsi', 'Sedang', 'prov'],
  ['br-tabung', 'Provinsi', 'Sedang', 'prov'],
  ['stat-diagram-lingkaran', 'Provinsi', 'Sedang', 'prov'],
  ['pec-harga-awal', 'Kabupaten/Kota', 'HOTS', 'kab'],
  ['stat-rata-gabungan', 'Kabupaten/Kota', 'HOTS', 'kab'],
];

export const ALL_GENERATORS: Generator[] = [
  ...BASE_GENERATORS,
  ...PROV_TO_KAB_HARD.map((k) => variantOf(k, 'Kabupaten/Kota', 'HOTS', 'kab')),
  ...KAB_TO_PROV_EASY.map((k) => variantOf(k, 'Provinsi', 'Mudah', 'prov')),
  ...LOMBA_VARIANTS.map(([k, level, diff, suffix]) => variantOf(k, level, diff, suffix)),
];

/** Difficulty mix per level (fractions), following the OSN SD 2026 blueprint. */
export const LEVEL_DIFFICULTY_MIX: Record<string, Record<string, number>> = {
  'Kabupaten/Kota': { Mudah: 8 / 30, Sedang: 14 / 30, HOTS: 8 / 30 },
  Provinsi: { Mudah: 4 / 20, Sedang: 8 / 20, HOTS: 8 / 20 },
};

export interface QuestionRow {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  level: string;
  /** "Lomba Matematika SD" kisi-kisi category, or null when the item is outside it. */
  kisi: string | null;
  format: 'pilihan_ganda' | 'isian';
  question: string;
  options: string; // JSON
  correct_answer: string;
  explanation: string;
  tips_trik: string;
  target_seconds: number;
  similar_questions: string; // JSON
}

function makeProblem(g: Generator, r: Rng): Problem {
  for (let i = 0; i < 60; i++) {
    try {
      return g.make(r);
    } catch (e) {
      if (!(e instanceof Retry)) throw e;
    }
  }
  throw new Error(`Generator ${g.key} kept asking for retries`);
}

function isIsian(g: Generator, p: Problem) {
  return g.level !== 'Kabupaten/Kota' && !g.pg && typeof p.ans === 'number' && Number.isInteger(p.ans);
}

function render(g: Generator, p: Problem, r: Rng) {
  if (isIsian(g, p)) {
    return { format: 'isian' as const, options: [] as string[], correct: String(p.ans) };
  }
  const { options, correct } = buildOptions(p, r);
  return { format: 'pilihan_ganda' as const, options, correct };
}

export function buildQuestionBank(total = TARGET_TOTAL): QuestionRow[] {
  const gens = ALL_GENERATORS;
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  const exhausted = new Set<string>();
  const rows: QuestionRow[] = [];

  // Round-robin so every generator contributes evenly; generators whose
  // parameter space runs out of fresh questions drop out and the rest fill in.
  let round = 0;
  while (rows.length < total && exhausted.size < gens.length) {
    for (const g of gens) {
      if (rows.length >= total) break;
      if (exhausted.has(g.key)) continue;
      const idx = counts.get(g.key) ?? 0;
      let produced = false;
      for (let attempt = 0; attempt < 40; attempt++) {
        const r = makeRng(hashString(`${g.key}#${idx}#${attempt}`));
        const p = makeProblem(g, r);
        if (seen.has(p.q)) continue;
        seen.add(p.q);

        const main = render(g, p, r);
        const simR = makeRng(hashString(`${g.key}#${idx}#sim#${attempt}`));
        let sim: Problem | null = null;
        for (let k = 0; k < 10 && !sim; k++) {
          const cand = makeProblem(g, simR);
          if (cand.q !== p.q) sim = cand;
        }
        const id = `${g.key}-${String(idx + 1).padStart(3, '0')}`;
        const similar = sim
          ? (() => {
              const s = render(g, sim, simR);
              return [{
                id: `${id}-sim`,
                question: sim.q,
                ...(s.options.length ? { options: s.options } : {}),
                correctAnswer: s.correct,
                explanation: sim.exp,
                tipsTrik: sim.tip,
              }];
            })()
          : [];

        rows.push({
          id,
          topic: g.topic,
          subtopic: g.sub,
          difficulty: g.diff,
          level: g.level,
          kisi: kisiOf(g.key),
          format: main.format,
          question: p.q,
          options: JSON.stringify(main.options),
          correct_answer: main.correct,
          explanation: p.exp,
          tips_trik: p.tip,
          target_seconds: g.sec,
          similar_questions: JSON.stringify(similar),
        });
        counts.set(g.key, idx + 1);
        produced = true;
        break;
      }
      if (!produced) exhausted.add(g.key);
    }
    round++;
    if (round > 200) break;
  }
  return rows;
}
