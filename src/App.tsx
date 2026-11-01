import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { ExamSimulation } from './components/ExamSimulation';
import { ExamResultAnalysis } from './components/ExamResultAnalysis';
import { SpeedDrillMode } from './components/SpeedDrillMode';
import { StudentAnalytics } from './components/StudentAnalytics';
import { QuestionBankExplorer } from './components/QuestionBankExplorer';
import { AuthModal } from './components/AuthModal';
import {
  getStoredUserSession,
  saveUserSession,
  UserSession,
  apiSaveAttempt,
  apiFetchUserAttempts,
  apiSaveDrillProgress,
} from './utils/storage';
import { StudentProfile, UserExamAttempt } from './types/olympiad';
import { OlympiadQuestion } from './data/questionBank';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => getStoredUserSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !getStoredUserSession());
  const [activeTab, setActiveTab] = useState<AppTab>('simulation');
  const [pastAttempts, setPastAttempts] = useState<UserExamAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<UserExamAttempt | null>(null);
  const [drillInitialQuestion, setDrillInitialQuestion] = useState<OlympiadQuestion | null>(null);

  // Load user attempts from SQLite when user logs in
  useEffect(() => {
    if (!currentUser) return;

    apiFetchUserAttempts(currentUser.id).then((attempts) => {
      setPastAttempts(attempts);
      if (attempts.length > 0 && !currentAttempt) {
        setCurrentAttempt(attempts[0]);
      }
    });
  }, [currentUser]);

  // Construct current student profile
  const profile: StudentProfile = {
    name: currentUser?.name || 'Siswa Juara OSN',
    schoolGrade: currentUser?.schoolGrade || 'SD Kelas 5',
    streak: currentUser?.streak || 1,
    lastActiveDate: currentUser?.lastActiveDate || null,
    dailyGoalTarget: currentUser?.dailyGoalTarget || 10,
    dailyGoalCompletedToday: currentUser?.dailyGoalCompletedToday || 0,
    pastAttempts: pastAttempts,
    drillStats: {},
  };

  const handleLoginSuccess = (user: any) => {
    const session: UserSession = {
      id: user.id,
      username: user.username,
      name: user.name,
      schoolGrade: user.school_grade || user.schoolGrade || 'SD Kelas 5',
      role: user.role || 'student',
      streak: user.streak || 1,
      lastActiveDate: user.last_active_date || user.lastActiveDate,
      dailyGoalTarget: user.daily_goal_target || 10,
      dailyGoalCompletedToday: user.daily_goal_completed_today || 0,
    };
    saveUserSession(session);
    setCurrentUser(session);
    setIsAuthModalOpen(false);

    // Load attempts for this user
    apiFetchUserAttempts(session.id).then((attempts) => {
      setPastAttempts(attempts);
      if (attempts.length > 0) {
        setCurrentAttempt(attempts[0]);
      } else {
        setCurrentAttempt(null);
      }
    });
  };

  const handleCompleteSimulation = async (attempt: UserExamAttempt) => {
    setCurrentAttempt(attempt);
    setPastAttempts((prev) => [attempt, ...prev]);

    // Update session state
    if (currentUser) {
      const updatedUser: UserSession = {
        ...currentUser,
        dailyGoalCompletedToday: currentUser.dailyGoalCompletedToday + attempt.questions.length,
      };
      setCurrentUser(updatedUser);
      saveUserSession(updatedUser);

      // Persist to SQLite database
      await apiSaveAttempt(attempt, currentUser.id);
    }

    setActiveTab('results');
  };

  const handleFinishDrill = async (stats: {
    topic: string;
    answered: number;
    correct: number;
    totalSeconds: number;
  }) => {
    if (stats.answered > 0 && currentUser) {
      const updatedUser: UserSession = {
        ...currentUser,
        dailyGoalCompletedToday: currentUser.dailyGoalCompletedToday + stats.answered,
      };
      setCurrentUser(updatedUser);
      saveUserSession(updatedUser);

      // Persist drill stats to SQLite
      await apiSaveDrillProgress({
        userId: currentUser.id,
        topic: stats.topic,
        answered: stats.answered,
        correct: stats.correct,
        totalSeconds: stats.totalSeconds,
      });
    }
    setActiveTab('analytics');
  };

  const handleLaunchSimilarDrill = (question: OlympiadQuestion) => {
    setDrillInitialQuestion(question);
    setActiveTab('drill');
  };

  const handleViewPastAttempt = (attempt: UserExamAttempt) => {
    setCurrentAttempt(attempt);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'drill') setDrillInitialQuestion(null);
          setActiveTab(tab);
        }}
        profile={currentUser ? profile : null}
        hasActiveResult={currentAttempt !== null}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'simulation' && (
          <ExamSimulation
            onCompleteSimulation={handleCompleteSimulation}
            onCancel={() => setActiveTab('analytics')}
          />
        )}

        {activeTab === 'drill' && (
          <SpeedDrillMode
            initialQuestion={drillInitialQuestion}
            onFinishDrill={handleFinishDrill}
            onCancel={() => setActiveTab('simulation')}
          />
        )}

        {activeTab === 'results' && currentAttempt && (
          <ExamResultAnalysis
            attempt={currentAttempt}
            onRetakeExam={() => setActiveTab('simulation')}
            onLaunchSimilarDrill={handleLaunchSimilarDrill}
            onGoToDashboard={() => setActiveTab('analytics')}
          />
        )}

        {activeTab === 'analytics' && (
          <StudentAnalytics
            profile={profile}
            onViewPastAttempt={handleViewPastAttempt}
            onStartNewSimulation={() => setActiveTab('simulation')}
            onStartDrill={() => {
              setDrillInitialQuestion(null);
              setActiveTab('drill');
            }}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBankExplorer
            onStartDrillWithQuestion={(q) => handleLaunchSimilarDrill(q)}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        allowClose={currentUser !== null}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 Simulasi Olimpiade Matematika SD • 1.500 Bank Soal SQLite • Persiapan OSN & SASMO
          </p>
          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-800 font-bold underline text-xs"
              >
                Ganti Akun ({currentUser.name})
              </button>
            )}
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Didukung Pembina AI Model GLM (SumoPod)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
