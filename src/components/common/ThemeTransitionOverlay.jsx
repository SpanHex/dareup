import React from 'react';

const SPARKLE_CONFIG = [
  { angle: 0, distance: 75, size: 18, delay: 0, color: '#EB5E86' },
  { angle: 45, distance: 95, size: 14, delay: 40, color: '#FFD166' },
  { angle: 90, distance: 65, size: 20, delay: 20, color: '#FFAFCC' },
  { angle: 135, distance: 85, size: 16, delay: 60, color: '#FFFFFF' },
  { angle: 180, distance: 70, size: 15, delay: 30, color: '#EB5E86' },
  { angle: 225, distance: 90, size: 19, delay: 50, color: '#FFD166' },
  { angle: 270, distance: 60, size: 14, delay: 10, color: '#FFAFCC' },
  { angle: 315, distance: 100, size: 22, delay: 70, color: '#FFFFFF' },
];

export function ThemeTransitionOverlay({ transition }) {
  if (!transition || !transition.active) return null;

  const { toTheme, originX, originY, key } = transition;
  const isToGirl = toTheme === 'girl';

  return (
    <div
      key={key}
      className={`theme-transition-overlay ${isToGirl ? 'to-girl' : 'to-boy'}`}
      style={{
        '--origin-x': `${originX}px`,
        '--origin-y': `${originY}px`,
      }}
      aria-hidden="true"
    >
      {/* Expanding Primary Wave */}
      <div className="theme-transition-wave" />

      {/* Luminous Leading Pulse Ring */}
      <div className="theme-transition-ring" />

      {/* Sparkle Particle Burst */}
      {isToGirl && (
        <div className="theme-sparkles-container">
          {SPARKLE_CONFIG.map((s, idx) => {
            const rad = (s.angle * Math.PI) / 180;
            const targetX = Math.cos(rad) * s.distance;
            const targetY = Math.sin(rad) * s.distance;

            return (
              <span
                key={idx}
                className="theme-sparkle"
                style={{
                  '--tx': `${targetX}px`,
                  '--ty': `${targetY}px`,
                  '--size': `${s.size}px`,
                  '--delay': `${s.delay}ms`,
                  '--color': s.color,
                }}
              >
                <svg viewBox="0 0 24 24" width={s.size} height={s.size} fill={s.color}>
                  <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                </svg>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeTransitionOverlay;
