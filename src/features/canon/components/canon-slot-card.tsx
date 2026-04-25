'use client';

import { CanonCategory, CanonSelection } from '@/features/canon/domain';
import { Button, Chip, ListItem, Typography } from '@worldcoin/mini-apps-ui-kit-react';

export function CanonSlotCard({
  category,
  slot,
  onEdit,
}: {
  category: CanonCategory;
  slot: CanonSelection | null;
  onEdit?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <Typography variant="label" level={2} className="uppercase text-gray-500">
          {category}
        </Typography>
        {onEdit ? (
          <Button size="sm" variant="secondary" onClick={onEdit}>
            {slot ? 'Change' : 'Add'}
          </Button>
        ) : null}
      </div>
      <ListItem
        disabled
        label={slot?.title ?? `No ${category} yet`}
        description={slot?.rationale ?? 'This slot is still empty.'}
      />
      {slot?.tags && slot.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-2 pb-2">
          {slot.tags.map((tag) => (
            <Chip key={tag} label={tag} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}
