import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { db, initDatabase } from './server/db';
import { seedQuestionsIfEmpty } from './server/seedQuestions';

dotenv.config();

// Initialize SQLite database and seed 1500 questions
initDatabase();
seedQuestionsIfEmpty();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// AUTHENTICATION ROUTES (SQLite)
// ==========================================

// Helper to hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

// Update streak helper
function calculateStreak(lastActiveStr: string | null, currentStreak: number): { streak: number; todayStr: string } {
  const todayStr = new Date().toISOString().split('T')[0];
  if (!lastActiveStr) {
    return { streak: 1, todayStr };
  }
  if (lastActiveStr === todayStr) {
    return { streak: Math.max(1, currentStreak), todayStr };
  }
  const last = new Date(lastActiveStr);
  const today = new Date(todayStr);
  const diffDays = Math.ceil(Math.abs(today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return { streak: currentStreak + 1, todayStr };
  }
  return { streak: 1, todayStr };
}

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, name, schoolGrade = 'SD Kelas 5', role = 'student' } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, dan nama wajib diisi' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
    if (existing) {
      return res.status(400).json({ error: 'Username sudah digunakan. Silakan pilih username lain.' });
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const hashedPassword = hashPassword(password);
    const todayStr = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO users (id, username, password, name, school_grade, role, streak, last_active_date, daily_goal_target, daily_goal_completed_today, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, cleanUsername, hashedPassword, name.trim(), schoolGrade, role, 1, todayStr, 10, 0, new Date().toISOString());

    const user = db.prepare('SELECT id, username, name, school_grade, role, streak, last_active_date, daily_goal_target, daily_goal_completed_today, created_at FROM users WHERE id = ?').get(id);
    return res.json({ user });
  } catch (err: any) {
    console.error('Error in register:', err);
    return res.status(500).json({ error: 'Gagal membuat akun', details: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const userRow: any = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);

    if (!userRow) {
      return res.status(401).json({ error: 'Akun tidak ditemukan. Silakan periksa username atau buat akun baru.' });
    }

    const hashedPassword = hashPassword(password);
    if (userRow.password !== hashedPassword) {
      return res.status(401).json({ error: 'Password salah. Silakan coba lagi.' });
    }

    // Update streak if needed
    const { streak, todayStr } = calculateStreak(userRow.last_active_date, userRow.streak);
    db.prepare('UPDATE users SET streak = ?, last_active_date = ? WHERE id = ?').run(streak, todayStr, userRow.id);

    const updatedUser = db.prepare('SELECT id, username, name, school_grade, role, streak, last_active_date, daily_goal_target, daily_goal_completed_today, created_at FROM users WHERE id = ?').get(userRow.id);
    return res.json({ user: updatedUser });
  } catch (err: any) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Gagal login', details: err.message });
  }
});

// Get User Profile & Available Accounts (for fast switcher)
app.get('/api/auth/users', (_req, res) => {
  try {
    const users = db.prepare('SELECT id, username, name, school_grade, role, streak, last_active_date, daily_goal_target, daily_goal_completed_today FROM users ORDER BY created_at DESC').all();
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memuat daftar user' });
  }
});

app.get('/api/auth/user/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, name, school_grade, role, streak, last_active_date, daily_goal_target, daily_goal_completed_today, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memuat profil' });
  }
});

// Parent monitoring: get all registered children with summary stats
app.get('/api/parent/children', (_req, res) => {
  try {
    const students = db.prepare(`
      SELECT 
        u.id, u.username, u.name, u.school_grade, u.role, u.streak, u.last_active_date, 
        u.daily_goal_target, u.daily_goal_completed_today, u.created_at,
        COUNT(a.id) as total_simulations
      FROM users u
      LEFT JOIN exam_attempts a ON u.id = a.user_id
      WHERE u.role = 'student' OR u.role IS NULL
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    return res.json({ students });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memuat data anak', details: err.message });
  }
});

// Parent capability: Update student's daily goal target
app.post('/api/users/update-goal', (req, res) => {
  try {
    const { userId, dailyGoalTarget } = req.body;
    if (!userId || !dailyGoalTarget) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }
    const target = Math.max(1, parseInt(dailyGoalTarget, 10));
    db.prepare('UPDATE users SET daily_goal_target = ? WHERE id = ?').run(target, userId);
    return res.json({ success: true, dailyGoalTarget: target });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memperbarui target harian' });
  }
});

// ==========================================
// QUESTION BANK ROUTES (1500 SOAL)
// ==========================================

// Question Stats & Totals
app.get('/api/questions/stats', (_req, res) => {
  try {
    const total = (db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number }).count;
    const byTopic = db.prepare('SELECT topic, COUNT(*) as count FROM questions GROUP BY topic').all();
    const byDifficulty = db.prepare('SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty').all();
    return res.json({ total, byTopic, byDifficulty });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memuat statistik soal' });
  }
});

// Query Questions with filter & pagination
app.get('/api/questions', (req, res) => {
  try {
    const { topic, difficulty, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: any[] = [];

    if (topic && topic !== 'Semua') {
      conditions.push('topic = ?');
      params.push(topic);
    }
    if (difficulty && difficulty !== 'Semua') {
      conditions.push('difficulty = ?');
      params.push(difficulty);
    }
    if (search && (search as string).trim()) {
      conditions.push('(question LIKE ? OR subtopic LIKE ? OR explanation LIKE ? OR tips_trik LIKE ?)');
      const term = `%${(search as string).trim()}%`;
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as count FROM questions ${whereClause}`;
    const total = (db.prepare(countQuery).get(...params) as { count: number }).count;

    const dataQuery = `SELECT * FROM questions ${whereClause} LIMIT ? OFFSET ?`;
    const rows = db.prepare(dataQuery).all(...params, limitNum, offset);

    const questions = rows.map((r: any) => ({
      id: r.id,
      topic: r.topic,
      subtopic: r.subtopic,
      difficulty: r.difficulty,
      format: r.format,
      question: r.question,
      options: r.options ? JSON.parse(r.options) : [],
      correctAnswer: r.correct_answer,
      explanation: r.explanation,
      tipsTrik: r.tips_trik,
      targetSeconds: r.target_seconds,
      similarQuestions: r.similar_questions ? JSON.parse(r.similar_questions) : [],
    }));

    return res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      questions,
    });
  } catch (err: any) {
    console.error('Error getting questions:', err);
    return res.status(500).json({ error: 'Gagal memuat soal' });
  }
});

// Random Exam Questions (Balanced across 5 pillars)
app.get('/api/questions/exam', (req, res) => {
  try {
    const count = parseInt(req.query.count as string, 10) || 10;
    const perTopic = Math.max(1, Math.floor(count / 5));

    const topics = [
      'Bilangan & Aritmatika',
      'Aljabar & Pola Bilangan',
      'Geometri & Pengukuran',
      'Kombinatorika & Peluang',
      'Logika & Masalah HOTS',
    ];

    let selectedQuestions: any[] = [];

    for (const top of topics) {
      const rows = db.prepare('SELECT * FROM questions WHERE topic = ? ORDER BY RANDOM() LIMIT ?').all(top, perTopic);
      selectedQuestions.push(...rows);
    }

    // Fill remaining if needed
    if (selectedQuestions.length < count) {
      const remaining = count - selectedQuestions.length;
      const ids = selectedQuestions.map((q) => q.id);
      const placeholders = ids.map(() => '?').join(',');
      const extraRows = db.prepare(`SELECT * FROM questions WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`).all(...ids, remaining);
      selectedQuestions.push(...extraRows);
    }

    // Shuffle questions
    selectedQuestions.sort(() => Math.random() - 0.5);

    const questions = selectedQuestions.map((r: any) => ({
      id: r.id,
      topic: r.topic,
      subtopic: r.subtopic,
      difficulty: r.difficulty,
      format: r.format,
      question: r.question,
      options: r.options ? JSON.parse(r.options) : [],
      correctAnswer: r.correct_answer,
      explanation: r.explanation,
      tipsTrik: r.tips_trik,
      targetSeconds: r.target_seconds,
      similarQuestions: r.similar_questions ? JSON.parse(r.similar_questions) : [],
    }));

    return res.json({ questions });
  } catch (err: any) {
    console.error('Error generating exam questions:', err);
    return res.status(500).json({ error: 'Gagal menyiapkan soal ujian' });
  }
});

// ==========================================
// EXAM ATTEMPTS & PROGRESS ROUTES (SQLite)
// ==========================================

// Save attempt
app.post('/api/attempts', (req, res) => {
  try {
    const {
      id,
      userId,
      presetId,
      presetName,
      date,
      durationMinutes,
      timeSpentSeconds,
      userAnswers,
      flaggedQuestionIds,
      questionTimeSpent,
      questions,
      summary,
    } = req.body;

    if (!userId || !questions || !summary) {
      return res.status(400).json({ error: 'Data ujian tidak lengkap' });
    }

    const attemptId = id || `attempt-${Date.now()}`;
    const attemptDate = date || new Date().toISOString();

    db.prepare(`
      INSERT INTO exam_attempts (
        id, user_id, preset_id, preset_name, date, duration_minutes, time_spent_seconds,
        user_answers, flagged_question_ids, question_time_spent, questions_data, summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      userId,
      presetId,
      presetName,
      attemptDate,
      durationMinutes,
      timeSpentSeconds,
      JSON.stringify(userAnswers || {}),
      JSON.stringify(flaggedQuestionIds || []),
      JSON.stringify(questionTimeSpent || {}),
      JSON.stringify(questions || []),
      JSON.stringify(summary || {})
    );

    // Update user daily completed count & streak
    const userRow: any = db.prepare('SELECT streak, last_active_date, daily_goal_completed_today FROM users WHERE id = ?').get(userId);
    if (userRow) {
      const { streak, todayStr } = calculateStreak(userRow.last_active_date, userRow.streak);
      const newDaily = userRow.daily_goal_completed_today + (questions.length || 0);
      db.prepare('UPDATE users SET streak = ?, last_active_date = ?, daily_goal_completed_today = ? WHERE id = ?').run(
        streak,
        todayStr,
        newDaily,
        userId
      );
    }

    return res.json({ success: true, attemptId });
  } catch (err: any) {
    console.error('Error saving attempt:', err);
    return res.status(500).json({ error: 'Gagal menyimpan hasil simulasi' });
  }
});

// Get user past attempts
app.get('/api/attempts/:userId', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM exam_attempts WHERE user_id = ? ORDER BY date DESC').all(req.params.userId);
    const attempts = rows.map((r: any) => ({
      id: r.id,
      presetId: r.preset_id,
      presetName: r.preset_name,
      date: r.date,
      durationMinutes: r.duration_minutes,
      timeSpentSeconds: r.time_spent_seconds,
      userAnswers: JSON.parse(r.user_answers || '{}'),
      flaggedQuestionIds: JSON.parse(r.flagged_question_ids || '[]'),
      questionTimeSpent: JSON.parse(r.question_time_spent || '{}'),
      questions: JSON.parse(r.questions_data || '[]'),
      summary: JSON.parse(r.summary || '{}'),
    }));
    return res.json({ attempts });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memuat riwayat ujian' });
  }
});

// Save Drill Progress
app.post('/api/drill-progress', (req, res) => {
  try {
    const { userId, topic, subtopic = 'Latihan Kilat', answered, correct, totalSeconds } = req.body;
    if (!userId || !topic) return res.status(400).json({ error: 'Data drill tidak lengkap' });

    const existing: any = db.prepare('SELECT * FROM drill_stats WHERE user_id = ? AND topic = ?').get(userId, topic);
    const todayStr = new Date().toISOString().split('T')[0];

    if (existing) {
      const newAnswered = existing.total_answered + answered;
      const newCorrect = existing.total_correct + correct;
      const newAvgSec = Math.round(
        (existing.avg_seconds * existing.total_answered + totalSeconds) / Math.max(1, newAnswered)
      );
      db.prepare(`
        UPDATE drill_stats SET total_answered = ?, total_correct = ?, avg_seconds = ?, last_trained = ?
        WHERE user_id = ? AND topic = ?
      `).run(newAnswered, newCorrect, newAvgSec, todayStr, userId, topic);
    } else {
      const avgSec = Math.round(totalSeconds / Math.max(1, answered));
      db.prepare(`
        INSERT INTO drill_stats (user_id, topic, subtopic, total_answered, total_correct, avg_seconds, last_trained)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, topic, subtopic, answered, correct, avgSec, todayStr);
    }

    // Update daily questions
    db.prepare('UPDATE users SET daily_goal_completed_today = daily_goal_completed_today + ? WHERE id = ?').run(answered, userId);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menyimpan progres drill' });
  }
});

// ==========================================
// SUMOPOD GLM & GEMINI AI TUTOR CHAT ENDPOINTS
// ==========================================

async function callSumoPodGLM({
  systemInstruction,
  messages,
  userPrompt,
}: {
  systemInstruction: string;
  messages?: Array<{ role: 'user' | 'model'; text: string }>;
  userPrompt: string;
}): Promise<{ reply: string; model: string } | null> {
  const apiKey = process.env.SUMOPOD_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com/v1').replace(/\/$/, '');
  const model = process.env.SUMOPOD_MODEL || 'glm-4';

  const formattedMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemInstruction },
  ];

  if (messages && Array.isArray(messages)) {
    const recent = messages.slice(-6);
    for (const m of recent) {
      formattedMessages.push({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text,
      });
    }
  }

  formattedMessages.push({
    role: 'user',
    content: userPrompt,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`SumoPod GLM API error (${response.status}):`, errText);
      return null;
    }

    const data: any = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (reply && typeof reply === 'string' && reply.trim()) {
      return { reply: reply.trim(), model };
    }
    return null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('SumoPod GLM request failed or timed out:', err?.message);
    return null;
  }
}

async function handleAIChatRequest(req: express.Request, res: express.Response) {
  try {
    const {
      question,
      topic,
      difficulty,
      options,
      userAnswer,
      correctAnswer,
      officialExplanation,
      tipsTrik,
      message,
      history,
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Pesan pertanyaan tidak boleh kosong' });
    }

    const systemInstruction = `Kamu adalah "Guru Pembina Olimpiade Matematika SD", seorang pelatih nasional OSN dan kompetisi matematika SD internasional (SASMO, Kangaroo).
Karaktermu:
- Sangat sabar, ramah, antusias, dan menyemangati murid SD (usia 9-12 tahun).
- Jangan gunakan istilah kalkulus atau aljabar rumit tingkat SMA. Selalu gunakan logika matematika SD, metode kotak/bar model, analogi benda nyata, atau pola bilangan.
- Berikan apresiasi pada usaha mereka terlebih dahulu.
- Jika siswa salah menjawab (Jawaban siswa: ${userAnswer || 'Belum diisi/ragu'}, Kunci jawaban: ${correctAnswer}), jelaskan di mana letak jebakan soal dan kenapa jawaban tersebut keliru.
- Jika siswa menanyakan cara cepat / rumus sakti, ajarkan "Trik Cepat Olimpiade" yang mudah diingat.
- Buat penjelasan terstruktur dengan poin-poin (1, 2, 3), kalimat yang ringkas, dan jelas.

Konteks Soal:
- Topik: ${topic || 'Olimpiade Matematika SD'}
- Tingkat Kesulitan: ${difficulty || 'Sedang'}
- Teks Soal: ${question}
${options && Array.isArray(options) && options.length > 0 ? `- Pilihan Jawaban:\n${options.join('\n')}` : ''}
- Jawaban Siswa: ${userAnswer || 'Belum dijawab'}
- Kunci Jawaban Benar: ${correctAnswer}
- Pembahasan Resmi: ${officialExplanation}
- Trik Cepat Resmi: ${tipsTrik}
`;

    const promptText = `Peran: Kamu adalah Guru Pembina Olimpiade Matematika SD.
Konteks Soal:
Topik: ${topic || 'Olimpiade SD'}
Soal: ${question}
${options && Array.isArray(options) ? `Pilihan: ${options.join(', ')}` : ''}
Jawaban Siswa: ${userAnswer || 'Belum diisi'}
Kunci Benar: ${correctAnswer}
Pembahasan Resmi: ${officialExplanation}
Trik Cepat: ${tipsTrik}

Pertanyaan Murid:
"${message}"

Berikan bimbingan ramah anak SD usia 9-12 tahun. Singkat, jelas, gunakan poin-poin terstruktur, dan berikan trik cepat.`;

    const fallbackTutorReply = generatePedagogicalResponse({
      topic,
      difficulty,
      question,
      userAnswer,
      correctAnswer,
      officialExplanation,
      tipsTrik,
      message,
    });

    // 1. Try SumoPod GLM Model first if API key is provided
    if (process.env.SUMOPOD_API_KEY) {
      const sumopodRes = await callSumoPodGLM({
        systemInstruction,
        messages: history,
        userPrompt: promptText,
      });

      if (sumopodRes) {
        return res.json({
          reply: sumopodRes.reply,
          source: 'sumopod_glm',
          model: sumopodRes.model,
        });
      }
    }

    // 2. Fallback to Gemini API if configured
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const apiCallPromise = (async () => {
          try {
            return await ai!.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: promptText,
              config: { systemInstruction },
            });
          } catch (flashErr) {
            return await ai!.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: promptText,
              config: { systemInstruction },
            });
          }
        })();

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('API Timeout')), 6000)
        );

        const response: any = await Promise.race([apiCallPromise, timeoutPromise]);
        const reply = response?.text?.trim() || fallbackTutorReply;
        return res.json({ reply, source: 'gemini', model: 'gemini-3.8-flash' });
      } catch (apiErr: any) {
        console.warn('Gemini call failed/timed out, using smart tutor fallback:', apiErr?.message);
      }
    }

    // 3. Resilient Smart Pedagogical Tutor Fallback
    return res.json({
      reply: fallbackTutorReply,
      source: 'smart_tutor_fallback',
      model: 'glm_pedagogical_engine',
    });
  } catch (error: any) {
    console.error('Error in chat handler:', error);
    return res.status(500).json({
      error: 'Gagal memproses pesan',
      details: error.message,
    });
  }
}

// Support both endpoint paths
app.post('/api/ai/chat', handleAIChatRequest);
app.post('/api/gemini/chat', handleAIChatRequest);

function generatePedagogicalResponse(ctx: {
  topic?: string;
  difficulty?: string;
  question?: string;
  userAnswer?: string;
  correctAnswer?: string;
  officialExplanation?: string;
  tipsTrik?: string;
  message: string;
}): string {
  const msgLower = (ctx.message || '').toLowerCase();

  if (msgLower.includes('trik') || msgLower.includes('cepat') || msgLower.includes('rumus')) {
    return `Halo adik juara! ⚡ Ini dia **Trik Sakti Juara OSN** untuk tipe soal ${ctx.topic || 'ini'}:

🎯 **Trik Cepat:**
${ctx.tipsTrik || 'Gunakan pola keteraturan atau penguraian faktor aljabar sederhana.'}

💡 **Kenapa cara ini efektif di olimpiade?**
Karena kamu tidak perlu menghitung manual angka yang besar. Dalam perlombaan matematika SD, soal yang kelihatannya rumit selalu menyimpan kunci pola yang bisa diselesaikan dalam waktu kurang dari 60 detik!

Cobalah trik ini di soal berikutnya ya!`;
  }

  if (msgLower.includes('salah') || msgLower.includes('keliru') || msgLower.includes('kenapa')) {
    return `Jangan bersedih ya, justru dari kesalahan kita jadi lebih pintar! 🌟

🔍 **Bedah Kesalahan & Jebakan Soal:**
- Jawaban yang kamu pilih: **${ctx.userAnswer || 'Belum diisi'}**
- Kunci jawaban yang tepat: **${ctx.correctAnswer}**

📌 **Langkah Logika yang Benar:**
${ctx.officialExplanation || 'Periksa kembali perhitungan dan sifat-sifat dasar bangun atau bilangan.'}

⚠️ **Jebakan Umum:**
Seringkali peserta olimpiade terburu-buru menghitung sebelum mengamati syarat atau selisih terkecil pada soal. Pastikan kamu selalu membaca apa yang sebenarnya ditanyakan!`;
  }

  if (msgLower.includes('analogi') || msgLower.includes('anak sd') || msgLower.includes('sederhana')) {
    return `Biar gampang dibayangkan, bayangkan seperti ini adik: 🎈

Katakanlah kita punya permen atau kotak mainan:
Setiap kali kita membaginya ke dalam kelompok yang sama, selalu ada sisa atau pola yang berulang teratur.
Dalam soal **${ctx.topic || 'matematika'}** ini:
${ctx.officialExplanation}

Lihat, matematika olimpiade itu seru seperti memecahkan teka-teki misteri, kan?`;
  }

  if (msgLower.includes('latihan') || msgLower.includes('mirip') || msgLower.includes('soal baru') || msgLower.includes('uji')) {
    return `Sip, ini Kakak siapkan 1 latihan tantangan baru yang setipe! 🎯

📝 **Tantangan Uji Reflek:**
Coba hitung nilai yang serupa dengan memperhatikan pola:
${ctx.tipsTrik}

Gunakan trik cepat di atas. Berapakah jawabanmu? Kakak tunggu!`;
  }

  return `Halo adik! Senang sekali kamu aktif bertanya. 🌟
Untuk soal **${ctx.topic || 'Olimpiade'}** ini:

1. **Konsep Kunci:**
${ctx.officialExplanation}

2. **Kunci Sukses Pengerjaan Cepat:**
${ctx.tipsTrik}

Apakah ada baris kalimat atau langkah hitungan di atas yang ingin Kakak perjelas lagi?`;
}

// Setup Vite in Dev or serve Static in Production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
