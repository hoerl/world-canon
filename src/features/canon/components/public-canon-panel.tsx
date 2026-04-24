'use client';

import { AddToMineDialog } from '@/features/canon/components/add-to-mine-dialog';
import { CanonSlotCard } from '@/features/canon/components/canon-slot-card';
import { CanonRecord, canonCategories } from '@/features/canon/domain';
import { Typography } from '@worldcoin/mini-apps-ui-kit-react';

export function PublicCanonPanel({
  canon,
  canAddToMine,
}: {
  canon: CanonRecord;
  canAddToMine: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gray-200 bg-white p-4">
        <Typography variant="subtitle" level={2}>
          {canon.username ?? canon.slug}
        </Typography>
        <Typography variant="body" level={3} className="text-gray-500">
          Evolved {canon.evolutions_count} times
        </Typography>
      </div>
      {canonCategories.map((category) => {
        const slot = canon.canon[category];
        if (!slot) {
          return null;
        }

        return (
          <div key={category} className="space-y-3">
            <CanonSlotCard category={category} slot={slot} />
            <AddToMineDialog category={category} slot={slot} enabled={canAddToMine} />
          </div>
        );
      })}
    </div>
  );
}
