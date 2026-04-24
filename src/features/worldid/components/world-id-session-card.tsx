'use client';

import { Button, Typography, VerificationBadge, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { CredentialRequest, IDKitSessionWidget, any } from '@worldcoin/idkit';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type WorldIdSessionCardProps = {
  isBound: boolean;
};

type RpContext = {
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
};

export function WorldIdSessionCard({ isBound }: WorldIdSessionCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  if (isBound) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <VerificationBadge verified />
          <div>
            <Typography variant="subtitle" level={2}>
              Canon is bound to a verified human
            </Typography>
            <Typography variant="body" level={3} className="text-gray-500">
              One World ID session anchors your permanent Canon.
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  const startBinding = async () => {
    try {
      const response = await fetch('/api/worldid/rp-context', {
        method: 'POST',
      });
      const json = (await response.json()) as RpContext & { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? 'Failed to start World ID binding');
      }
      setRpContext(json);
      setOpen(true);
    } catch (error) {
      toast.error({ title: error instanceof Error ? error.message : 'Failed to bind World ID' });
    }
  };

  return (
    <>
      <div className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-4">
        <Typography variant="subtitle" level={2}>
          Bind your Canon to one verified human
        </Typography>
        <Typography variant="body" level={3} className="text-gray-600">
          Complete one World ID 4.0 session proof before you create or evolve your canon.
        </Typography>
        <Button fullWidth onClick={startBinding}>
          Bind with World ID 4.0
        </Button>
      </div>
      {rpContext ? (
        <IDKitSessionWidget
          open={open}
          onOpenChange={setOpen}
          app_id={(process.env.NEXT_PUBLIC_APP_ID ?? 'app_missing') as `app_${string}`}
          rp_context={rpContext}
          constraints={any(CredentialRequest('proof_of_human'))}
          environment={
            process.env.NEXT_PUBLIC_WORLD_ENV === 'production' ? 'production' : 'staging'
          }
          handleVerify={async (result) => {
            const response = await fetch('/api/worldid/verify', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify(result),
            });

            if (!response.ok) {
              const json = (await response.json().catch(() => null)) as { error?: string } | null;
              throw new Error(json?.error ?? 'World ID verification failed');
            }
          }}
          onSuccess={async () => {
            toast.success({ title: 'Canon bound to your World ID.' });
            router.refresh();
          }}
          onError={(errorCode) => {
            toast.error({ title: `World ID error: ${errorCode}` });
          }}
        />
      ) : null}
    </>
  );
}
