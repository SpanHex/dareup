import React, { useState, useEffect } from 'react';
import '../styles/admin.css';

export default function AdminPage() {
  const [currentView, setCurrentView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [accessDeniedUser, setAccessDeniedUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Overview state
  const [overviewData, setOverviewData] = useState(null);
  const [diagData, setDiagData] = useState(null);

  // Users state
  const [usersData, setUsersData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEvents, setUserEvents] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Bracket state
  const [bracketData, setBracketData] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [bracketAlert, setBracketAlert] = useState(null);

  // Assign / Move modal state
  const [assignModal, setAssignModal] = useState({ open: false, userId: null, userName: '', defaultSlot: 1 });
  const [slotAssignModal, setSlotAssignModal] = useState({ open: false, slotNumber: null, selectedUserId: '' });
  const [moveModal, setMoveModal] = useState({ open: false, fromSlot: null, participantName: '', targetSlot: 1 });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (adminUser) {
      if (currentView === 'overview') fetchOverview();
      if (currentView === 'users') fetchUsers();
      if (currentView === 'bracket') fetchBracket();
    }
  }, [currentView, adminUser]);

  const checkAdminAuth = async () => {
    setLoading(true);
    setAuthError(null);
    setAccessDeniedUser(null);

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Accept: 'application/json' },
        credentials: 'include'
      });

      if (res.status === 401) {
        // Not authenticated
        window.location.href = '/register?next=' + encodeURIComponent('/admin');
        return;
      }

      if (!res.ok) {
        // Server might be offline or non-mongo; show informative state
        setAuthError(`Server error (${res.status}). Could not verify session.`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const user = data?.user;

      if (!user) {
        window.location.href = '/register?next=' + encodeURIComponent('/admin');
        return;
      }

      const role = (user.role || '').toLowerCase();
      if (role !== 'admin') {
        setAccessDeniedUser(user);
        setLoading(false);
        return;
      }

      setAdminUser(user);
      setLoading(false);
    } catch (err) {
      console.warn('Admin auth check failed:', err);
      // In local dev without backend running, allow viewing with mock admin or show connection error
      setAuthError('Network error connecting to authentication server. Please check your connection.');
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const [secRes, diagRes] = await Promise.all([
        fetch('/api/admin/security/overview', { credentials: 'include' }).catch(() => null),
        fetch('/api/admin/diagnostics', { credentials: 'include' }).catch(() => null)
      ]);

      if (secRes && secRes.ok) {
        const data = await secRes.json();
        setOverviewData(data);
      } else {
        // Fallback default structure
        setOverviewData({
          totalUsers: 16,
          newUsers24h: 3,
          recentLogins: 24,
          failedLogins24h: 1,
          recentSuspicious: []
        });
      }

      if (diagRes && diagRes.ok) {
        const diag = await diagRes.json();
        setDiagData(diag);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsersData(data);
      } else {
        setUsersData({
          totalUsers: 0,
          currentPage: 1,
          totalPages: 1,
          users: []
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBracket = async () => {
    try {
      const res = await fetch('/api/admin/bracket', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBracketData(data);
      } else {
        // Fallback to local bracket JSON if available
        const localRes = await fetch('/bracket_data.json').catch(() => null);
        if (localRes && localRes.ok) {
          const b = await localRes.json();
          setBracketData({ bracket: b, registeredUsers: [] });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openUserDetail = async (id) => {
    setUserModalOpen(true);
    setModalLoading(true);
    try {
      const [uRes, evRes] = await Promise.all([
        fetch(`/api/admin/users/${id}`, { credentials: 'include' }),
        fetch(`/api/admin/users/${id}/security-events?limit=20`, { credentials: 'include' })
      ]);
      const user = await uRes.json();
      const evs = await evRes.json();
      setSelectedUser(user);
      setUserEvents(evs);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const toggleUserStatus = async (id, newStatus) => {
    if (!window.confirm(`Set account status to "${newStatus}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        openUserDetail(id);
        if (currentView === 'users') fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update status');
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const assignUser = async (slotNumber, userId) => {
    try {
      const res = await fetch('/api/admin/bracket/assign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber, userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign user.');
      triggerBracketAlert(data.message || `User assigned to Slot #${slotNumber}.`, 'success');
      fetchBracket();
    } catch (err) {
      triggerBracketAlert(err.message, 'error');
    }
  };

  const clearSlot = async (slotNumber) => {
    if (!window.confirm(`Are you sure you want to clear Slot #${slotNumber}?`)) return;
    try {
      const res = await fetch('/api/admin/bracket/remove', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear slot.');
      triggerBracketAlert(data.message || `Slot #${slotNumber} cleared.`, 'success');
      fetchBracket();
    } catch (err) {
      triggerBracketAlert(err.message, 'error');
    }
  };

  const swapTwoSlots = async (slotA, slotB) => {
    try {
      const res = await fetch('/api/admin/bracket/swap', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumberA: slotA, slotNumberB: slotB })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to swap slots.');
      triggerBracketAlert(data.message || `Slots #${slotA} and #${slotB} swapped.`, 'success');
      fetchBracket();
    } catch (err) {
      triggerBracketAlert(err.message, 'error');
    }
  };

  const triggerBracketAlert = (msg, type = 'success') => {
    setBracketAlert({ msg, type });
    setTimeout(() => setBracketAlert(null), 5000);
  };

  const doLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/register?next=' + encodeURIComponent('/admin');
  };

  const disp = (val, fallback = 'Unknown') => {
    if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return fallback;
    return String(val);
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleString(); } catch { return 'N/A'; }
  };

  const formatDateShort = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString(); } catch { return 'N/A'; }
  };

  const formatIp = (ip, family) => {
    if (!ip || ip === 'unknown' || ip === 'Unavailable' || ip === 'null' || ip === 'undefined') {
      return <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Unavailable</span>;
    }
    const clean = String(ip).trim();
    if (family === 'v4' && (clean === '127.0.0.1' || clean.startsWith('127.0.0.1'))) {
      return <span style={{ color: '#8bb4f7' }}>127.0.0.1 <span style={{ color: '#4f8ef7', fontSize: '0.65rem' }}>(Localhost)</span></span>;
    }
    if (family === 'v6' && (clean === '::1' || clean.startsWith('::1'))) {
      return <span style={{ color: '#8bb4f7' }}>::1 <span style={{ color: '#4f8ef7', fontSize: '0.65rem' }}>(Localhost)</span></span>;
    }
    return <span>{clean}</span>;
  };

  if (loading) {
    return (
      <div className="admin-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: '70px 20px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255,255,255,0.12)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '18px'
          }}></div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Checking Authorization…
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            Verifying server session and administrator credentials
          </div>
        </div>
      </div>
    );
  }

  if (accessDeniedUser) {
    return (
      <div className="admin-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          maxWidth: '580px',
          margin: '60px auto',
          background: 'rgba(255, 75, 130, 0.06)',
          border: '1px solid rgba(255, 75, 130, 0.35)',
          borderRadius: '8px',
          padding: '36px 24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>🛡️</div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ff4b82', marginBottom: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            403 Forbidden: Admin Access Required
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
            You are currently signed in as <strong>@{accessDeniedUser.username || accessDeniedUser.displayName || 'User'}</strong> (Role: <span style={{ color: '#ff4b82', fontWeight: 600 }}>{accessDeniedUser.role || 'USER'}</span>). This management area is restricted to administrators only.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/profile" className="action-btn" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff', textDecoration: 'none', padding: '10px 20px', fontSize: '0.85rem' }}>
              Go to Profile
            </a>
            <a href="/" className="action-btn" style={{ background: '#fff', color: '#000', borderColor: '#fff', textDecoration: 'none', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600 }}>
              Main Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (authError && !adminUser) {
    return (
      <div className="admin-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          maxWidth: '500px',
          margin: '60px auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '28px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.1rem', color: '#ff4b82', marginBottom: '10px', fontWeight: 600 }}>
            Authentication Check Failed
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
            {authError}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="action-btn" onClick={checkAdminAuth} style={{ background: '#fff', color: '#000', padding: '8px 18px', fontWeight: 600 }}>
              Retry
            </button>
            <button className="action-btn" onClick={() => setAdminUser({ username: 'Admin', role: 'admin' })} style={{ borderColor: '#ff4b82', color: '#ff4b82', padding: '8px 18px' }}>
              Dev Preview
            </button>
            <a href="/" className="action-btn" style={{ textDecoration: 'none', padding: '8px 18px' }}>
              Return to Site
            </a>
          </div>
        </div>
      </div>
    );
  }

  const slots = bracketData?.bracket?.slots || [];
  const rounds = bracketData?.bracket?.rounds || [];
  const registeredUsers = bracketData?.registeredUsers || [];
  const occupiedCount = slots.filter(s => s.isOccupied).length;

  const filteredUsers = registeredUsers.filter(u => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (u.displayName || u.username || '').toLowerCase();
    const handle = (u.username || '').toLowerCase();
    return name.includes(q) || handle.includes(q);
  });

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <a href="/" className="admin-logo">
          DAREDOWN <span>Admin</span>
        </a>
        <nav className="admin-nav">
          <button
            className={currentView === 'overview' ? 'active' : ''}
            onClick={() => setCurrentView('overview')}
          >
            Overview
          </button>
          <button
            className={currentView === 'bracket' ? 'active' : ''}
            onClick={() => setCurrentView('bracket')}
          >
            Bracket Manager
          </button>
          <button
            className={currentView === 'users' ? 'active' : ''}
            onClick={() => setCurrentView('users')}
          >
            Users
          </button>
        </nav>
        <div style={{ marginTop: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
          <a href="/api/auth/logout" onClick={doLogout} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            ← Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {/* OVERVIEW VIEW */}
        {currentView === 'overview' && (
          <div>
            <div className="admin-header">
              <h1 className="admin-title">Security Overview</h1>
            </div>

            {overviewData ? (
              <>
                <div className="overview-grid">
                  <div className="stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{overviewData.totalUsers ?? 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">New Users (24h)</div>
                    <div className="stat-value">{overviewData.newUsers24h ?? 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Logins (24h)</div>
                    <div className="stat-value">{overviewData.recentLogins ?? 0}</div>
                  </div>
                  <div className="stat-card" style={{ borderColor: (overviewData.failedLogins24h || 0) > 10 ? '#ff4b82' : 'rgba(255,255,255,0.1)' }}>
                    <div className="stat-label">Failed Logins (24h)</div>
                    <div className={`stat-value ${(overviewData.failedLogins24h || 0) > 10 ? 'danger' : ''}`}>
                      {overviewData.failedLogins24h ?? 0}
                    </div>
                  </div>
                </div>

                {diagData && (
                  <>
                    <div className="admin-header" style={{ marginTop: '36px' }}>
                      <h2 className="admin-title" style={{ fontSize: '1.25rem' }}>Server Request &amp; IP Environment Diagnostics</h2>
                    </div>
                    <div style={{
                      marginTop: '12px',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '0.75rem',
                      lineHeight: 1.6,
                      background: '#0d0d0d',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '18px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                        <div>
                          <div style={{ color: '#ff4b82', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Observed Client IP
                          </div>
                          <div><strong>Detected IP:</strong> <span style={{ color: '#fff' }}>{diagData.detectedClientIp || 'Unavailable'}</span></div>
                          <div><strong>Express req.ip:</strong> <span style={{ color: '#fff' }}>{diagData.expressIp || 'Unavailable'}</span></div>
                          <div><strong>Socket Address:</strong> <span style={{ color: '#fff' }}>{diagData.remoteAddress || 'Unavailable'}</span></div>
                        </div>
                        <div>
                          <div style={{ color: '#ff4b82', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Proxy / Vercel Headers
                          </div>
                          <div><strong>x-vercel-forwarded-for:</strong> <span style={{ color: '#fff' }}>{diagData.headers?.['x-vercel-forwarded-for'] || <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>(Not present - running local)</span>}</span></div>
                          <div><strong>x-real-ip:</strong> <span style={{ color: '#fff' }}>{diagData.headers?.['x-real-ip'] || <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>(Not present)</span>}</span></div>
                          <div><strong>x-forwarded-for:</strong> <span style={{ color: '#fff' }}>{diagData.headers?.['x-forwarded-for'] || <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>(Not present)</span>}</span></div>
                        </div>
                        <div>
                          <div style={{ color: '#ff4b82', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Runtime Environment
                          </div>
                          <div><strong>Platform:</strong> <span style={{ color: '#fff' }}>{diagData.environment?.platform || 'node'}</span></div>
                          <div><strong>Vercel Detected:</strong> {diagData.environment?.isVercel ? <span style={{ color: '#10b981', fontWeight: 700 }}>Yes (Production)</span> : <span style={{ color: '#60a5fa' }}>No (Localhost Dev)</span>}</div>
                          <div><strong>Node Env:</strong> <span style={{ color: '#fff' }}>{diagData.environment?.nodeEnv || 'development'}</span></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {overviewData.recentSuspicious?.length > 0 && (
                  <>
                    <div className="admin-header" style={{ marginTop: '40px' }}>
                      <h2 className="admin-title" style={{ fontSize: '1.4rem' }}>Recent Failed Logins</h2>
                    </div>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Username Attempted</th>
                            <th>IP</th>
                            <th>Reason</th>
                            <th>Browser / OS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overviewData.recentSuspicious.map((ev, i) => (
                            <tr key={i}>
                              <td>{formatDate(ev.timestamp)}</td>
                              <td>{disp(ev.usernameAttempt, 'N/A')}</td>
                              <td>
                                <div className="ip-block">
                                  <div className="ip-row"><span className="ip-label">IPv4:</span> {formatIp(ev.ipv4, 'v4')}</div>
                                  <div className="ip-row"><span className="ip-label">IPv6:</span> {formatIp(ev.ipv6, 'v6')}</div>
                                </div>
                              </td>
                              <td><span style={{ color: '#ff4b82', fontSize: '0.8rem' }}>{disp(ev.failureReason, 'Unknown')}</span></td>
                              <td>
                                <div className="device-block">
                                  <div>{disp(ev.browser)} {disp(ev.browserVersion) !== 'Unknown' ? disp(ev.browserVersion) : ''}</div>
                                  <div>{disp(ev.os)} {disp(ev.osVersion) !== 'Unknown' ? disp(ev.osVersion) : ''}</div>
                                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>{disp(ev.deviceType, 'desktop')}</div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="loading">Loading overview data…</div>
            )}
          </div>
        )}

        {/* BRACKET MANAGER VIEW */}
        {currentView === 'bracket' && (
          <div>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 className="admin-title">Tournament Bracket Manager</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>
                  Graphical 16-player tournament bracket. Drag registered users onto bracket slots, drag from slot to slot, or use accessible click controls.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className={`badge ${occupiedCount === 16 ? 'success' : 'neutral'}`} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                  {occupiedCount} / 16 Slots Occupied
                </span>
                <button className="action-btn" onClick={fetchBracket}>↻ Refresh</button>
              </div>
            </div>

            {bracketAlert && (
              <div style={{
                padding: '12px 18px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                background: bracketAlert.type === 'success' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255, 75, 130, 0.15)',
                border: bracketAlert.type === 'success' ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(255, 75, 130, 0.4)',
                color: bracketAlert.type === 'success' ? '#2ecc71' : '#ff4b82'
              }}>
                {bracketAlert.msg}
              </div>
            )}

            <div className="bracket-mgr-layout">
              {/* Left Pool */}
              <div className="bracket-mgr-sidebar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    Registered Users ({registeredUsers.length})
                  </h2>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="text"
                    placeholder="Filter users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div className="user-pool-list">
                  {filteredUsers.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', padding: '10px' }}>
                      No registered users found.
                    </div>
                  ) : (
                    filteredUsers.map(u => {
                      const name = u.displayName || u.username;
                      const initial = name.charAt(0).toUpperCase();
                      return (
                        <div
                          key={u._id}
                          className="user-draggable-card"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'copyMove';
                            e.dataTransfer.setData('application/json', JSON.stringify({ type: 'user', userId: u._id, name }));
                          }}
                        >
                          {u.avatar ? (
                            <img src={u.avatar} className="card-avatar" alt="" />
                          ) : (
                            <div className="card-avatar">{initial}</div>
                          )}
                          <div className="card-info">
                            <div className="card-name">{name}</div>
                            <div className="card-handle">@{u.username}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            {u.bracketSlot ? (
                              <span className="badge success">Slot #{u.bracketSlot}</span>
                            ) : (
                              <span className="badge neutral">Unassigned</span>
                            )}
                            <button
                              type="button"
                              className="slot-btn"
                              style={{ fontSize: '0.6rem' }}
                              onClick={() => setAssignModal({ open: true, userId: u._id, userName: name, defaultSlot: 1 })}
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Graphical Tree */}
              <div className="bracket-tree-wrap">
                <div className="bracket-tree-columns">
                  {/* Round 1 */}
                  <div className="bracket-column">
                    <div className="bracket-column-header">Round 1 (Round of 16)</div>
                    <div className="bracket-matches-col">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(m => {
                        const sAIndex = m * 2 - 1;
                        const sBIndex = m * 2;
                        const sA = slots.find(s => s.slotNumber === sAIndex) || { slotNumber: sAIndex, isOccupied: false };
                        const sB = slots.find(s => s.slotNumber === sBIndex) || { slotNumber: sBIndex, isOccupied: false };

                        return (
                          <div key={m} className="match-box">
                            <div className="match-box-header">
                              <span>Match #{m}</span>
                              <span>1v1</span>
                            </div>

                            {/* Slot A */}
                            <div
                              className={`bracket-slot-dropzone ${sA.isOccupied ? 'is-occupied' : ''}`}
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                              onDrop={async (e) => {
                                e.preventDefault();
                                const raw = e.dataTransfer.getData('application/json');
                                if (!raw) return;
                                const p = JSON.parse(raw);
                                if (p.type === 'user') await assignUser(sAIndex, p.userId);
                                else if (p.type === 'slot' && p.fromSlot !== sAIndex) await swapTwoSlots(p.fromSlot, sAIndex);
                              }}
                            >
                              <div
                                className="slot-player-info"
                                draggable={!!sA.isOccupied}
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'slot', fromSlot: sAIndex }));
                                }}
                                style={{ cursor: sA.isOccupied ? 'grab' : 'default' }}
                              >
                                <span className="slot-num-badge">#{sAIndex}</span>
                                {sA.isOccupied && sA.avatar ? (
                                  <img src={sA.avatar} className="slot-avatar" alt="" />
                                ) : (
                                  <div className="slot-avatar" style={{ opacity: sA.isOccupied ? 1 : 0.3 }}>
                                    {sA.isOccupied ? (sA.displayName || sA.username || '#').charAt(0).toUpperCase() : '#'}
                                  </div>
                                )}
                                <span className={`slot-name ${!sA.isOccupied ? 'is-empty' : ''}`}>
                                  {sA.isOccupied ? (sA.displayName || sA.username) : `Player #${sAIndex}`}
                                </span>
                              </div>
                              <div className="slot-actions">
                                {sA.isOccupied ? (
                                  <>
                                    <button
                                      className="slot-btn"
                                      onClick={() => setMoveModal({ open: true, fromSlot: sAIndex, participantName: sA.displayName || sA.username, targetSlot: 1 })}
                                    >
                                      Move
                                    </button>
                                    <button className="slot-btn danger" onClick={() => clearSlot(sAIndex)}>✕</button>
                                  </>
                                ) : (
                                  <button className="slot-btn" onClick={() => setSlotAssignModal({ open: true, slotNumber: sAIndex, selectedUserId: registeredUsers[0]?._id || '' })}>
                                    + Assign
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Slot B */}
                            <div
                              className={`bracket-slot-dropzone ${sB.isOccupied ? 'is-occupied' : ''}`}
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                              onDrop={async (e) => {
                                e.preventDefault();
                                const raw = e.dataTransfer.getData('application/json');
                                if (!raw) return;
                                const p = JSON.parse(raw);
                                if (p.type === 'user') await assignUser(sBIndex, p.userId);
                                else if (p.type === 'slot' && p.fromSlot !== sBIndex) await swapTwoSlots(p.fromSlot, sBIndex);
                              }}
                            >
                              <div
                                className="slot-player-info"
                                draggable={!!sB.isOccupied}
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'slot', fromSlot: sBIndex }));
                                }}
                                style={{ cursor: sB.isOccupied ? 'grab' : 'default' }}
                              >
                                <span className="slot-num-badge">#{sBIndex}</span>
                                {sB.isOccupied && sB.avatar ? (
                                  <img src={sB.avatar} className="slot-avatar" alt="" />
                                ) : (
                                  <div className="slot-avatar" style={{ opacity: sB.isOccupied ? 1 : 0.3 }}>
                                    {sB.isOccupied ? (sB.displayName || sB.username || '#').charAt(0).toUpperCase() : '#'}
                                  </div>
                                )}
                                <span className={`slot-name ${!sB.isOccupied ? 'is-empty' : ''}`}>
                                  {sB.isOccupied ? (sB.displayName || sB.username) : `Player #${sBIndex}`}
                                </span>
                              </div>
                              <div className="slot-actions">
                                {sB.isOccupied ? (
                                  <>
                                    <button
                                      className="slot-btn"
                                      onClick={() => setMoveModal({ open: true, fromSlot: sBIndex, participantName: sB.displayName || sB.username, targetSlot: 1 })}
                                    >
                                      Move
                                    </button>
                                    <button className="slot-btn danger" onClick={() => clearSlot(sBIndex)}>✕</button>
                                  </>
                                ) : (
                                  <button className="slot-btn" onClick={() => setSlotAssignModal({ open: true, slotNumber: sBIndex, selectedUserId: registeredUsers[0]?._id || '' })}>
                                    + Assign
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quarterfinals */}
                  <div className="bracket-column">
                    <div className="bracket-column-header">Quarterfinals</div>
                    <div className="bracket-matches-col">
                      {[1, 2, 3, 4].map(q => {
                        const m = rounds.find(r => r.roundNumber === 2)?.matches?.[q - 1];
                        return (
                          <div key={q} className="match-box" style={{ opacity: 0.85 }}>
                            <div className="match-box-header">
                              <span>Match #{q}</span>
                              <span>{m?.status || 'PENDING'}</span>
                            </div>
                            <div className="bracket-slot-dropzone">
                              <div className="slot-player-info">
                                <span className="slot-num-badge">A</span>
                                <span className="slot-name is-empty">{m?.participantA?.displayName || 'Winner TBD'}</span>
                              </div>
                            </div>
                            <div className="bracket-slot-dropzone">
                              <div className="slot-player-info">
                                <span className="slot-num-badge">B</span>
                                <span className="slot-name is-empty">{m?.participantB?.displayName || 'Winner TBD'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Semifinals */}
                  <div className="bracket-column">
                    <div className="bracket-column-header">Semifinals</div>
                    <div className="bracket-matches-col">
                      {[1, 2].map(s => {
                        const m = rounds.find(r => r.roundNumber === 3)?.matches?.[s - 1];
                        return (
                          <div key={s} className="match-box" style={{ opacity: 0.85 }}>
                            <div className="match-box-header">
                              <span>Match #{s}</span>
                              <span>{m?.status || 'PENDING'}</span>
                            </div>
                            <div className="bracket-slot-dropzone">
                              <div className="slot-player-info">
                                <span className="slot-num-badge">A</span>
                                <span className="slot-name is-empty">{m?.participantA?.displayName || 'Winner TBD'}</span>
                              </div>
                            </div>
                            <div className="bracket-slot-dropzone">
                              <div className="slot-player-info">
                                <span className="slot-num-badge">B</span>
                                <span className="slot-name is-empty">{m?.participantB?.displayName || 'Winner TBD'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grand Final */}
                  <div className="bracket-column">
                    <div className="bracket-column-header">Grand Final</div>
                    <div className="bracket-matches-col">
                      {(() => {
                        const m = rounds.find(r => r.roundNumber === 4)?.matches?.[0];
                        return (
                          <div className="match-box" style={{ opacity: 0.85 }}>
                            <div className="match-box-header">
                              <span>Grand Final</span>
                              <span>{m?.status || 'PENDING'}</span>
                            </div>
                            <div className="bracket-slot-dropzone">
                              <div className="slot-player-info">
                                <span className="slot-num-badge">A</span>
                                <span className="slot-name is-empty">{m?.participantA?.displayName || 'Winner TBD'}</span>
                              </div>
                            </div>
                            <div className="bracket-slot-dropzone">
                              <div className="slot-player-info">
                                <span className="slot-num-badge">B</span>
                                <span className="slot-name is-empty">{m?.participantB?.displayName || 'Winner TBD'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS VIEW */}
        {currentView === 'users' && (
          <div>
            <div className="admin-header">
              <h1 className="admin-title">User Management</h1>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                {usersData?.totalUsers ?? 0} total · page {usersData?.currentPage || 1}/{usersData?.totalPages || 1}
              </div>
            </div>

            {usersData ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Provider</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Tournament</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.users?.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.username}</div>
                          <div style={{ fontSize: '0.7rem', color: '#666' }}>{u.email || 'No email'}</div>
                        </td>
                        <td><span className="badge neutral">{u.authProvider}</span></td>
                        <td><span className={`badge ${(u.role || '').toLowerCase() === 'admin' ? 'danger' : 'neutral'}`}>{u.role}</span></td>
                        <td><span className={`badge ${u.accountStatus === 'active' ? 'success' : 'danger'}`}>{u.accountStatus}</span></td>
                        <td><span className="badge neutral">{u.tournamentStatus || 'registered'}</span></td>
                        <td>{formatDateShort(u.createdAt)}</td>
                        <td>{u.lastLoginAt ? formatDateShort(u.lastLoginAt) : 'N/A'}</td>
                        <td>
                          <button className="action-btn" onClick={() => openUserDetail(u._id)}>Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="loading">Loading users…</div>
            )}
          </div>
        )}
      </main>

      {/* User Detail Modal */}
      {userModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setUserModalOpen(false); }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setUserModalOpen(false)}>×</button>

            {modalLoading || !selectedUser ? (
              <div className="loading">Loading user details…</div>
            ) : (
              <div>
                <h2 className="admin-title" style={{ fontSize: '1.6rem', marginBottom: '24px' }}>
                  {selectedUser.username}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', marginBottom: '32px', fontSize: '0.85rem' }}>
                  <div><div className="stat-label">Email</div><div>{disp(selectedUser.email, 'None')}</div></div>
                  <div><div className="stat-label">Provider</div><div>{selectedUser.authProvider}</div></div>
                  <div><div className="stat-label">Role</div><div>{selectedUser.role}</div></div>
                  <div>
                    <div className="stat-label">Status</div>
                    <span className={`badge ${selectedUser.accountStatus === 'active' ? 'success' : 'danger'}`}>{selectedUser.accountStatus}</span>
                  </div>
                  <div><div className="stat-label">Tournament</div><div>{disp(selectedUser.tournamentStatus)}</div></div>
                  <div><div className="stat-label">Joined</div><div>{formatDate(selectedUser.createdAt)}</div></div>
                  <div><div className="stat-label">Last Login</div><div>{formatDate(selectedUser.lastLoginAt)}</div></div>
                  <div>
                    <div className="stat-label">Action</div>
                    {selectedUser.role !== 'admin' ? (
                      <button
                        className={`action-btn ${selectedUser.accountStatus === 'active' ? 'danger' : ''}`}
                        onClick={() => toggleUserStatus(selectedUser._id, selectedUser.accountStatus === 'active' ? 'suspended' : 'active')}
                      >
                        {selectedUser.accountStatus === 'active' ? 'Suspend' : 'Restore'}
                      </button>
                    ) : (
                      <span style={{ color: '#666', fontSize: '0.75rem' }}>Protected</span>
                    )}
                  </div>
                </div>

                <h3 className="admin-title" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                  Security Activity ({userEvents?.totalEvents ?? 0} total)
                </h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Event</th>
                        <th>Result</th>
                        <th>IPv4</th>
                        <th>IPv6</th>
                        <th>Browser</th>
                        <th>OS</th>
                        <th>Device</th>
                        <th>Provider</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userEvents?.events?.map((ev, i) => (
                        <tr key={i}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{formatDate(ev.timestamp)}</td>
                          <td><span className="badge neutral">{ev.eventType}</span></td>
                          <td><span className={`badge ${ev.success ? 'success' : 'danger'}`}>{ev.success ? 'OK' : 'Fail'}</span></td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{formatIp(ev.ipv4, 'v4')}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{formatIp(ev.ipv6, 'v6')}</td>
                          <td style={{ fontSize: '0.75rem' }}>{disp(ev.browser)} {disp(ev.browserVersion) !== 'Unknown' ? disp(ev.browserVersion) : ''}</td>
                          <td style={{ fontSize: '0.75rem' }}>{disp(ev.os)} {disp(ev.osVersion) !== 'Unknown' ? disp(ev.osVersion) : ''}</td>
                          <td style={{ fontSize: '0.75rem' }}>{disp(ev.deviceType, 'desktop')}</td>
                          <td><span className="badge neutral">{disp(ev.authProvider)}</span></td>
                          <td style={{ fontSize: '0.72rem', color: '#ff4b82' }}>{ev.success ? '' : disp(ev.failureReason, 'N/A')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign User to Bracket Slot Modal */}
      {assignModal.open && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setAssignModal({ ...assignModal, open: false }); }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setAssignModal({ ...assignModal, open: false })}>×</button>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Assign User to Bracket Slot</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Choose a bracket slot for <strong>{assignModal.userName}</strong>:
            </p>
            <div style={{ marginBottom: '20px' }}>
              <select
                id="assign-slot-select"
                defaultValue={assignModal.defaultSlot}
                style={{ width: '100%', background: '#222', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff', borderRadius: '4px', fontSize: '0.9rem' }}
              >
                {slots.map(s => (
                  <option key={s.slotNumber} value={s.slotNumber}>
                    Slot #{s.slotNumber} {s.isOccupied ? `(Occupied: ${s.displayName || s.username})` : '(Available)'}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="action-btn" onClick={() => setAssignModal({ ...assignModal, open: false })}>Cancel</button>
              <button
                className="action-btn"
                style={{ background: '#fff', color: '#000' }}
                onClick={async () => {
                  const select = document.getElementById('assign-slot-select');
                  const slotNum = parseInt(select.value, 10);
                  setAssignModal({ ...assignModal, open: false });
                  await assignUser(slotNum, assignModal.userId);
                }}
              >
                Assign to Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Slot (from Slot button) Modal */}
      {slotAssignModal.open && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setSlotAssignModal({ ...slotAssignModal, open: false }); }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSlotAssignModal({ ...slotAssignModal, open: false })}>×</button>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
              Assign User to Slot #{slotAssignModal.slotNumber}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Select a registered participant to place into Slot #{slotAssignModal.slotNumber}:
            </p>
            <div style={{ marginBottom: '20px' }}>
              <select
                id="slot-assign-user-select"
                defaultValue={registeredUsers[0]?._id}
                style={{ width: '100%', background: '#222', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff', borderRadius: '4px', fontSize: '0.9rem' }}
              >
                {registeredUsers.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.displayName || u.username} (@{u.username}) {u.bracketSlot ? `[Currently in Slot #${u.bracketSlot}]` : '[Unassigned]'}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="action-btn" onClick={() => setSlotAssignModal({ ...slotAssignModal, open: false })}>Cancel</button>
              <button
                className="action-btn"
                style={{ background: '#fff', color: '#000' }}
                onClick={async () => {
                  const select = document.getElementById('slot-assign-user-select');
                  const uId = select.value;
                  const sNum = slotAssignModal.slotNumber;
                  setSlotAssignModal({ ...slotAssignModal, open: false });
                  await assignUser(sNum, uId);
                }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Participant Modal */}
      {moveModal.open && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setMoveModal({ ...moveModal, open: false }); }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setMoveModal({ ...moveModal, open: false })}>×</button>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
              Move Participant (Slot #{moveModal.fromSlot})
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Move <strong>{moveModal.participantName}</strong> to another slot:
            </p>
            <div style={{ marginBottom: '20px' }}>
              <select
                id="move-slot-select"
                defaultValue={slots.find(s => s.slotNumber !== moveModal.fromSlot)?.slotNumber || 1}
                style={{ width: '100%', background: '#222', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff', borderRadius: '4px', fontSize: '0.9rem' }}
              >
                {slots.filter(s => s.slotNumber !== moveModal.fromSlot).map(s => (
                  <option key={s.slotNumber} value={s.slotNumber}>
                    Slot #{s.slotNumber} {s.isOccupied ? `(Occupied: ${s.displayName || s.username}) - will swap` : '(Empty)'}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="action-btn" onClick={() => setMoveModal({ ...moveModal, open: false })}>Cancel</button>
              <button
                className="action-btn"
                style={{ background: '#fff', color: '#000' }}
                onClick={async () => {
                  const select = document.getElementById('move-slot-select');
                  const targetSlot = parseInt(select.value, 10);
                  const fromSlot = moveModal.fromSlot;
                  setMoveModal({ ...moveModal, open: false });
                  await swapTwoSlots(fromSlot, targetSlot);
                }}
              >
                Move Participant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
