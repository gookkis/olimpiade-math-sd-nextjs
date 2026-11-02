// Run: npx tsx server/bank/validate.ts
import { buildQuestionBank, ALL_GENERATORS } from './index';
import { KISI_KEYS } from './kisi';

const t0 = Date.now();
const rows = buildQuestionBank();
const errors: string[] = [];
const tally = (key: (r: (typeof rows)[number]) => string) => {
  const m: Record<string, number> = {};
  rows.forEach((r) => (m[key(r)] = (m[key(r)] ?? 0) + 1));
  return m;
};

if (rows.length !== 1500) errors.push(`expected 1500 rows, got ${rows.length}`);
if (new Set(rows.map((r) => r.id)).size !== rows.length) errors.push('duplicate ids');
if (new Set(rows.map((r) => r.question)).size !== rows.length) errors.push('duplicate question text');

for (const r of rows) {
  const blob = [r.question, r.options, r.explanation, r.tips_trik, r.correct_answer, r.similar_questions].join(' ');
  if (/NaN|undefined|Infinity|\[object|null/.test(blob)) errors.push(`${r.id}: bad token in text`);
  const opts: string[] = JSON.parse(r.options);
  if (r.format === 'pilihan_ganda') {
    if (opts.length !== 4) errors.push(`${r.id}: ${opts.length} options`);
    if (new Set(opts.map((o) => o.slice(3))).size !== opts.length) errors.push(`${r.id}: duplicate options ${opts}`);
    if (!['A', 'B', 'C', 'D'].includes(r.correct_answer)) errors.push(`${r.id}: bad key ${r.correct_answer}`);
  } else {
    if (!/^-?\d+$/.test(r.correct_answer)) errors.push(`${r.id}: isian answer not integer: ${r.correct_answer}`);
    if (opts.length) errors.push(`${r.id}: isian has options`);
  }
  const sims = JSON.parse(r.similar_questions);
  if (!sims.length) errors.push(`${r.id}: no similar question`);
}

const genKeys = new Set(ALL_GENERATORS.map((g) => g.key));
for (const k of KISI_KEYS) if (!genKeys.has(k)) errors.push(`kisi map references unknown generator ${k}`);

const perGen = tally((r) => r.id.replace(/-\d{3}$/, ''));
const short = ALL_GENERATORS.filter((g) => (perGen[g.key] ?? 0) < 6).map((g) => `${g.key}=${perGen[g.key] ?? 0}`);

console.log(`built ${rows.length} rows from ${ALL_GENERATORS.length} generators in ${Date.now() - t0} ms`);
console.log('topic', tally((r) => r.topic));
console.log('level', tally((r) => r.level));
console.log('difficulty', tally((r) => r.difficulty));
console.log('format', tally((r) => r.format));
console.log('level×format', tally((r) => `${r.level} / ${r.format}`));
console.log('level×difficulty', tally((r) => `${r.level} / ${r.difficulty}`));
console.log('PG key letter', tally((r) => (r.format === 'pilihan_ganda' ? r.correct_answer : '-')));
console.log('kisi × format (Kab/Prov)', tally((r) => (r.kisi && r.level !== 'Nasional' ? `${r.kisi} / ${r.format}` : '-')));
console.log('distinct subtopics', new Set(rows.map((r) => r.subtopic)).size);
console.log('generators with < 6 questions:', short.length ? short.join(', ') : 'none');
console.log(errors.length ? `ERRORS (${errors.length}):\n` + errors.slice(0, 40).join('\n') : 'OK: no validation errors');
if (errors.length) process.exit(1);
