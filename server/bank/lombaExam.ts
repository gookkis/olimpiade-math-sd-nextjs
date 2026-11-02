// Picks a "Lomba Matematika SD" paper: 20 multiple choice + 10 short answer, every
// kisi-kisi category gets exactly 5 questions. Pure function so it can be tested.
import { KISI_LOMBA_SD } from './kisi';

export const LOMBA_SD_BLUEPRINT = {
  pg: 20,
  isian: 10,
  /** Difficulty targets per section (soft: relaxed when the pool runs short). */
  pgDifficulty: { Mudah: 6, Sedang: 9, HOTS: 5 } as Record<string, number>,
  isianDifficulty: { Mudah: 3, Sedang: 5, HOTS: 2 } as Record<string, number>,
};

export interface LombaRow {
  id: string;
  kisi: string | null;
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

function pickSection<T extends LombaRow>(
  pool: T[],
  perKisi: Record<string, number>,
  diffTarget: Record<string, number>,
  usedSub: Set<string>,
): T[] {
  const total = Object.values(perKisi).reduce((s, n) => s + n, 0);
  const chosen: T[] = [];
  const ids = new Set<string>();
  const kisiCount: Record<string, number> = {};
  const diffCount: Record<string, number> = {};
  // Kisi quota is never relaxed (except in the very last pass, as a safety net);
  // distinct subtopic and difficulty targets are relaxed one by one.
  const passes = [
    { sub: true, diff: true, kisi: true },
    { sub: false, diff: true, kisi: true },
    { sub: false, diff: false, kisi: true },
    { sub: false, diff: false, kisi: false },
  ];
  for (const pass of passes) {
    for (const r of pool) {
      if (chosen.length >= total) break;
      if (ids.has(r.id) || !r.kisi) continue;
      if (pass.kisi && (kisiCount[r.kisi] ?? 0) >= (perKisi[r.kisi] ?? 0)) continue;
      if (pass.sub && usedSub.has(r.subtopic)) continue;
      if (pass.diff && (diffCount[r.difficulty] ?? 0) >= (diffTarget[r.difficulty] ?? 0)) continue;
      chosen.push(r);
      ids.add(r.id);
      usedSub.add(r.subtopic);
      kisiCount[r.kisi] = (kisiCount[r.kisi] ?? 0) + 1;
      diffCount[r.difficulty] = (diffCount[r.difficulty] ?? 0) + 1;
    }
  }
  const rank: Record<string, number> = { Mudah: 0, Sedang: 1, HOTS: 2 };
  return chosen.sort((a, b) => (rank[a.difficulty] ?? 1) - (rank[b.difficulty] ?? 1));
}

/**
 * Section A (PG) from Kabupaten/Kota + Provinsi multiple-choice items, section B (isian)
 * from Provinsi short-answer items. Nasional items are left out (above SD lomba level).
 * Two random categories get 4 PG + 1 isian, the other four 3 PG + 2 isian, so each
 * category totals 5. Returned order: PG easy → hard, then isian easy → hard.
 */
export function selectLombaSdPaper<T extends LombaRow>(rows: T[], rand: () => number = Math.random): T[] {
  const pool = shuffle(rows.filter((r) => r.kisi && r.level !== 'Nasional'), rand);
  const pgPool = pool.filter((r) => r.format === 'pilihan_ganda');
  const isianPool = pool.filter((r) => r.format === 'isian');

  const order = shuffle([...KISI_LOMBA_SD], rand);
  const pgQuota: Record<string, number> = {};
  const isianQuota: Record<string, number> = {};
  order.forEach((k, i) => {
    pgQuota[k] = i < 2 ? 4 : 3;
    isianQuota[k] = i < 2 ? 1 : 2;
  });

  const usedSub = new Set<string>();
  const pg = pickSection(pgPool, pgQuota, LOMBA_SD_BLUEPRINT.pgDifficulty, usedSub);
  const isian = pickSection(isianPool, isianQuota, LOMBA_SD_BLUEPRINT.isianDifficulty, usedSub);
  return [...pg, ...isian];
}
