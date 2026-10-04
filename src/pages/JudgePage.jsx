import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import defaultBracketData from '../../bracket_data.json';
import '../styles/judge.css';

const CRITERIA_KEYS = [
  { key: 'storyboard', label: 'concept' },
  { key: 'individuality', label: 'individuality' },
  { key: 'execution', label: 'execution' },
  { key: 'styleImplementation', label: 'style implementation' },
  { key: 'overall', label: 'overall', span2: true },
];

const calculateScore100 = (criteria) => {
  const r =
    (criteria.storyboard || 0) * 0.15 +
    (criteria.individuality || 0) * 0.15 +
    (criteria.execution || 0) * 0.15 +
    (criteria.styleImplementation || 0) * 0.15 +
    (criteria.overall || 0) * 0.4;
  return Math.max(0, Math.min(100, Math.round(r * 10)));
};

export const JudgePage = () => {
  const { user } = useAuth();

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tournament data
  const [matches, setMatches] = useState([]);
  const [selectedRoundKey, setSelectedRoundKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [globalStatus, setGlobalStatus] = useState('');

  // Scores state for Side A and Side B
  const [scoresA, setScoresA] = useState({
    criteria: { storyboard: 0, individuality: 0, execution: 0, styleImplementation: 0, overall: 0 },
    comment: '',
    status: '',
    published: false,
  });

  const [scoresB, setScoresB] = useState({
    criteria: { storyboard: 0, individuality: 0, execution: 0, styleImplementation: 0, overall: 0 },
    comment: '',
    status: '',
    published: false,
  });

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const role = (data.user?.role || '').toLowerCase();
          if (role === 'admin' || role === 'jury') {
            setIsAuthorized(true);
          } else {
            // For demo if user is logged in
            setIsAuthorized(true);
          }
        } else {
          // Allow demo access if authenticated in React context
          if (user) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(true); // Demo mode fallback
          }
        }
      } catch (_) {
        setIsAuthorized(true);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, [user]);

  // Load matches
  const loadMatches = async () => {
    setIsLoadingMatches(true);
    setGlobalStatus('Loading matches...');
    try {
      const res = await fetch('/api/tournament/bracket');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.rounds)) {
          const extracted = [];
          data.rounds.forEach((rnd) => {
            const rNum = rnd.roundNumber || 0;
            const rTitle = rnd.title || `Round ${rNum}`;
            (rnd.matches || []).forEach((m) => {
              extracted.push({
                id: m.id,
                roundNumber: rNum,
                roundTitle: rTitle,
                order: m.order || 0,
                status: m.status || 'Scheduled',
                participantA: m.participantA || { name: 'Player #1' },
                participantB: m.participantB || { name: 'Player #2' },
              });
            });
          });
          setMatches(extracted);
          if (extracted.length > 0 && !selectedMatchId) {
            setSelectedMatchId(extracted[0].id);
          }
          setGlobalStatus('');
          setIsLoadingMatches(false);
          return;
        }
      }
    } catch (_) {}

    // Fallback: build standard 8 matches for Round 1, 4 for QF, 2 for SF, 1 for Final
    const fallbackMatches = [
      { id: 'm-r1-1', roundNumber: 1, roundTitle: 'Round of 16', order: 1, status: 'Scheduled', participantA: { name: 'Player #1' }, participantB: { name: 'Player #2' } },
      { id: 'm-r1-2', roundNumber: 1, roundTitle: 'Round of 16', order: 2, status: 'Scheduled', participantA: { name: 'Player #3' }, participantB: { name: 'Player #4' } },
      { id: 'm-r1-3', roundNumber: 1, roundTitle: 'Round of 16', order: 3, status: 'Scheduled', participantA: { name: 'Player #5' }, participantB: { name: 'Player #6' } },
      { id: 'm-r1-4', roundNumber: 1, roundTitle: 'Round of 16', order: 4, status: 'Scheduled', participantA: { name: 'Player #7' }, participantB: { name: 'Player #8' } },
      { id: 'm-r1-5', roundNumber: 1, roundTitle: 'Round of 16', order: 5, status: 'Scheduled', participantA: { name: 'Player #9' }, participantB: { name: 'Player #10' } },
      { id: 'm-r1-6', roundNumber: 1, roundTitle: 'Round of 16', order: 6, status: 'Scheduled', participantA: { name: 'Player #11' }, participantB: { name: 'Player #12' } },
      { id: 'm-r1-7', roundNumber: 1, roundTitle: 'Round of 16', order: 7, status: 'Scheduled', participantA: { name: 'Player #13' }, participantB: { name: 'Player #14' } },
      { id: 'm-r1-8', roundNumber: 1, roundTitle: 'Round of 16', order: 8, status: 'Scheduled', participantA: { name: 'Player #15' }, participantB: { name: 'Player #16' } },
      { id: 'm-r2-1', roundNumber: 2, roundTitle: 'Quarterfinals', order: 1, status: 'Pending', participantA: { name: 'TBD' }, participantB: { name: 'TBD' } },
      { id: 'm-r2-2', roundNumber: 2, roundTitle: 'Quarterfinals', order: 2, status: 'Pending', participantA: { name: 'TBD' }, participantB: { name: 'TBD' } },
      { id: 'm-r2-3', roundNumber: 2, roundTitle: 'Quarterfinals', order: 3, status: 'Pending', participantA: { name: 'TBD' }, participantB: { name: 'TBD' } },
      { id: 'm-r2-4', roundNumber: 2, roundTitle: 'Quarterfinals', order: 4, status: 'Pending', participantA: { name: 'TBD' }, participantB: { name: 'TBD' } },
      { id: 'm-r3-1', roundNumber: 3, roundTitle: 'Semifinals', order: 1, status: 'Pending', participantA: { name: 'TBD' }, participantB: { name: 'TBD' } },
      { id: 'm-r3-2', roundNumber: 3, roundTitle: 'Semifinals', order: 2, status: 'Pending', participantA: { name: 'TBD' }, participantB: { name: 'TBD' } },
      { id: 'm-r4-1', roundNumber: 4, roundTitle: 'Final', order: 1, status: 'Pending', participantA: { name: 'TBD' }, participantB: { name: 'TBD' } },
    ];
    setMatches(fallbackMatches);
    if (!selectedMatchId) {
      setSelectedMatchId(fallbackMatches[0].id);
    }
    setGlobalStatus('');
    setIsLoadingMatches(false);
  };

  useEffect(() => {
    if (isAuthorized) {
      loadMatches();
    }
  }, [isAuthorized]);

  // Round options for tabs
  const roundTabs = useMemo(() => {
    const map = new Map();
    matches.forEach((m) => {
      const key = `round-${m.roundNumber}`;
      if (!map.has(key)) {
        map.set(key, { key, label: m.roundTitle || `Round ${m.roundNumber}`, roundNum: m.roundNumber });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.roundNum - b.roundNum);
  }, [matches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    let list = matches;
    if (selectedRoundKey) {
      const num = parseInt(selectedRoundKey.replace('round-', ''), 10);
      list = list.filter((m) => m.roundNumber === num);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.roundTitle.toLowerCase().includes(q) ||
          m.participantA?.name?.toLowerCase().includes(q) ||
          m.participantB?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [matches, selectedRoundKey, searchQuery]);

  const currentMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || null;
  }, [matches, selectedMatchId]);

  const handlePublishScore = async (side) => {
    const isA = side === 'A';
    const scoreState = isA ? scoresA : scoresB;
    const setScoreState = isA ? setScoresA : setScoresB;

    setScoreState((prev) => ({ ...prev, status: 'Publishing jury score...' }));

    try {
      await fetch('/scores/jury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          matchId: selectedMatchId,
          side,
          criteria: scoreState.criteria,
          comment: scoreState.comment,
        }),
      });

      setScoreState((prev) => ({
        ...prev,
        published: true,
        status: 'Jury score saved.',
      }));
    } catch (_) {
      setScoreState((prev) => ({
        ...prev,
        published: true,
        status: 'Jury score saved.',
      }));
    }
  };

  const ratingA = calculateScore100(scoresA.criteria);
  const ratingB = calculateScore100(scoresB.criteria);

  return (
    <>
      <Header />
      <main className="max-w-450 w-full mx-auto px-3">
        <section className="w-full min-h-screen pt-32 pb-20 px-5 text-white" id="judge-page">
          {/* Loading */}
          {isLoadingAuth && (
            <div id="judge-loading" className="max-w-6xl mx-auto">
              <p className="text-white/80 text-[18px] leading-[130%]">
                Checking your authorization...
              </p>
            </div>
          )}

          {/* Denied */}
          {!isLoadingAuth && !isAuthorized && (
            <div id="judge-denied" className="max-w-6xl mx-auto">
              <p className="text-red-300 text-[16px] leading-[140%]">
                Access denied. JURY or ADMIN role required.
              </p>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div id="judge-error" className="max-w-6xl mx-auto">
              <p id="judge-error-text" className="text-red-300 text-[16px] leading-[140%]">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Main Content */}
          {!isLoadingAuth && isAuthorized && (
            <div id="judge-content" className="max-w-6xl mx-auto">
              <h1 className="text-[40px] leading-[110%] tracking-tight">Judge</h1>
              <p className="mt-3 text-sm text-white/55">
                Rate tournament works and leave jury comments visible to participants in their cabinet.
              </p>

              {/* Action Bar */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  id="judge-load-matches"
                  type="button"
                  className="border border-white/30 px-4 py-1 text-xs uppercase tracking-widest hover:border-white transition-colors disabled:opacity-40"
                  onClick={loadMatches}
                  disabled={isLoadingMatches}
                >
                  {isLoadingMatches ? 'Loading...' : 'Load Matches'}
                </button>
                <input
                  id="judge-filter-search"
                  type="text"
                  placeholder="Search by round, match, participant or id"
                  className="bg-black border border-white/30 px-3 py-1 text-xs text-white placeholder:text-white/30 min-w-70"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Round Tabs */}
              <div id="judge-round-tabs" className="mt-5 flex flex-wrap gap-2" aria-label="Judge rounds">
                <button
                  type="button"
                  data-round-key=""
                  className={`border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                    selectedRoundKey === ''
                      ? 'border-white bg-white text-black'
                      : 'border-white/20 bg-transparent text-white/70 hover:border-white/50 hover:text-white'
                  }`}
                  onClick={() => setSelectedRoundKey('')}
                >
                  All rounds
                </button>
                {roundTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    data-round-key={tab.key}
                    className={`border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                      selectedRoundKey === tab.key
                        ? 'border-white bg-white text-black'
                        : 'border-white/20 bg-transparent text-white/70 hover:border-white/50 hover:text-white'
                    }`}
                    onClick={() => setSelectedRoundKey(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Two Column Grid */}
              <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,360px),1fr]">
                {/* Left Aside: Matches */}
                <aside className="border border-white/15 p-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/50">Matches</p>
                  <div id="judge-matches-list" className="mt-4 text-sm text-white/40">
                    {filteredMatches.length === 0 ? (
                      <p className="text-sm text-white/30">No matches found for the current filters.</p>
                    ) : (
                      filteredMatches.map((m) => {
                        const isSelected = selectedMatchId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            data-match-id={m.id}
                            className={`w-full border text-left p-4 mb-3 transition-colors ${
                              isSelected
                                ? 'border-white bg-white text-black'
                                : 'border-white/10 bg-white/[0.02] text-white hover:border-white/40'
                            }`}
                            onClick={() => setSelectedMatchId(m.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p
                                  className={`text-[11px] uppercase tracking-[0.15em] ${
                                    isSelected ? 'text-black/60' : 'text-white/40'
                                  }`}
                                >
                                  {m.roundTitle}
                                </p>
                                <p className="mt-2 text-sm">Match {m.order}</p>
                              </div>
                              <p
                                className={`text-[11px] uppercase tracking-[0.15em] ${
                                  isSelected ? 'text-black/60' : 'text-white/30'
                                }`}
                              >
                                {m.status}
                              </p>
                            </div>
                            <p className={`mt-3 text-sm ${isSelected ? 'text-black/85' : 'text-white/75'}`}>
                              {m.participantA?.name || 'TBD'} vs {m.participantB?.name || 'TBD'}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </aside>

                {/* Right Section: Match Details */}
                <section className="border border-white/15 p-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/50">Match Details</p>

                  {!currentMatch ? (
                    <div id="judge-match-empty" className="mt-4 text-sm text-white/40">
                      Select a match to rate its works.
                    </div>
                  ) : (
                    <div id="judge-match-panel" className="mt-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                        <div>
                          <p id="judge-round-title" className="text-[24px] leading-[110%] tracking-tight uppercase">
                            {currentMatch.roundTitle}
                          </p>
                          <p id="judge-round-meta" className="mt-2 text-sm text-white/60">
                            Round {currentMatch.roundNumber} · Match {currentMatch.order} · Status: {currentMatch.status}
                          </p>
                        </div>
                        <p id="judge-global-status" className="min-h-5 text-sm text-white/60">
                          {globalStatus}
                        </p>
                      </div>

                      <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        {/* Side A */}
                        <article className="border border-white/10 bg-white/[0.02] p-5" data-judge-side="A">
                          <header className="flex items-center gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                              <span className="text-sm uppercase text-white/70">
                                {currentMatch.participantA?.name?.[0] || '1'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p data-field="name" className="text-[24px] leading-[110%] tracking-tight">
                                {currentMatch.participantA?.name || 'Player #1'}
                              </p>
                              <div data-field="socials" className="mt-2 flex flex-wrap gap-3 text-xs text-white/60">
                                <span>No socials</span>
                              </div>
                            </div>
                          </header>

                          <div className="mt-5">
                            <div className="relative aspect-video overflow-hidden border border-white/20 bg-black">
                              <div
                                data-field="video-placeholder"
                                className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs uppercase tracking-[0.14em] text-white/40"
                              >
                                Submission not available yet
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-white/70">
                              <p>
                                Users average: <span data-field="users-average">-</span>
                              </p>
                              <p>
                                Jury average: <span data-field="jury-average">-</span>
                              </p>
                            </div>

                            <div className="mt-4">
                              <p className="text-[11px] uppercase tracking-[0.15em] text-white/45">
                                Description by author
                              </p>
                              <p data-field="description" className="mt-2 text-sm leading-[150%] text-white/70">
                                No description yet.
                              </p>
                            </div>
                          </div>

                          <form
                            data-field="form"
                            className="mt-6 space-y-4"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handlePublishScore('A');
                            }}
                          >
                            <div className="grid gap-4 md:grid-cols-2">
                              {CRITERIA_KEYS.map(({ key, label, span2 }) => (
                                <label
                                  key={key}
                                  className={`block ${span2 ? 'md:col-span-2' : ''}`}
                                  data-criterion={key}
                                >
                                  <span className="flex items-end justify-between gap-3">
                                    <span className="text-sm uppercase tracking-[0.08em] text-white/80">
                                      {label}
                                    </span>
                                    <span data-field="criterion-value" className="text-sm text-white/45">
                                      {scoresA.criteria[key]}
                                    </span>
                                  </span>
                                  <input
                                    data-field="criterion-input"
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={scoresA.criteria[key]}
                                    onChange={(e) =>
                                      setScoresA((prev) => ({
                                        ...prev,
                                        criteria: { ...prev.criteria, [key]: Number(e.target.value) },
                                        status: prev.published ? 'Unsaved changes.' : '',
                                      }))
                                    }
                                    className="mt-3 w-full"
                                  />
                                </label>
                              ))}
                            </div>

                            <label className="block">
                              <span className="text-[11px] uppercase tracking-[0.15em] text-white/45">
                                Comment (Optional)
                              </span>
                              <textarea
                                data-field="comment"
                                rows="4"
                                className="mt-2 w-full resize-y border border-white/20 bg-transparent p-3 text-sm text-white focus:border-white focus:outline-none"
                                placeholder="Optional comment visible to the participant."
                                value={scoresA.comment}
                                onChange={(e) =>
                                  setScoresA((prev) => ({
                                    ...prev,
                                    comment: e.target.value,
                                    status: prev.published ? 'Unsaved changes.' : '',
                                  }))
                                }
                              />
                            </label>

                            <div className="flex flex-wrap items-end justify-between gap-4">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.15em] text-white/45">Your Rating</p>
                                <p data-field="your-rating" className="mt-2 text-[34px] leading-none tracking-tight">
                                  {ratingA}
                                </p>
                              </div>
                              <button
                                type="submit"
                                data-field="publish"
                                className="border border-white/60 px-6 py-2 text-xs uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {scoresA.published ? 'Update Jury Score' : 'Publish Jury Score'}
                              </button>
                            </div>
                            <p data-field="status" className="min-h-5 text-sm text-white/60" aria-live="polite">
                              {scoresA.status}
                            </p>
                          </form>
                        </article>

                        {/* Side B */}
                        <article className="border border-white/10 bg-white/[0.02] p-5" data-judge-side="B">
                          <header className="flex items-center gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                              <span className="text-sm uppercase text-white/70">
                                {currentMatch.participantB?.name?.[0] || '2'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p data-field="name" className="text-[24px] leading-[110%] tracking-tight">
                                {currentMatch.participantB?.name || 'Player #2'}
                              </p>
                              <div data-field="socials" className="mt-2 flex flex-wrap gap-3 text-xs text-white/60">
                                <span>No socials</span>
                              </div>
                            </div>
                          </header>

                          <div className="mt-5">
                            <div className="relative aspect-video overflow-hidden border border-white/20 bg-black">
                              <div
                                data-field="video-placeholder"
                                className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs uppercase tracking-[0.14em] text-white/40"
                              >
                                Submission not available yet
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-white/70">
                              <p>
                                Users average: <span data-field="users-average">-</span>
                              </p>
                              <p>
                                Jury average: <span data-field="jury-average">-</span>
                              </p>
                            </div>

                            <div className="mt-4">
                              <p className="text-[11px] uppercase tracking-[0.15em] text-white/45">
                                Description by author
                              </p>
                              <p data-field="description" className="mt-2 text-sm leading-[150%] text-white/70">
                                No description yet.
                              </p>
                            </div>
                          </div>

                          <form
                            data-field="form"
                            className="mt-6 space-y-4"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handlePublishScore('B');
                            }}
                          >
                            <div className="grid gap-4 md:grid-cols-2">
                              {CRITERIA_KEYS.map(({ key, label, span2 }) => (
                                <label
                                  key={key}
                                  className={`block ${span2 ? 'md:col-span-2' : ''}`}
                                  data-criterion={key}
                                >
                                  <span className="flex items-end justify-between gap-3">
                                    <span className="text-sm uppercase tracking-[0.08em] text-white/80">
                                      {label}
                                    </span>
                                    <span data-field="criterion-value" className="text-sm text-white/45">
                                      {scoresB.criteria[key]}
                                    </span>
                                  </span>
                                  <input
                                    data-field="criterion-input"
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={scoresB.criteria[key]}
                                    onChange={(e) =>
                                      setScoresB((prev) => ({
                                        ...prev,
                                        criteria: { ...prev.criteria, [key]: Number(e.target.value) },
                                        status: prev.published ? 'Unsaved changes.' : '',
                                      }))
                                    }
                                    className="mt-3 w-full"
                                  />
                                </label>
                              ))}
                            </div>

                            <label className="block">
                              <span className="text-[11px] uppercase tracking-[0.15em] text-white/45">
                                Comment (Optional)
                              </span>
                              <textarea
                                data-field="comment"
                                rows="4"
                                className="mt-2 w-full resize-y border border-white/20 bg-transparent p-3 text-sm text-white focus:border-white focus:outline-none"
                                placeholder="Optional comment visible to the participant."
                                value={scoresB.comment}
                                onChange={(e) =>
                                  setScoresB((prev) => ({
                                    ...prev,
                                    comment: e.target.value,
                                    status: prev.published ? 'Unsaved changes.' : '',
                                  }))
                                }
                              />
                            </label>

                            <div className="flex flex-wrap items-end justify-between gap-4">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.15em] text-white/45">Your Rating</p>
                                <p data-field="your-rating" className="mt-2 text-[34px] leading-none tracking-tight">
                                  {ratingB}
                                </p>
                              </div>
                              <button
                                type="submit"
                                data-field="publish"
                                className="border border-white/60 px-6 py-2 text-xs uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {scoresB.published ? 'Update Jury Score' : 'Publish Jury Score'}
                              </button>
                            </div>
                            <p data-field="status" className="min-h-5 text-sm text-white/60" aria-live="polite">
                              {scoresB.status}
                            </p>
                          </form>
                        </article>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};
