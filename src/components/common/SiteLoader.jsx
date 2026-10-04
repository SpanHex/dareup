import React, { useState, useEffect } from 'react';

export const SiteLoader = () => {
  const [progress, setProgress] = useState(10);
  const [status, setStatus] = useState('INITIALIZING...');
  const [isFading, setIsFading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let current = 10;
    let target = 35;
    setStatus('FONTS READY');

    const interval = setInterval(() => {
      current += (target - current) * 0.25;
      if (current >= 30 && target === 35) {
        target = 85;
        setStatus('LOADING EVENT DATA');
      } else if (current >= 80 && target === 85) {
        target = 100;
        setStatus('ALL ASSETS READY');
      } else if (current >= 99 && target === 100) {
        current = 100;
        setProgress(100);
        setStatus('READY');
        clearInterval(interval);

        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            setIsFinished(true);
          }, 600);
        }, 200);
      }
      setProgress(Math.min(100, Math.round(current)));
    }, 40);

    return () => clearInterval(interval);
  }, []);

  if (isFinished) return null;

  return (
    <div
      id="site-loader"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFading ? 'none' : 'auto',
        opacity: isFading ? 0 : 1,
        transform: isFading ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '90vw' }}>
        <div
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 'clamp(1.2rem, 3.5vw, 2.2rem)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#ffffff',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(255,255,255,0.2)',
          }}
        >
          DAREDOWN
        </div>
        <div
          style={{
            width: 'clamp(220px, 40vw, 360px)',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            id="loader-progress-bar"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #c78a56, #e2c275, #ffffff)',
              borderRadius: '999px',
              transition: 'width 0.15s ease-out',
              boxShadow: '0 0 12px rgba(226, 194, 117, 0.6)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: 'clamp(220px, 40vw, 360px)',
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <span id="loader-status-text">{status}</span>
          <span id="loader-percent-text">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
