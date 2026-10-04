import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer = () => {
  const location = useLocation();

  const handleAnchorClick = (e, targetId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        const headerH = document.getElementById('site-header')?.getBoundingClientRect().height || 90;
        const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
        if (window.lenis) {
          window.lenis.scrollTo(Math.max(0, top), { duration: 1.1 });
        } else {
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
        window.history.pushState({}, '', `#${targetId}`);
      }
    }
  };

  return (
    <div>
      <img
        className="footer-newgen-img relative bottom-[-8px] px-3 w-full max-w-450 mx-auto"
        src="/footer_newgen.svg"
        alt="DAREDOWN"
      />
      <footer className="w-full px-3 md:px-18 py-5 bg-white">
        <div className="max-w-450 w-full mx-auto grid grid-cols-1 gap-8 items-start sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch lg:gap-10">
          <div className="decoration-transparent decoration-0 text-black text-[18px] leading-tight tracking-tight flex flex-col gap-3 sm:text-[20px] lg:text-[24px] lg:gap-7.5">
            <span>DAREDOWN</span>
            <span>TRUTH OR DARE</span>
            <span>TOURNAMENT</span>
          </div>

          <ol className="decoration-transparent decoration-0 text-black text-[18px] leading-tight tracking-tight flex flex-col gap-3 sm:text-[20px] lg:text-[24px] lg:gap-7.5">
            <li>
              <Link
                className="transition-colors duration-130 hover:text-black/70 hover:underline"
                to="/rules"
              >
                Rules
              </Link>
            </li>
            <li>
              <a
                className="transition-colors duration-130 hover:text-black/70 hover:underline"
                href="/#bracket"
                onClick={(e) => handleAnchorClick(e, 'bracket')}
              >
                Bracket
              </a>
            </li>
            <li>
              <Link
                className="transition-colors duration-130 hover:text-black/70 hover:underline"
                to="/ngc"
              >
                Challenges
              </Link>
            </li>
            <li>
              <a
                className="transition-colors duration-130 hover:text-black/70 hover:underline"
                href="/#about"
                onClick={(e) => handleAnchorClick(e, 'about')}
              >
                About
              </a>
            </li>
          </ol>

          <ol className="decoration-transparent decoration-0 text-black text-[18px] leading-tight tracking-tight flex flex-col gap-3 sm:text-[20px] lg:text-[24px] lg:gap-7.5">
            <li>
              <Link
                className="transition-colors duration-130 hover:text-black/70 hover:underline"
                to="/register"
              >
                Register
              </Link>
            </li>
          </ol>

          <div className="w-full flex flex-col gap-3 text-black text-[18px] leading-tight tracking-tight sm:text-[20px] lg:text-[24px] lg:gap-7.5">
            <span>Hosted by the crew</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
