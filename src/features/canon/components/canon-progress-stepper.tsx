'use client';

import { CanonCategory } from '@/features/canon/domain';
import { Progress, Typography } from '@worldcoin/mini-apps-ui-kit-react';

const order: CanonCategory[] = ['person', 'place', 'thing'];

export function CanonProgressStepper({ nextCategory }: { nextCategory: CanonCategory | null }) {
  const completedCount = nextCategory ? order.indexOf(nextCategory) : order.length;
  const percentage = (completedCount / order.length) * 100;

  return (
    <div className="space-y-2 rounded-3xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <Typography variant="subtitle" level={2}>
          {nextCategory ? `Next: ${capitalize(nextCategory)}` : 'Canon complete'}
        </Typography>
        <Typography variant="body" level={4} className="text-gray-500">
          {completedCount}/{order.length}
        </Typography>
      </div>
      <Progress value={percentage} max={100} />
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
