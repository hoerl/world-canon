'use client';

import { useAddToCrate } from '@/features/canon/add-to-crate-context';
import { CanonEvolutionRecord, CanonRecord, canonCategories } from '@/features/canon/domain';
import { FadingTextList } from '@/features/ui/fading-text-list';
import { buildWorldChatShareMessage } from '@/features/share/world-chat';
import { WorldIdSessionCard } from '@/features/worldid/components/world-id-session-card';
import {
  Button,
  Chip,
  Drawer,
  DrawerContent,
  ListItem,
  SafeAreaView,
  TopBar,
  Typography,
  VerificationBadge,
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

function dateSectionLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86_400_000);

  if (diffDays < 0) return 'Today';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  if (diffDays < 14) return 'Last Week';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} Weeks Ago`;

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'long' });
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

  if (!session.worldSessionId) {
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
          />
          <main className="flex-1 overflow-y-auto px-6">
            <div className="pt-8">
              <WorldIdSessionCard isBound={false} />
            </div>
          </main>
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
    <SafeAreaView edges={['top', 'bottom']} className="animate-fadeIn fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <TopBar
          title="My Crate"
          startAdornment={
            <Button size="icon" variant="tertiary" asChild>
              <Link href="/" aria-label="Close">
                <Xmark className="h-5 w-5" />
              </Link>
            </Button>
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

        <main className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="flex flex-col items-center pt-4">
            <div className="mb-5 h-52 w-52 rounded-2xl bg-gray-900" />

            <FadingTextList items={crateItems} align="center" />

            {(() => {
              const allTags = sortedCategories.flatMap((cat) => canon?.canon[cat]?.tags ?? []);
              if (allTags.length === 0) return null;
              return (
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {allTags.map((tag) => (
                    <Chip key={tag} label={tag} variant="default" />
                  ))}
                </div>
              );
            })()}

            <div className="mt-10 space-y-4 text-center">
              {canon && Object.values(canon.canon).some((slot) => slot !== null) && (
                <Link href="/twins" className="block w-full">
                  <Typography variant="body" level={2} className="text-gray-400">
                    Find Your Twins &gt;
                  </Typography>
                </Link>
              )}
              {evolutions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="block w-full"
                >
                  <Typography variant="body" level={2} className="text-gray-400">
                    View History &gt;
                  </Typography>
                </button>
              )}
              <button
                type="button"
                onClick={deployAgent}
                className="block w-full"
              >
                <Typography variant="body" level={2} className="text-gray-400">
                  Deploy Agent &gt;
                </Typography>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-gray-400">
              <VerificationBadge verified className="size-4" />
              <Typography variant="body" level={3} className="text-gray-400">
                Verified human
              </Typography>
            </div>
          </div>
        </main>

        <div className="flex-none px-6 pb-8">
          <Button variant="primary" size="lg" fullWidth onClick={openAddDrawer}>
            Add to Crate
          </Button>
        </div>
      </div>

      <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
        <DrawerContent className="mx-auto max-w-xl rounded-t-3xl bg-white pb-6">
          <TopBar
            title="History"
            startAdornment={null}
            endAdornment={
              <Button size="icon" variant="tertiary" onClick={() => setHistoryOpen(false)} aria-label="Close">
                <Xmark className="h-5 w-5" />
              </Button>
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 px-6 pb-6">
              {evolutions.map((evo, i) => {
                const section = dateSectionLabel(evo.evolved_at);
                const prev = i > 0 ? dateSectionLabel(evolutions[i - 1].evolved_at) : null;
                return (
                  <div key={`${evo.category}-${evo.evolved_at}-${i}`}>
                    {section !== prev && (
                      <Typography variant="label" level={2} className={`${i > 0 ? 'pt-4' : ''} pb-1 text-gray-400`}>
                        {section}
                      </Typography>
                    )}
                    <ListItem
                      label={evo.new_title}
                      description={evo.new_rationale}
                      endAdornment={<Chip label={evo.category.charAt(0).toUpperCase() + evo.category.slice(1)} variant="default" />}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
