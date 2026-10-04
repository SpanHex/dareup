import React, { useState, useEffect } from 'react';

export const VsScreenModal = ({ matchId, isOpen, onClose }) => {
  const [matchData, setMatchData] = useState(null);
  const [scoreA, setScoreA] = useState({ completed: 0, overall: 0 });
  const [scoreB, setScoreB] = useState({ completed: 0, overall: 0 });
  const [statusA, setStatusA] = useState('');
  const [statusB, setStatusB] = useState('');
  const [showHelpA, setShowHelpA] = useState(false);
  const [showHelpB, setShowHelpB] = useState(false);

  useEffect(() => {
    if (!matchId) return;

    // Load match details from matches_details.json or mock
    const loadMatch = async () => {
      try {
        const res = await fetch('/matches_details.json');
        if (res.ok) {
          const allDetails = await res.json();
          if (allDetails[matchId]) {
            setMatchData(allDetails[matchId]);
            return;
          }
        }
      } catch (_) {}

      // Fallback match display
      setMatchData({
        participantA: { nickname: 'Player A', username: 'player_a' },
        participantB: { nickname: 'Player B', username: 'player_b' },
      });
    };

    loadMatch();
  }, [matchId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const partA = matchData?.participantA;
  const partB = matchData?.participantB;
  const nameA = partA?.nickname || partA?.username || 'Player #1';
  const nameB = partB?.nickname || partB?.username || 'Player #2';

  const handleVoteA = (e) => {
    e.preventDefault();
    setStatusA('Vote recorded!');
    setTimeout(() => setStatusA(''), 2500);
  };

  const handleVoteB = (e) => {
    e.preventDefault();
    setStatusB('Vote recorded!');
    setTimeout(() => setStatusB(''), 2500);
  };

  return (
    <div
      id="vs-screen"
      data-vs-modal
      className="vs-screen flex is-open"
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      onClick={(e) => {
        if (e.target.id === 'vs-screen') onClose();
      }}
    >
      <div className="vs-screen__panel" data-vs-panel data-lenis-prevent>
        <div className="vs-screen__topbar">
          <button
            type="button"
            className="vs-screen__close"
            data-vs-close
            aria-label="Close VS screen"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <p className="vs-screen__global-status is-hidden" data-vs-global-status aria-live="polite" />

        <div className="vs-screen__body">
          {/* SIDE A */}
          <section className="vs-screen__side" data-vs-side="A">
            <header className="vs-screen__participant">
              <div className="vs-screen__participant-main">
                <div className="vs-screen__avatar" data-field="avatar">
                  {partA?.avatar || partA?.avatarUrl ? (
                    <img
                      data-field="avatar-image"
                      className="vs-screen__avatar-image"
                      src={partA.avatar || partA.avatarUrl}
                      alt={nameA}
                    />
                  ) : (
                    <span data-field="avatar-fallback" className="vs-screen__avatar-fallback">
                      {nameA[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="vs-screen__participant-meta">
                  <h3 className="vs-screen__participant-name" data-field="name">
                    {nameA}
                  </h3>
                  <div className="vs-screen__socials" data-field="socials" />
                </div>
              </div>
              <p className="vs-screen__result-badge is-hidden" data-field="result-badge" aria-live="polite" />
            </header>

            <div className="vs-screen__media-row">
              <div
                className="vs-screen__video-shell"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}
              >
                <div
                  className="vs-screen__video-placeholder"
                  data-field="video-placeholder"
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  <span className="vs-screen__video-placeholder-text" style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                    Match details shown below
                  </span>
                </div>
              </div>

              <div className="vs-screen__averages" tabIndex={0} aria-label="VS screen votes">
                <p className="vs-screen__averages-label">votes</p>
                <div className="vs-screen__average-line is-jury">
                  <span data-field="jury-average" className="vs-screen__average-value">
                    {partA?.scores?.jury?.average100 || '--'}
                  </span>
                  <span className="vs-screen__average-caption">host</span>
                </div>
                <div className="vs-screen__average-line">
                  <span data-field="audience-average" className="vs-screen__average-value">
                    {partA?.scores?.users?.average100 || '--'}
                  </span>
                  <span className="vs-screen__average-caption">audience</span>
                </div>
                <div className="vs-screen__averages-tooltip" data-field="averages-tooltip" role="tooltip" />
              </div>
            </div>

            <div className="vs-screen__meta-row">
              <div className="vs-screen__description-block">
                <p className="vs-screen__description-label">CHALLENGE ASSIGNED</p>
                <p className="vs-screen__description-text" data-field="description">
                  {matchData?.round?.conditions || 'Challenge will be revealed live by the host.'}
                </p>
              </div>
              <div className="vs-screen__your-rating">
                <span className="vs-screen__your-rating-value" data-field="your-rating">
                  {scoreA.completed * 5 + scoreA.overall}
                </span>
                <span className="vs-screen__your-rating-label">your vote</span>
              </div>
            </div>

            <form className="vs-screen__form" data-field="form" noValidate onSubmit={handleVoteA}>
              <div className="vs-screen__criteria-columns">
                <div className="vs-screen__criteria-column">
                  <label className="vs-screen__criterion" data-criterion="completed">
                    <span className="vs-screen__criterion-topline">
                      <span className="vs-screen__criterion-label">completed</span>
                      <span className="vs-screen__criterion-value" data-field="criterion-value">
                        {scoreA.completed}
                      </span>
                    </span>
                    <input
                      data-field="criterion-input"
                      type="range"
                      min="0"
                      max="1"
                      step="1"
                      value={scoreA.completed}
                      aria-label="completed challenge"
                      onChange={(e) => setScoreA({ ...scoreA, completed: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <div className="vs-screen__criteria-column">
                  <label className="vs-screen__criterion is-overall" data-criterion="overall">
                    <span className="vs-screen__criterion-topline">
                      <span className="vs-screen__criterion-label">overall</span>
                      <span className="vs-screen__criterion-value" data-field="criterion-value">
                        {scoreA.overall}
                      </span>
                    </span>
                    <input
                      data-field="criterion-input"
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={scoreA.overall}
                      aria-label="overall score"
                      onChange={(e) => setScoreA({ ...scoreA, overall: Number(e.target.value) })}
                    />
                  </label>

                  <div className="vs-screen__form-actions">
                    <button type="submit" className="vs-screen__publish" data-field="publish">
                      VOTE
                    </button>
                    {statusA && (
                      <p className="vs-screen__side-status" data-field="side-status" aria-live="polite">
                        {statusA}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="vs-screen__criteria-help">
                <div className="vs-screen__criteria-help-wrap">
                  <button
                    type="button"
                    className="vs-screen__criteria-help-trigger"
                    aria-label="How does voting work?"
                    onClick={() => setShowHelpA(!showHelpA)}
                  >
                    How does voting work?
                  </button>
                  {showHelpA && (
                    <div className="vs-screen__criteria-help-tooltip" style={{ display: 'block' }}>
                      <ul className="vs-screen__criteria-help-list">
                        <li className="vs-screen__criteria-help-item">
                          <p className="vs-screen__criteria-help-title">completed</p>
                          <p className="vs-screen__criteria-help-text">
                            Did the player successfully complete their Truth or Dare challenge? (0 = No, 1 = Yes)
                          </p>
                        </li>
                        <li className="vs-screen__criteria-help-item">
                          <p className="vs-screen__criteria-help-title">overall</p>
                          <p className="vs-screen__criteria-help-text">
                            How entertaining or impressive was their performance? Rate from 0 to 10.
                          </p>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </section>

          {/* SIDE B */}
          <section className="vs-screen__side" data-vs-side="B">
            <header className="vs-screen__participant">
              <div className="vs-screen__participant-main">
                <div className="vs-screen__avatar" data-field="avatar">
                  {partB?.avatar || partB?.avatarUrl ? (
                    <img
                      data-field="avatar-image"
                      className="vs-screen__avatar-image"
                      src={partB.avatar || partB.avatarUrl}
                      alt={nameB}
                    />
                  ) : (
                    <span data-field="avatar-fallback" className="vs-screen__avatar-fallback">
                      {nameB[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="vs-screen__participant-meta">
                  <h3 className="vs-screen__participant-name" data-field="name">
                    {nameB}
                  </h3>
                  <div className="vs-screen__socials" data-field="socials" />
                </div>
              </div>
              <p className="vs-screen__result-badge is-hidden" data-field="result-badge" aria-live="polite" />
            </header>

            <div className="vs-screen__media-row">
              <div
                className="vs-screen__video-shell"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}
              >
                <div
                  className="vs-screen__video-placeholder"
                  data-field="video-placeholder"
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  <span className="vs-screen__video-placeholder-text" style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                    Match details shown below
                  </span>
                </div>
              </div>

              <div className="vs-screen__averages" tabIndex={0} aria-label="VS screen votes">
                <p className="vs-screen__averages-label">votes</p>
                <div className="vs-screen__average-line is-jury">
                  <span data-field="jury-average" className="vs-screen__average-value">
                    {partB?.scores?.jury?.average100 || '--'}
                  </span>
                  <span className="vs-screen__average-caption">host</span>
                </div>
                <div className="vs-screen__average-line">
                  <span data-field="audience-average" className="vs-screen__average-value">
                    {partB?.scores?.users?.average100 || '--'}
                  </span>
                  <span className="vs-screen__average-caption">audience</span>
                </div>
                <div className="vs-screen__averages-tooltip" data-field="averages-tooltip" role="tooltip" />
              </div>
            </div>

            <div className="vs-screen__meta-row">
              <div className="vs-screen__description-block">
                <p className="vs-screen__description-label">CHALLENGE ASSIGNED</p>
                <p className="vs-screen__description-text" data-field="description">
                  {matchData?.round?.conditions || 'Challenge will be revealed live by the host.'}
                </p>
              </div>
              <div className="vs-screen__your-rating">
                <span className="vs-screen__your-rating-value" data-field="your-rating">
                  {scoreB.completed * 5 + scoreB.overall}
                </span>
                <span className="vs-screen__your-rating-label">your vote</span>
              </div>
            </div>

            <form className="vs-screen__form" data-field="form" noValidate onSubmit={handleVoteB}>
              <div className="vs-screen__criteria-columns">
                <div className="vs-screen__criteria-column">
                  <label className="vs-screen__criterion" data-criterion="completed">
                    <span className="vs-screen__criterion-topline">
                      <span className="vs-screen__criterion-label">completed</span>
                      <span className="vs-screen__criterion-value" data-field="criterion-value">
                        {scoreB.completed}
                      </span>
                    </span>
                    <input
                      data-field="criterion-input"
                      type="range"
                      min="0"
                      max="1"
                      step="1"
                      value={scoreB.completed}
                      aria-label="completed challenge"
                      onChange={(e) => setScoreB({ ...scoreB, completed: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <div className="vs-screen__criteria-column">
                  <label className="vs-screen__criterion is-overall" data-criterion="overall">
                    <span className="vs-screen__criterion-topline">
                      <span className="vs-screen__criterion-label">overall</span>
                      <span className="vs-screen__criterion-value" data-field="criterion-value">
                        {scoreB.overall}
                      </span>
                    </span>
                    <input
                      data-field="criterion-input"
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={scoreB.overall}
                      aria-label="overall score"
                      onChange={(e) => setScoreB({ ...scoreB, overall: Number(e.target.value) })}
                    />
                  </label>

                  <div className="vs-screen__form-actions">
                    <button type="submit" className="vs-screen__publish" data-field="publish">
                      VOTE
                    </button>
                    {statusB && (
                      <p className="vs-screen__side-status" data-field="side-status" aria-live="polite">
                        {statusB}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="vs-screen__criteria-help">
                <div className="vs-screen__criteria-help-wrap">
                  <button
                    type="button"
                    className="vs-screen__criteria-help-trigger"
                    aria-label="How does voting work?"
                    onClick={() => setShowHelpB(!showHelpB)}
                  >
                    How does voting work?
                  </button>
                  {showHelpB && (
                    <div className="vs-screen__criteria-help-tooltip" style={{ display: 'block' }}>
                      <ul className="vs-screen__criteria-help-list">
                        <li className="vs-screen__criteria-help-item">
                          <p className="vs-screen__criteria-help-title">completed</p>
                          <p className="vs-screen__criteria-help-text">
                            Did the player successfully complete their Truth or Dare challenge? (0 = No, 1 = Yes)
                          </p>
                        </li>
                        <li className="vs-screen__criteria-help-item">
                          <p className="vs-screen__criteria-help-title">overall</p>
                          <p className="vs-screen__criteria-help-text">
                            How entertaining or impressive was their performance? Rate from 0 to 10.
                          </p>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </section>

          {/* VS DIVIDER */}
          <div className="vs-screen__divider" aria-hidden="true">
            <span>VS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
