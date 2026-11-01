import { StudentProfile, UserExamAttempt } from '../types/olympiad';
import { OlympiadQuestion } from '../data/questionBank';

const CURRENT_USER_KEY = 'olimpiade_active_user_v2';

export interface UserSession {
  id: string;
  username: string;
  name: string;
  schoolGrade: string;
  role: 'student' | 'parent';
  streak: number;
  lastActiveDate: string | null;
  dailyGoalTarget: number;
  dailyGoalCompletedToday: number;
}

export function getStoredUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading user session:', e);
  }
  return null;
}

export function saveUserSession(user: UserSession | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Error saving user session:', e);
  }
}

// API client to fetch 1500 questions from SQLite
export async function apiFetchExamQuestions(count: number): Promise<OlympiadQuestion[]> {
  try {
    const res = await fetch(`/api/questions/exam?count=${count}`);
    const data = await res.json();
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch (err) {
    console.error('Error fetching exam questions from backend:', err);
  }
  return [];
}

export async function apiFetchQuestionStats(): Promise<{ total: number; byTopic: any[]; byDifficulty: any[] }> {
  try {
    const res = await fetch('/api/questions/stats');
    return await res.json();
  } catch (err) {
    console.error('Error fetching stats:', err);
    return { total: 1500, byTopic: [], byDifficulty: [] };
  }
}

export async function apiFetchQuestions(params: {
  topic?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; limit: number; totalPages: number; questions: OlympiadQuestion[] }> {
  try {
    const query = new URLSearchParams();
    if (params.topic) query.set('topic', params.topic);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/questions?${query.toString()}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching questions:', err);
    return { total: 0, page: 1, limit: 20, totalPages: 0, questions: [] };
  }
}

export async function apiSaveAttempt(attempt: UserExamAttempt, userId: string): Promise<void> {
  try {
    await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...attempt,
        userId,
      }),
    });
  } catch (err) {
    console.error('Error saving attempt to SQLite:', err);
  }
}

export async function apiFetchUserAttempts(userId: string): Promise<UserExamAttempt[]> {
  try {
    const res = await fetch(`/api/attempts/${userId}`);
    const data = await res.json();
    return data.attempts || [];
  } catch (err) {
    console.error('Error loading attempts:', err);
    return [];
  }
}

export async function apiSaveDrillProgress(stats: {
  userId: string;
  topic: string;
  subtopic?: string;
  answered: number;
  correct: number;
  totalSeconds: number;
}): Promise<void> {
  try {
    await fetch('/api/drill-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    });
  } catch (err) {
    console.error('Error saving drill progress:', err);
  }
}
