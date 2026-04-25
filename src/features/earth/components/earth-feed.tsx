'use client';

import { EarthCanon } from '@/features/earth/earth-service';
import { Chip, ListItem, Typography } from '@worldcoin/mini-apps-ui-kit-react';

const categoryLabel: Record<string, string> = {
  person: 'Person',
  place: 'Place',
  thing: 'Thing',
};

export function EarthFeed({ earth }: { earth: EarthCanon }) {
  if (earth.length === 0) {
    return (
      <div className="py-10 text-center">
        <Typography variant="body" level={3} className="text-gray-400">
          No inspiration yet. Be the first.
        </Typography>
      </div>
    );
  }

  return (
    <div
      className="mt-4 -mx-6 flex-1"
      style={{ overscrollBehaviorY: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-background to-transparent" />
        <div className="px-6">
          {earth.map((entry, i) => (
            <ListItem
              key={`${entry.category}-${entry.title}-${i}`}
              label={entry.title}
              description={`${entry.votes} ${entry.votes === 1 ? 'vote' : 'votes'}`}
              startAdornment={
                <Typography variant="label" level={2} className="w-6 text-center text-gray-300">
                  {i + 1}
                </Typography>
              }
              endAdornment={
                <Chip label={categoryLabel[entry.category]} variant="default" />
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
