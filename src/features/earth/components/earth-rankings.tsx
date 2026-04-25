'use client';

import { EarthCanon } from '@/features/earth/earth-service';
import { Typography } from '@worldcoin/mini-apps-ui-kit-react';

const rowStyles = [
  'text-gray-900 font-semibold',
  'text-gray-400',
  'text-gray-300',
] as const;

const placeholders = [
  { person: 'Person A', place: 'Place A', thing: 'Thing A' },
  { person: 'Person B', place: 'Place B', thing: 'Thing B' },
  { person: 'Person C', place: 'Place C', thing: 'Thing C' },
];

export function EarthRankings({ earth }: { earth: EarthCanon }) {
  return (
    <div className="mt-2 space-y-2 text-center">
      {placeholders.map((fallback, i) => {
        const person = earth.person[i]?.title ?? fallback.person;
        const place = earth.place[i]?.title ?? fallback.place;
        const thing = earth.thing[i]?.title ?? fallback.thing;

        return (
          <Typography
            key={i}
            variant="body"
            level={2}
            className={rowStyles[i]}
          >
            <span>{person}</span>
            <span className="mx-2">{place}</span>
            <span>{thing}</span>
          </Typography>
        );
      })}
    </div>
  );
}
