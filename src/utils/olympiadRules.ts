export interface QuestionResult {
  questionId: string;
  topic: string;
  difficulty: 'Mudah' | 'Sedang' | 'HOTS';
  isCorrect: boolean;
  timeSpentSeconds: number;
  userAnswer?: string;
  correctAnswer: string;
}

export interface SimulationSummary {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  rawScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  totalTimeSpentSeconds: number;
  avgTimePerQuestionSeconds: number;
  medal: 'Emas' | 'Perak' | 'Perunggu' | 'Honorable Mention' | 'Perlu Latihan Intensif';
  speedRating: 'Sangat Cepat' | 'Optimal' | 'Perlu Percepatan';
  topicMastery: Record<string, { total: number; correct: number; percentage: number; status: string }>;
  difficultyBreakdown: Record<string, { total: number; correct: number; percentage: number }>;
  timeSinkCount: number;
  fastCorrectCount: number;
  recommendedFocus: string[];
}

export function calculateOlympiadScore(
  results: QuestionResult[],
  scoringModel: 'OSN_STANDARD' | 'PERCENTAGE' = 'OSN_STANDARD'
): SimulationSummary {
  const totalQuestions = results.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let totalTimeSpentSeconds = 0;
  let timeSinkCount = 0;
  let fastCorrectCount = 0;

  const topicStats: Record<string, { total: number; correct: number }> = {};
  const difficultyStats: Record<string, { total: number; correct: number }> = {
    Mudah: { total: 0, correct: 0 },
    Sedang: { total: 0, correct: 0 },
    HOTS: { total: 0, correct: 0 },
  };

  for (const item of results) {
    totalTimeSpentSeconds += item.timeSpentSeconds;

    if (!topicStats[item.topic]) {
      topicStats[item.topic] = { total: 0, correct: 0 };
    }
    topicStats[item.topic].total += 1;

    if (difficultyStats[item.difficulty]) {
      difficultyStats[item.difficulty].total += 1;
    }

    if (!item.userAnswer || item.userAnswer.trim() === '') {
      unansweredCount += 1;
    } else if (item.isCorrect) {
      correctCount += 1;
      topicStats[item.topic].correct += 1;
      if (difficultyStats[item.difficulty]) {
        difficultyStats[item.difficulty].correct += 1;
      }
      if (item.timeSpentSeconds <= 50) {
        fastCorrectCount += 1;
      }
    } else {
      wrongCount += 1;
    }

    // Identify time sink questions: > 150 seconds spent
    if (item.timeSpentSeconds > 150) {
      timeSinkCount += 1;
    }
  }

  const answeredCount = correctCount + wrongCount;

  // OSN scoring standard: +4 for correct, -1 for wrong, 0 for empty
  let rawScore = 0;
  let maxPossibleScore = 0;

  if (scoringModel === 'OSN_STANDARD') {
    rawScore = correctCount * 4 - wrongCount * 1;
    maxPossibleScore = totalQuestions * 4;
  } else {
    rawScore = correctCount;
    maxPossibleScore = totalQuestions;
  }

  const percentageScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgTimePerQuestionSeconds = totalQuestions > 0 ? Math.round(totalTimeSpentSeconds / totalQuestions) : 0;

  // Medal determination
  let medal: SimulationSummary['medal'] = 'Perlu Latihan Intensif';
  if (percentageScore >= 84) {
    medal = 'Emas';
  } else if (percentageScore >= 70) {
    medal = 'Perak';
  } else if (percentageScore >= 52) {
    medal = 'Perunggu';
  } else if (percentageScore >= 35) {
    medal = 'Honorable Mention';
  }

  // Speed rating
  let speedRating: SimulationSummary['speedRating'] = 'Optimal';
  if (avgTimePerQuestionSeconds > 130) {
    speedRating = 'Perlu Percepatan';
  } else if (avgTimePerQuestionSeconds < 65 && percentageScore >= 60) {
    speedRating = 'Sangat Cepat';
  }

  // Topic mastery calculation
  const topicMastery: SimulationSummary['topicMastery'] = {};
  const recommendedFocus: string[] = [];

  for (const [topicName, stat] of Object.entries(topicStats)) {
    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    let status = 'Butuh Perhatian';
    if (pct >= 80) status = 'Master Juara';
    else if (pct >= 60) status = 'Mahir';
    else if (pct >= 40) status = 'Berkembang';

    if (pct < 60) {
      recommendedFocus.push(topicName);
    }

    topicMastery[topicName] = {
      total: stat.total,
      correct: stat.correct,
      percentage: pct,
      status,
    };
  }

  // Difficulty breakdown
  const difficultyBreakdown: SimulationSummary['difficultyBreakdown'] = {};
  for (const [diffKey, stat] of Object.entries(difficultyStats)) {
    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    difficultyBreakdown[diffKey] = {
      total: stat.total,
      correct: stat.correct,
      percentage: pct,
    };
  }

  if (recommendedFocus.length === 0 && percentageScore < 85) {
    recommendedFocus.push('Tingkatkan kecepatan pada soal HOTS');
  }

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    wrongCount,
    unansweredCount,
    rawScore,
    maxPossibleScore,
    percentageScore,
    totalTimeSpentSeconds,
    avgTimePerQuestionSeconds,
    medal,
    speedRating,
    topicMastery,
    difficultyBreakdown,
    timeSinkCount,
    fastCorrectCount,
    recommendedFocus,
  };
}

export function updateDailyStreak(lastActiveDateStr: string | null, currentStreak: number): { newStreak: number; updatedDate: string } {
  const todayStr = new Date().toISOString().split('T')[0];
  if (!lastActiveDateStr) {
    return { newStreak: 1, updatedDate: todayStr };
  }

  if (lastActiveDateStr === todayStr) {
    return { newStreak: Math.max(1, currentStreak), updatedDate: todayStr };
  }

  const lastDate = new Date(lastActiveDateStr);
  const today = new Date(todayStr);
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { newStreak: currentStreak + 1, updatedDate: todayStr };
  } else {
    return { newStreak: 1, updatedDate: todayStr };
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} detik`;
  return `${mins}m ${secs}s`;
}
