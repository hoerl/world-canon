'use client';

import { useRef, useMemo } from 'react';
import { EarthCanon } from '@/features/earth/earth-service';
import { LANDMASS_DOTS } from '@/features/earth/lib/landmass-dots';
import { precomputeCartesian } from '@/features/earth/lib/globe-math';
import { CategoryWeights } from '@/features/earth/lib/globe-renderer';
import { useGlobeInteraction } from '@/features/earth/lib/use-globe-interaction';

const SIZE = 192;

export function EarthSphere({ earth }: { earth?: EarthCanon }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cartesian = useMemo(() => precomputeCartesian(LANDMASS_DOTS), []);

  const weights = useMemo((): CategoryWeights | null => {
    if (!earth || earth.length === 0) return null;

    const totals = { person: 0, place: 0, thing: 0 };
    let total = 0;
    for (const e of earth) {
      totals[e.category] = (totals[e.category] ?? 0) + e.votes;
      total += e.votes;
    }

    if (total === 0) return null;

    return {
      person: totals.person / total,
      place: totals.place / total,
      thing: totals.thing / total,
    };
  }, [earth]);

  const { onPointerDown, onPointerMove, onPointerUp } = useGlobeInteraction(
    canvasRef,
    cartesian,
    weights,
    SIZE,
  );

  return (
    <div className="flex justify-center py-8">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="cursor-grab touch-none select-none active:cursor-grabbing"
        style={{
          width: SIZE,
          height: SIZE,
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.06))',
        }}
      />
    </div>
  );
}
