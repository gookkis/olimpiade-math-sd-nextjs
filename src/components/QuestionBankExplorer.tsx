import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Zap,
  Bot,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { COMPETITION_LEVELS, KISI_LOMBA_SD, OlympiadQuestion, OLYMPIAD_TOPICS, QUESTION_BANK } from '../data/questionBank';
import { GeminiTutorDrawer } from './GeminiTutorDrawer';

interface QuestionBankExplorerProps {
  onStartDrillWithQuestion: (question: OlympiadQuestion) => void;
}

export const QuestionBankExplorer: React.FC<QuestionBankExplorerProps> = ({
  onStartDrillWithQuestion,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Semua');
  const [selectedLevel, setSelectedLevel] = useState<string>('Semua');
  const [selectedKisi, setSelectedKisi] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalQuestions, setTotalQuestions] = useState<number>(1500);
  const [totalPages, setTotalPages] = useState<number>(100);
  const [questions, setQuestions] = useState<OlympiadQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Gemini tutor drawer
  const [activeTutorQ, setActiveTutorQ] = useState<OlympiadQuestion | null>(null);

  // Fetch questions from SQLite backend
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (selectedTopic !== 'Semua') query.set('topic', selectedTopic);
      if (selectedDifficulty !== 'Semua') query.set('difficulty', selectedDifficulty);
      if (selectedLevel !== 'Semua') query.set('level', selectedLevel);
      if (selectedKisi !== 'Semua') query.set('kisi', selectedKisi);
      if (searchQuery.trim()) query.set('search', searchQuery.trim());

      const res = await fetch(`/api/questions?${query.toString()}`);
      const data = await res.json();

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setTotalQuestions(data.total);
        setTotalPages(data.totalPages);
      } else {
        setQuestions(QUESTION_BANK);
      }
    } catch (err) {
      console.warn('Backend fetch failed, using local bank:', err);
      setQuestions(QUESTION_BANK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedTopic, selectedDifficulty, selectedLevel, selectedKisi, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-slate-900">
                Bank Soal Olimpiade Matematika SD
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              1.500 soal dari 150+ tipe soal berbeda, disusun berjenjang mengikuti OSN SD dan IYF JSIT: tingkat Kabupaten/Kota, Provinsi, dan Nasional.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Tersedia {totalQuestions.toLocaleString()} Soal di SQLite
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, rumus, sisa, daun, kecepatan..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="Semua">Semua Topik Materi</option>
              {OLYMPIAD_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="Semua">Semua Tingkat Kesulitan</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="HOTS">Tinggi (HOTS)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="Semua">Semua Tingkat Lomba</option>
              {COMPETITION_LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedKisi}
              onChange={(e) => {
                setSelectedKisi(e.target.value);
                setPage(1);
              }}
              title="Kisi-kisi Lomba Matematika SD (Individu)"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="Semua">Semua Kisi-kisi Lomba SD</option>
              {KISI_LOMBA_SD.map((k, i) => (
                <option key={k} value={k}>
                  {i + 1}) {k}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">Memuat bank soal dari SQLite database...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">Tidak ada soal yang cocok dengan filter</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih Semua Topik</p>
          </div>
        ) : (
          questions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const itemNumber = (page - 1) * limit + idx + 1;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {itemNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{q.topic}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{q.subtopic}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {q.kisi && (
                      <span
                        title="Kisi-kisi Lomba Matematika SD"
                        className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold"
                      >
                        Kisi: {q.kisi}
                      </span>
                    )}
                    {q.level && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {q.level}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        q.difficulty === 'Mudah'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.difficulty === 'Sedang'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {q.format === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Isian Singkat'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-800 text-sm sm:text-base font-normal whitespace-pre-line mb-4">
                  {q.question}
                </p>

                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs text-slate-600">
                    {q.options.map((opt) => (
                      <div key={opt} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Collapsible Solution & Trick */}
                {isExpanded && (
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    <div className="p-4 bg-indigo-50/60 rounded-xl text-xs text-slate-800 leading-relaxed border border-indigo-100">
                      <span className="font-bold text-indigo-900 block mb-1">
                        Kunci Jawaban: {q.correctAnswer}
                      </span>
                      <p className="whitespace-pre-line text-slate-700">{q.explanation}</p>
                    </div>

                    {q.tipsTrik && (
                      <div className="p-3.5 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200/80 flex items-start gap-2">
                        <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-amber-950 font-bold mb-0.5">Trik Cepat OSN:</strong>
                          <span>{q.tipsTrik}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Sembunyikan Pembahasan
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Lihat Pembahasan & Kunci
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTutorQ(q)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      Tanya Guru AI
                    </button>

                    <button
                      onClick={() => onStartDrillWithQuestion(q)}
                      className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      Drill Kilat Tipe Ini
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500">
            Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> ({totalQuestions.toLocaleString()} total soal)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
            >
              Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Gemini Tutor Drawer */}
      <GeminiTutorDrawer
        isOpen={activeTutorQ !== null}
        onClose={() => setActiveTutorQ(null)}
        question={activeTutorQ}
      />
    </div>
  );
};
