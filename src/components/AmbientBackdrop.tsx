import React from 'react';
import type { MoodVector } from '../types/cinema';

interface AmbientBackdropProps {
  mood: MoodVector;
  lightingTone: 'amber' | 'cyan' | 'crimson' | 'slate';
}

export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({ mood, lightingTone }) => {
  // Subtle GPU-friendly ambient color interpolation driven by tactile slider & AI tone
  const tensionFactor = mood.tension / 100;
  const atmosphereFactor = mood.atmosphere / 100;

  const primaryGlow =
    lightingTone === 'crimson'
      ? `rgba(180, 38, 62, ${0.14 + tensionFactor * 0.14})`
      : lightingTone === 'cyan'
      ? `rgba(42, 118, 148, ${0.14 + (1 - atmosphereFactor) * 0.12})`
      : lightingTone === 'slate'
      ? `rgba(148, 163, 184, ${0.1 + tensionFactor * 0.08})`
      : `rgba(212, 175, 55, ${0.12 + atmosphereFactor * 0.14})`;

  const secondaryGlow =
    atmosphereFactor > 0.55
      ? 'rgba(212, 175, 55, 0.09)'
      : 'rgba(56, 102, 138, 0.1)';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#070b14]"
    >
      {/* Primary upper-center atmospheric key light */}
      <div
        className="absolute -top-[28%] left-1/2 h-[72vh] w-[90vw] max-w-[1100px] -translate-x-1/2 rounded-full blur-[130px] transition-colors duration-700"
        style={{
          background: `radial-gradient(circle, ${primaryGlow} 0%, rgba(7, 11, 20, 0) 70%)`
        }}
      />

      {/* Secondary warm gold / obsidian rim diffusion */}
      <div
        className="absolute bottom-[-22%] right-[-10%] h-[58vh] w-[70vw] max-w-[800px] rounded-full blur-[140px] transition-colors duration-700"
        style={{
          background: `radial-gradient(circle, ${secondaryGlow} 0%, rgba(7, 11, 20, 0) 72%)`
        }}
      />

      {/* Subtle architectural vignette preserving #070b14 contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 50% 42%, transparent 25%, rgba(7, 11, 20, 0.78) 100%)'
        }}
      />
    </div>
  );
};
