'use client';

import { TwinMatch } from '@/features/twins/domain';
import { Button, Chip, Typography, useHaptics, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';

const categoryLabel: Record<string, string> = {
  person: 'Person',
  place: 'Place',
  thing: 'Thing',
};

export function TwinCard({ twin, mySlug }: { twin: TwinMatch; mySlug: string }) {
  const { toast } = useToast();
  const haptics = useHaptics();

  const sayHi = async () => {
    haptics.impact('light');

    if (!MiniKit.isInWorldApp()) {
      toast.error({ title: 'Open Crate in World App to chat.' });
      return;
    }

    const sharedPick = twin.overlaps[0];
    const publicUrl = `${window.location.origin}/u/${mySlug}`;
    const message =
      `We're taste twins on Crate! We both chose ${sharedPick.title}.\n` +
      `Check out my crate: ${publicUrl}`;

    try {
      await MiniKit.chat({ message });
    } catch {
      // World App shows its own native error toast
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Typography variant="subtitle" level={1}>
            {twin.username ?? twin.slug}
          </Typography>
          <Typography variant="body" level={3} className="mt-0.5 text-gray-400">
            @{twin.slug}
          </Typography>
        </div>
        <Button variant="tertiary" size="sm" onClick={sayHi}>
          Say Hi
        </Button>
      </div>

      <div className="mt-3 space-y-1.5">
        {twin.overlaps.map((overlap) => (
          <div key={`${overlap.category}-${overlap.title}`} className="flex items-center gap-2">
            <Chip label={categoryLabel[overlap.category]} variant="default" />
            <Typography variant="body" level={3} className="text-gray-600">
              You both chose <span className="font-medium text-gray-900">{overlap.title}</span>
            </Typography>
          </div>
        ))}
      </div>

      {twin.sharedTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {twin.sharedTags.map((tag) => (
            <Chip key={tag} label={tag} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}
