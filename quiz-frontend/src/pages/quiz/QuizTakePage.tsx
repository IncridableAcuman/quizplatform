import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Download, ArrowRight, RotateCcw, Award, AlertTriangle } from 'lucide-react';
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

  // Browser-based setInterval uchun `number` turi ishlatiladi
  const timerRef = useRef<number | null>(null);

  // 1. Quiz ma'lumotlarini yuklash
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axiosClient.get<Quiz>(`/quizzes/${quizId}`);
        setQuiz(response.data);
        setTimeLeftSeconds(response.data.timeLimitMinutes * 60);
      } catch (err) {
        console.error("Quiz ma'lumotlarini yuklashda xatolik:", err);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  // Variant tanlash
  const handleOptionSelect = (questionId: number, optionId: number) => {
    if (quizResult) return; // Natija chiqgach tanlab bo'lmaydi
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // 2. Testni yakunlash va submit qilish (useCallback bilan o'ralgan)
  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz || isSubmitting) return;

    setIsSubmitting(true);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }

    const totalSpentTime = quiz.timeLimitMinutes * 60 - timeLeftSeconds;

    const payload: SubmitQuizPayload = {
      quizId: quiz.id,
      timeTakenSeconds: totalSpentTime > 0 ? totalSpentTime : 1,
      answers: selectedAnswers,
    };

    try {
      const response = await axiosClient.post<QuizResult>('/results/submit', payload);
      setQuizResult(response.data);

      // Agar testdan muvaffaqiyatli o'tsa confetti otiladi
      if (response.data.isPassed) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Natijani yuborishda xatolik:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, isSubmitting, timeLeftSeconds, selectedAnswers]);

  // 3. Real-vaqt Taymer Logic (Endi handleSubmitQuiz e'lon qilingandan KЕYIN joylashgan)
  useEffect(() => {
    if (timeLeftSeconds > 0 && !quizResult) {
      timerRef.current = window.setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current !== null) clearInterval(timerRef.current);
            handleSubmitQuiz(); // Vaqt tugagach avtomatik submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [timeLeftSeconds, quizResult, handleSubmitQuiz]);

  // 4. PDF Sertifikatni Yuklab Olish
  const handleDownloadPdf = async () => {
    if (!quizResult) return;
    setDownloadingPdf(true);

    try {
      const response = await axiosClient.get(`/results/${quizResult.id}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quiz-Certificate-${quizResult.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('PDF yuklashda xatolik:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentQuestion: Question = quiz.questions?.[currentQuestionIndex] || {
    id: 0,
    content: '',
    points: 0,
    options: [],
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const progressPercentage = (((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">
        {!quizResult ? (
          /* ================= TEST TOPSHIRISH INTERFEYSI ================= */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
          >
            {/* Header: Title va Taymer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
                  {quiz.category?.name || 'Quiz'}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{quiz.title}</h1>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-semibold self-start sm:self-auto ${
                  timeLeftSeconds < 60
                    ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Question Progress Bar */}
            <div className="my-6">
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                <span>
                  Savol {currentQuestionIndex + 1} / {quiz.questions?.length}
                </span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-sky-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Savol Kontenti va Animatsiyasi */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <h2 className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
                  {currentQuestion.content}
                </h2>

                {/* Dasturlash kodi bor bo'lsa (Code Snippet) */}
                {currentQuestion.codeSnippet && (
                  <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-mono text-sky-300 overflow-x-auto">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                )}

                {/* Variantlar Ro'yxati */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500 text-sky-200 shadow-md shadow-sky-500/10'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <span>{option.optionText}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation va Submit Tugmalari */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Orqaga
              </button>

              {currentQuestionIndex < (quiz.questions?.length || 1) - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/20"
                >
                  <span>Keyingisi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Testni Yakunlash</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* ================= YAKUNIY NATIJA KARTASI (RESULT CARD) ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10 border">
              {quizResult.isPassed ? (
                <div className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 w-full h-full rounded-3xl flex items-center justify-center">
                  <Award className="w-10 h-10" />
                </div>
              ) : (
                <div className="bg-red-500/10 border-red-500/30 text-red-400 w-full h-full rounded-3xl flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10" />
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {quizResult.isPassed ? "Tabriklaymiz! Testdan o'tdingiz 🎉" : 'Afsuski, yetarli ball toplay olmadingiz'}
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              {quizResult.isPassed
                ? 'Siz belgilangan bilim darajasini ko’rsatdingiz va sertifikatingiz tayyor!'
                : 'Qayta urinib ko’ring va bilimingizni yanada mustahkamlang.'}
            </p>

            {/* Statistika Paneli */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">To'plangan Ball</span>
                <span className="text-xl font-bold text-sky-400">{quizResult.score}</span>
              </div>
              <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">To'g'ri Javoblar</span>
                <span className="text-xl font-bold text-emerald-400">
                  {quizResult.correctAnswers} / {quizResult.totalQuestions}
                </span>
              </div>
              <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">Sarflangan Vaqt</span>
                <span className="text-xl font-bold text-slate-200">{quizResult.timeTakenSeconds}s</span>
              </div>
              <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">Status</span>
                <span
                  className={`text-sm font-bold uppercase ${
                    quizResult.isPassed ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {quizResult.isPassed ? "O'tdi" : "O'tmadi"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Sertifikatni Yuklab Olish (PDF)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Dashboardga Qaytish</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};