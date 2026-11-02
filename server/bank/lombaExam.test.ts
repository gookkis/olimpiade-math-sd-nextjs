import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuestionBank } from './index';
import { KISI_LOMBA_SD } from './kisi';
import { selectLombaSdPaper } from './lombaExam';
import { makeRng } from './core';

const rows = buildQuestionBank();

test('lomba SD paper: 20 PG then 10 isian, 5 per kisi, no Nasional, no duplicates', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const rng = makeRng(seed);
    const paper = selectLombaSdPaper(rows, rng.next);
    assert.equal(paper.length, 30);
    assert.ok(paper.slice(0, 20).every((r) => r.format === 'pilihan_ganda'), 'first 20 are PG');
    assert.ok(paper.slice(20).every((r) => r.format === 'isian'), 'last 10 are isian');
    assert.equal(new Set(paper.map((r) => r.id)).size, 30);
    assert.ok(paper.every((r) => r.level !== 'Nasional'));
    for (const k of KISI_LOMBA_SD) {
      assert.equal(paper.filter((r) => r.kisi === k).length, 5, `${k} has 5 questions (seed ${seed})`);
    }
  }
});
