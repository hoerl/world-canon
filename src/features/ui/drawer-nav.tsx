'use client';

import { Button, Typography } from '@worldcoin/mini-apps-ui-kit-react';
import { ArrowLeft, Xmark } from '@worldcoin/mini-apps-ui-kit-react/icons';

type DrawerNavProps = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
};

export function DrawerNav({ title, onClose, onBack }: DrawerNavProps) {
  return (
    <div className="mb-4 flex items-center">
      {onBack ? (
        <Button size="icon" variant="tertiary" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-10" />
      )}
      <Typography variant="label" level={1} className="flex-1 text-center text-gray-400">
        {title}
      </Typography>
      <Button size="icon" variant="tertiary" onClick={onClose} aria-label="Close">
        <Xmark className="h-4 w-4" />
      </Button>
    </div>
  );
}
