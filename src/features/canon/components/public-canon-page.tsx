'use client';

import { PublicCanonPanel } from '@/features/canon/components/public-canon-panel';
import { CanonRecord } from '@/features/canon/domain';
import { buildWorldChatShareMessage } from '@/features/share/world-chat';
import { AppShell } from '@/features/ui/app-shell';
import { Button, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';

export function PublicCanonPage({
  canon,
  viewerCanAddToMine,
}: {
  canon: CanonRecord;
  viewerCanAddToMine: boolean;
}) {
  const { toast } = useToast();

  const shareCanon = async () => {
    if (!MiniKit.isInWorldApp()) {
      toast.error({ title: 'Open Crate in World App to share in World Chat.' });
      return;
    }

    try {
      const publicUrl = `${window.location.origin}/u/${canon.slug}`;
      await MiniKit.chat({
        message: buildWorldChatShareMessage(canon, publicUrl),
      });
    } catch (error) {
      toast.error({ title: error instanceof Error ? error.message : 'Share failed' });
    }
  };

  return (
    <AppShell
      title={canon.username ?? canon.slug}
      subtitle="A public portable canon."
      endAdornment={
        <Button size="sm" variant="secondary" onClick={shareCanon}>
          Share
        </Button>
      }
    >
      <PublicCanonPanel canon={canon} canAddToMine={viewerCanAddToMine} />
    </AppShell>
  );
}
