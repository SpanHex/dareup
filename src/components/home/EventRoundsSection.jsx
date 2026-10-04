import React, { useEffect, useRef } from 'react';

export const EventRoundsSection = () => {
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

  const rounds = [
    {
      num: '1',
      title: 'ROUND OF 16',
      subtitle: '16 PLAYERS',
      desc: 'Random matchups: Truth or Dare assigned live',
    },
    {
      num: '2',
      title: 'QUARTERFINALS',
      subtitle: '8 SURVIVORS',
      desc: 'Harder challenges: double or nothing',
    },
    {
      num: '3',
      title: 'SEMIFINALS',
      subtitle: '4 REMAIN',
      desc: "One slip and you're out",
    },
    {
      num: '4',
      title: 'THE FINAL',
      subtitle: '2 PLAYERS',
      desc: 'One dare. Winner takes £50',
    },
  ];

  return (
    <div
      className="flex flex-col gap-12.5 pt-[126px]"
      id="rounds"
      data-astro-cid-rsd2vusr
    >
      <h2 className="block-title text-white text-left" data-astro-cid-rsd2vusr>
        EVENT ROUNDS
      </h2>

      <div
        id="rounds-reveal"
        ref={revealRef}
        className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] 2xl:[grid-template-columns:repeat(4,minmax(280px,1fr))]"
      >
        {rounds.map((round, idx) => (
          <div
            key={idx}
            className="round-card flex flex-col gap-[40px] items-start justify-center w-full max-w-[280px]"
            style={{ '--round-index': idx }}
          >
            <div className="flex flex-col gap-[5px] items-start justify-center">
              <p className="text-[75px] text-white">{round.num}</p>
              <p className="text-[24px] text-white uppercase">{round.title}</p>
            </div>
            <div className="flex flex-col gap-[5px] items-start justify-center">
              <p className="text-[24px] text-white uppercase">{round.subtitle}</p>
              <p className="text-[24px] text-white uppercase">{round.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
