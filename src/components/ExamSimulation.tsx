import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Send,
  HelpCircle,
  Flag,
  Award,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { EXAM_PRESETS, ExamPreset, OlympiadQuestion, QUESTION_BANK } from '../data/questionBank';
import { calculateOlympiadScore, formatDuration, isAnswerCorrect, QuestionResult } from '../utils/olympiadRules';
import { ScratchpadModal } from './ScratchpadModal';
import { UserExamAttempt } from '../types/olympiad';

interface ExamSimulationProps {
  onCompleteSimulation: (attempt: UserExamAttempt) => void;
  onCancel: () => void;
}

export const ExamSimulation: React.FC<ExamSimulationProps> = ({
  onCompleteSimulation,
  onCancel,
}) => {
  // Setup state vs In-exam state
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(EXAM_PRESETS[0]);
  const [customMinutes, setCustomMinutes] = useState(60);
  const [customQuestionCount, setCustomQuestionCount] = useState(10);
  const [isExamStarted, setIsExamStarted] = useState(false);

  // Active Exam state
  const [examQuestions, setExamQuestions] = useState<OlympiadQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [initialDurationSeconds, setInitialDurationSeconds] = useState(0);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Per-question time tracking
  const [questionTimeMap, setQuestionTimeMap] = useState<Record<string, number>>({});
  const activeQuestionStartTimeRef = useRef<number>(Date.now());

  // Initialize Exam with SQLite 1500 questions
  const handleStartExam = async (preset: ExamPreset) => {
    const count = preset.id === 'custom' ? customQuestionCount : preset.questionCount;
    const duration = preset.id === 'custom' ? customMinutes : preset.durationMinutes;

    let questionsToUse: OlympiadQuestion[] = [];
    try {
      const levelParam = preset.level ? `&level=${encodeURIComponent(preset.level)}` : '';
      const blueprintParam = preset.blueprint ? `&blueprint=${preset.blueprint}` : '';
      const res = await fetch(`/api/questions/exam?count=${count}${levelParam}${blueprintParam}`);
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        questionsToUse = data.questions;
      }
    } catch (err) {
      console.warn('Fallback to local bank:', err);
    }

    if (questionsToUse.length === 0) {
      const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
      questionsToUse = shuffled.slice(0, Math.min(count, QUESTION_BANK.length));
    }

    setExamQuestions(questionsToUse);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds([]);
    setQuestionTimeMap({});
    const totalSecs = duration * 60;
    setTimeRemainingSeconds(totalSecs);
    setInitialDurationSeconds(totalSecs);
    setIsExamStarted(true);
    activeQuestionStartTimeRef.current = Date.now();
  };

  // Record time on current question when index changes
  const recordCurrentQuestionTime = (oldIndex: number) => {
    if (!examQuestions[oldIndex]) return;
    const qId = examQuestions[oldIndex].id;
    const now = Date.now();
    const elapsedSeconds = Math.max(1, Math.round((now - activeQuestionStartTimeRef.current) / 1000));
    setQuestionTimeMap((prev) => ({
      ...prev,
      [qId]: (prev[qId] || 0) + elapsedSeconds,
    }));
    activeQuestionStartTimeRef.current = now;
  };

  const handleSelectQuestionIndex = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    recordCurrentQuestionTime(currentIndex);
    setCurrentIndex(newIndex);
  };

  // Countdown Timer
  useEffect(() => {
    if (!isExamStarted) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out!
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, examQuestions, answers]);

  // Answer selection
  const handleAnswerSelect = (optionLetter: string) => {
    const activeQ = examQuestions[currentIndex];
    if (!activeQ) return;
    setAnswers((prev) => ({
      ...prev,
      [activeQ.id]: optionLetter,
    }));
  };

  // Toggle Flag (Ragu-ragu)
  const handleToggleFlag = () => {
    const activeQ = examQuestions[currentIndex];
    if (!activeQ) return;
    setFlaggedIds((prev) =>
      prev.includes(activeQ.id) ? prev.filter((id) => id !== activeQ.id) : [...prev, activeQ.id]
    );
  };

  // Submit Exam
  const handleSubmitExam = (isAutoSubmit = false) => {
    recordCurrentQuestionTime(currentIndex);
    const totalSpent = initialDurationSeconds - timeRemainingSeconds;

    // Calculate question results
    const results: QuestionResult[] = examQuestions.map((q) => {
      const userAns = (answers[q.id] || '').trim();
      const isCorrect = isAnswerCorrect(userAns, q.correctAnswer);
      const timeSpent = questionTimeMap[q.id] || 30; // fallback

      return {
        questionId: q.id,
        // Kisi-kisi presets report mastery per kisi category instead of per broad topic.
        topic: selectedPreset.blueprint && q.kisi ? q.kisi : q.topic,
        difficulty: q.difficulty,
        isCorrect,
        timeSpentSeconds: timeSpent,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
      };
    });

    const summary = calculateOlympiadScore(results, 'OSN_2026_WEIGHTED');

    const attempt: UserExamAttempt = {
      id: `attempt-${Date.now()}`,
      presetId: selectedPreset.id,
      presetName: selectedPreset.name,
      date: new Date().toISOString(),
      durationMinutes: Math.round(initialDurationSeconds / 60),
      timeSpentSeconds: totalSpent,
      userAnswers: answers,
      flaggedQuestionIds: flaggedIds,
      questionTimeSpent: questionTimeMap,
      questions: examQuestions,
      summary,
    };

    onCompleteSimulation(attempt);
  };

  // Pre-Exam Screen
  if (!isExamStarted) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <Award className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-slate-950 mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Ruang Ujian Simulasi Resmi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Simulasi Ujian Olimpiade Matematika SD
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Uji kemampuan dengan sistem waktu riil, format soal berjenjang OSN SD & IYF JSIT (Kabupaten/Kota, Provinsi, Nasional), serta evaluasi otomatis per topik.
            </p>
          </div>
        </div>

        {/* Preset Selection Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Pilih Paket Simulasi Ujian
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAM_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                      {preset.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {preset.durationMinutes} Menit
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-1">{preset.name}</h3>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{preset.description}</p>

                  {preset.kisiKisi && (
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Kisi-kisi Soal</span>
                      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-700">
                        {preset.kisiKisi.map((k, i) => (
                          <li key={k} className="flex gap-1.5">
                            <span className="font-bold text-indigo-600">{i + 1})</span>
                            <span>{k}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
                    <span>Jumlah: <strong>{preset.questionCount} Soal</strong></span>
                    <span>Tingkat: <strong>{preset.targetLevel}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam Rules & Instructions Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
          <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Aturan & Petunjuk Pengerjaan Simulasi
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span><strong>Benar: 1 poin × bobot</strong> (Mudah 1 · Sedang 1,25 · Sukar 1,5), <strong>Salah/Kosong: 0</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>Waktu berjalan terus dan ujian akan <strong>otomatis terkumpul</strong> saat waktu habis.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Gunakan fitur <strong>Tandai Ragu-ragu</strong> untuk meninjau kembali soal sulit.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>Tersedia <strong>Lembar Coretan Virtual</strong> di layar untuk berhitung tanpa kertas!</span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={() => handleStartExam(selectedPreset)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Mulai Simulasi Sekarang ({selectedPreset.durationMinutes} Menit)
          </button>
        </div>
      </div>
    );
  }

  // Active Exam Room
  const activeQuestion = examQuestions[currentIndex];
  const minutesLeft = Math.floor(timeRemainingSeconds / 60);
  const secondsLeft = timeRemainingSeconds % 60;
  const isTimeCritical = timeRemainingSeconds < 120; // under 2 mins
  const isTimeWarning = timeRemainingSeconds < 600; // under 10 mins

  const currentAnswer = activeQuestion ? answers[activeQuestion.id] || '' : '';
  const isFlagged = activeQuestion ? flaggedIds.includes(activeQuestion.id) : false;

  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].trim() !== '').length;
  const flaggedCount = flaggedIds.length;
  const unattemptedCount = examQuestions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Fixed HUD Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
              {selectedPreset.name}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Soal {currentIndex + 1} dari {examQuestions.length}
            </span>
          </div>

          {/* Real-time Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-base transition-colors ${
              isTimeCritical
                ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300'
                : isTimeWarning
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-600' : isTimeWarning ? 'text-amber-600' : 'text-indigo-600'}`} />
            <span>
              {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200"
              title="Buka Lembar Coretan"
            >
              <PenTool className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Lembar Coretan</span>
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Selesai Ujian
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Question Area */}
        <div className="lg:col-span-3 space-y-4">
          {activeQuestion && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      {selectedPreset.blueprint
                        ? `${activeQuestion.format === 'isian' ? 'Bagian B · Isian Singkat' : 'Bagian A · Pilihan Ganda'} — ${activeQuestion.kisi ?? activeQuestion.topic}`
                        : activeQuestion.topic}
                    </span>
                    <span className="text-xs text-indigo-700 font-medium">
                      {activeQuestion.subtopic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    activeQuestion.difficulty === 'Mudah'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeQuestion.difficulty === 'Sedang'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {activeQuestion.difficulty}
                  </span>

                  <button
                    onClick={handleToggleFlag}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    {isFlagged ? 'Ragu-ragu' : 'Tandai Ragu'}
                  </button>
                </div>
              </div>

              {/* Question Body */}
              <div className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal whitespace-pre-line mb-8 select-none">
                {activeQuestion.question}
              </div>

              {/* Answer Choices or Short Answer Input */}
              {activeQuestion.format === 'pilihan_ganda' && activeQuestion.options ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Pilih Jawaban yang Tepat:
                  </span>
                  {activeQuestion.options.map((optionStr) => {
                    // Extract letter 'A', 'B', 'C', 'D'
                    const optionLetter = optionStr.charAt(0).toUpperCase();
                    const isSelected = currentAnswer === optionLetter;

                    return (
                      <div
                        key={optionStr}
                        onClick={() => handleAnswerSelect(optionLetter)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs ring-1 ring-indigo-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <span className="text-sm sm:text-base flex-1">
                          {optionStr.substring(3).trim()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                    Tuliskan Jawaban Isian Singkat (Angka):
                  </label>
                  <div className="flex items-center gap-3 max-w-xs">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      placeholder="Masukkan nilai numerik..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Contoh: Jika hasilnya 59, cukup ketikkan 59 tanpa satuan.
                  </p>
                </div>
              )}

              {/* Bottom Nav Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                <button
                  onClick={() => handleSelectQuestionIndex(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Soal Sebelumnya
                </button>

                {currentIndex < examQuestions.length - 1 ? (
                  <button
                    onClick={() => handleSelectQuestionIndex(currentIndex + 1)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    Soal Berikutnya
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    Kumpulkan Ujian
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Question Navigation Grid */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Navigasi Nomor Soal</h3>

            {/* Grid of numbers */}
            <div className="grid grid-cols-5 gap-2 mb-5">
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
                const isQuestionFlagged = flaggedIds.includes(q.id);

                let bgClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isQuestionFlagged) {
                  bgClass = 'bg-amber-400 text-slate-900 font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-500 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestionIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${bgClass} ${
                      isCurrent ? 'ring-3 ring-indigo-600 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  Dijawab
                </span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-400" />
                  Ragu-ragu
                </span>
                <span className="font-bold text-amber-700">{flaggedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-200" />
                  Belum Dijawab
                </span>
                <span className="font-bold text-slate-500">{unattemptedCount}</span>
              </div>
            </div>

            {/* Finish Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Kumpulkan Ujian Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Virtual Scratchpad Modal */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Submit Confirmation Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-slate-900 mb-2">Konfirmasi Pengumpulan Ujian</h3>
            <p className="text-xs text-slate-500 mb-4">
              Periksa kembali kelengkapan lembar jawabanmu sebelum mengumpulkan.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Soal:</span>
                <span className="font-bold">{examQuestions.length} Soal</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Sudah Dijawab:</span>
                <span className="font-bold">{answeredCount} Soal</span>
              </div>
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Masih Ditandai Ragu:</span>
                  <span className="font-bold">{flaggedCount} Soal</span>
                </div>
              )}
              {unattemptedCount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Belum Diisi (Kosong):</span>
                  <span className="font-bold">{unattemptedCount} Soal</span>
                </div>
              )}
            </div>

            {unattemptedCount > 0 && (
              <p className="text-xs text-rose-600 font-medium mb-4 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Masih ada {unattemptedCount} soal yang kosong. Soal kosong bernilai 0 poin.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmitExam(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
