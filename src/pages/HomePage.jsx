import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { GenderSelectorModal } from '../components/common/GenderSelectorModal';
import { SiteLoader } from '../components/common/SiteLoader';
import { HeroWinnersSection } from '../components/home/HeroWinnersSection';
import { TournamentBracket } from '../components/home/TournamentBracket';
import { AboutSection } from '../components/home/AboutSection';
import { EventRoundsSection } from '../components/home/EventRoundsSection';
import { SpecialThanksSection } from '../components/home/SpecialThanksSection';
import { ApplicationModal } from '../components/modals/ApplicationModal';
import { VsScreenModal } from '../components/modals/VsScreenModal';

export const HomePage = () => {
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    const handleVsOpen = (e) => {
      const matchId = e.detail?.matchId;
      if (matchId) {
        setActiveMatchId(matchId);
      }
    };

    const checkModalQuery = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modal') === 'application') {
        setIsApplicationOpen(true);
      }
    };

    const handleModalOpenClick = (e) => {
      const opener = e.target.closest('[data-modal-open="application"]');
      if (opener) {
        e.preventDefault();
        setIsApplicationOpen(true);
      }
    };

    checkModalQuery();
    document.addEventListener('ngt:vs-open', handleVsOpen);
    document.addEventListener('click', handleModalOpenClick);

    // Initial hash scroll if present
    if (window.location.hash) {
      const targetId = window.location.hash.replace(/^#/, '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          const headerH = document.getElementById('site-header')?.getBoundingClientRect().height || 90;
          const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }, 300);
      }
    }

    return () => {
      document.removeEventListener('ngt:vs-open', handleVsOpen);
      document.removeEventListener('click', handleModalOpenClick);
    };
  }, []);

  return (
    <>
      <GenderSelectorModal />
      <SiteLoader />
      <Header />

      <main className="max-w-450 w-full mx-auto px-3">
        <div className="w-full h-full flex flex-col gap-50">
          <HeroWinnersSection />
          <TournamentBracket onSelectMatch={(id) => setActiveMatchId(id)} />
          <AboutSection />
          <EventRoundsSection />
          <SpecialThanksSection />
        </div>
      </main>

      <Footer />

      <ApplicationModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
      />

      <VsScreenModal
        matchId={activeMatchId}
        isOpen={!!activeMatchId}
        onClose={() => setActiveMatchId(null)}
      />
    </>
  );
};
