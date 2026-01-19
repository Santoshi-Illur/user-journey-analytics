// src/App.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import UserJourneyPage from "./pages/UserJourneyPage";
import FunnelAnalysisPage from "./pages/FunnelAnalysisPage";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem("token"));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  return (
    <Routes>
      <Route path="/" element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/app/dashboard" replace />} />
      <Route path="/app" element={isLoggedIn ? <Layout /> : <Navigate to="/" replace />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="user/:id" element={<UserJourneyPage />} />
        <Route path="funnel" element={<FunnelAnalysisPage />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
