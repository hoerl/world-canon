'use client';

import { EarthCanon } from '@/features/earth/earth-service';
import { Tabs, TabItem, ListItem, Typography } from '@worldcoin/mini-apps-ui-kit-react';
import { useMemo, useState } from 'react';

export function EarthCategoryList({ earth }: { earth: EarthCanon }) {
  const [selected, setSelected] = useState<'person' | 'place' | 'thing'>('person');

  const entries = useMemo(() => earth[selected], [earth, selected]);

  return (
    <div className="space-y-4">
      <Tabs value={selected} onValueChange={(value) => setSelected(value as typeof selected)}>
        <TabItem value="person" icon={<TabBadge label="P" />} label="Person" />
        <TabItem value="place" icon={<TabBadge label="L" />} label="Place" />
        <TabItem value="thing" icon={<TabBadge label="T" />} label="Thing" />
      </Tabs>
      <div className="space-y-2">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <ListItem
              key={`${selected}-${entry.title}`}
              disabled
              label={entry.title}
              description={`${entry.votes} verified humans`}
              startAdornment={
                <Typography variant="number" level={5} className="w-6 text-center">
                  {index + 1}
                </Typography>
              }
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6">
            <Typography variant="subtitle" level={3}>
              Earth is still quiet.
            </Typography>
            <Typography variant="body" level={3} className="text-gray-500">
              The ranking will fill as verified humans publish their Canons.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700">
      {label}
    </span>
  );
}
