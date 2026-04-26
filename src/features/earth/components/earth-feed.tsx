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
      className="flex-1"
      style={{ overscrollBehaviorY: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <div>
        <div className="flex flex-col gap-2 px-6 py-2">
          {earth.map((entry, i) => (
            <ListItem
              key={`${entry.category}-${entry.title}-${i}`}
              label={entry.title}
              description={`${entry.votes} ${entry.votes === 1 ? 'vote' : 'votes'}`}
              startAdornment={
                <Typography variant="label" level={2} className="w-6 text-center text-gray-400">
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
