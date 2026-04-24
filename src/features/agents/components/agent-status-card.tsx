'use client';

import { AgentRegistrationDialog } from '@/features/agents/components/agent-registration-dialog';
import { Button, Typography, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AgentStatusCardProps = {
  agent:
    | {
        walletAddress: string;
        registrationStatus: string;
        lastAttestedAt: string | null;
      }
    | null;
};

export function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [dialogMode, setDialogMode] = useState<'register' | 'rotate' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = async () => {
    if (!dialogMode) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        dialogMode === 'register' ? '/api/agent/register' : '/api/agent/rotate',
        {
          method: 'POST',
        },
      );

      const json = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(json?.error ?? 'Agent action failed');
      }

      toast.success({
        title: dialogMode === 'register' ? 'Canon-Agent provisioned.' : 'Canon-Agent rotated.',
      });
      setDialogMode(null);
      router.refresh();
    } catch (error) {
      toast.error({ title: error instanceof Error ? error.message : 'Agent action failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-4">
        <Typography variant="subtitle" level={2}>
          Canon-Agent
        </Typography>
        {agent ? (
          <>
            <Typography variant="body" level={3} className="text-gray-600">
              Wallet: {agent.walletAddress}
            </Typography>
            <Typography variant="body" level={3} className="text-gray-600">
              Status: {agent.registrationStatus}
            </Typography>
            <Typography variant="body" level={4} className="text-gray-500">
              {agent.lastAttestedAt
                ? `Last signed response: ${new Date(agent.lastAttestedAt).toLocaleString()}`
                : 'No signed canon response yet.'}
            </Typography>
            <Button fullWidth variant="secondary" onClick={() => setDialogMode('rotate')}>
              Rotate Canon-Agent
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body" level={3} className="text-gray-600">
              Provision a managed Canon-Agent wallet so your canon can be signed for the agentic
              web.
            </Typography>
            <Button fullWidth onClick={() => setDialogMode('register')}>
              Provision Canon-Agent
            </Button>
          </>
        )}
      </div>
      {dialogMode ? (
        <AgentRegistrationDialog
          open
          mode={dialogMode}
          isLoading={isLoading}
          onOpenChange={(open) => {
            if (!open) {
              setDialogMode(null);
            }
          }}
          onConfirm={confirm}
        />
      ) : null}
    </>
  );
}
