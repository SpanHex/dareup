import React, { useState, useRef, useEffect } from 'react';
import bracketDataRaw from '../../../bracket_data.json';

export const TournamentBracket = ({ onSelectMatch }) => {
  const [activeRound, setActiveRound] = useState(1);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const viewportRef = useRef(null);
  const stageRef = useRef(null);

  const handleChipClick = (round) => {
    setActiveRound(round);
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!viewport || !stage) return;

    const maxScroll = Math.max(0, stage.scrollWidth - viewport.clientWidth);
    let target = 0;
    if (round === 1) target = 0;
    else if (round === 2) target = maxScroll * 0.28;
    else if (round === 3) target = maxScroll * 0.4;
    else if (round === 4) target = maxScroll * 0.5;

    viewport.scrollTo({ left: target, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (showSwipeHint) {
      setShowSwipeHint(false);
    }
  };

  const handleMatchClick = (matchId) => {
    if (onSelectMatch) {
      onSelectMatch(matchId);
    }
    document.dispatchEvent(new CustomEvent('ngt:vs-open', { detail: { matchId } }));
  };

  return (
    <div
      className="flex flex-col items-center justify-start gap-2 md:gap-3 pt-24 md:pt-[126px] pb-6 md:pb-10 overflow-hidden"
      id="bracket"
      data-astro-cid-rsd2vusr
    >
      <h2 className="block-title text-white text-center" data-astro-cid-rsd2vusr>
        TOURNAMENT BRACKET
      </h2>

      <div className="w-full px-2 md:px-4">
        <div
          id="bracket-shell"
          className="w-full flex flex-col items-center gap-4"
          data-stub-mode="auto"
          data-empty-text="Bracket is not available yet."
          data-total-rounds="4"
          data-total-participants="16"
        >
          <p
            id="bracket-status"
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/45 text-center hidden"
            aria-live="polite"
          />
          <div id="bracket-content" className="w-full">
            {/* Mobile Controls */}
            <div className="bracket-mobile-controls">
              {showSwipeHint && (
                <div className="bracket-swipe-hint">
                  <span>⟷</span> <span>Swipe horizontally to view bracket</span>
                </div>
              )}
              <div className="bracket-round-chips" role="tablist" aria-label="Tournament Rounds">
                {[
                  { r: 1, label: 'Round of 16' },
                  { r: 2, label: 'Quarterfinals' },
                  { r: 3, label: 'Semifinals' },
                  { r: 4, label: 'Final' },
                ].map(({ r, label }) => (
                  <button
                    key={r}
                    type="button"
                    className={`bracket-round-chip ${activeRound === r ? 'is-active' : ''}`}
                    onClick={() => handleChipClick(r)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Viewport and Stage */}
            <div
              id="bracket-viewport"
              ref={viewportRef}
              className="bracket-viewport"
              onScroll={handleScroll}
            >
              <div id="bracket-stage" ref={stageRef} className="bracket-stage">
                {/* LEFT SIDE TRACK */}
                <div className="bracket-side is-left">
                  <div className="bracket-side-track is-left">
                    <div className="bracket-branch is-left" data-depth="3">
                      <div className="bracket-children">
                        {/* Sub-branch Top */}
                        <div className="bracket-child">
                          <div className="bracket-branch is-left" data-depth="2">
                            <div className="bracket-children">
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-1"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #1 versus Player #2"
                                  onClick={() => handleMatchClick('m-r1-1')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-1')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="1">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #1</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="2">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #2</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-2"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #3 versus Player #4"
                                  onClick={() => handleMatchClick('m-r1-2')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-2')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="3">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #3</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="4">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #4</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                            </div>
                            <div className="bracket-link" />
                            <article className="bracket-match is-placeholder">
                              <div className="bracket-slot is-top shift-left is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                              <div className="bracket-slot shift-right is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                            </article>
                          </div>
                        </div>

                        {/* Sub-branch Bottom */}
                        <div className="bracket-child">
                          <div className="bracket-branch is-left" data-depth="2">
                            <div className="bracket-children">
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-3"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #5 versus Player #6"
                                  onClick={() => handleMatchClick('m-r1-3')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-3')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="5">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #5</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="6">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #6</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-4"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #7 versus Player #8"
                                  onClick={() => handleMatchClick('m-r1-4')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-4')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="7">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #7</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="8">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #8</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                            </div>
                            <div className="bracket-link" />
                            <article className="bracket-match is-placeholder">
                              <div className="bracket-slot is-top shift-left is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                              <div className="bracket-slot shift-right is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                            </article>
                          </div>
                        </div>
                      </div>

                      <div className="bracket-link" />
                      <article className="bracket-match is-placeholder">
                        <div className="bracket-slot is-top shift-left is-empty">
                          <span className="bracket-slot-main">
                            <span className="bracket-slot-name">TBD</span>
                          </span>
                        </div>
                        <div className="bracket-slot shift-right is-empty">
                          <span className="bracket-slot-main">
                            <span className="bracket-slot-name">TBD</span>
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>

                {/* CENTER FINALS */}
                <div className="bracket-center">
                  <div className="bracket-center-finals">
                    <div className="bracket-center-side-link" />
                    <article className="bracket-match is-final is-placeholder">
                      <div className="bracket-slot is-top shift-left is-empty">
                        <span className="bracket-slot-main">
                          <span className="bracket-slot-name">TBD</span>
                        </span>
                      </div>
                      <div className="bracket-slot shift-right is-empty">
                        <span className="bracket-slot-main">
                          <span className="bracket-slot-name">TBD</span>
                        </span>
                      </div>
                    </article>
                    <div className="bracket-center-side-link" />
                  </div>
                </div>

                {/* RIGHT SIDE TRACK */}
                <div className="bracket-side is-right">
                  <div className="bracket-side-track is-right">
                    <div className="bracket-branch is-right" data-depth="3">
                      <div className="bracket-children">
                        {/* Sub-branch Top */}
                        <div className="bracket-child">
                          <div className="bracket-branch is-right" data-depth="2">
                            <div className="bracket-children">
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-5"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #9 versus Player #10"
                                  onClick={() => handleMatchClick('m-r1-5')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-5')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="9">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #9</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="10">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #10</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-6"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #11 versus Player #12"
                                  onClick={() => handleMatchClick('m-r1-6')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-6')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="11">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #11</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="12">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #12</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                            </div>
                            <div className="bracket-link" />
                            <article className="bracket-match is-placeholder">
                              <div className="bracket-slot is-top shift-left is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                              <div className="bracket-slot shift-right is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                            </article>
                          </div>
                        </div>

                        {/* Sub-branch Bottom */}
                        <div className="bracket-child">
                          <div className="bracket-branch is-right" data-depth="2">
                            <div className="bracket-children">
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-7"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #13 versus Player #14"
                                  onClick={() => handleMatchClick('m-r1-7')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-7')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="13">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #13</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="14">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #14</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                              <div className="bracket-child">
                                <article
                                  className="bracket-match is-interactive"
                                  data-vs-trigger="true"
                                  data-match-id="m-r1-8"
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Open match Player #15 versus Player #16"
                                  onClick={() => handleMatchClick('m-r1-8')}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMatchClick('m-r1-8')}
                                >
                                  <div className="bracket-slot is-top shift-left" data-slot-number="15">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #15</span>
                                    </span>
                                  </div>
                                  <div className="bracket-slot shift-right" data-slot-number="16">
                                    <span className="bracket-slot-main">
                                      <span className="bracket-slot-name">Player #16</span>
                                    </span>
                                  </div>
                                </article>
                              </div>
                            </div>
                            <div className="bracket-link" />
                            <article className="bracket-match is-placeholder">
                              <div className="bracket-slot is-top shift-left is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                              <div className="bracket-slot shift-right is-empty">
                                <span className="bracket-slot-main">
                                  <span className="bracket-slot-name">TBD</span>
                                </span>
                              </div>
                            </article>
                          </div>
                        </div>
                      </div>

                      <div className="bracket-link" />
                      <article className="bracket-match is-placeholder">
                        <div className="bracket-slot is-top shift-left is-empty">
                          <span className="bracket-slot-main">
                            <span className="bracket-slot-name">TBD</span>
                          </span>
                        </div>
                        <div className="bracket-slot shift-right is-empty">
                          <span className="bracket-slot-main">
                            <span className="bracket-slot-name">TBD</span>
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="bracket-stub" className="w-full hidden">
            <p className="text-[clamp(1rem,2.1vw,1.5rem)] text-white text-center max-w-275 mx-auto uppercase leading-tight">
              The bracket will be revealed once all 16 players are registered. Register to secure your spot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
