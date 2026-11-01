// Core helpers for the generated olympiad question bank.
// Every generator computes its own answer in code (brute force wherever practical),
// so answer keys never depend on hand-typed numbers.

export type Level = 'Kabupaten/Kota' | 'Provinsi' | 'Nasional';
export type Difficulty = 'Mudah' | 'Sedang' | 'HOTS';
export type Topic =
  | 'Bilangan & Aritmatika'
  | 'Aljabar & Pola Bilangan'
  | 'Geometri & Pengukuran'
  | 'Kombinatorika & Peluang'
  | 'Logika & Masalah HOTS';

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  shuffle<T>(arr: readonly T[]): T[];
  sample<T>(arr: readonly T[], k: number): T[];
  chance(p: number): boolean;
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const shuffle = <T>(arr: readonly T[]) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return {
    next,
    int,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle,
    sample: (arr, k) => shuffle(arr).slice(0, k),
    chance: (p) => next() < p,
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Throw from make() to ask the seeder for a fresh attempt with new random parameters. */
export class Retry extends Error {}

/** A single generated problem, before it is turned into a DB row. */
export interface Problem {
  q: string;
  /** Number answers may become short-answer (isian) items; strings are always multiple choice. */
  ans: number | string;
  /** Plausible wrong answers (typical mistakes). Auto-filled for numbers when fewer than 3. */
  wrong?: (number | string)[];
  unit?: string;
  prefix?: string;
  exp: string;
  tip: string;
}

export interface Generator {
  key: string;
  topic: Topic;
  sub: string;
  level: Level;
  diff: Difficulty;
  sec: number;
  /** Force multiple choice even at Provinsi/Nasional level. */
  pg?: boolean;
  make(r: Rng): Problem;
}

// ---------- math helpers ----------
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;
export const lcmAll = (xs: number[]) => xs.reduce((acc, x) => lcm(acc, x), 1);
export const gcdAll = (xs: number[]) => xs.reduce((acc, x) => gcd(acc, x), 0);

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export function divisors(n: number): number[] {
  const out: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
  return out;
}

export function factorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export const sup = (n: number | string) => String(n).split('').map((c) => SUP[c] ?? c).join('');

export const factorStr = (n: number) =>
  factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}${sup(e)}`))
    .join(' × ');

export function C(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
export const digitSum = (n: number | bigint) => String(n).split('').reduce((s, c) => s + Number(c), 0);
export const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
export const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

export function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return result;
}

/** All permutations of an array (small n only). */
export function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr.slice()];
  const out: T[][] = [];
  arr.forEach((x, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([x, ...p]);
  });
  return out;
}

export function frac(p: number, q: number): string {
  if (q < 0) {
    p = -p;
    q = -q;
  }
  const g = gcd(Math.abs(p), q) || 1;
  const a = p / g;
  const b = q / g;
  return b === 1 ? `${a}` : `${a}/${b}`;
}

export function reduced(p: number, q: number): [number, number] {
  const g = gcd(Math.abs(p), Math.abs(q)) || 1;
  return [p / g, q / g];
}

// ---------- formatting ----------
/** Indonesian number formatting: 12.500 and 2,5 */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) throw new Error(`fmt received non-finite number: ${n}`);
  const neg = n < 0;
  const abs = Math.abs(n);
  const rounded = Math.round(abs * 1000) / 1000;
  const [intPart, decPart] = String(rounded).split('.');
  const withDots = intPart.length > 4 ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : intPart;
  return (neg ? '-' : '') + withDots + (decPart ? ',' + decPart : '');
}

export const rp = (n: number) => `Rp${fmt(n).replace(/^(\d{4})$/, (m) => m[0] + '.' + m.slice(1))}`;

export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const pad2 = (n: number) => String(n).padStart(2, '0');
export function clock(totalMinutes: number): string {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(m / 60))}.${pad2(m % 60)}`;
}

export const NAMA_L = ['Ahmad', 'Budi', 'Umar', 'Hasan', 'Rafi', 'Yusuf', 'Fikri', 'Bilal', 'Dimas', 'Irfan', 'Zaki', 'Galih', 'Hamzah', 'Raka', 'Naufal', 'Arif'];
export const NAMA_P = ['Aisyah', 'Fatimah', 'Citra', 'Dina', 'Zahra', 'Salsa', 'Nisa', 'Laila', 'Maryam', 'Putri', 'Kirana', 'Hana', 'Syifa', 'Alya', 'Nadia', 'Rina'];
export const NAMA = [...NAMA_L, ...NAMA_P];

// ---------- option building ----------
export const LETTERS = ['A', 'B', 'C', 'D'];

export function display(v: number | string, p: Pick<Problem, 'unit' | 'prefix'>): string {
  const core = typeof v === 'number' ? (p.prefix === 'Rp' ? rp(v) : fmt(v)) : v;
  const pre = p.prefix && p.prefix !== 'Rp' ? p.prefix : '';
  return `${pre}${core}${p.unit ? (p.unit.startsWith('°') || p.unit === '%' ? '' : ' ') + p.unit : ''}`;
}

function autoDistractors(ans: number, r: Rng): number[] {
  const isInt = Number.isInteger(ans);
  const step = isInt ? 1 : 0.5;
  const big = Math.abs(ans) >= 40 ? Math.max(2, Math.round(Math.abs(ans) * 0.1)) : 3;
  const cands = [ans + step, ans - step, ans + 2 * step, ans - 2 * step, ans + big, ans - big, ans * 2, ans + 10, ans - 10];
  if (isInt && ans % 2 === 0) cands.push(ans / 2);
  return r.shuffle(cands).filter((c) => (ans >= 0 ? c >= 0 : true) && c !== ans && Number.isFinite(c));
}

export function buildOptions(p: Problem, r: Rng): { options: string[]; correct: string } {
  const correctText = display(p.ans, p);
  const seen = new Set<string>([correctText]);
  const chosen: string[] = [];
  const tryAdd = (v: number | string) => {
    if (chosen.length >= 3) return;
    if (typeof v === 'number' && !Number.isFinite(v)) return;
    const t = display(v, p);
    if (seen.has(t)) return;
    seen.add(t);
    chosen.push(t);
  };
  (p.wrong ?? []).forEach(tryAdd);
  if (chosen.length < 3 && typeof p.ans === 'number') autoDistractors(p.ans, r).forEach(tryAdd);
  if (chosen.length < 3 && typeof p.ans === 'string' && /^\d+\/\d+$/.test(p.ans)) {
    const [a, b] = p.ans.split('/').map(Number);
    r.shuffle([[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1], [b - a, b], [a, 2 * b], [2 * a, b], [a + 2, b], [1, b]])
      .filter(([x, y]) => x > 0 && y > 1 && x !== y)
      .forEach(([x, y]) => tryAdd(frac(x, y)));
  }
  if (chosen.length < 3 && typeof p.ans === 'string' && /^\d\d\.\d\d$/.test(p.ans)) {
    const [h, m] = p.ans.split('.').map(Number);
    r.shuffle([-60, 60, -30, 30, -15, 15, 20, -20]).forEach((d) => tryAdd(clock(h * 60 + m + d)));
  }
  if (chosen.length < 3) throw new Error(`Not enough distractors for: ${p.q.slice(0, 80)}`);
  const all = r.shuffle([correctText, ...chosen]);
  return {
    options: all.map((t, i) => `${LETTERS[i]}. ${t}`),
    correct: LETTERS[all.indexOf(correctText)],
  };
}

/** Normalize a typed short answer so "1.500", " 1500 " and "1500" compare equal. */
export function normalizeAnswer(s: string): string {
  let t = s.trim().toUpperCase().replace(/\s+/g, '');
  if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  return t;
}
