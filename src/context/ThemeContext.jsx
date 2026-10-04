import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import ThemeTransitionOverlay from '../components/common/ThemeTransitionOverlay';

const THEME_KEY = 'ngt_gender_theme';

const ThemeContext = createContext({
  theme: 'boy',
  hasChosenTheme: true,
  toggleTheme: () => {},
  selectTheme: () => {},
  openThemeSelector: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'boy' || stored === 'girl') return stored;
    } catch (_) {}
    return 'boy';
  });

  const [hasChosenTheme, setHasChosenTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === 'boy' || stored === 'girl';
    } catch (_) {}
    return true;
  });

  const [washActive, setWashActive] = useState(null);
  const [transitionData, setTransitionData] = useState(null);
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (hasChosenTheme) {
        root.setAttribute('data-theme', theme);
        root.classList.add('has-theme');
        root.classList.remove('needs-theme-select');
      } else {
        root.classList.add('needs-theme-select');
        root.classList.remove('has-theme');
      }
    } catch (_) {}
  }, [theme, hasChosenTheme]);

  const saveTheme = (newTheme) => {
    try {
      localStorage.setItem(THEME_KEY, newTheme);
      sessionStorage.setItem(THEME_KEY, newTheme);
      document.cookie = `ngt_gender_theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
      window.name = `ngt_theme:${newTheme}`;
    } catch (_) {}
  };

  const selectTheme = (selected, e) => {
    const chosen = selected === 'girl' ? 'girl' : 'boy';

    let originX = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 0;
    let originY = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 0;

    if (e) {
      if (typeof e.clientX === 'number' && e.clientX > 0) {
        originX = e.clientX;
        originY = e.clientY;
      } else if (e.currentTarget?.getBoundingClientRect) {
        const rect = e.currentTarget.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }
    }

    setWashActive(`active-${chosen}`);
    setTransitionData({
      active: true,
      toTheme: chosen,
      fromTheme: theme,
      originX,
      originY,
      key: Date.now(),
    });

    saveTheme(chosen);

    setTimeout(() => {
      setThemeState(chosen);
      setHasChosenTheme(true);
      setTimeout(() => {
        setWashActive(null);
        setTransitionData(null);
      }, 720);
    }, 260);
  };

  const toggleTheme = (e) => {
    if (transitionData?.active) return;

    let originX = typeof window !== 'undefined' ? window.innerWidth * 0.85 : 0;
    let originY = 40;

    if (e) {
      if (typeof e.clientX === 'number' && e.clientX > 0) {
        originX = e.clientX;
        originY = e.clientY;
      } else if (e.currentTarget?.getBoundingClientRect) {
        const rect = e.currentTarget.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      } else if (e.target?.getBoundingClientRect) {
        const rect = e.target.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }
    }

    const next = theme === 'girl' ? 'boy' : 'girl';

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setThemeState(next);
      setHasChosenTheme(true);
      saveTheme(next);
      return;
    }

    // Trigger tactile button pop feedback
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.theme-toggle-pill').forEach((btn) => {
        btn.classList.add('theme-toggle-popping');
        setTimeout(() => btn.classList.remove('theme-toggle-popping'), 600);
      });
    }

    setTransitionData({
      active: true,
      toTheme: next,
      fromTheme: theme,
      originX,
      originY,
      key: Date.now(),
    });

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

    // Synchronize underlying theme switch at wave peak
    setTimeout(() => {
      setThemeState(next);
      setHasChosenTheme(true);
      saveTheme(next);
    }, 260);

    // Clean up overlay when wave finishes expanding and fading
    transitionTimerRef.current = setTimeout(() => {
      setTransitionData(null);
    }, 720);
  };

  const openThemeSelector = () => {
    try {
      localStorage.removeItem(THEME_KEY);
      sessionStorage.removeItem(THEME_KEY);
      document.cookie = 'ngt_gender_theme=; path=/; max-age=0';
      window.name = '';
    } catch (_) {}
    setHasChosenTheme(false);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        hasChosenTheme,
        toggleTheme,
        selectTheme,
        openThemeSelector,
        washActive,
      }}
    >
      {/* MAGICAL THEME TRANSITION EXPANDING WAVE & SPARKLES */}
      <ThemeTransitionOverlay transition={transitionData} />

      {/* EXPANDING THEME WASH TRANSITION LAYER (legacy fallback) */}
      <div
        id="theme-expand-wash"
        className={`theme-expand-wash ${washActive || ''}`}
        aria-hidden="true"
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
