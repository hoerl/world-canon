'use client';

import { useAddToCrate } from '@/features/canon/add-to-crate-context';
import { CanonEvolutionRecord, CanonRecord, canonCategories } from '@/features/canon/domain';
import { DrawerNav } from '@/features/ui/drawer-nav';
import { FadingTextList } from '@/features/ui/fading-text-list';
import { buildWorldChatShareMessage } from '@/features/share/world-chat';
import {
  Drawer,
  DrawerContent,
  SafeAreaView,
  Typography,
  useToast,
} from '@worldcoin/mini-apps-ui-kit-react';
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
    } catch (error) {
      toast.error({ title: error instanceof Error ? error.message : 'Share failed' });
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
        <header className="flex-none px-6 pt-4 pb-2">
          <div className="flex items-center">
            <Link href="/" className="flex h-10 w-10 items-center justify-center text-gray-900" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </Link>
            <div className="flex-1 text-center">
              <Typography variant="heading" level={1}>
                My Crate
              </Typography>
            </div>
            <button
              type="button"
              onClick={shareCanon}
              className="flex h-10 w-10 items-center justify-center text-gray-500"
              aria-label="Share"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 7l-7-6-7 6" />
                <path d="M10 1v12" />
                <path d="M4 11v6a1 1 0 001 1h10a1 1 0 001-1v-6" />
              </svg>
            </button>
          </div>
          {canon && (
            <Typography variant="body" level={3} className="mt-1 text-center text-gray-400">
              Last updated {formatRelativeTime(canon.updated_at)}
            </Typography>
          )}
        </header>

        <main className="flex-1 overflow-y-auto px-6">
          <div className="flex flex-col items-center pt-4">
            <div className="mb-6 h-52 w-52 rounded-lg bg-gray-900" />

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

        <div className="flex-none px-6 pb-6">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={openAddDrawer}
              className="min-h-[44px] rounded-full bg-gray-900 px-8 py-3 text-base font-medium text-white active:scale-[0.97] transition-transform"
            >
              Add to Crate
            </button>
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
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
