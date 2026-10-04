import React, { useEffect, useRef } from 'react';

export const HeroWinnersSection = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const winnersLayer = root.querySelector('[data-transition-winners]');
    const winnerLinks = Array.from(root.querySelectorAll('.winner-name-link'));
    let frame = 0;
    let reducedMotion = prefersReducedMotion.matches;

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);
    const range = (progress, start, end) => clamp((progress - start) / (end - start));
    const reveal = (progress, start, end) => easeOut(range(progress, start, end));

    const setHiddenLinks = (hidden) => {
      if (winnersLayer instanceof HTMLElement) {
        winnersLayer.toggleAttribute('inert', hidden);
        winnersLayer.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      }

      winnerLinks.forEach((link) => {
        if (!(link instanceof HTMLElement)) return;
        if (hidden) {
          if ('transitionPreviousTabindex' in link.dataset) return;
          link.dataset.transitionPreviousTabindex = link.getAttribute('tabindex') ?? '';
          link.setAttribute('tabindex', '-1');
        } else if ('transitionPreviousTabindex' in link.dataset) {
          const previous = link.dataset.transitionPreviousTabindex;
          if (previous) {
            link.setAttribute('tabindex', previous);
          } else {
            link.removeAttribute('tabindex');
          }
          delete link.dataset.transitionPreviousTabindex;
        }
      });
    };

    const setVar = (name, value) => {
      root.style.setProperty(name, value);
    };

    const updateWinnersLayout = () => {
      if (window.innerWidth <= 900) {
        setVar('--winners-scale', '1');
        setVar('--winners-section-offset', '0px');
        return;
      }
      const vh = window.innerHeight;
      const header = document.getElementById('site-header');
      const headerH = header ? header.getBoundingClientRect().height : 90;

      const targetH = 1060;
      const topPadding = Math.max(headerH + 8, 92);
      const bottomPadding = 20;
      const availableH = Math.max(280, vh - topPadding - bottomPadding);
      const scale = Math.min(1, Math.max(0.4, availableH / targetH));
      const offset = topPadding - 25.6 * scale;

      setVar('--winners-scale', scale.toFixed(4));
      setVar('--winners-section-offset', offset.toFixed(1) + 'px');
      setVar('--winners-visual-height', (targetH * scale + offset).toFixed(1) + 'px');
    };

    const applyProgress = () => {
      frame = 0;
      updateWinnersLayout();

      if (reducedMotion) {
        setHiddenLinks(false);
        return;
      }

      const rect = root.getBoundingClientRect();
      const distance = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);

      const heroOpacity = 1 - reveal(progress, 0, 0.24);
      const titleProgress = reveal(progress, 0.25, 0.38);
      const firstProgress = reveal(progress, 0.4, 0.58);
      const secondProgress = reveal(progress, 0.56, 0.74);
      const thirdProgress = reveal(progress, 0.72, 0.9);
      const winnersOpacity = Math.max(titleProgress, firstProgress, secondProgress, thirdProgress);

      setVar('--hero-opacity', heroOpacity.toFixed(4));
      setVar('--winners-opacity', winnersOpacity.toFixed(4));
      setVar('--winners-title-opacity', titleProgress.toFixed(4));
      setVar('--winners-title-y', `${((1 - titleProgress) * 1.15).toFixed(3)}rem`);
      setVar('--winner-first-opacity', firstProgress.toFixed(4));
      setVar('--winner-first-y', `${((1 - firstProgress) * 5.5).toFixed(3)}rem`);
      setVar('--winner-second-opacity', secondProgress.toFixed(4));
      setVar('--winner-second-y', `${((1 - secondProgress) * 5.5).toFixed(3)}rem`);
      setVar('--winner-third-opacity', thirdProgress.toFixed(4));
      setVar('--winner-third-y', `${((1 - thirdProgress) * 5.5).toFixed(3)}rem`);
      setHiddenLinks(winnersOpacity < 0.98);
    };

    const requestSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(applyProgress);
    };

    const handleReducedMotion = () => {
      reducedMotion = prefersReducedMotion.matches;
      if (reducedMotion) {
        root.removeAttribute('data-transition-active');
        root.style.cssText = '';
      } else {
        root.setAttribute('data-transition-active', 'true');
      }
      requestSync();
    };

    const scrollToFinalWinners = () => {
      const distance = Math.max(1, root.offsetHeight - window.innerHeight);
      const top = root.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + distance);
    };

    const syncInitialHash = () => {
      if (window.location.hash !== '#winners' || reducedMotion) return;
      window.requestAnimationFrame(() => {
        scrollToFinalWinners();
        requestSync();
      });
    };

    handleReducedMotion();
    updateWinnersLayout();
    applyProgress();
    syncInitialHash();

    const t1 = setTimeout(() => {
      updateWinnersLayout();
      requestSync();
    }, 120);

    const t2 = setTimeout(() => {
      updateWinnersLayout();
      requestSync();
    }, 500);

    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', () => {
      updateWinnersLayout();
      requestSync();
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="hero-winners-transition"
      ref={rootRef}
      className="hero-winners-transition"
      aria-label="Hero to winners transition"
      data-astro-cid-efhtxqxr
    >
      <div className="hero-winners-pin" data-astro-cid-efhtxqxr>
        {/* HERO SECTION */}
        <div className="hero-transition-layer" data-transition-hero data-astro-cid-efhtxqxr>
          <section
            id="hero-section"
            className="relative h-dvh w-screen left-1/2 -translate-x-1/2 flex justify-center items-center overflow-hidden"
            data-astro-cid-4z5ypzu4
          >
            <div id="hero-bg-video-layer" className="hero-bg-video-layer" aria-hidden="true" data-astro-cid-4z5ypzu4>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                data-astro-cid-4z5ypzu4
              >
                <source src="/videos/Comp%201_9.mp4" type="video/mp4" data-astro-cid-4z5ypzu4 />
                <source src="/background.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/50" data-astro-cid-4z5ypzu4 />
            </div>

            <p
              id="hero-title"
              className="relative z-20 w-full px-4 flex flex-wrap items-center justify-center gap-x-[0.35em] gap-y-[0.05em] leading-[0.92] text-white font-extralight text-center text-[clamp(1.05rem,5.35vw,6.5rem)] transition-opacity duration-150"
              data-astro-cid-4z5ypzu4
            >
              <span data-astro-cid-4z5ypzu4>
                DARE<span className="font-bold" data-astro-cid-4z5ypzu4>DOWN</span>
                <span
                  style={{ fontSize: '0.55em', letterSpacing: '0.06em', opacity: 0.7 }}
                  data-astro-cid-4z5ypzu4
                >
                  TRUTH&nbsp;OR&nbsp;DARE&nbsp;TOURNAMENT
                </span>
              </span>
            </p>
          </section>
        </div>

        {/* WINNERS SECTION */}
        <div className="winners-transition-layer" data-transition-winners data-astro-cid-efhtxqxr>
          <div className="winners-transition-shell" data-astro-cid-efhtxqxr>
            <section
              id="winners"
              className="winners-screen"
              aria-labelledby="winners-title"
              data-astro-cid-6ur5r5pq
            >
              <div className="winners-copy" data-winners-title-reveal data-astro-cid-6ur5r5pq>
                <h2 id="winners-title" data-astro-cid-6ur5r5pq>
                  DAREDOWN CHAMPIONS
                </h2>
              </div>

              <div
                className="winners-stage"
                aria-label="DAREDOWN Truth or Dare Tournament champions"
                data-astro-cid-6ur5r5pq
              >
                {/* 2ND PLACE */}
                <article
                  className="winner-card winner-card-second"
                  data-winner-reveal="second"
                  data-astro-cid-6ur5r5pq
                >
                  <svg
                    className="winner-rank-number rank-silver"
                    viewBox="0 0 430 720"
                    aria-hidden="true"
                    data-astro-cid-6ur5r5pq
                  >
                    <defs data-astro-cid-6ur5r5pq>
                      <linearGradient
                        id="winner-rank-silver"
                        x1="360"
                        y1="-70"
                        x2="-50"
                        y2="735"
                        gradientUnits="userSpaceOnUse"
                        data-astro-cid-6ur5r5pq
                      >
                        <stop stopColor="#F1F4F8" data-astro-cid-6ur5r5pq />
                        <stop offset="1" stopColor="#343B45" data-astro-cid-6ur5r5pq />
                      </linearGradient>
                    </defs>
                    <text
                      className="winner-rank-text"
                      x="28"
                      y="655"
                      fill="url(#winner-rank-silver)"
                      data-astro-cid-6ur5r5pq
                    >
                      2
                    </text>
                  </svg>
                  <div className="winner-detail second-detail" data-astro-cid-6ur5r5pq>
                    <p className="winner-place" data-astro-cid-6ur5r5pq>
                      2ND PLACE
                    </p>
                    <span className="winner-rule" data-astro-cid-6ur5r5pq />
                    <h3 data-astro-cid-6ur5r5pq>
                      <a
                        className="winner-name-link"
                        data-winner-name
                        data-winner-place="second"
                        data-astro-cid-6ur5r5pq
                      >
                        TBD
                      </a>
                    </h3>
                    <svg
                      className="winner-prize prize-silver"
                      viewBox="0 0 500 230"
                      role="img"
                      aria-label="Runner Up"
                      data-astro-cid-6ur5r5pq
                    >
                      <title>Runner Up</title>
                      <defs data-astro-cid-6ur5r5pq>
                        <linearGradient
                          id="winner-prize-silver"
                          x1="330"
                          y1="-40"
                          x2="0"
                          y2="210"
                          gradientUnits="userSpaceOnUse"
                          data-astro-cid-6ur5r5pq
                        >
                          <stop stopColor="#D7DBE0" data-astro-cid-6ur5r5pq />
                          <stop offset="1" stopColor="#343B45" data-astro-cid-6ur5r5pq />
                        </linearGradient>
                      </defs>
                      <text
                        className="winner-prize-text"
                        x="16"
                        y="170"
                        fill="url(#winner-prize-silver)"
                        data-astro-cid-6ur5r5pq
                        style={{ fontSize: '0.65em' }}
                      >
                        Runner Up
                      </text>
                    </svg>
                    <p
                      className="winner-title"
                      data-winner-title
                      data-winner-place="second"
                      data-astro-cid-6ur5r5pq
                    >
                      The Finalist
                    </p>
                  </div>
                </article>

                {/* 1ST PLACE */}
                <article
                  className="winner-card winner-card-first"
                  data-winner-reveal="first"
                  data-astro-cid-6ur5r5pq
                >
                  <svg
                    className="winner-rank-number rank-gold"
                    viewBox="0 0 330 720"
                    aria-hidden="true"
                    data-astro-cid-6ur5r5pq
                  >
                    <defs data-astro-cid-6ur5r5pq>
                      <linearGradient
                        id="winner-rank-gold"
                        x1="-40"
                        y1="130"
                        x2="410"
                        y2="580"
                        gradientUnits="userSpaceOnUse"
                        data-astro-cid-6ur5r5pq
                      >
                        <stop stopColor="#E2C275" data-astro-cid-6ur5r5pq />
                        <stop offset="1" stopColor="#050402" data-astro-cid-6ur5r5pq />
                      </linearGradient>
                    </defs>
                    <text
                      className="winner-rank-text"
                      x="34"
                      y="655"
                      fill="url(#winner-rank-gold)"
                      data-astro-cid-6ur5r5pq
                    >
                      1
                    </text>
                  </svg>
                  <div className="winner-detail first-detail" data-astro-cid-6ur5r5pq>
                    <p className="winner-place" data-astro-cid-6ur5r5pq>
                      1ST PLACE
                    </p>
                    <span className="winner-rule" data-astro-cid-6ur5r5pq />
                    <h3 data-astro-cid-6ur5r5pq>
                      <a
                        className="winner-name-link"
                        data-winner-name
                        data-winner-place="first"
                        data-astro-cid-6ur5r5pq
                      >
                        TBD
                      </a>
                    </h3>
                    <svg
                      className="winner-prize prize-gold"
                      viewBox="0 0 500 230"
                      role="img"
                      aria-label="50 pounds prize"
                      data-astro-cid-6ur5r5pq
                    >
                      <title>£50</title>
                      <defs data-astro-cid-6ur5r5pq>
                        <linearGradient
                          id="winner-prize-gold"
                          x1="-20"
                          y1="35"
                          x2="430"
                          y2="155"
                          gradientUnits="userSpaceOnUse"
                          data-astro-cid-6ur5r5pq
                        >
                          <stop stopColor="#E2C275" data-astro-cid-6ur5r5pq />
                          <stop offset="1" stopColor="#080604" data-astro-cid-6ur5r5pq />
                        </linearGradient>
                      </defs>
                      <text
                        className="winner-prize-text"
                        x="16"
                        y="170"
                        fill="url(#winner-prize-gold)"
                        data-astro-cid-6ur5r5pq
                      >
                        £50
                      </text>
                    </svg>
                    <p
                      className="winner-title"
                      data-winner-title
                      data-winner-place="first"
                      data-astro-cid-6ur5r5pq
                    >
                      The Champion
                    </p>
                  </div>
                </article>

                {/* 3RD PLACE */}
                <article
                  className="winner-card winner-card-third"
                  data-winner-reveal="third"
                  data-astro-cid-6ur5r5pq
                >
                  <svg
                    className="winner-rank-number rank-bronze"
                    viewBox="0 0 430 720"
                    aria-hidden="true"
                    data-astro-cid-6ur5r5pq
                  >
                    <defs data-astro-cid-6ur5r5pq>
                      <linearGradient
                        id="winner-rank-bronze"
                        x1="-50"
                        y1="720"
                        x2="460"
                        y2="130"
                        gradientUnits="userSpaceOnUse"
                        data-astro-cid-6ur5r5pq
                      >
                        <stop stopColor="#C78A56" data-astro-cid-6ur5r5pq />
                        <stop offset="1" stopColor="#56361C" data-astro-cid-6ur5r5pq />
                      </linearGradient>
                    </defs>
                    <text
                      className="winner-rank-text"
                      x="28"
                      y="655"
                      fill="url(#winner-rank-bronze)"
                      data-astro-cid-6ur5r5pq
                    >
                      3
                    </text>
                  </svg>
                  <div className="winner-detail third-detail" data-astro-cid-6ur5r5pq>
                    <p className="winner-place" data-astro-cid-6ur5r5pq>
                      3RD PLACE
                    </p>
                    <span className="winner-rule" data-astro-cid-6ur5r5pq />
                    <h3 data-astro-cid-6ur5r5pq>
                      <a
                        className="winner-name-link"
                        data-winner-name
                        data-winner-place="third"
                        data-astro-cid-6ur5r5pq
                      >
                        TBD
                      </a>
                    </h3>
                    <svg
                      className="winner-prize prize-bronze"
                      viewBox="0 0 500 230"
                      role="img"
                      aria-label="Survived"
                      data-astro-cid-6ur5r5pq
                    >
                      <title>Survived</title>
                      <defs data-astro-cid-6ur5r5pq>
                        <linearGradient
                          id="winner-prize-bronze"
                          x1="-20"
                          y1="180"
                          x2="430"
                          y2="20"
                          gradientUnits="userSpaceOnUse"
                          data-astro-cid-6ur5r5pq
                        >
                          <stop stopColor="#C78A56" data-astro-cid-6ur5r5pq />
                          <stop offset="1" stopColor="#56361C" data-astro-cid-6ur5r5pq />
                        </linearGradient>
                      </defs>
                      <text
                        className="winner-prize-text"
                        x="16"
                        y="170"
                        fill="url(#winner-prize-bronze)"
                        data-astro-cid-6ur5r5pq
                        style={{ fontSize: '0.65em' }}
                      >
                        Survived
                      </text>
                    </svg>
                    <p
                      className="winner-title"
                      data-winner-title
                      data-winner-place="third"
                      data-astro-cid-6ur5r5pq
                    >
                      THE BRAVE
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};
