import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Download,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Code2,
  Home,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { axiosClient } from '../../api/axiosClient';
import type { Quiz, QuizResult, Question, SubmitQuizPayload } from '../../types';

export const QuizTakePage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  // State-lar
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}); // questionId -> optionId
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<number | null>(null);

  // 1. Quiz ma'lumotlarini yuklash
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get<Quiz>(`/quizzes/${quizId}`);
        setQuiz(response.data);
        setTimeLeftSeconds((response.data.timeLimitMinutes || 10) * 60);
      } catch (err) {
        console.error("Quiz ma'lumotlarini yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  // Variant tanlash
  const handleOptionSelect = (questionId: number, optionId: number) => {
    if (quizResult || isSubmitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // 2. Testni topshirish (Submit)
  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz || isSubmitting) return;

    setIsSubmitting(true);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }

    const totalTime = (quiz.timeLimitMinutes || 10) * 60;
    const totalSpentTime = totalTime - timeLeftSeconds;

    const payload: SubmitQuizPayload = {
      quizId: quiz.id,
      timeTakenSeconds: totalSpentTime > 0 ? totalSpentTime : 1,
      answers: selectedAnswers,
    };

    try {
      const response = await axiosClient.post<QuizResult>('/results/submit', payload);
      setQuizResult(response.data);

      if (response.data.isPassed) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Natijani yuborishda xatolik:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, isSubmitting, timeLeftSeconds, selectedAnswers]);

  // 3. Taymer
  useEffect(() => {
    if (timeLeftSeconds > 0 && !quizResult && quiz) {
      timerRef.current = window.setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current !== null) clearInterval(timerRef.current);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [timeLeftSeconds, quizResult, quiz, handleSubmitQuiz]);

  // 4. Klaviatura bilan boshqarish (Keyboard Shortcuts)
  useEffect(() => {
    if (!quiz || quizResult || !quiz.questions || quiz.questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentQ = quiz.questions?.[currentQuestionIndex];
      if (!currentQ) return;

      // 1, 2, 3, 4 yoki A, B, C, D orqali javob tanlash
      const key = e.key.toUpperCase();
      let optionIdx = -1;

      if (key === '1' || key === 'A') optionIdx = 0;
      else if (key === '2' || key === 'B') optionIdx = 1;
      else if (key === '3' || key === 'C') optionIdx = 2;
      else if (key === '4' || key === 'D') optionIdx = 3;

      if (optionIdx !== -1 && currentQ.options[optionIdx]) {
        handleOptionSelect(currentQ.id, currentQ.options[optionIdx].id);
      }

      // ArrowRight -> Keyingi savol
      if (e.key === 'ArrowRight' && quiz.questions && currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      // ArrowLeft -> Oldingi savol
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, currentQuestionIndex, quizResult, selectedAnswers]);

  // 5. PDF Sertifikatni Yuklab Olish
  const handleDownloadPdf = async () => {
    const resultId = quizResult?.id || quizResult?.resultId;
    if (!resultId) return;
    setDownloadingPdf(true);

    try {
      const response = await axiosClient.get(`/results/${resultId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quiz-Certificate-${resultId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF yuklashda xatolik:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Savollar tayyorlanmoqda...</p>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion: Question = questions[currentQuestionIndex] || {
    id: 0,
    content: 'Savol mavjud emas',
    points: 0,
    options: [],
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;
  const progressPercentage = totalCount > 0 ? (((currentQuestionIndex + 1) / totalCount) * 100).toFixed(0) : '0';

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-160 h-160 bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {!quizResult ? (
          /* ================= TEST TOPSHIRISH INTERFEYSI ================= */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6"
          >
            {/* Header: Title, Kategoriya va Taymer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                  {quiz.category?.name || 'Viktorina'}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">{quiz.title}</h1>
              </div>

              {/* Taymer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono text-sm font-bold shadow-inner ${
                  timeLeftSeconds < 60
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-400" />
                <span>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Savollar Navigatori (Pills Matrix) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Savol: <strong className="text-white">{currentQuestionIndex + 1}</strong> / {totalCount}
                </span>
                <span>
                  Belgilangan: <strong className="text-emerald-400">{answeredCount}</strong> / {totalCount}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = selectedAnswers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-sky-500 text-white ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 shadow-md shadow-sky-500/30'
                          : isAnswered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <motion.div
                  className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full"
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Savol Matni va Kod Bloki */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                <div className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {currentQuestion.content}
                  </h2>

                  {/* Code Snippet (mavjud bo'lsa) */}
                  {currentQuestion.codeSnippet && (
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-sky-300 overflow-x-auto shadow-inner">
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800/80 text-slate-500 text-[10px] uppercase font-bold">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Kod Blok</span>
                      </div>
                      <pre className="whitespace-pre">{currentQuestion.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Javob Variantlari */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options?.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option.id;

                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all border ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                            : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {optionLabels[idx] || idx + 1}
                        </span>
                        <span className="text-sm font-medium leading-relaxed">{option.optionText}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigatsiya va Tugmalar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  currentQuestionIndex === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Oldingi Savol</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {currentQuestionIndex < totalCount - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all"
                  >
                    <span>Keyingi Savol</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Yuborilmoqda...' : 'Testni Yakunlash'}</span>
                </button>
              </div>
            </div>

            {/* Keyboard shortcut hint */}
            <p className="text-[11px] text-slate-500 text-center">
              💡 Maslahat: Variantlarni klaviaturadagi <strong>A, B, C, D</strong> yoki <strong>1, 2, 3, 4</strong> tugmalari orqali tanlashingiz mumkin.
            </p>
          </motion.div>
        ) : (
          /* ================= TEST NATIJASI KO'RINISHI ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl text-center space-y-6"
          >
            {/* Status Icon */}
            <div className="inline-flex p-4 rounded-3xl bg-slate-800/60 border border-slate-700 shadow-xl mx-auto">
              {quizResult.isPassed ? (
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Award className="w-10 h-10" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <XCircle className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* Sarlavha */}
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                {quizResult.categoryName || quiz.category?.name || 'Quiz'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {quizResult.quizTitle || quiz.title}
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                {quizResult.isPassed
                  ? "Tabriklaymiz! Siz ushbu viktorinadan muvaffaqiyatli o'tdingiz!"
                  : "Afsuski, ushbu safar o'tish baliga yetmadi. Yana harakat qilib ko'ring!"}
              </p>
            </div>

            {/* Statistika Kartochkalari */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
                <span className="text-xs text-slate-400">To'plangan Ball</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{quizResult.score}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
                <span className="text-xs text-slate-400">To'g'ri Javoblar</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {quizResult.correctAnswers} / {quizResult.totalQuestions}
                </p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
                <span className="text-xs text-slate-400">O'zlashtirish</span>
                <p className="text-2xl font-black text-sky-400 mt-1">
                  {quizResult.percentage || Math.round((quizResult.correctAnswers / (quizResult.totalQuestions || 1)) * 100)}%
                </p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
                <span className="text-xs text-slate-400">Sarflangan Vaqt</span>
                <p className="text-2xl font-black text-purple-400 mt-1">
                  {Math.floor(quizResult.timeTakenSeconds / 60)}m {quizResult.timeTakenSeconds % 60}s
                </p>
              </div>
            </div>

            {/* Harakatlar Tugmalari */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingPdf ? 'Sertifikat yuklanmoqda...' : 'Sertifikatni Yuklab Olish (PDF)'}</span>
              </button>

              <button
                onClick={() => {
                  setQuizResult(null);
                  setSelectedAnswers({});
                  setCurrentQuestionIndex(0);
                  setTimeLeftSeconds((quiz.timeLimitMinutes || 10) * 60);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qayta topshirish</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
