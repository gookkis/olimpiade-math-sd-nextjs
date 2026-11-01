import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'olimpiade.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      school_grade TEXT NOT NULL DEFAULT 'SD Kelas 5',
      role TEXT NOT NULL DEFAULT 'student',
      streak INTEGER NOT NULL DEFAULT 1,
      last_active_date TEXT,
      daily_goal_target INTEGER NOT NULL DEFAULT 10,
      daily_goal_completed_today INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      subtopic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      format TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT, -- JSON array
      correct_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      tips_trik TEXT NOT NULL,
      target_seconds INTEGER NOT NULL DEFAULT 75,
      similar_questions TEXT -- JSON array
    );

    CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

    CREATE TABLE IF NOT EXISTS exam_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      preset_id TEXT NOT NULL,
      preset_name TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      time_spent_seconds INTEGER NOT NULL,
      user_answers TEXT NOT NULL, -- JSON
      flagged_question_ids TEXT NOT NULL, -- JSON
      question_time_spent TEXT NOT NULL, -- JSON
      questions_data TEXT NOT NULL, -- JSON
      summary TEXT NOT NULL, -- JSON
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON exam_attempts(user_id);

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS drill_stats (
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      subtopic TEXT NOT NULL,
      total_answered INTEGER NOT NULL DEFAULT 0,
      total_correct INTEGER NOT NULL DEFAULT 0,
      avg_seconds INTEGER NOT NULL DEFAULT 0,
      last_trained TEXT NOT NULL,
      PRIMARY KEY (user_id, topic),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migration: competition level (Kabupaten/Kota, Provinsi, Nasional) for older databases
  const questionCols = db.prepare('PRAGMA table_info(questions)').all() as { name: string }[];
  if (!questionCols.some((c) => c.name === 'level')) {
    db.exec(`ALTER TABLE questions ADD COLUMN level TEXT NOT NULL DEFAULT 'Kabupaten/Kota'`);
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level)');
}
