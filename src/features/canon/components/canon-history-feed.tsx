'use client';

import { CanonEvolutionRecord } from '@/features/canon/domain';
import { Typography } from '@worldcoin/mini-apps-ui-kit-react';

function formatRelativeTime(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

export function CanonHistoryFeed({
  evolutions,
}: {
  evolutions: CanonEvolutionRecord[];
}) {
  if (evolutions.length === 0) return null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4">
      <Typography variant="label" level={2} className="mb-3 uppercase text-gray-400">
        History
      </Typography>
      <div className="divide-y divide-gray-100">
        {evolutions.map((evo, i) => (
          <div key={`${evo.category}-${evo.evolved_at}-${i}`} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-baseline gap-2 min-w-0">
              <Typography variant="label" level={2} className="shrink-0 text-[10px] uppercase text-gray-400">
                {evo.category}
              </Typography>
              <Typography variant="body" level={2} className="truncate text-gray-900">
                {evo.new_title}
              </Typography>
            </div>
            <Typography variant="label" level={2} className="shrink-0 text-gray-400">
              {formatRelativeTime(evo.evolved_at)}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
