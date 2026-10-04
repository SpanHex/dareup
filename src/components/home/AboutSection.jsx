import React, { useEffect, useRef } from 'react';

export const AboutSection = () => {
  const revealRef = useRef(null);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;

    const show = () => {
      el.classList.add('is-visible', 'is-revealed');
    };

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.15) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const headingWords = ['DARE', 'TO', 'SURVIVE.'];
  const bodyWords = [
    'DAREDOWN', 'is', 'a', 'live', 'Truth', 'or', 'Dare', 'elimination',
    'tournament.', '16', 'players.', 'Random', 'matchups.', 'Challenges',
    'assigned', 'live.', 'Fail', 'the', 'dare', 'and', "you're", 'out.',
    'Last', 'one', 'standing', 'takes', '£50.',
  ];

  return (
    <div
      className="flex flex-col gap-12.5 pt-12 md:pt-16"
      id="about"
      data-astro-cid-rsd2vusr
    >
      <h2 className="block-title text-white text-center" data-astro-cid-rsd2vusr>
        About
      </h2>

      <div id="about-reveal" ref={revealRef}>
        <p
          id="about-heading"
          className="px-4 text-[clamp(2rem,8.6vw,8rem)] font-bold text-white text-center max-w-345 mx-auto uppercase leading-[0.96]"
        >
          {headingWords.map((word, idx) => (
            <span key={idx} className="word-clip" style={{ '--word-index': idx }}>
              <span className="word-inner">{word} </span>
            </span>
          ))}
        </p>

        <p
          id="about-body"
          className="px-4 text-[clamp(0.95rem,1.8vw,1.5rem)] text-white text-center max-w-275 mx-auto mt-4 md:mt-7.5 leading-tight font-medium"
        >
          {bodyWords.map((word, idx) => (
            <span
              key={idx}
              className="word-clip"
              style={{ '--word-index': idx + headingWords.length }}
            >
              <span className="word-inner">{word} </span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};
