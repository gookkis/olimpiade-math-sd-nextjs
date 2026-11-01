import { OlympiadQuestion, SimilarPracticeQuestion } from '../data/questionBank';
import { SimulationSummary } from '../utils/olympiadRules';

export interface UserExamAttempt {
  id: string;
  presetId: string;
  presetName: string;
  date: string; // ISO string
  durationMinutes: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, string>;
  flaggedQuestionIds: string[];
  questionTimeSpent: Record<string, number>;
  questions: OlympiadQuestion[];
  summary: SimulationSummary;
}

export interface DrillProgress {
  topic: string;
  subtopic: string;
  totalAnswered: number;
  totalCorrect: number;
  avgSeconds: number;
  lastTrained: string;
}

export interface StudentProfile {
  name: string;
  schoolGrade: string; // e.g. "SD Kelas 5"
  streak: number;
  lastActiveDate: string | null;
  dailyGoalTarget: number; // e.g. 10 questions per day
  dailyGoalCompletedToday: number;
  pastAttempts: UserExamAttempt[];
  drillStats: Record<string, DrillProgress>;
}
