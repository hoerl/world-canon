'use client';

import { Typography } from '@worldcoin/mini-apps-ui-kit-react';

const opacityClasses = [
  'text-gray-900 font-semibold',
  'text-gray-400',
  'text-gray-300',
] as const;

export function FadingTextList({
  items,
  align = 'center',
}: {
  items: (string | null)[];
  align?: 'center' | 'left';
}) {
  const filled = items.filter((item): item is string => item !== null);
  if (filled.length === 0) return null;

  return (
    <div className={`space-y-1 ${align === 'center' ? 'text-center' : ''}`}>
      {filled.map((item, i) => (
        <Typography
          key={`${item}-${i}`}
          variant="body"
          level={2}
          className={opacityClasses[i] ?? opacityClasses[opacityClasses.length - 1]}
        >
          {item}
        </Typography>
      ))}
    </div>
  );
}
