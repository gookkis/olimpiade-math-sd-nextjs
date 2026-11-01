import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, HelpCircle, Lightbulb, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { OlympiadQuestion } from '../data/questionBank';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface GeminiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: OlympiadQuestion | null;
  userAnswer?: string;
  onLaunchSimilarDrill?: (question: OlympiadQuestion) => void;
}

export const GeminiTutorDrawer: React.FC<GeminiTutorDrawerProps> = ({
  isOpen,
  onClose,
  question,
  userAnswer,
  onLaunchSimilarDrill,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize or reset chat when a new question is loaded
  useEffect(() => {
    if (!isOpen || !question) return;

    setErrorMsg(null);
    const isCorrect = userAnswer === question.correctAnswer;

    const initialGreeting = isCorrect
      ? `Halo juara! 🎉 Hebat sekali kamu berhasil menjawab soal ini dengan benar (${userAnswer}).
Apakah ada bagian dari trik cepat atau variasi soal ini yang ingin kamu perdalam bersama Kakak Guru?`
      : `Halo adik! Jangan berkecil hati ya. Soal olimpiade memang dirancang untuk melatih ketajaman berpikir.
Jawabanmu: **${userAnswer || 'Belum diisi'}**, sedangkan kunci jawaban yang tepat adalah **${question.correctAnswer}**.

Di mana bagian yang membuatmu ragu atau bingung? Kakak Guru siap jelaskan langkah demi langkah! 🌟`;

    setMessages([
      {
        role: 'model',
        text: initialGreeting,
      },
    ]);
  }, [isOpen, question, userAnswer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading || !question) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          topic: question.topic,
          difficulty: question.difficulty,
          options: question.options,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          officialExplanation: question.explanation,
          tipsTrik: question.tipsTrik,
          message: textToSend,
          history: messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses pesan');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.reply,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal memuat balasan dari Guru AI GLM. Silakan coba lagi.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `Adik, jangan khawatir ya! Kakak rangkumkan poin terpenting untuk soal ini:\n\n${question.explanation}\n\n💡 **Trik Cepat:** ${question.tipsTrik}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    { label: 'Di mana letak salah saya?', prompt: 'Kak, jelaskan di mana letak kesalahan pemikiran saya dan kenapa jawaban saya keliru?' },
    { label: 'Trik cepat olimpiade?', prompt: 'Kak, ajarkan trik cepat sakti atau rumus kilat untuk tipe soal seperti ini agar hemat waktu di olimpiade!' },
    { label: 'Analogi sederhana anak SD', prompt: 'Bisa jelaskan konsep ini dengan perumpamaan benda nyata atau cerita sederhana untuk anak SD?' },
    { label: 'Uji dengan 1 soal mirip', prompt: 'Berikan saya 1 latihan soal baru yang polanya persis sama agar saya bisa tes pemahaman saya sekarang!' },
  ];

  if (!isOpen || !question) return null;

  const isUserCorrect = userAnswer === question.correctAnswer;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Guru Pembina AI GLM</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400 text-slate-950 uppercase tracking-wider">
                  SumoPod AI
                </span>
              </div>
              <p className="text-xs text-indigo-100">Bimbingan komprehensif olimpiade matematika SD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup Panel Bimbingan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Snapshot Strip */}
        <div className="px-5 py-3 bg-indigo-50/60 border-b border-indigo-100 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-indigo-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Soal: {question.topic} • {question.subtopic}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1 ${
              isUserCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isUserCorrect ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Benar
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Jawaban Salah
                </>
              )}
            </span>
          </div>

          <p className="text-slate-700 font-medium line-clamp-2 italic mb-2">
            "{question.question}"
          </p>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-600">
              Jawabanmu: <strong className={isUserCorrect ? 'text-emerald-700' : 'text-rose-700'}>{userAnswer || '(Tidak Diisi)'}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Kunci Benar: <strong className="text-emerald-700">{question.correctAnswer}</strong>
            </span>
            {onLaunchSimilarDrill && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchSimilarDrill(question);
                }}
                className="ml-auto text-indigo-600 hover:text-indigo-800 font-bold underline text-[11px]"
              >
                Latih Tipe Serupa 🎯
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {quickQuestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-full text-xs font-medium transition-all shadow-2xs disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 rounded-bl-xs shadow-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Guru AI sedang menyusun penjelasan ramah anak SD...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan bagian yang belum kamu pahami..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm transition-all text-slate-800 placeholder-slate-400 outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors shadow-xs"
              aria-label="Kirim Pertanyaan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Didukung oleh GLM Model via SumoPod AI • Dirancang khusus untuk pembinaan OSN SD
          </p>
        </div>
      </div>
    </div>
  );
};
