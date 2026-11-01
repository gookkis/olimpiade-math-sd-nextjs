import React from 'react';
import {
  Award,
  Clock,
  Zap,
  TrendingUp,
  BookOpen,
  Flame,
  Menu,
  X,
  Target,
} from 'lucide-react';
import { StudentProfile } from '../types/olympiad';

export type AppTab = 'simulation' | 'drill' | 'results' | 'analytics' | 'bank';

interface NavbarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  profile: StudentProfile | null;
  hasActiveResult: boolean;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  profile,
  hasActiveResult,
  onOpenAuthModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    {
      id: 'simulation',
      label: 'Simulasi Ujian',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'drill',
      label: 'Drill Kilat',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'results',
      label: 'Analisis Hasil',
      icon: <Target className="w-4 h-4" />,
      hidden: !hasActiveResult,
    },
    {
      id: 'analytics',
      label: 'Rapor & Statistik',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'bank',
      label: 'Bank Soal',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('simulation')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-base tracking-tight">
                  Olimpiade Math SD
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  OSN & IYF
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Simulasi Presisi & Drill Kecepatan
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {navItems
              .filter((item) => !item.hidden)
              .map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
          </div>

          {/* Right Streak & Profile Widget */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Daily Streak Indicator */}
            <div
              onClick={() => onSelectTab('analytics')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold cursor-pointer hover:bg-amber-100/80 transition-colors"
              title="Streak Belajar Harian Berturut-turut"
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{profile?.streak || 1} Hari</span>
            </div>

            {/* Student Avatar & Account Switcher */}
            {profile ? (
              <div
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
                title="Klik untuk ganti akun atau profil"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'SD'}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="font-bold text-slate-800 text-xs block leading-tight group-hover:text-indigo-600 transition-colors">
                    {profile.name ? profile.name.split(' ')[0] : 'Siswa'}
                  </span>
                  <span className="text-[10px] text-slate-500">{profile.schoolGrade || 'SD Kelas 5'}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Masuk / Daftar
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{profile?.streak || 1}d</span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navItems
            .filter((item) => !item.hidden)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
        </div>
      )}
    </nav>
  );
};
