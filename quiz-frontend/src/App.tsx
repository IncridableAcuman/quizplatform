import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { QuizTakePage } from "./pages/quiz/QuizTakePage";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LeaderboardPage } from "./pages/leaderboard/LeaderboardPage";

// Placeholder-lar (Keyinchalik to'liq sahifalar bilan almashtiriladi)
const DashboardPlaceholder = () => (
  <div className="text-white text-xl font-bold">Dashboard Sahifasi</div>
);

const AdminPlaceholder = () => (
  <div className="text-white text-xl font-bold">Admin Panel Sahifasi</div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ochiq (Public) Marshrutlar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Himoyalangan (Protected) Marshrutlar - MainLayout bilan */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/quizzes" element={<DashboardPlaceholder />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>

          {/* Fullscreen Test Topshirish Sahifasi (Layout-siz) */}
          <Route path="/quiz/:quizId" element={<QuizTakePage />} />

          {/* Faqat Admin uchun Yopiq Marshrut */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route element={<MainLayout />}>
              <Route path="/admin" element={<AdminPlaceholder />} />
            </Route>
          </Route>
        </Route>

        {/* Noma'lum yo'llarni Dashboardga yo'naltirish */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
