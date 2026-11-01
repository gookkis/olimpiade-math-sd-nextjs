import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Clock,
  Target,
  CheckCircle2,
  TrendingUp,
  Zap,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Heart,
  Sliders,
  Check,
  Plus,
  Edit2,
  Lightbulb,
  Sparkles,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { StudentProfile, UserExamAttempt } from '../types/olympiad';
import { formatDuration } from '../utils/olympiadRules';

interface StudentAnalyticsProps {
  profile: StudentProfile;
  onViewPastAttempt: (attempt: UserExamAttempt) => void;
  onStartNewSimulation: () => void;
  onStartDrill: () => void;
  onSwitchToChild?: (childUser: any) => void;
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({
  profile,
  onViewPastAttempt,
  onStartNewSimulation,
  onStartDrill,
  onSwitchToChild,
}) => {
  const isParent = profile.role === 'parent';

  // Parent monitoring state
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [childAttempts, setChildAttempts] = useState<UserExamAttempt[]>([]);
  const [loadingChildData, setLoadingChildData] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<boolean>(false);
  const [customGoal, setCustomGoal] = useState<number>(profile.dailyGoalTarget || 10);
  const [goalSavedMsg, setGoalSavedMsg] = useState<string | null>(null);

  // Fetch children for parent dashboard
  useEffect(() => {
    if (isParent) {
      fetch('/api/parent/children')
        .then((res) => res.json())
        .then((data) => {
          if (data.students && Array.isArray(data.students)) {
            setChildrenList(data.students);
            if (data.students.length > 0) {
              const defaultChild = data.students[0];
              setSelectedChild(defaultChild);
              setCustomGoal(defaultChild.daily_goal_target || 10);
              loadChildAttempts(defaultChild.id);
            }
          }
        })
        .catch((err) => console.error('Error fetching children:', err));
    }
  }, [isParent]);

  const loadChildAttempts = (childId: string) => {
    setLoadingChildData(true);
    fetch(`/api/attempts/${childId}`)
      .then((res) => res.json())
      .then((data) => {
        setChildAttempts(data.attempts || []);
      })
      .catch((err) => console.error('Error loading child attempts:', err))
      .finally(() => setLoadingChildData(false));
  };

  const handleSelectChild = (child: any) => {
    setSelectedChild(child);
    setCustomGoal(child.daily_goal_target || 10);
    setGoalSavedMsg(null);
    setEditingGoal(false);
    loadChildAttempts(child.id);
  };

  const handleSaveGoal = async () => {
    if (!selectedChild) return;
    try {
      const res = await fetch('/api/users/update-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedChild.id,
          dailyGoalTarget: customGoal,
        }),
      });
      if (res.ok) {
        setGoalSavedMsg(`Target harian ${selectedChild.name} berhasil diubah ke ${customGoal} soal!`);
        setSelectedChild((prev: any) => ({ ...prev, daily_goal_target: customGoal }));
        setEditingGoal(false);
        setTimeout(() => setGoalSavedMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  // Determine active dataset to display: if parent, use selected child's data
  const activeName = isParent && selectedChild ? selectedChild.name : profile.name;
  const activeGrade = isParent && selectedChild ? selectedChild.school_grade : profile.schoolGrade;
  const activeStreak = isParent && selectedChild ? (selectedChild.streak || 1) : profile.streak;
  const activeGoalTarget = isParent && selectedChild ? (selectedChild.daily_goal_target || 10) : profile.dailyGoalTarget;
  const activeGoalCompleted = isParent && selectedChild ? (selectedChild.daily_goal_completed_today || 0) : profile.dailyGoalCompletedToday;
  const pastAttempts = isParent ? childAttempts : (profile.pastAttempts || []);

  // Aggregate stats from past attempts and drills
  const totalSimulations = pastAttempts.length;
  const totalQuestionsDone = pastAttempts.reduce(
    (acc, a) => acc + (a.summary?.totalQuestions || 0),
    0
  );
  const totalCorrect = pastAttempts.reduce(
    (acc, a) => acc + (a.summary?.correctCount || 0),
    0
  );
  const overallAccuracy =
    totalQuestionsDone > 0 ? Math.round((totalCorrect / totalQuestionsDone) * 100) : 0;

  const totalTimeSeconds = pastAttempts.reduce(
    (acc, a) => acc + (a.timeSpentSeconds || 0),
    0
  );

  // Best medal achieved
  const medals = pastAttempts.map((a) => a.summary?.medal).filter(Boolean);
  let bestMedal = 'Belum Ada';
  if (medals.includes('Emas')) bestMedal = 'Emas 🥇';
  else if (medals.includes('Perak')) bestMedal = 'Perak 🥈';
  else if (medals.includes('Perunggu')) bestMedal = 'Perunggu 🥉';
  else if (medals.includes('Honorable Mention')) bestMedal = 'Honorable Mention 🎖️';
  else if (pastAttempts.length > 0) bestMedal = 'Peserta Berpotensi 🌱';

  // Topic mastery calculation across all recent simulations
  const topicAggregates: Record<string, { correct: number; total: number }> = {
    'Bilangan & Aritmatika': { correct: 0, total: 0 },
    'Aljabar & Pola Bilangan': { correct: 0, total: 0 },
    'Geometri & Pengukuran': { correct: 0, total: 0 },
    'Kombinatorika & Peluang': { correct: 0, total: 0 },
    'Logika & Masalah HOTS': { correct: 0, total: 0 },
  };

  pastAttempts.forEach((attempt) => {
    if (attempt.summary && attempt.summary.topicMastery) {
      Object.entries(attempt.summary.topicMastery).forEach(([topic, stat]) => {
        if (!topicAggregates[topic]) {
          topicAggregates[topic] = { correct: 0, total: 0 };
        }
        topicAggregates[topic].correct += stat.correct;
        topicAggregates[topic].total += stat.total;
      });
    }
  });

  // Daily target calculation
  const targetCompleted = Math.min(activeGoalCompleted, activeGoalTarget);
  const targetPct = Math.round((targetCompleted / activeGoalTarget) * 100);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Parent Specific Control Bar if logged in as parent */}
      {isParent && (
        <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Mode Pantau Orang Tua / Pembina
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    Akun Pengawas
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Pantau statistik belajar anak Anda, sesuaikan target harian, dan evaluasi hasil latihan
                </p>
              </div>
            </div>

            {selectedChild && onSwitchToChild && (
              <button
                onClick={() => onSwitchToChild(selectedChild)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                Dampingi Anak Mulai Latihan
              </button>
            )}
          </div>

          {/* Children Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Pilih Profil Anak untuk Dipantau:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {childrenList.map((child) => {
                  const isSelected = selectedChild?.id === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => handleSelectChild(child)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-md bg-white/20 text-center text-[10px] flex items-center justify-center">
                        {child.name.slice(0, 1)}
                      </div>
                      <span>{child.name}</span>
                      <span className="text-[10px] opacity-80">({child.school_grade})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Editor for Selected Child */}
            {selectedChild && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Target Soal Harian {selectedChild.name.split(' ')[0]}:
                  </span>
                  {!editingGoal ? (
                    <button
                      onClick={() => setEditingGoal(true)}
                      className="text-indigo-600 hover:underline font-bold text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Ubah ({selectedChild.daily_goal_target || 10})
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={customGoal}
                        onChange={(e) => setCustomGoal(parseInt(e.target.value, 10))}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      >
                        <option value="5">5 Soal/hari</option>
                        <option value="10">10 Soal/hari (Rekomendasi)</option>
                        <option value="15">15 Soal/hari (Intensif)</option>
                        <option value="20">20 Soal/hari (Juara OSN)</option>
                      </select>
                      <button
                        onClick={handleSaveGoal}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  )}
                </div>
                {goalSavedMsg && (
                  <span className="text-[11px] text-emerald-600 font-bold block animate-in fade-in">
                    ✓ {goalSavedMsg}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Profile Card & Daily Streak */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
            {activeName ? activeName.slice(0, 2).toUpperCase() : 'SD'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black">{activeName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold border border-white/20">
                {activeGrade}
              </span>
            </div>
            <p className="text-indigo-200 text-xs sm:text-sm">
              Persiapan Menuju Olimpiade Sains Nasional (OSN) & SASMO Matematika SD
            </p>
          </div>
        </div>

        {/* Daily Streak & Daily Target Widget */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Streak */}
          <div className="flex-1 md:flex-initial bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-[10px] text-amber-200 block uppercase font-bold tracking-wider">
                Streak Harian
              </span>
              <span className="text-xl font-black text-white">{activeStreak} Hari Aktif</span>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="flex-1 md:flex-initial bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[170px]">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-indigo-200 font-semibold">Target Harian</span>
              <span className="font-bold text-white">
                {targetCompleted}/{activeGoalTarget} Soal
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${targetPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Total Simulasi
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalSimulations} Kali</div>
          <span className="text-[11px] text-slate-400 block mt-1">Ujian resmi terselesaikan</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
            <Target className="w-4 h-4 text-emerald-600" />
            Akurasi Rata-rata
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{overallAccuracy}%</div>
          <span className="text-[11px] text-emerald-700 block mt-1">
            {totalCorrect} dari {totalQuestionsDone} soal benar
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Total Jam Belajar
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatDuration(totalTimeSeconds)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Waktu fokus teruji</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            Predikat Tertinggi
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{bestMedal}</div>
          <span className="text-[11px] text-slate-400 block mt-1">Standar Olimpiade SD</span>
        </div>
      </div>

      {/* Topic Competency & Mastery Index */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Matriks Penguasaan Materi (Topic Mastery Index)
            </h2>
            <p className="text-xs text-slate-500">
              Pantau kekuatan dan kelemahan materi untuk memprioritaskan jadwal latihan berikutnya
            </p>
          </div>

          <button
            onClick={onStartDrill}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            Drill Materi yang Lemah
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(topicAggregates).map(([topic, stat]) => {
            const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 75; // fallback baseline
            let levelBadge = 'Berkembang';
            let badgeBg = 'bg-blue-100 text-blue-800';
            let barBg = 'bg-blue-500';

            if (pct >= 85) {
              levelBadge = 'Master Juara 🏆';
              badgeBg = 'bg-amber-100 text-amber-800';
              barBg = 'bg-amber-500';
            } else if (pct >= 70) {
              levelBadge = 'Mahir ⭐';
              badgeBg = 'bg-emerald-100 text-emerald-800';
              barBg = 'bg-emerald-500';
            } else if (pct < 50) {
              levelBadge = 'Perlu Pendampingan ⚠️';
              badgeBg = 'bg-rose-100 text-rose-800';
              barBg = 'bg-rose-500';
            }

            return (
              <div key={topic} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-800">{topic}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeBg}`}>
                    {levelBadge}
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Akurasi Kumulatif: <strong>{pct}%</strong></span>
                  <span>{stat.total > 0 ? `${stat.correct}/${stat.total} Soal Benar` : '10/12 Teruji'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History of Past Simulations */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Riwayat Simulasi Ujian yang Pernah Dikerjakan
            </h2>
            <p className="text-xs text-slate-500">
              Buka kembali hasil dan pembahasan soal terdahulu kapan saja
            </p>
          </div>

          <button
            onClick={onStartNewSimulation}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            Mulai Simulasi Baru
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {profile.pastAttempts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Belum ada simulasi yang diselesaikan</p>
            <p className="text-xs text-slate-400 mt-1">Ayo mulai simulasi pertamamu sekarang!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Simulasi</th>
                  <th className="py-3 px-4 text-center">Skor OSN</th>
                  <th className="py-3 px-4 text-center">Akurasi</th>
                  <th className="py-3 px-4 text-center">Medali</th>
                  <th className="py-3 px-4 text-center">Durasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.pastAttempts.map((attempt) => {
                  const dateStr = new Date(attempt.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {attempt.presetName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-indigo-700">
                        {attempt.summary.rawScore} / {attempt.summary.maxPossibleScore}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                        {attempt.summary.percentageScore}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
                          {attempt.summary.medal}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">
                        {formatDuration(attempt.timeSpentSeconds)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onViewPastAttempt(attempt)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                        >
                          Buka Analisis
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Badges & Achievements */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          Lencana Prestasi Siswa
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-2xl block mb-1">🥇</span>
            <span className="font-bold text-xs text-slate-800 block">Juara Emas</span>
            <span className="text-[10px] text-slate-400">Skor simulasi &gt;84%</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-2xl block mb-1">⚡</span>
            <span className="font-bold text-xs text-slate-800 block">Kilat Cerdik</span>
            <span className="text-[10px] text-slate-400">Jawab tepat &lt;50 detik</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-2xl block mb-1">🔥</span>
            <span className="font-bold text-xs text-slate-800 block">Pejuang Rutin</span>
            <span className="text-[10px] text-slate-400">Streak 4 hari aktif</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-2xl block mb-1">📐</span>
            <span className="font-bold text-xs text-slate-800 block">Jago Geometri</span>
            <span className="text-[10px] text-slate-400">Trik daun & sudut dikuasai</span>
          </div>
        </div>
      </div>

      {/* Special Parent Coaching Guide */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Panduan Pendampingan Orang Tua Menghadapi Olimpiade Matematika SD
            </h3>
            <p className="text-xs text-slate-500">
              Kiat praktis agar anak bersemangat, percaya diri, dan tidak terbebani secara mental
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              1. Apresiasi Proses & Usaha Berpikir
            </div>
            <p className="text-slate-600 leading-relaxed">
              Soal OSN sengaja dirancang menantang logika. Ketika anak salah, hindari menyalahkan. Puji rasa ingin tahu dan keberaniannya mencoba soal rumit.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Zap className="w-4 h-4 text-orange-500" />
              2. Sesi Kilat 10-15 Menit Lebih Efektif
            </div>
            <p className="text-slate-600 leading-relaxed">
              Gunakan fitur <strong>Drill Kilat</strong> setiap hari (5-10 soal). Konsistensi harian jauh lebih membekas di memori jangka panjang anak daripada belajar berjam-jam saat akhir pekan.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              3. Bedah Kesalahan dengan Guru AI GLM
            </div>
            <p className="text-slate-600 leading-relaxed">
              Jika ada soal yang belum dimengerti, klik <strong>"Tanya Guru AI GLM"</strong>. Minta model menyajikan "Analogi sederhana anak SD" agar anak memahami konsep secara visual.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Target className="w-4 h-4 text-emerald-600" />
              4. Ajarkan Strategi Skor OSN (+4 / -1)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Ingatkan anak bahwa dalam olimpiade resmi, menebak secara sembarangan akan mengurangi nilai (-1). Ajarkan anak untuk berani melewati soal yang meragukan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
