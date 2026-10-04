import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const GenderSelectorModal = () => {
  const { hasChosenTheme, selectTheme } = useTheme();
  const [hoverState, setHoverState] = useState('');
  const [isDismissing, setIsDismissing] = useState(false);

  if (hasChosenTheme && !isDismissing) {
    return null;
  }

  const handleSelect = (chosen) => {
    setIsDismissing(true);
    selectTheme(chosen);
  };

  return (
    <div
      id="gender-selector"
      role="dialog"
      aria-modal="true"
      aria-label="Visual Personality Selector"
      className={`${hoverState} ${isDismissing ? 'is-dismissed' : ''}`}
      style={{ display: 'flex' }}
    >
      <div className="selector-ambient-layer" />
      <div className="selector-bg-grid" />

      <div className="selector-container">
        <h1 className="selector-title">are you a boy or girl?</h1>

        <div className="selector-options">
          {/* BOY OPTION */}
          <button
            id="select-boy-btn"
            type="button"
            className="gender-card card-boy"
            aria-label="Boy"
            onMouseEnter={() => setHoverState('hover-boy')}
            onMouseLeave={() => setHoverState('')}
            onClick={() => handleSelect('boy')}
          >
            <span className="card-label">BOY</span>
          </button>

          {/* GIRL OPTION */}
          <button
            id="select-girl-btn"
            type="button"
            className="gender-card card-girl"
            aria-label="Girl"
            onMouseEnter={() => setHoverState('hover-girl')}
            onMouseLeave={() => setHoverState('')}
            onClick={() => handleSelect('girl')}
          >
            <span className="card-label">GIRL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
