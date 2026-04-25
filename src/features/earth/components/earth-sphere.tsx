'use client';

import { useRef, useState, useCallback } from 'react';

export function EarthSphere() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    ref.current?.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => ({
      x: prev.x + dx * 0.4,
      y: prev.y + dy * 0.4,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const cx = 50 + offset.x * 0.15;
  const cy = 40 + offset.y * 0.15;
  const hue = ((offset.x + offset.y) * 0.5) % 360;

  return (
    <div className="flex justify-center py-8">
      <div
        ref={ref}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative h-48 w-48 cursor-grab touch-none select-none rounded-full active:cursor-grabbing"
        style={{
          background: `
            radial-gradient(circle at ${cx}% ${cy}%,
              hsla(${hue + 280}, 60%, 88%, 1) 0%,
              hsla(${hue + 200}, 50%, 82%, 0.8) 25%,
              hsla(${hue + 150}, 40%, 78%, 0.6) 50%,
              hsla(${hue + 100}, 35%, 72%, 0.4) 70%,
              hsla(${hue + 50}, 30%, 65%, 0.3) 90%,
              hsla(${hue}, 25%, 60%, 0.2) 100%
            )
          `,
          boxShadow: `
            inset -12px -12px 24px rgba(0,0,0,0.05),
            inset 8px 8px 16px rgba(255,255,255,0.4),
            0 8px 32px rgba(0,0,0,0.08)
          `,
          transition: dragging.current ? 'none' : 'background 0.3s ease-out',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at ${cx + 5}% ${cy - 5}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  );
}
