import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Loader2,
  History,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';
import type { QuizResultHistory } from '../../types';

export const ResultHistory: React.FC = () => {
  const [results, setResults] = useState<QuizResultHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchResultHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get<QuizResultHistory[]>('/results/history');
        if (isMounted) {
          setResults(response.data || []);
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

      const response = await axiosClient.get(`/results/${resultId}/pdf`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Certificate_${quizTitle.replace(/\s+/g, '_')}_${resultId}.pdf`);
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
      (item.quizTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.categoryName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const isPassed = item.passed !== undefined ? item.passed : Boolean(item.isPassed);

    if (statusFilter === 'PASSED') return matchesSearch && isPassed;
    if (statusFilter === 'FAILED') return matchesSearch && !isPassed;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Natijalar tarixi yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Natijalar Jurnali</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Topshirilgan Testlar Tarixi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Barcha ishlagan viktorinalaringiz natijalari va rasmiy PDF sertifikatlar
          </p>
        </div>

        <button
          onClick={() => navigate('/quizzes')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-md shadow-sky-500/20 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Yangi Test Topshirish</span>
        </button>
      </div>

      {/* Filterlar va Qidiruv */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Test nomi yoki kategoriya bo'yicha qidirish..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all backdrop-blur-md"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl">
          {(['ALL', 'PASSED', 'FAILED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === filter
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {filter === 'ALL' ? 'Barchasi' : filter === 'PASSED' ? "O'tganlar" : "O'tmaganlar"}
            </button>
          ))}
        </div>
      </div>

      {/* Natijalar Jadvali / Kartalari */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Hech qanday natija topilmadi</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Hozircha siz ushbu shartlar bo'yicha test topshirmagansiz yoki qidiruv natija bermadi.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/40">
                  <th className="py-3.5 px-5">Viktorina</th>
                  <th className="py-3.5 px-4">Kategoriya</th>
                  <th className="py-3.5 px-4">Holat</th>
                  <th className="py-3.5 px-4">Ball</th>
                  <th className="py-3.5 px-4">Ko'rsatkich</th>
                  <th className="py-3.5 px-4">Sarflangan Vaqt</th>
                  <th className="py-3.5 px-4">Sana</th>
                  <th className="py-3.5 px-5 text-right">Sertifikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredResults.map((item) => {
                  const isPassed = item.passed !== undefined ? item.passed : Boolean(item.isPassed);
                  const timeSec = item.timeSpentSeconds || item.timeTakenSeconds || 0;
                  const mins = Math.floor(timeSec / 60);
                  const secs = timeSec % 60;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-bold text-white block">{item.quizTitle}</span>
                        <span className="text-[11px] text-slate-500 font-mono">ID: #{item.id}</span>
                      </td>

                      <td className="py-4 px-4 text-xs font-semibold text-slate-300">
                        {item.categoryName}
                      </td>

                      <td className="py-4 px-4">
                        {isPassed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>O'tdi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>O'tmadi</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-amber-400">
                        {item.score} ball
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">
                            {item.percentage}%
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({item.correctAnswers}/{item.totalQuestions})
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                        {mins}m {secs}s
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-400">
                        {item.completedAt}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDownloadCertificate(item.id, item.quizTitle)}
                          disabled={downloadingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition-all disabled:opacity-50"
                        >
                          {downloadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
