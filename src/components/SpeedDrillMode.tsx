import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Flame,
  Award,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { OlympiadQuestion, OLYMPIAD_TOPICS, QUESTION_BANK, SimilarPracticeQuestion } from '../data/questionBank';
import { GeminiTutorDrawer } from './GeminiTutorDrawer';

interface SpeedDrillModeProps {
  initialQuestion?: OlympiadQuestion | null;
  onFinishDrill: (stats: { topic: string; answered: number; correct: number; totalSeconds: number }) => void;
  onCancel: () => void;
}

export const SpeedDrillMode: React.FC<SpeedDrillModeProps> = ({
  initialQuestion,
  onFinishDrill,
  onCancel,
}) => {
  // Topic selection
  const [selectedTopic, setSelectedTopic] = useState<string>(initialQuestion ? initialQuestion.topic : 'Semua');
  const [activeQuestion, setActiveQuestion] = useState<OlympiadQuestion>(
    initialQuestion || QUESTION_BANK[0]
  );
  const [activeSimilarIndex, setActiveSimilarIndex] = useState<number>(-1); // -1 means primary question, >=0 means similar question

  // User response state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Speed Stopwatch
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Session stats
  const [sessionAnswered, setSessionAnswered] = useState<number>(0);
  const [sessionCorrect, setSessionCorrect] = useState<number>(0);
  const [sessionTotalSeconds, setSessionTotalSeconds] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);

  // Gemini Tutor Drawer
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);

  // Start timer on question load
  useEffect(() => {
    setSecondsElapsed(0);
    setIsAnswerSubmitted(false);
    setSelectedOption('');

    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuestion, activeSimilarIndex]);

  // Current question data
  const isPracticingSimilar = activeSimilarIndex >= 0 && activeQuestion.similarQuestions[activeSimilarIndex];
  const currentQData: {
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    tipsTrik: string;
  } = isPracticingSimilar
    ? activeQuestion.similarQuestions[activeSimilarIndex]
    : activeQuestion;

  const handleCheckAnswer = () => {
    if (!selectedOption.trim() || isAnswerSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption.toUpperCase() === currentQData.correctAnswer.toUpperCase();
    setSessionAnswered((prev) => prev + 1);
    setSessionTotalSeconds((prev) => prev + secondsElapsed);

    if (isCorrect) {
      setSessionCorrect((prev) => prev + 1);
      setCurrentStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setCurrentStreak(0);
    }
  };

  const handleNextQuestion = () => {
    // If there are more similar questions in this problem family, do them first for intensive drill!
    if (activeSimilarIndex < activeQuestion.similarQuestions.length - 1) {
      setActiveSimilarIndex((prev) => prev + 1);
      return;
    }

    // Otherwise, pick next question from the selected topic
    let pool = QUESTION_BANK;
    if (selectedTopic !== 'Semua') {
      pool = QUESTION_BANK.filter((q) => q.topic === selectedTopic);
    }
    const otherQuestions = pool.filter((q) => q.id !== activeQuestion.id);
    const nextQ = otherQuestions.length > 0
      ? otherQuestions[Math.floor(Math.random() * otherQuestions.length)]
      : activeQuestion;

    setActiveQuestion(nextQ);
    setActiveSimilarIndex(-1);
  };

  const handleTopicChange = (newTopic: string) => {
    setSelectedTopic(newTopic);
    const pool = newTopic === 'Semua' ? QUESTION_BANK : QUESTION_BANK.filter((q) => q.topic === newTopic);
    if (pool.length > 0) {
      setActiveQuestion(pool[0]);
      setActiveSimilarIndex(-1);
    }
  };

  const isUserCorrect = isAnswerSubmitted && selectedOption.toUpperCase() === currentQData.correctAnswer.toUpperCase();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-orange-700 mb-2 shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-orange-600" />
            Mode Drill Intensif Kecepatan
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Latihan Kilat Tipe Soal Serupa
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm mt-1">
            Uji reflek hitung cepat dengan tipe pola soal yang serupa berulang-ulang hingga refleksmu terbentuk.
          </p>
        </div>

        {/* Live Session Counter HUD */}
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <span className="text-[10px] text-orange-200 block uppercase font-bold">Terjawab</span>
            <span className="text-xl font-extrabold">{sessionAnswered}</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <span className="text-[10px] text-orange-200 block uppercase font-bold">Akurasi</span>
            <span className="text-xl font-extrabold">
              {sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 100}%
            </span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2 flex flex-col items-center">
            <span className="text-[10px] text-amber-200 block uppercase font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-yellow-300" /> Streak
            </span>
            <span className="text-xl font-extrabold text-yellow-300">{currentStreak}x</span>
          </div>
        </div>
      </div>

      {/* Topic Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleTopicChange('Semua')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedTopic === 'Semua'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Topik
        </button>
        {OLYMPIAD_TOPICS.map((top) => (
          <button
            key={top}
            onClick={() => handleTopicChange(top)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedTopic === top
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {top}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Subtopic & Stopwatch HUD */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-xs font-bold">
              {activeQuestion.topic}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {activeQuestion.subtopic}
            </span>
            {isPracticingSimilar && (
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                Variasi Serupa #{activeSimilarIndex + 1}
              </span>
            )}
          </div>

          {/* Stopwatch */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              secondsElapsed > 90
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : secondsElapsed > 50
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{secondsElapsed} Detik</span>
          </div>
        </div>

        {/* Question Text */}
        <p className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed whitespace-pre-line mb-8">
          {currentQData.question}
        </p>

        {/* Option Choices */}
        {currentQData.options && currentQData.options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {currentQData.options.map((opt) => {
              const letter = opt.charAt(0).toUpperCase();
              const isSelected = selectedOption === letter;

              let cardStyle = 'border-slate-200 bg-white hover:border-slate-300';
              if (isAnswerSubmitted) {
                if (letter === currentQData.correctAnswer.toUpperCase()) {
                  cardStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold';
                } else if (isSelected) {
                  cardStyle = 'border-rose-500 bg-rose-50/70 text-rose-950';
                } else {
                  cardStyle = 'opacity-50 border-slate-200';
                }
              } else if (isSelected) {
                cardStyle = 'border-indigo-600 bg-indigo-50/60 font-semibold ring-1 ring-indigo-500/20';
              }

              return (
                <div
                  key={opt}
                  onClick={() => !isAnswerSubmitted && setSelectedOption(letter)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer ${cardStyle}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="text-sm">{opt.substring(3).trim()}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-8">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
              Ketik Jawaban Isian Singkat:
            </label>
            <input
              type="text"
              value={selectedOption}
              onChange={(e) => !isAnswerSubmitted && setSelectedOption(e.target.value)}
              placeholder="Masukkan angka hasil..."
              disabled={isAnswerSubmitted}
              className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-600 w-64"
            />
          </div>
        )}

        {/* Action Controls */}
        {!isAnswerSubmitted ? (
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
            >
              Keluar Latihan
            </button>
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption.trim()}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Periksa Jawaban Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
            {/* Feedback Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isUserCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {isUserCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {isUserCorrect ? 'Luar Biasa, Jawabanmu Benar!' : 'Kurang Tepat, Jangan Menyerah!'}
                  </h4>
                  <p className="text-xs">
                    Waktu Pengerjaan: <strong>{secondsElapsed} detik</strong> • Kunci Jawaban:{' '}
                    <strong>{currentQData.correctAnswer}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTutorOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-300" />
                  Tanya Guru AI
                </button>
              </div>
            </div>

            {/* Quick Olympiad Trick Highlight */}
            {currentQData.tipsTrik && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-amber-950 mb-0.5">Trik Kecepatan Kilat OSN:</strong>
                  <span>{currentQData.tipsTrik}</span>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Penjelasan Singkat:</span>
              <p className="whitespace-pre-line">{currentQData.explanation}</p>
            </div>

            {/* Next Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  onFinishDrill({
                    topic: selectedTopic,
                    answered: sessionAnswered,
                    correct: sessionCorrect,
                    totalSeconds: sessionTotalSeconds,
                  })
                }
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Selesaikan Sesi Latihan ({sessionAnswered} Soal)
              </button>

              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                Lanjut Soal Serupa Berikutnya
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gemini Tutor Drawer */}
      <GeminiTutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        question={activeQuestion}
        userAnswer={selectedOption}
      />
    </div>
  );
};
