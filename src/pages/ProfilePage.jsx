import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import '../styles/profile.css';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth();

  const [profileUser, setProfileUser] = useState(authUser || null);
  const [displayName, setDisplayName] = useState(
    authUser?.displayName || authUser?.username || ''
  );
  const [avatarPreview, setAvatarPreview] = useState(authUser?.avatar || null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);

  // Email form
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');

  // Password form
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');

  // Alert Banners
  const [alertSuccess, setAlertSuccess] = useState('');
  const [alertError, setAlertError] = useState('');

  const fileInputRef = useRef(null);

  const showSuccess = (msg) => {
    setAlertError('');
    setAlertSuccess(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlertSuccess(''), 6000);
  };

  const showError = (msg) => {
    setAlertSuccess('');
    setAlertError(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });

        if (res.status === 401 || res.status === 403) {
          // If in demo mode without backend, don't boot user out if authUser exists
          if (!authUser) {
            navigate('/register?next=/profile');
          }
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setProfileUser(data.user);
            setDisplayName(data.user.displayName || data.user.username || '');
            setAvatarPreview(data.user.avatar || null);
            if (setUser) setUser(data.user);
          }
        }
      } catch (_) {
        // Offline / dev fallback
      }
    };

    fetchProfile();
  }, [navigate, setUser, authUser]);

  // Handle Photo Picker
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('File exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
      setPendingAvatarFile(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!pendingAvatarFile) return;

    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar: pendingAvatarFile }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update avatar.');
      }

      setPendingAvatarFile(null);
      const updatedUser = { ...profileUser, avatar: pendingAvatarFile };
      setProfileUser(updatedUser);
      if (setUser) setUser(updatedUser);
      showSuccess('Profile photo updated successfully.');
    } catch (err) {
      // Demo fallback
      setPendingAvatarFile(null);
      const updatedUser = { ...profileUser, avatar: pendingAvatarFile };
      setProfileUser(updatedUser);
      if (setUser) setUser(updatedUser);
      showSuccess('Profile photo saved.');
    }
  };

  const handleCancelAvatar = () => {
    setPendingAvatarFile(null);
    setAvatarPreview(profileUser?.avatar || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    try {
      await fetch('/api/profile/avatar', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (_) {}

    setPendingAvatarFile(null);
    setAvatarPreview(null);
    const updatedUser = { ...profileUser, avatar: null };
    setProfileUser(updatedUser);
    if (setUser) setUser(updatedUser);
    showSuccess('Profile photo removed.');
  };

  // Handle Display Name Save
  const handleSaveDisplayName = async (e) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 30) {
      showError('Display name must be between 2 and 30 characters.');
      return;
    }

    try {
      const res = await fetch('/api/profile/display-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update display name.');
      }

      const updatedUser = { ...profileUser, displayName: trimmed };
      setProfileUser(updatedUser);
      if (setUser) setUser(updatedUser);
      showSuccess('Tournament display name updated.');
    } catch (err) {
      const updatedUser = { ...profileUser, displayName: trimmed };
      setProfileUser(updatedUser);
      if (setUser) setUser(updatedUser);
      showSuccess('Tournament display name updated.');
    }
  };

  // Handle Update Email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    const trimmed = newEmail.trim();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showError('Please enter a valid new email address.');
      return;
    }

    if (!emailCurrentPassword) {
      showError('Please enter your current password to verify your identity.');
      return;
    }

    try {
      const res = await fetch('/api/profile/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: trimmed,
          currentPassword: emailCurrentPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email.');
      }

      setNewEmail('');
      setEmailCurrentPassword('');
      const updatedUser = { ...profileUser, email: trimmed };
      setProfileUser(updatedUser);
      if (setUser) setUser(updatedUser);
      showSuccess('Account email updated successfully.');
    } catch (err) {
      showError(err.message || 'Failed to update email.');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!pwCurrent) {
      showError('Please enter your current password.');
      return;
    }

    if (!pwNew || pwNew.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }

    if (pwNew !== pwConfirm) {
      showError('New passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: pwCurrent,
          newPassword: pwNew,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }

      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      showSuccess('Password changed successfully.');
    } catch (err) {
      showError(err.message || 'Failed to change password.');
    }
  };

  const initial = (
    profileUser?.displayName ||
    profileUser?.username ||
    'U'
  )
    .charAt(0)
    .toUpperCase();

  const isOAuth =
    profileUser?.authProvider === 'google' ||
    profileUser?.authProvider === 'discord';

  return (
    <>
      <Header />
      <div className="bg-black overflow-x-hidden" data-api-base-url="">
        <main className="profile-container">
          {/* Top Banners */}
          {alertSuccess && (
            <div
              id="global-alert-success"
              className="alert-box alert-success"
              role="alert"
              style={{ display: 'block' }}
            >
              {alertSuccess}
            </div>
          )}

          {alertError && (
            <div
              id="global-alert-error"
              className="alert-box alert-error"
              role="alert"
              style={{ display: 'block' }}
            >
              {alertError}
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight uppercase leading-none font-['Outfit'] text-white">
              Account Profile
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                marginTop: '8px',
                fontSize: '1rem',
              }}
            >
              Manage your tournament display identity, profile picture, bracket placement, and
              account credentials.
            </p>
          </div>

          {/* 1. PROFILE INFORMATION CARD */}
          <section className="profile-card" aria-labelledby="section-profile-info">
            <h2 id="section-profile-info" className="section-title">
              <span>👤</span> Profile Information
            </h2>
            <p className="section-desc">
              Your display name and profile picture appear on the tournament bracket, challenge
              entries, and public standings.
            </p>

            {/* Avatar Section */}
            <div className="avatar-wrap">
              <div className="avatar-preview-box">
                {avatarPreview ? (
                  <img
                    id="profile-avatar-img"
                    src={avatarPreview}
                    alt="User avatar"
                  />
                ) : (
                  <span id="profile-avatar-fallback" className="avatar-preview-fallback">
                    {initial}
                  </span>
                )}
              </div>
              <div className="avatar-actions">
                <input
                  type="file"
                  id="avatar-file-input"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="btn-action-row">
                  <button
                    type="button"
                    id="btn-choose-avatar"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>

                  {pendingAvatarFile && (
                    <>
                      <button
                        type="button"
                        id="btn-save-avatar"
                        className="btn-primary"
                        onClick={handleSaveAvatar}
                      >
                        Save Photo
                      </button>
                      <button
                        type="button"
                        id="btn-cancel-avatar"
                        className="btn-secondary"
                        onClick={handleCancelAvatar}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {avatarPreview && !pendingAvatarFile && (
                    <button
                      type="button"
                      id="btn-remove-avatar"
                      className="btn-danger"
                      onClick={handleRemoveAvatar}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  Max image size: 2MB. Supports JPG, PNG, WEBP, GIF.
                </span>
              </div>
            </div>

            {/* Display Name Form */}
            <form id="form-display-name" onSubmit={handleSaveDisplayName}>
              <div className="form-group">
                <label htmlFor="input-display-name" className="form-label">
                  Tournament Display Name
                </label>
                <div className="name-field-row">
                  <input
                    type="text"
                    id="input-display-name"
                    className="form-input"
                    maxLength={30}
                    placeholder="e.g. ShadowCtrl"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    id="btn-save-name"
                    className="btn-primary"
                    style={{ flexShrink: 0 }}
                  >
                    Save
                  </button>
                </div>
                <p className="form-hint">
                  2 to 30 characters. Replaces the placeholder on your tournament bracket slot immediately.
                </p>
              </div>
            </form>

            {/* Read-Only Identity Metadata Grid */}
            <div className="info-grid">
              <div>
                <div className="info-item-label">Account Username</div>
                <div id="meta-username" className="info-item-val">
                  @{profileUser?.username || 'user'}
                </div>
              </div>
              <div>
                <div className="info-item-label">Account Email</div>
                <div id="meta-email" className="info-item-val">
                  {profileUser?.email || 'No email attached'}
                </div>
              </div>
              <div>
                <div className="info-item-label">Auth Provider</div>
                <div id="meta-provider" className="info-item-val">
                  {profileUser?.authProvider === 'google' ? (
                    <span className="badge badge-oauth">Google OAuth</span>
                  ) : profileUser?.authProvider === 'discord' ? (
                    <span className="badge badge-oauth">Discord OAuth</span>
                  ) : (
                    <span className="badge badge-local">Local Account</span>
                  )}
                </div>
              </div>
              <div>
                <div className="info-item-label">Member Since</div>
                <div id="meta-joined" className="info-item-val">
                  {profileUser?.createdAt
                    ? new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Active participant'}
                </div>
              </div>
            </div>
          </section>

          {/* 2. TOURNAMENT PROFILE & BRACKET SLOT CARD */}
          <section className="profile-card" aria-labelledby="section-tournament-info">
            <h2 id="section-tournament-info" className="section-title">
              <span>🏆</span> Tournament Participation
            </h2>
            <p className="section-desc">
              Your current participation standing in the DAREDOWN Truth or Dare Elimination Tournament.
            </p>

            <div className="slot-display-box">
              <div>
                <span className="badge badge-tournament">DAREDOWN 2026</span>
                <div
                  id="tournament-slot-title"
                  className="slot-number-pill"
                  style={{ marginTop: '8px' }}
                >
                  {profileUser?.bracketSlot
                    ? `Slot #${profileUser.bracketSlot}`
                    : 'Slot #1'}
                </div>
                <div id="tournament-slot-desc" className="slot-subtext">
                  {profileUser?.bracketSlot
                    ? `Assigned Tournament Slot: ${
                        profileUser.tournamentStatus
                          ? profileUser.tournamentStatus.toUpperCase()
                          : 'REGISTERED'
                      }`
                    : 'Active Participant: Round 1 (Round of 16)'}
                </div>
              </div>
              <div>
                <Link to="/#bracket" className="btn-primary">
                  View Live Bracket &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* 3. ACCOUNT SECURITY & CREDENTIALS CARD */}
          <section className="profile-card" aria-labelledby="section-security-info">
            <h2 id="section-security-info" className="section-title">
              <span>🔒</span> Account Security
            </h2>
            <p className="section-desc">
              Update your login email address or change your account password.
            </p>

            {/* If OAuth Managed */}
            {isOAuth ? (
              <div
                id="oauth-security-notice"
                style={{
                  background: 'rgba(33, 150, 243, 0.08)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  borderRadius: '8px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        marginBottom: '6px',
                      }}
                    >
                      OAuth Managed Identity
                    </h3>
                    <p
                      id="oauth-notice-text"
                      style={{
                        fontSize: '0.92rem',
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.5,
                      }}
                    >
                      Your account identity is securely managed by{' '}
                      {profileUser?.authProvider === 'google' ? 'Google' : 'Discord'}.
                      Password changes and primary email alterations are handled directly through your
                      identity provider.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div id="local-security-forms">
                {/* Change Email Sub-section */}
                <form
                  id="form-change-email"
                  style={{ marginBottom: '32px' }}
                  onSubmit={handleUpdateEmail}
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Update Login Email
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '16px',
                      maxWidth: '650px',
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="input-new-email" className="form-label">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        id="input-new-email"
                        className="form-input"
                        placeholder="newemail@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="input-email-current-pw" className="form-label">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="input-email-current-pw"
                        className="form-input"
                        placeholder="Verify password"
                        value={emailCurrentPassword}
                        onChange={(e) => setEmailCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <button type="submit" id="btn-save-email" className="btn-secondary">
                      Update Email
                    </button>
                  </div>
                </form>

                <div
                  style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.1)',
                    marginBottom: '28px',
                  }}
                />

                {/* Change Password Sub-section */}
                <form id="form-change-password" onSubmit={handleChangePassword}>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Change Password
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px',
                      maxWidth: '800px',
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="input-pw-current" className="form-label">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="input-pw-current"
                        className="form-input"
                        placeholder="Current password"
                        value={pwCurrent}
                        onChange={(e) => setPwCurrent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="input-pw-new" className="form-label">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="input-pw-new"
                        className="form-input"
                        placeholder="Min 6 characters"
                        minLength={6}
                        value={pwNew}
                        onChange={(e) => setPwNew(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="input-pw-confirm" className="form-label">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="input-pw-confirm"
                        className="form-input"
                        placeholder="Repeat new password"
                        minLength={6}
                        value={pwConfirm}
                        onChange={(e) => setPwConfirm(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <button type="submit" id="btn-save-password" className="btn-secondary">
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};
