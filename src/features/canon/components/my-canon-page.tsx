'use client';

import { useAddToCrate } from '@/features/canon/add-to-crate-context';
import { CanonEvolutionRecord, CanonRecord, canonCategories } from '@/features/canon/domain';
import { DrawerNav } from '@/features/ui/drawer-nav';
import { FadingTextList } from '@/features/ui/fading-text-list';
import { buildWorldChatShareMessage } from '@/features/share/world-chat';
import {
  Button,
  Drawer,
  DrawerContent,
  SafeAreaView,
  TopBar,
  Typography,
  useToast,
} from '@worldcoin/mini-apps-ui-kit-react';
import { ShareIos, Xmark } from '@worldcoin/mini-apps-ui-kit-react/icons';
import { MiniKit } from '@worldcoin/minikit-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type MyCanonPageProps = {
  session:
    | {
        username: string | null;
        worldSessionId: string | null;
      }
    | null;
  canon: CanonRecord | null;
  evolutions: CanonEvolutionRecord[];
  agent:
    | {
        walletAddress: string;
        registrationStatus: string;
        lastAttestedAt: string | null;
      }
    | null;
};

function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

export function MyCanonPage({ session, canon, evolutions, agent }: MyCanonPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { open: openAddDrawer } = useAddToCrate();
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!session) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
        <div className="flex h-full flex-col items-center justify-center px-6">
          <Typography variant="body" level={2} className="text-gray-500">
            Sign in to view your crate.
          </Typography>
        </div>
      </SafeAreaView>
    );
  }

  const shareCanon = async () => {
    if (!canon) return;
    if (!MiniKit.isInWorldApp()) {
      toast.error({ title: 'Open Crate in World App to share.' });
      return;
    }
    try {
      const publicUrl = `${window.location.origin}/u/${canon.slug}`;
      await MiniKit.chat({ message: buildWorldChatShareMessage(canon, publicUrl) });
    } catch {
      // World App shows its own native error toast for chat failures —
      // suppress ours to avoid duplicate error UI (see IMG_8814).
    }
  };

  const deployAgent = async () => {
    if (!agent) {
      try {
        const response = await fetch('/api/agent/register', { method: 'POST' });
        if (!response.ok) {
          const json = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(json?.error ?? 'Deploy failed');
        }
        toast.success({ title: 'Crate-Agent deployed.' });
        router.refresh();
      } catch (error) {
        toast.error({ title: error instanceof Error ? error.message : 'Deploy failed' });
      }
    } else {
      toast.success({ title: `Agent status: ${agent.registrationStatus}` });
    }
  };

  const sortedCategories = [...canonCategories].sort((a, b) => {
    const aEvo = evolutions.find((e) => e.category === a);
    const bEvo = evolutions.find((e) => e.category === b);
    if (!aEvo && !bEvo) return 0;
    if (!aEvo) return 1;
    if (!bEvo) return -1;
    return new Date(bEvo.evolved_at).getTime() - new Date(aEvo.evolved_at).getTime();
  });
  const crateItems = sortedCategories.map((cat) => canon?.canon[cat]?.title ?? null);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <TopBar
          title="My Crate"
          startAdornment={
            <Link href="/" aria-label="Close">
              <Xmark className="h-5 w-5" />
            </Link>
          }
          endAdornment={
            <Button size="icon" variant="tertiary" onClick={shareCanon} aria-label="Share">
              <ShareIos className="h-5 w-5" />
            </Button>
          }
        />
        {canon && (
          <Typography variant="body" level={3} className="px-6 text-center text-gray-400">
            Last updated {formatRelativeTime(canon.updated_at)}
          </Typography>
        )}

        <main className="flex-1 overflow-y-auto px-6">
          <div className="flex flex-col items-center pt-4">
            <div className="mb-5 h-52 w-52 rounded-2xl bg-gray-900" />

            <FadingTextList items={crateItems} align="center" />

            <div className="mt-10 space-y-4 text-center">
              {evolutions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="block w-full text-base text-gray-400"
                >
                  View History &gt;
                </button>
              )}
              <button
                type="button"
                onClick={deployAgent}
                className="block w-full text-base text-gray-400"
              >
                Deploy Agent &gt;
              </button>
            </div>
          </div>
        </main>

        <div className="flex-none px-6 pb-8">
          <div className="flex justify-center">
            <Button variant="primary" size="lg" onClick={openAddDrawer}>
              Add to Crate
            </Button>
          </div>
        </div>
      </div>

      <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
        <DrawerContent className="mx-auto max-w-xl rounded-t-3xl bg-white px-6 pb-6">
          <div className="pt-4">
            <DrawerNav title="History" onClose={() => setHistoryOpen(false)} />
            <div className="space-y-4">
              {evolutions.map((evo, i) => (
                <div key={`${evo.category}-${evo.evolved_at}-${i}`} className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <Typography variant="label" level={2} className="shrink-0 uppercase text-gray-400">
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
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
