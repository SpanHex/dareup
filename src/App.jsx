import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SmoothScroll } from './components/common/SmoothScroll';
import { HomePage } from './pages/HomePage';
import { RulesPage } from './pages/RulesPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { JudgePage } from './pages/JudgePage';
import AdminPage from './pages/AdminPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <SmoothScroll />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/rules.html" element={<RulesPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/challenges.html" element={<ChallengesPage />} />
        <Route path="/ngc" element={<ChallengesPage />} />
        <Route path="/ngc.html" element={<ChallengesPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register.html" element={<RegisterPage />} />
        <Route path="/register/index.html" element={<RegisterPage />} />
        <Route path="/login" element={<RegisterPage />} />
        <Route path="/login.html" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile.html" element={<ProfilePage />} />
        <Route path="/profile/index.html" element={<ProfilePage />} />
        <Route path="/judge" element={<JudgePage />} />
        <Route path="/judge.html" element={<JudgePage />} />
        <Route path="/judge/index.html" element={<JudgePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin.html" element={<AdminPage />} />
        <Route path="/admin/index.html" element={<AdminPage />} />
        {/* Catch all redirecting to HomePage */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}
