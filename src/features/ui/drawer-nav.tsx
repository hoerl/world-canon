'use client';

import { Typography } from '@worldcoin/mini-apps-ui-kit-react';

type DrawerNavProps = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
};

export function DrawerNav({ title, onClose, onBack }: DrawerNavProps) {
  return (
    <div className="mb-4 flex items-center">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center text-gray-500"
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2L4 8l6 6" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}
      <Typography variant="label" level={1} className="flex-1 text-center text-gray-400">
        {title}
      </Typography>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
        aria-label="Close"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M1 1l8 8M9 1L1 9" />
        </svg>
      </button>
    </div>
  );
}
