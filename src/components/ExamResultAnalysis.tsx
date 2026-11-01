import React, { useState } from 'react';
import {
  Award,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { UserExamAttempt } from '../types/olympiad';
import { OlympiadQuestion } from '../data/questionBank';
import { formatDuration } from '../utils/olympiadRules';
import { GeminiTutorDrawer } from './GeminiTutorDrawer';

interface ExamResultAnalysisProps {
  attempt: UserExamAttempt;
  onRetakeExam: () => void;
  onLaunchSimilarDrill: (question: OlympiadQuestion) => void;
  onGoToDashboard: () => void;
}

export const ExamResultAnalysis: React.FC<ExamResultAnalysisProps> = ({
  attempt,
  onRetakeExam,
  onLaunchSimilarDrill,
  onGoToDashboard,
}) => {
  const { summary, questions, userAnswers, questionTimeSpent } = attempt;

  // Filter for reviewed questions
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'flagged'>('all');

  // Gemini Tutor Drawer state
  const [activeTutorQuestion, setActiveTutorQuestion] = useState<OlympiadQuestion | null>(null);

  // Medal styling and badge
  const medalConfig = {
    Emas: {
      title: 'Medali Emas 🥇',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      gradient: 'from-amber-500 via-yellow-400 to-amber-600',
      text: 'Luar Biasa! Kemampuanmu sudah setara juara nasional OSN!',
    },
    Perak: {
      title: 'Medali Perak 🥈',
      badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
      gradient: 'from-slate-400 via-slate-300 to-slate-500',
      text: 'Hebat! Penguasaan konsep sangat baik dan tinggal memoles beberapa trik cepat.',
    },
    Perunggu: {
      title: 'Medali Perunggu 🥉',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
      gradient: 'from-amber-700 via-amber-600 to-amber-800',
      text: 'Bagus! Potensimu sangat tinggi, perbanyak latihan tipe soal HOTS.',
    },
    'Honorable Mention': {
      title: 'Honorable Mention 🎖️',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      gradient: 'from-blue-600 to-indigo-600',
      text: 'Usaha yang mantap! Evaluasi soal yang salah untuk melipatgandakan skor.',
    },
    'Perlu Latihan Intensif': {
      title: 'Peserta Berpotensi 🌱',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      gradient: 'from-emerald-600 to-teal-700',
      text: 'Langkah awal yang baik! Pelajari pembahasan dan tanyakan materi ke Guru AI GLM.',
    },
  }[summary.medal];

  // Filtered questions
  const displayedQuestions = questions.filter((q) => {
    const userAns = (userAnswers[q.id] || '').trim();
    const isCorrect = userAns.toUpperCase() === q.correctAnswer.toUpperCase();
    const isFlagged = attempt.flaggedQuestionIds.includes(q.id);

    if (filterMode === 'wrong') return !isCorrect;
    if (filterMode === 'flagged') return isFlagged || userAns === '';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner & Medal Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${medalConfig.gradient} flex items-center justify-center shadow-lg text-white font-extrabold text-3xl shrink-0`}
            >
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-1.5 ${medalConfig.badgeClass}`}>
                {medalConfig.title}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hasil Simulasi: {attempt.presetName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{medalConfig.text}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onRetakeExam}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Simulasi
            </button>
            <button
              onClick={onGoToDashboard}
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              Lihat Rapor Belajar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Skor Resmi OSN</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                {summary.rawScore}
              </span>
              <span className="text-xs text-slate-400">/ {summary.maxPossibleScore}</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              (+4 Benar, -1 Salah)
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Tingkat Akurasi</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                {summary.percentageScore}%
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 block mt-1">
              {summary.correctCount} dari {summary.totalQuestions} Soal Benar
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Waktu Pengerjaan</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-800">
                {formatDuration(summary.totalTimeSpentSeconds)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Rata-rata {summary.avgTimePerQuestionSeconds}s / soal
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Status Kecepatan</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-amber-600">
                {summary.speedRating}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {summary.fastCorrectCount} Soal Cepat (&lt;50s)
            </span>
          </div>
        </div>
      </div>

      {/* Deep Analytics Grid: Topic Mastery & Time Sinks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Mastery (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Analisis Penguasaan Materi & Topik
            </h2>
            <span className="text-xs text-slate-500">Standar OSN SD</span>
          </div>

          <div className="space-y-4">
            {Object.entries(summary.topicMastery).map(([topic, stat]) => (
              <div key={topic} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{stat.correct} / {stat.total} Soal</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      stat.percentage >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : stat.percentage >= 50
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {stat.status} ({stat.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.percentage >= 80
                        ? 'bg-emerald-500'
                        : stat.percentage >= 50
                        ? 'bg-blue-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Difficulty Breakdown */}
          <div className="pt-6 mt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            {Object.entries(summary.difficultyBreakdown).map(([diff, stat]) => (
              <div key={diff} className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">{diff}</span>
                <span className="text-base font-extrabold text-slate-800">{stat.percentage}%</span>
                <span className="text-[10px] text-slate-400 block">{stat.correct}/{stat.total} Benar</span>
              </div>
            ))}
          </div>
        </div>

        {/* Speed Analysis & Recommendations (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Efisiensi & Waktu Pengerjaan
            </h2>

            <div className="space-y-3 mb-6">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Soal Memakan Waktu (&gt;150s)
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Terdapat <strong>{summary.timeSinkCount} soal</strong> yang kamu kerjakan cukup lama. Dalam olimpiade, jika sudah 2 menit belum menemukan pola, tandai ragu dan lewati terlebih dahulu!
                </p>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Rekomendasi Pelatih OSN
                </div>
                <ul className="text-xs text-indigo-900 space-y-1.5 list-disc list-inside">
                  {summary.recommendedFocus.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Bot className="w-4 h-4" />
              Fitur Chat Guru AI GLM (SumoPod)
            </div>
            <p className="text-slate-300 leading-relaxed">
              Klik tombol <strong>"Tanya Guru AI"</strong> pada nomor soal di bawah untuk berdialog interaktif, meminta analogi sederhana, atau menguji pemahaman dengan soal baru!
            </p>
          </div>
        </div>
      </div>

      {/* Review Questions Section with Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pembahasan Detail & Tanya Guru AI</h2>
            <p className="text-xs text-slate-500">
              Pelajari langkah penyelesaian dan diskusikan langsung bagian yang masih membingungkan
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({questions.length})
            </button>
            <button
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'wrong'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Salah Saja ({summary.wrongCount})
            </button>
            <button
              onClick={() => setFilterMode('flagged')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'flagged'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ragu / Kosong ({summary.unansweredCount + attempt.flaggedQuestionIds.length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {displayedQuestions.map((q) => {
            const userAns = (userAnswers[q.id] || '').trim();
            const isCorrect = userAns.toUpperCase() === q.correctAnswer.toUpperCase();
            const timeSpent = questionTimeSpent[q.id] || 0;
            const originalIndex = questions.findIndex((item) => item.id === q.id);

            return (
              <div
                key={q.id}
                className={`rounded-2xl border-2 p-5 sm:p-6 transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-white'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center text-white ${
                        isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {originalIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{q.topic}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600">{q.subtopic}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeSpent}s
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Benar
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Salah
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-slate-900 text-sm sm:text-base font-medium whitespace-pre-line mb-4">
                  {q.question}
                </p>

                {/* Answers Comparison */}
                <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block">Jawaban Kamu:</span>
                    <strong className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                      {userAns || '(Tidak Dijawab)'}
                    </strong>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-slate-500 block">Kunci Jawaban Benar:</span>
                    <strong className="text-emerald-700 font-bold">{q.correctAnswer}</strong>
                  </div>
                </div>

                {/* Official Step-by-Step Explanation */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed mb-4">
                  <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5 text-xs">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Pembahasan Langkah Demi Langkah:
                  </h4>
                  <div className="whitespace-pre-line text-slate-700 font-normal">
                    {q.explanation}
                  </div>
                </div>

                {/* Olympiad Secret Trick */}
                {q.tipsTrik && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 mb-4 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-amber-950 mb-0.5">Trik Cepat Juara OSN:</strong>
                      <span>{q.tipsTrik}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Chat with Gemini & Drill Similar */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => onLaunchSimilarDrill(q)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    Latih Soal Tipe Serupa
                  </button>

                  <button
                    onClick={() => setActiveTutorQuestion(q)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Bot className="w-4 h-4 text-amber-300" />
                    Tanya Guru AI GLM (Bahas Detail)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gemini Tutor Drawer */}
      <GeminiTutorDrawer
        isOpen={activeTutorQuestion !== null}
        onClose={() => setActiveTutorQuestion(null)}
        question={activeTutorQuestion}
        userAnswer={activeTutorQuestion ? userAnswers[activeTutorQuestion.id] : undefined}
        onLaunchSimilarDrill={(q) => {
          setActiveTutorQuestion(null);
          onLaunchSimilarDrill(q);
        }}
      />
    </div>
  );
};
