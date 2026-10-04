import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { theme, toggleTheme, openThemeSelector } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileAuthOpen, setIsMobileAuthOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#auth-menu') && !e.target.closest('#mobile-auth-wrapper')) {
        setIsAuthOpen(false);
        setIsMobileAuthOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAnchorClick = (e, targetId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        const headerH = document.getElementById('site-header')?.getBoundingClientRect().height || 90;
        const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
        if (window.lenis) {
          window.lenis.scrollTo(Math.max(0, top), { duration: 1.1 });
        } else {
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
        window.history.pushState({}, '', `#${targetId}`);
      }
    } else {
      navigate(`/#${targetId}`);
    }
    setIsMobileDrawerOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const isJuryOrAdmin = user?.role === 'admin' || user?.role === 'jury';

  return (
    <>
      <header
        id="site-header"
        className={`fixed top-0 left-[50%] transform -translate-x-1/2 z-50 w-full min-h-24 py-3 md:py-0 flex justify-center items-center ${
          isScrolled ? 'header-bg' : ''
        }`}
      >
        <div className="max-w-450 w-full mx-auto px-3 flex flex-col md:flex-row justify-center md:justify-between items-center gap-2 md:gap-0">
          <Link
            to="/"
            className="text-[clamp(0.95rem,3.7vw,1.875rem)] tracking-tight text-white text-center md:text-left transition-colors duration-130 hover:text-white/70"
          >
            DAREDOWN
          </Link>

          {/* Desktop Navigation */}
          <ol className="desktop-nav decoration-transparent decoration-0 text-white text-[clamp(0.95rem,3.2vw,1.5rem)] tracking-tight flex flex-wrap justify-center items-center gap-x-4 gap-y-1 md:gap-8">
            <li>
              <Link className="header-ngc-link" to="/ngc" aria-label="Challenges">
                Challenges
              </Link>
            </li>
            <li>
              <a
                className="transition-colors duration-130 hover:text-white/70 hover:underline"
                href="/#bracket"
                onClick={(e) => handleAnchorClick(e, 'bracket')}
              >
                Bracket
              </a>
            </li>
            <li>
              <Link
                className="transition-colors duration-130 hover:text-white/70 hover:underline"
                to="/rules"
              >
                Rules
              </Link>
            </li>
            <li>
              <a
                className="transition-colors duration-130 hover:text-white/70 hover:underline"
                href="/#about"
                onClick={(e) => handleAnchorClick(e, 'about')}
              >
                About
              </a>
            </li>
            <li>
              <button
                id="theme-toggle-btn"
                type="button"
                className="theme-toggle-pill"
                aria-label="Toggle visual theme"
                onClick={toggleTheme}
              >
                <span className="theme-toggle-indicator" />
                <span className="theme-toggle-text">{theme.toUpperCase()}</span>
              </button>
            </li>
            <li>
              {!isAuthenticated ? (
                <Link
                  id="login-link"
                  className="transition-colors duration-130 hover:text-white/70 hover:underline"
                  to="/register"
                >
                  Register / Log In
                </Link>
              ) : (
                <div id="auth-menu" className="relative">
                  <button
                    id="auth-avatar-button"
                    type="button"
                    className="auth-user-pill"
                    aria-haspopup="menu"
                    aria-expanded={isAuthOpen}
                    onClick={() => setIsAuthOpen(!isAuthOpen)}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {user?.avatar ? (
                        <img
                          id="auth-avatar-image"
                          src={user.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span id="auth-avatar-fallback" className="text-xs uppercase font-bold text-white">
                          {user?.username?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    <span id="auth-username-display" className="text-sm font-medium">
                      {user?.username || 'User'}
                    </span>
                  </button>

                  {isAuthOpen && (
                    <div
                      id="auth-dropdown"
                      className="absolute right-0 top-full mt-2 min-w-45 bg-black/95 backdrop-blur-xl border border-white/20 rounded-md p-1.5 shadow-2xl z-50"
                      role="menu"
                    >
                      <Link
                        to="/profile"
                        className="block px-3 py-2 text-[15px] text-white transition-colors duration-130 hover:bg-white/10 rounded-sm"
                        role="menuitem"
                        onClick={() => setIsAuthOpen(false)}
                      >
                        Profile
                      </Link>
                      {isJuryOrAdmin && (
                        <Link
                          id="judge-link"
                          to="/judge"
                          className="block px-3 py-2 text-[15px] text-white transition-colors duration-130 hover:bg-white/10 rounded-sm"
                          role="menuitem"
                          onClick={() => setIsAuthOpen(false)}
                        >
                          Host Panel
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          id="admin-link"
                          to="/admin"
                          className="block px-3 py-2 text-[15px] text-white transition-colors duration-130 hover:bg-white/10 rounded-sm"
                          role="menuitem"
                          onClick={() => setIsAuthOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        id="theme-switch-menu-btn"
                        type="button"
                        className="w-full text-left px-3 py-2 text-[15px] text-white transition-colors duration-130 hover:bg-white/10 rounded-sm"
                        role="menuitem"
                        onClick={() => {
                          setIsAuthOpen(false);
                          openThemeSelector();
                        }}
                      >
                        Switch Style (Boy/Girl)
                      </button>
                      <button
                        id="logout-button"
                        type="button"
                        className="w-full text-left px-3 py-2 text-[15px] text-white transition-colors duration-130 hover:bg-white/10 rounded-sm"
                        role="menuitem"
                        onClick={() => {
                          setIsAuthOpen(false);
                          logout();
                        }}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          </ol>

          {/* Mobile Header Bar Controls */}
          <div className="mobile-header-actions">
            <button
              id="mobile-theme-toggle-btn"
              type="button"
              className="theme-toggle-pill"
              aria-label="Toggle visual theme"
              onClick={toggleTheme}
            >
              <span className="theme-toggle-indicator" />
              <span className="theme-toggle-text">{theme.toUpperCase()}</span>
            </button>

            <div id="mobile-auth-wrapper" className="relative">
              {!isAuthenticated ? (
                <Link id="mobile-login-link" className="mobile-login-btn" to="/register">
                  Log In
                </Link>
              ) : (
                <div id="mobile-auth-menu" className="relative">
                  <button
                    id="mobile-auth-trigger"
                    type="button"
                    className="mobile-profile-pill"
                    aria-haspopup="menu"
                    aria-expanded={isMobileAuthOpen}
                    aria-label="Account menu"
                    onClick={() => setIsMobileAuthOpen(!isMobileAuthOpen)}
                  >
                    <div className="mobile-profile-avatar">
                      {user?.avatar ? (
                        <img
                          id="mobile-auth-avatar-img"
                          src={user.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span id="mobile-auth-avatar-fallback" className="mobile-avatar-initial">
                          {user?.username?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    <span id="mobile-auth-username" className="mobile-profile-name">
                      {user?.username || 'User'}
                    </span>
                    <svg
                      className="mobile-profile-chevron"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isMobileAuthOpen && (
                    <div id="mobile-auth-dropdown" className="mobile-profile-dropdown" role="menu">
                      <div className="mobile-dropdown-header">
                        <span id="mobile-dropdown-display-name" className="mobile-dropdown-user">
                          {user?.username || 'User'}
                        </span>
                        <span id="mobile-dropdown-user-role" className="mobile-dropdown-badge">
                          {user?.role === 'admin' ? 'Admin' : user?.role === 'jury' ? 'Host' : 'Contestant'}
                        </span>
                      </div>
                      <div className="mobile-dropdown-divider" />
                      <Link
                        id="mobile-dropdown-profile-link"
                        to="/profile"
                        className="mobile-dropdown-item"
                        role="menuitem"
                        onClick={() => setIsMobileAuthOpen(false)}
                      >
                        <svg className="mobile-dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Profile</span>
                      </Link>
                      {isJuryOrAdmin && (
                        <Link
                          id="mobile-dropdown-judge-link"
                          to="/judge"
                          className="mobile-dropdown-item"
                          role="menuitem"
                          onClick={() => setIsMobileAuthOpen(false)}
                        >
                          <svg className="mobile-dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                          </svg>
                          <span>Host Panel</span>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          id="mobile-dropdown-admin-link"
                          to="/admin"
                          className="mobile-dropdown-item"
                          role="menuitem"
                          onClick={() => setIsMobileAuthOpen(false)}
                        >
                          <svg className="mobile-dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <div className="mobile-dropdown-divider" />
                      <button
                        id="mobile-dropdown-logout-btn"
                        type="button"
                        className="mobile-dropdown-item is-logout"
                        role="menuitem"
                        onClick={() => {
                          setIsMobileAuthOpen(false);
                          logout();
                        }}
                      >
                        <svg className="mobile-dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              id="mobile-menu-toggle"
              type="button"
              className="mobile-menu-toggle"
              aria-label="Open navigation menu"
              aria-expanded={isMobileDrawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setIsMobileDrawerOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${isMobileDrawerOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        aria-hidden={!isMobileDrawerOpen}
      >
        <div className="mobile-nav-panel">
          <div className="mobile-nav-header">
            <span className="mobile-nav-brand">DAREDOWN</span>
            <button
              id="mobile-nav-close-btn"
              type="button"
              className="mobile-nav-close"
              aria-label="Close menu"
              onClick={() => setIsMobileDrawerOpen(false)}
            >
              &times;
            </button>
          </div>
          <ul className="mobile-nav-links">
            <li>
              <Link
                to="/ngc"
                className="mobile-nav-link is-highlight"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <span>Challenges (Truth/Dare)</span>
                <span>&rarr;</span>
              </Link>
            </li>
            <li>
              <a
                href="/#bracket"
                className="mobile-nav-link"
                onClick={(e) => handleAnchorClick(e, 'bracket')}
              >
                <span>Tournament Bracket</span>
                <span>&rarr;</span>
              </a>
            </li>
            <li>
              <Link
                to="/rules"
                className="mobile-nav-link"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <span>Official Rules</span>
                <span>&rarr;</span>
              </Link>
            </li>
            <li>
              <a
                href="/#about"
                className="mobile-nav-link"
                onClick={(e) => handleAnchorClick(e, 'about')}
              >
                <span>About DAREDOWN</span>
                <span>&rarr;</span>
              </a>
            </li>
            <li>
              <Link
                to="/profile"
                className="mobile-nav-link"
                id="mobile-drawer-auth-link"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <span>Profile</span>
                <span>&rarr;</span>
              </Link>
            </li>
            {isJuryOrAdmin && (
              <li>
                <Link
                  to="/judge"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  <span>Host Panel</span>
                  <span>&rarr;</span>
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  <span>Admin Dashboard</span>
                  <span>&rarr;</span>
                </Link>
              </li>
            )}
          </ul>
          <div className="mobile-nav-footer">
            <button
              id="mobile-drawer-theme-btn"
              type="button"
              className="mobile-nav-link"
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => {
                toggleTheme();
                setIsMobileDrawerOpen(false);
              }}
            >
              <span>Switch Theme (Boy / Girl)</span>
              <span id="mobile-drawer-theme-name" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                {theme.toUpperCase()}
              </span>
            </button>
            {isAuthenticated && (
              <button
                id="mobile-drawer-logout-btn"
                type="button"
                className="mobile-nav-link"
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ff4b82' }}
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  logout();
                }}
              >
                <span>Log Out</span>
                <span>&times;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
