'use client';

import { useEffect, useState } from 'react';

const LETTERS = ['C', 'R', 'A', 'T', 'E'] as const;
const TOTAL_DURATION = 2000;
const FADE_OUT_DURATION = 400;
const FAILSAFE_BUFFER = 500;

const letterOffsets = [
  { x: -30, y: -40, r: -15 },
  { x: 25, y: -20, r: 12 },
  { x: -20, y: 10, r: -8 },
  { x: 15, y: 30, r: 10 },
  { x: -10, y: 50, r: -6 },
];

type Phase = 'square' | 'glitch' | 'resolve' | 'fadeOut';

export function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('square');

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const t = setTimeout(onComplete, 200);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase('glitch'), 600);
    const t2 = setTimeout(() => setPhase('resolve'), 1000);
    const t3 = setTimeout(() => setPhase('fadeOut'), TOTAL_DURATION);
    const t4 = setTimeout(onComplete, TOTAL_DURATION + FADE_OUT_DURATION);
    const failsafe = setTimeout(onComplete, TOTAL_DURATION + FADE_OUT_DURATION + FAILSAFE_BUFFER);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(failsafe);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      style={{
        opacity: phase === 'fadeOut' ? 0 : 1,
        transition: `opacity ${FADE_OUT_DURATION}ms ease-out`,
      }}
    >
      <div className="relative flex flex-col items-center justify-center">
        <div
          className={`absolute h-12 w-12 bg-gray-900 transition-all ${
            phase === 'square'
              ? 'intro-square scale-100 opacity-100'
              : 'scale-150 opacity-0'
          }`}
          style={{
            transitionDuration: phase === 'square' ? '600ms' : '300ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        <div
          className="flex flex-col items-center"
          style={{
            opacity: phase === 'square' ? 0 : 1,
            transition: 'opacity 200ms ease-in',
          }}
        >
          {LETTERS.map((letter, i) => {
            const offset = letterOffsets[i];
            const isGlitch = phase === 'glitch';
            const isResolved = phase === 'resolve' || phase === 'fadeOut';

            return (
              <span
                key={letter}
                className="block text-center font-sans text-6xl font-bold leading-tight text-gray-900"
                style={{
                  transform: isGlitch
                    ? `translate(${offset.x}px, ${offset.y}px) rotate(${offset.r}deg)`
                    : 'translate(0, 0) rotate(0deg)',
                  opacity: isResolved ? 1 : isGlitch ? 0.85 : 0,
                  transition: `transform ${400 + i * 50}ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-in`,
                  transitionDelay: isResolved ? `${i * 40}ms` : '0ms',
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
