import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import defaultChallengesData from '../../challenges.json';
import '../styles/ngc.css';

export const ChallengesPage = () => {
  const [filter, setFilter] = useState('all');
  const [challenges, setChallenges] = useState(() => {
    const list = [...(defaultChallengesData.challenges || [])].filter((c) => c.active !== false);
    return list;
  });

  useEffect(() => {
    fetch('/challenges.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.challenges)) {
          const valid = data.challenges.filter((c) => c.active !== false);
          setChallenges(valid);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = challenges.filter((c) => {
    if (filter === 'all') return true;
    return c.type === filter;
  });

  return (
    <>
      <Header />
      <div className="challenges-page">
        <main className="challenges-main">
          {/* Title */}
          <div className="challenges-header-row">
            <span className="challenges-eyebrow">DAREDOWN ~ Challenge Pool</span>
            <h1 className="challenges-title">Truth &amp; Dare</h1>
            <p className="challenges-sub">
              These are the challenges you'll face in the tournament.
              All challenges are assigned live by the host, randomly selected from this pool.
              Come prepared for anything.
            </p>
          </div>

          {/* Filters */}
          <div className="challenges-filters" role="group" aria-label="Filter challenges">
            <button
              className={`challenges-filter-btn ${filter === 'all' ? 'is-active' : ''}`}
              id="filter-all"
              data-filter="all"
              type="button"
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`challenges-filter-btn is-truth ${filter === 'truth' ? 'is-active' : ''}`}
              id="filter-truth"
              data-filter="truth"
              type="button"
              onClick={() => setFilter('truth')}
            >
              Truth
            </button>
            <button
              className={`challenges-filter-btn is-dare ${filter === 'dare' ? 'is-active' : ''}`}
              id="filter-dare"
              data-filter="dare"
              type="button"
              onClick={() => setFilter('dare')}
            >
              Dare
            </button>
          </div>

          {/* Challenge Cards */}
          <div className="challenges-grid" id="challenges-grid">
            {filtered.length > 0 ? (
              filtered.map((challenge) => {
                const difficulty = challenge.difficulty || 1;
                return (
                  <div
                    key={challenge.id}
                    className="challenge-card"
                    data-type={challenge.type}
                    data-challenge-id={challenge.id}
                  >
                    <div className="challenge-type-badge">
                      {challenge.type.toUpperCase()}
                    </div>
                    <p className="challenge-text">{challenge.text}</p>
                    <div
                      className="challenge-difficulty"
                      aria-label={`Difficulty: ${difficulty} of 3`}
                    >
                      {[1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={`challenge-difficulty-dot ${i <= difficulty ? 'is-filled' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Challenge pool will be revealed closer to the event date.
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="challenges-cta">
            <h2 className="challenges-cta-title">Think you can handle it?</h2>
            <p className="challenges-cta-sub">
              £0.50 entry. £50 prize. 16 spots. First come, first served.
            </p>
            <Link to="/register" className="challenges-cta-btn" id="cta-register-btn">
              Register Now
            </Link>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};
