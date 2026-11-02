import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOlympiadScore, updateDailyStreak, formatDuration, QuestionResult } from './olympiadRules';

test('calculateOlympiadScore computes correct OSN score and stats', () => {
  const dummyResults: QuestionResult[] = [
    { questionId: '1', topic: 'Bilangan', difficulty: 'Mudah', isCorrect: true, timeSpentSeconds: 40, userAnswer: 'A', correctAnswer: 'A' },
    { questionId: '2', topic: 'Bilangan', difficulty: 'Sedang', isCorrect: true, timeSpentSeconds: 70, userAnswer: 'B', correctAnswer: 'B' },
    { questionId: '3', topic: 'Geometri', difficulty: 'Sedang', isCorrect: false, timeSpentSeconds: 160, userAnswer: 'C', correctAnswer: 'D' },
    { questionId: '4', topic: 'Geometri', difficulty: 'HOTS', isCorrect: false, timeSpentSeconds: 180, userAnswer: '', correctAnswer: '12' },
    { questionId: '5', topic: 'Aljabar', difficulty: 'Mudah', isCorrect: true, timeSpentSeconds: 30, userAnswer: 'A', correctAnswer: 'A' },
  ];

  const summary = calculateOlympiadScore(dummyResults, 'OSN_STANDARD');

  assert.equal(summary.totalQuestions, 5);
  assert.equal(summary.correctCount, 3);
  assert.equal(summary.wrongCount, 1);
  assert.equal(summary.unansweredCount, 1);
  // OSN Score: (3 * 4) - (1 * 1) = 11
  assert.equal(summary.rawScore, 11);
  assert.equal(summary.maxPossibleScore, 20);
  assert.equal(summary.percentageScore, 60); // 3 / 5 = 60%
  assert.equal(summary.medal, 'Perunggu');
  assert.equal(summary.fastCorrectCount, 2); // 40s and 30s
  assert.equal(summary.timeSinkCount, 2); // 160s and 180s

  assert.ok(summary.topicMastery['Bilangan']);
  assert.equal(summary.topicMastery['Bilangan'].percentage, 100);
  assert.ok(summary.topicMastery['Geometri']);
  assert.equal(summary.topicMastery['Geometri'].percentage, 0);
  assert.ok(summary.recommendedFocus.includes('Geometri'));
});

test('calculateOlympiadScore uses OSN 2026 difficulty weights by default (no penalty)', () => {
  const results: QuestionResult[] = [
    { questionId: '1', topic: 'Bilangan', difficulty: 'Mudah', isCorrect: true, timeSpentSeconds: 40, userAnswer: 'A', correctAnswer: 'A' },
    { questionId: '2', topic: 'Bilangan', difficulty: 'Sedang', isCorrect: true, timeSpentSeconds: 60, userAnswer: '12', correctAnswer: '12' },
    { questionId: '3', topic: 'Geometri', difficulty: 'HOTS', isCorrect: true, timeSpentSeconds: 90, userAnswer: '7', correctAnswer: '7' },
    { questionId: '4', topic: 'Geometri', difficulty: 'HOTS', isCorrect: false, timeSpentSeconds: 90, userAnswer: '8', correctAnswer: '9' },
    { questionId: '5', topic: 'Aljabar', difficulty: 'Sedang', isCorrect: false, timeSpentSeconds: 30, userAnswer: '', correctAnswer: '3' },
  ];

  const summary = calculateOlympiadScore(results);
  assert.equal(summary.scoringModel, 'OSN_2026_WEIGHTED');
  // 1 + 1.25 + 1.5 = 3.75; the wrong answer costs nothing
  assert.equal(summary.rawScore, 3.75);
  // 1 + 1.25 + 1.5 + 1.5 + 1.25 = 6.5
  assert.equal(summary.maxPossibleScore, 6.5);
});

test('calculateOlympiadScore awards Gold medal for >=84%', () => {
  const results: QuestionResult[] = Array.from({ length: 10 }, (_, i) => ({
    questionId: `q-${i}`,
    topic: 'Bilangan',
    difficulty: 'Sedang',
    isCorrect: i < 9, // 90%
    timeSpentSeconds: 60,
    userAnswer: i < 9 ? 'A' : 'B',
    correctAnswer: 'A',
  }));

  const summary = calculateOlympiadScore(results);
  assert.equal(summary.percentageScore, 90);
  assert.equal(summary.medal, 'Emas');
});

test('updateDailyStreak correctly handles streaks', () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // New user
  const initial = updateDailyStreak(null, 0);
  assert.equal(initial.newStreak, 1);

  // Consecutive day
  const consecutive = updateDailyStreak(yesterday, 3);
  assert.equal(consecutive.newStreak, 4);

  // Same day
  const sameDay = updateDailyStreak(today, 4);
  assert.equal(sameDay.newStreak, 4);
});

test('formatDuration formats seconds nicely', () => {
  assert.equal(formatDuration(45), '45 detik');
  assert.equal(formatDuration(125), '2m 5s');
});

test('Lomba SD scoring: correct 1 point, wrong 0, blank 0 regardless of difficulty', () => {
  const results: QuestionResult[] = [
    { questionId: '1', topic: 'A', difficulty: 'Mudah', isCorrect: true, timeSpentSeconds: 30, userAnswer: 'A', correctAnswer: 'A' },
    { questionId: '2', topic: 'A', difficulty: 'HOTS', isCorrect: true, timeSpentSeconds: 30, userAnswer: '12', correctAnswer: '12' },
    { questionId: '3', topic: 'B', difficulty: 'Sedang', isCorrect: false, timeSpentSeconds: 30, userAnswer: 'B', correctAnswer: 'C' },
    { questionId: '4', topic: 'B', difficulty: 'HOTS', isCorrect: false, timeSpentSeconds: 30, userAnswer: '', correctAnswer: '7' },
  ];
  const summary = calculateOlympiadScore(results, 'PERCENTAGE');
  assert.equal(summary.rawScore, 2);
  assert.equal(summary.maxPossibleScore, 4);
  assert.equal(summary.wrongCount, 1);
  assert.equal(summary.unansweredCount, 1);
});
