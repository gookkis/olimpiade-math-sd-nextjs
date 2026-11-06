import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuestionBank } from './index';
import { makeRng } from './core';
import { KISI_OBOR_LANGIT_C, selectOborLangitPaper } from './oborLangit';

const rows = buildQuestionBank();

test('obor langit C paper: 30 PG (3 per kisi) then 2 esai from different kisi', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const paper = selectOborLangitPaper(rows, makeRng(seed).next);
    assert.equal(paper.length, 32, `seed ${seed}`);
    const pg = paper.slice(0, 30);
    const esai = paper.slice(30);
    assert.ok(pg.every((r) => r.format === 'pilihan_ganda'), 'first 30 are PG');
    assert.ok(esai.every((r) => r.format === 'isian'), 'last 2 are esai');
    assert.notEqual(esai[0].oborKisi, esai[1].oborKisi, 'esai from different kisi');
    assert.equal(new Set(paper.map((r) => r.id)).size, 32);
    assert.ok(paper.every((r) => r.level !== 'Nasional'));
    for (const k of KISI_OBOR_LANGIT_C) {
      assert.equal(pg.filter((r) => r.oborKisi === k).length, 3, `${k} has 3 PG (seed ${seed})`);
    }
  }
});
