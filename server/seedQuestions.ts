import { db } from './db';
import { buildQuestionBank, QUESTION_BANK_VERSION } from './bank';

/**
 * Seeds the question bank. The bank is regenerated whenever QUESTION_BANK_VERSION
 * changes, so improving the generators automatically refreshes existing databases.
 * Past exam attempts keep their own copy of the questions (questions_data), so
 * re-seeding never breaks history.
 */
export function seedQuestionsIfEmpty(): number {
  const count = (db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number }).count;
  const meta = db.prepare(`SELECT value FROM app_meta WHERE key = 'question_bank_version'`).get() as { value: string } | undefined;

  if (meta?.value === QUESTION_BANK_VERSION && count > 0) {
    console.log(`Bank soal versi ${QUESTION_BANK_VERSION} sudah terpasang (${count} soal).`);
    return count;
  }

  console.log(`Membangun bank soal versi ${QUESTION_BANK_VERSION} (sebelumnya: ${meta?.value ?? 'lama'}, ${count} soal)...`);
  const rows = buildQuestionBank();

  const insert = db.prepare(`
    INSERT INTO questions (
      id, topic, subtopic, difficulty, level, format, question, options, correct_answer, explanation, tips_trik, target_seconds, similar_questions
    ) VALUES (
      @id, @topic, @subtopic, @difficulty, @level, @format, @question, @options, @correct_answer, @explanation, @tips_trik, @target_seconds, @similar_questions
    )
  `);

  db.transaction(() => {
    db.exec('DELETE FROM questions');
    for (const row of rows) insert.run(row);
    db.prepare(`INSERT INTO app_meta (key, value) VALUES ('question_bank_version', ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(QUESTION_BANK_VERSION);
  })();

  const finalCount = (db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number }).count;
  console.log(`Berhasil memasang ${finalCount} soal.`);
  return finalCount;
}
