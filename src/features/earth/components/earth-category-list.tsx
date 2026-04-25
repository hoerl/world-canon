'use client';

import { EarthCanon } from '@/features/earth/earth-service';
import { Tabs, TabItem, ListItem, Typography } from '@worldcoin/mini-apps-ui-kit-react';
import { useMemo, useState } from 'react';

function CategoryDot() {
  return <span className="inline-block h-2 w-2 rounded-full bg-gray-900" />;
}

export function EarthCategoryList({ earth }: { earth: EarthCanon }) {
  const [selected, setSelected] = useState<'person' | 'place' | 'thing'>('person');
  const entries = useMemo(() => earth[selected], [earth, selected]);

  return (
    <div className="space-y-4">
      <Tabs value={selected} onValueChange={(value) => setSelected(value as typeof selected)}>
        <TabItem value="person" icon={<CategoryDot />} label="Person" />
        <TabItem value="place" icon={<CategoryDot />} label="Place" />
        <TabItem value="thing" icon={<CategoryDot />} label="Thing" />
      </Tabs>
      <div className="space-y-2">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <ListItem
              key={`${selected}-${entry.title}`}
              disabled
              label={entry.title}
              description={`${entry.votes} verified ${entry.votes === 1 ? 'human' : 'humans'}`}
              startAdornment={
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                  {index + 1}
                </span>
              }
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Typography variant="subtitle" level={2} className="mb-1">
              No entries yet
            </Typography>
            <Typography variant="body" level={3} className="text-gray-400">
              Be the first to publish your crate.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
