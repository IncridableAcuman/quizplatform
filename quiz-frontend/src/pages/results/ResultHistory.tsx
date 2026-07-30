import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

interface QuizResultHistory {
  id: number;
  quizId: number;
  quizTitle: string;
  categoryName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  timeSpentSeconds: number;
}

export const ResultHistory: React.FC = () => {
  const [results, setResults] = useState<QuizResultHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');

  useEffect(() => {
    let isMounted = true;

    const fetchResultHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get<QuizResultHistory[]>('/results/history');
        if (isMounted) {
          setResults(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Natijalar tarixini yuklashda xatolik:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResultHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // PDF Sertifikatni yuklab olish
  const handleDownloadCertificate = async (resultId: number, quizTitle: string) => {
    try {
      setDownloadingId(resultId);

      const response = await axiosClient.get(`/results/${resultId}/certificate`, {
        responseType: 'blob', // Binary PDF fayl formatida qabul qilamiz
      });

      // Blob obyektini yaratib, avtomatik yuklash linkini simulyatsiya qilish
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Certificate_${quizTitle.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Sertifikatni yuklab olishda xatolik:", err);
      alert("Sertifikatni yuklab olishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Saralash va Filterlash
  const filteredResults = results.filter((item) => {
    const matchesSearch =
      item.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'PASSED') return matchesSearch && item.passed;
    if (statusFilter === 'FAILED') return matchesSearch && !item.passed;
    return matchesSearch;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-400" />
            <span>Natijalar Tarixi va Sertifikatlar</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Topshirilgan barcha testlar statistikasi hamda o'tilgan testlar uchun PDF sertifikatlarni yuklab olish
          </p>
        </div>

        {/* Qisqacha statistik ko'rsatkich */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Jami Topshirilgan</div>
            <div className="text-lg font-bold text-white">{results.length} ta test</div>
          </div>
        </div>
      </div>

      {/* Filter va Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quiz nomi yoki kategoriya bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {(['ALL', 'PASSED', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL' && 'Barchasi'},
              {status === 'PASSED' && 'O\'tganlar'}
              {status === 'FAILED' && 'O\'tmaganlar'}
            </button>
          ))}
        </div>
      </div>

      {/* Results List / Grid */}
      {filteredResults.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Natijalar topilmadi</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Siz hali mos keladigan testlarni topshirmagansiz yoki qidiruv so'rovingizga mos natija mavjud emas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-4">
                {/* Header: Category & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                    {result.categoryName}
                  </span>

                  {result.passed ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>O'tdi</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>O'tmadi</span>
                    </span>
                  )}
                </div>

                {/* Quiz Title */}
                <h3 className="text-lg font-bold text-white line-clamp-2">
                  {result.quizTitle}
                </h3>

                {/* Main Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <div>
                    <div className="text-xs text-slate-400">Natija</div>
                    <div className="text-base font-bold text-white font-mono">
                      {result.score}/{result.totalQuestions} ({result.percentage}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Sarflangan Vaqt</div>
                    <div className="text-base font-bold text-slate-300 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatTime(result.timeSpentSeconds)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(result.completedAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-800">
                {result.passed ? (
                  <button
                    onClick={() => handleDownloadCertificate(result.id, result.quizTitle)}
                    disabled={downloadingId === result.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-lg shadow-sky-500/10"
                  >
                    {downloadingId === result.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sertifikat Tayyorlanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Sertifikatni Yuklab Olish</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center py-2 px-3 rounded-xl bg-slate-950 text-slate-500 text-xs font-medium border border-slate-800/50">
                    Sertifikat olish uchun kamida 70% to'plashingiz kerak
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};