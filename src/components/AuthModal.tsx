import React, { useState } from 'react';
import {
  Award,
  User,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { StudentProfile } from '../types/olympiad';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: any) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  allowClose = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [schoolGrade, setSchoolGrade] = useState('SD Kelas 5');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal login');
        onLoginSuccess(data.user);
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            name: name || username,
            schoolGrade,
            role,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mendaftar akun');
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click registration for the user's child
  const handleQuickChildLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    const demoUser = `anak_${Math.floor(100 + Math.random() * 900)}`;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: demoUser,
          password: '123',
          name: 'Calon Juara OSN',
          schoolGrade: 'SD Kelas 5',
          role: 'student',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal masuk cepat');
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white text-center relative">
          {allowClose && onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-md">
            <Award className="w-6 h-6 text-amber-300" />
          </div>

          <h2 className="text-xl font-black tracking-tight">Olimpiade Math SD</h2>
          <p className="text-xs text-indigo-100 mt-1">
            Simpan progres belajar, rekor streak harian, dan 1.500 bank soal
          </p>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Masuk Akun
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Daftar Akun Baru
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    Nama Siswa / Anak:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kenzo Pratama"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Tingkat Kelas:
                    </label>
                    <select
                      value={schoolGrade}
                      onChange={(e) => setSchoolGrade(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                    >
                      <option value="SD Kelas 4">SD Kelas 4</option>
                      <option value="SD Kelas 5">SD Kelas 5</option>
                      <option value="SD Kelas 6">SD Kelas 6</option>
                      <option value="Alumni / Pembina">Orang Tua / Pembina</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Peran:
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                    >
                      <option value="student">Siswa / Anak</option>
                      <option value="parent">Orang Tua</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Username / Nama Panggilan:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: kenzo"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Password / PIN:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password atau PIN angka"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                'Memproses...'
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Masuk ke Akun Belajar
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Buat Akun & Mulai Latihan
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button for effortless sharing */}
          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block mb-2">Ingin langsung mencoba tanpa mendaftar?</span>
            <button
              type="button"
              onClick={handleQuickChildLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Masuk Cepat (Akun Baru Siap Pakai)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
