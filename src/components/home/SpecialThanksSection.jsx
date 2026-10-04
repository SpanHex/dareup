import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export const SpecialThanksSection = () => {
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

  const titleWords = ['WANT', 'IN?'];
  const feeWords = [
    'Entry', 'fee:', '£0.50.', 'Prize:', '£50.', '16', 'spots.', 'First', 'come,', 'first', 'served.',
  ];
  const questionWords = [
    'Questions?', 'Contact', 'the', 'host', 'to', 'find', 'out', 'more.',
  ];

  return (
    <section
      id="special-thanks"
      className="w-full min-h-[82dvh] px-5 pb-12 pt-28 text-white flex flex-col items-center justify-start gap-12 md:gap-14"
    >
      <div id="special-thanks-reveal" ref={revealRef} className="w-full flex flex-col items-center">
        <h2 className="text-center uppercase font-medium leading-none tracking-[-0.05em] text-[clamp(2.4rem,5.2vw,75px)]">
          {titleWords.map((word, idx) => (
            <span key={idx} className="word-clip" style={{ '--word-index': idx }}>
              <span className="word-inner">{word} </span>
            </span>
          ))}
        </h2>

        <p className="mt-2 text-center uppercase font-light leading-tight tracking-[-0.01em] text-[clamp(0.8rem,1vw,1.45rem)]">
          {feeWords.map((word, idx) => (
            <span key={idx} className="word-clip" style={{ '--word-index': idx + 2 }}>
              <span className="word-inner">{word} </span>
            </span>
          ))}
        </p>

        <ul className="w-full max-w-[720px] mx-auto mt-3 mb-3 text-center leading-[1.22] tracking-[-0.01em] text-[clamp(1.35rem,2.2vw,2.7rem)]">
          <li>
            <Link to="/register" className="word-clip" style={{ '--word-index': 13 }}>
              <span className="word-inner hover:text-white/70 transition-colors duration-300">
                {' '}REGISTER NOW{' '}
              </span>
            </Link>
          </li>
        </ul>

        <p className="w-full max-w-[1380px] text-center uppercase font-light tracking-[-0.01em] leading-tight text-[clamp(0.82rem,1.02vw,1.5rem)]">
          {questionWords.map((word, idx) => (
            <span key={idx} className="word-clip" style={{ '--word-index': idx + 14 }}>
              <span className="word-inner">{word} </span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
};
