'use client';

import { AgentStatusCard } from '@/features/agents/components/agent-status-card';
import { CanonEditorForm } from '@/features/canon/components/canon-editor-form';
import { CanonHistoryFeed } from '@/features/canon/components/canon-history-feed';
import { CanonProgressStepper } from '@/features/canon/components/canon-progress-stepper';
import { CanonSlotCard } from '@/features/canon/components/canon-slot-card';
import { CanonCategory, CanonEvolutionRecord, CanonRecord, canonCategories } from '@/features/canon/domain';
import { buildWorldChatShareMessage } from '@/features/share/world-chat';
import { AppShell } from '@/features/ui/app-shell';
import { WorldIdSessionCard } from '@/features/worldid/components/world-id-session-card';
import { Button, Typography, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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

export function MyCanonPage({ session, canon, evolutions, agent }: MyCanonPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<CanonCategory | null>(null);

  const nextMissingCategory = useMemo(() => {
    if (!canon) return 'person';
    return canonCategories.find((category) => canon.canon[category] === null) ?? null;
  }, [canon]);

  const isFullyBound = Boolean(session?.worldSessionId);
  const isCanonComplete =
    canon !== null && canonCategories.every((category) => canon.canon[category] !== null);

  const saveCategory = async (category: CanonCategory, value: { title: string; rationale: string }) => {
    const response = await fetch(`/api/canon/${category}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(value),
    });

    const json = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      throw new Error(json?.error ?? `Failed to save ${category}`);
    }
    router.refresh();
  };

  const shareCanon = async () => {
    if (!canon) return;
    if (!MiniKit.isInWorldApp()) {
      toast.error({ title: 'Open Canon in World App to share.' });
      return;
    }
    try {
      const publicUrl = `${window.location.origin}/u/${canon.slug}`;
      await MiniKit.chat({ message: buildWorldChatShareMessage(canon, publicUrl) });
    } catch (error) {
      toast.error({ title: error instanceof Error ? error.message : 'Share failed' });
    }
  };

  return (
    <AppShell
      title="My Canon"
      subtitle="One human, one evolving canon."
      endAdornment={
        isCanonComplete ? (
          <Button size="sm" variant="secondary" onClick={shareCanon}>
            Share
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {!session ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <Typography variant="subtitle" level={2} className="mb-1">
              Sign in first
            </Typography>
            <Typography variant="body" level={3} className="text-gray-500">
              Open Canon in World App and sign in to create your canon.
            </Typography>
          </div>
        ) : (
          <>
            <WorldIdSessionCard isBound={isFullyBound} />

            {isFullyBound && (
              <>
                <CanonProgressStepper nextCategory={nextMissingCategory} />

                <div className="space-y-3">
                  {canonCategories.map((category) => (
                    <CanonSlotCard
                      key={category}
                      category={category}
                      slot={canon?.canon[category] ?? null}
                      onEdit={() => setEditingCategory(category)}
                    />
                  ))}
                </div>

                {nextMissingCategory && (
                  <Button fullWidth onClick={() => setEditingCategory(nextMissingCategory)}>
                    {canon?.canon.person ? `Add ${nextMissingCategory}` : 'Start with person'}
                  </Button>
                )}

                <CanonHistoryFeed evolutions={evolutions} />

                {isCanonComplete && <AgentStatusCard agent={agent} />}
              </>
            )}
          </>
        )}
      </div>

      {editingCategory && (
        <CanonEditorForm
          category={editingCategory}
          open
          onOpenChange={(open) => { if (!open) setEditingCategory(null); }}
          onSave={(value) => saveCategory(editingCategory, value)}
        />
      )}
    </AppShell>
  );
}
