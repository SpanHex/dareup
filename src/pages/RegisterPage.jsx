import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import '../styles/register.css';

export const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setUser } = useAuth();

  const isLoginUrl = location.pathname === '/login';
  const [activeTab, setActiveTab] = useState(isLoginUrl ? 'login' : 'register');

  // Registration Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConsent, setRegConsent] = useState(false);

  // Registration Validation Errors
  const [errRegUsername, setErrRegUsername] = useState(false);
  const [errRegEmail, setErrRegEmail] = useState(false);
  const [errRegPassword, setErrRegPassword] = useState(false);
  const [errConsent, setErrConsent] = useState(false);
  const [errRegGeneral, setErrRegGeneral] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errLoginGeneral, setErrLoginGeneral] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Success State
  const [successState, setSuccessState] = useState(null); // 'register' | 'login' | null

  useEffect(() => {
    if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Check URL for OAuth errors
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'oauth_failed') {
      setErrRegGeneral('OAuth authentication failed. Please try again.');
    }
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = regUsername.trim();
    const trimmedEmail = regEmail.trim();

    let valid = true;
    if (!trimmedUsername || trimmedUsername.length > 30) {
      setErrRegUsername(true);
      valid = false;
    } else {
      setErrRegUsername(false);
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrRegEmail(true);
      valid = false;
    } else {
      setErrRegEmail(false);
    }

    if (!regPassword) {
      setErrRegPassword(true);
      valid = false;
    } else {
      setErrRegPassword(false);
    }

    if (!regConsent) {
      setErrConsent(true);
      valid = false;
    } else {
      setErrConsent(false);
    }

    if (!valid) return;

    setIsRegistering(true);
    setErrRegGeneral('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail || undefined,
          password: regPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.user) {
        if (setUser) setUser(data.user);
        if (login) login(data.user, data.token);
      }

      setSuccessState('register');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setErrRegGeneral(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = loginUsername.trim();

    if (!trimmedUsername || !loginPassword) {
      setErrLoginGeneral('Please enter your display name and password.');
      return;
    }

    setIsLoggingIn(true);
    setErrLoginGeneral('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user) {
        if (setUser) setUser(data.user);
        if (login) login(data.user, data.token);
      }

      setSuccessState('login');

      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get('next');
      const safeNext =
        nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
          ? nextParam
          : null;
      const isAdminUser = (data.user?.role || '').toLowerCase() === 'admin';
      const dest = safeNext || (isAdminUser ? '/admin' : '/');

      setTimeout(() => {
        navigate(dest);
      }, 900);
    } catch (err) {
      setErrLoginGeneral(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Header />
      <div className="register-page">
        <main className="reg-main" id="register-main">
          {successState === null && (
            <>
              {/* Event Badge */}
              <div className="reg-badge">
                <span className="reg-badge-dot" />
                <span>Registrations open</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="reg-title">
                Join<br />DAREDOWN.
              </h1>
              <p className="reg-subtitle">
                16 spots. One winner. Truth or Dare decides everything.<br />
                Create your profile to enter the tournament.
              </p>

              {/* Entry Fee Info */}
              <div className="reg-entry-notice">
                <span className="reg-entry-label">Event Details</span>
                <div className="reg-entry-amounts">
                  <div className="reg-entry-item">
                    <span className="reg-entry-value">£0.50</span>
                    <span className="reg-entry-desc">Entry Fee</span>
                  </div>
                  <div className="reg-entry-item">
                    <span className="reg-entry-value">£50</span>
                    <span className="reg-entry-desc">Prize Pool</span>
                  </div>
                  <div className="reg-entry-item">
                    <span className="reg-entry-value">16</span>
                    <span className="reg-entry-desc">Max Players</span>
                  </div>
                </div>
                <p className="reg-entry-note">
                  Entry fee collected by the host at event check-in. First come, first served.
                  Payment processed in-person at check-in. No card details required here.
                </p>
              </div>

              {/* Auth Tabs */}
              <div className="auth-tabs">
                <div
                  className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                  id="tab-register"
                  onClick={() => {
                    setActiveTab('register');
                    setErrRegGeneral('');
                    setErrLoginGeneral('');
                  }}
                >
                  Register
                </div>
                <div
                  className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                  id="tab-login"
                  onClick={() => {
                    setActiveTab('login');
                    setErrRegGeneral('');
                    setErrLoginGeneral('');
                  }}
                >
                  Login
                </div>
              </div>

              {/* Registration Form */}
              <form
                className="reg-form"
                id="register-form"
                noValidate
                style={{ display: activeTab === 'register' ? 'flex' : 'none' }}
                onSubmit={handleRegisterSubmit}
              >
                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-username">
                    Display Name
                  </label>
                  <input
                    className="reg-input"
                    type="text"
                    id="reg-username"
                    name="username"
                    placeholder="Enter your name or alias"
                    maxLength={30}
                    autoComplete="nickname"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                  <span
                    className={`reg-error ${errRegUsername ? 'visible' : ''}`}
                    id="err-reg-username"
                  >
                    Please enter a display name (max 30 characters).
                  </span>
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-email">
                    Email (optional)
                  </label>
                  <input
                    className="reg-input"
                    type="email"
                    id="reg-email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  <span
                    className={`reg-error ${errRegEmail ? 'visible' : ''}`}
                    id="err-reg-email"
                  >
                    Please enter a valid email address.
                  </span>
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-password">
                    Password
                  </label>
                  <input
                    className="reg-input"
                    type="password"
                    id="reg-password"
                    name="password"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <span
                    className={`reg-error ${errRegPassword ? 'visible' : ''}`}
                    id="err-reg-password"
                  >
                    Password is required.
                  </span>
                </div>

                <label className="reg-consent" htmlFor="reg-consent">
                  <input
                    type="checkbox"
                    className="reg-consent-check"
                    id="reg-consent"
                    checked={regConsent}
                    onChange={(e) => setRegConsent(e.target.checked)}
                    required
                  />
                  <span className="reg-consent-text">
                    I agree to participate in good faith, accept the{' '}
                    <Link to="/rules">event rules</Link>.
                  </span>
                </label>
                <span
                  className={`reg-error ${errConsent ? 'visible' : ''}`}
                  id="err-consent"
                >
                  You must agree to the event rules.
                </span>
                <span
                  className={`reg-error ${errRegGeneral ? 'visible' : ''}`}
                  id="err-reg-general"
                >
                  {errRegGeneral}
                </span>

                <button
                  type="submit"
                  className="reg-submit"
                  id="reg-submit-btn"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Registering...' : 'Register Now'}
                </button>
              </form>

              {/* Login Form */}
              <form
                className="reg-form"
                id="login-form"
                noValidate
                style={{ display: activeTab === 'login' ? 'flex' : 'none' }}
                onSubmit={handleLoginSubmit}
              >
                <div className="reg-field">
                  <label className="reg-label" htmlFor="login-username">
                    Display Name
                  </label>
                  <input
                    className="reg-input"
                    type="text"
                    id="login-username"
                    name="username"
                    placeholder="Enter your display name"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    className="reg-input"
                    type="password"
                    id="login-password"
                    name="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <span
                  className={`reg-error ${errLoginGeneral ? 'visible' : ''}`}
                  id="err-login-general"
                >
                  {errLoginGeneral}
                </span>

                <button
                  type="submit"
                  className="reg-submit"
                  id="login-submit-btn"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* OR Divider */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              {/* OAuth Buttons */}
              <div className="oauth-container">
                <a href="/api/auth/google" className="oauth-btn">
                  Google
                </a>
                <a href="/api/auth/discord" className="oauth-btn">
                  Discord
                </a>
              </div>
            </>
          )}

          {/* Success State */}
          {successState === 'register' && (
            <div className="reg-success" id="reg-success" style={{ display: 'flex' }}>
              <div className="reg-success-icon">🎭</div>
              <h2 className="reg-success-title">You're Registered!</h2>
              <p className="reg-success-text">
                Your entry has been noted. The host will confirm your spot before the event.
                Check back on the{' '}
                <Link to="/#bracket" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  bracket
                </Link>{' '}
                to see when you're up.
              </p>
            </div>
          )}

          {successState === 'login' && (
            <div className="reg-success" id="reg-success" style={{ display: 'flex' }}>
              <div className="reg-success-icon">🎭</div>
              <h2 className="reg-success-title">Welcome Back!</h2>
              <p className="reg-success-text">Redirecting...</p>
            </div>
          )}
        </main>

        <footer className="reg-footer">
          <Link to="/">← Back to DAREDOWN</Link>
        </footer>
      </div>
    </>
  );
};
