'use client';

import { Button, Typography, VerificationBadge, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { CredentialRequest, IDKitSessionWidget, any, setDebug } from '@worldcoin/idkit';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

if (process.env.NEXT_PUBLIC_WORLD_ENV !== 'production') {
  setDebug(true);
}

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

function DevBindButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      fullWidth
      variant="tertiary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/dev/bind', { method: 'POST' });
          if (!response.ok) {
            const json = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(json?.error ?? 'Dev bind failed');
          }
          toast.success({ title: 'Dev bind complete — World ID skipped.' });
          router.refresh();
        } catch (error) {
          toast.error({ title: error instanceof Error ? error.message : 'Dev bind failed' });
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? 'Binding…' : 'Dev Bind (skip World ID)'}
    </Button>
  );
}

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
              Crate is bound to a verified human
            </Typography>
            <Typography variant="body" level={3} className="text-gray-500">
              One World ID session anchors your permanent Crate.
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
      console.log('[WorldID] RP context received', {
        rp_id: json.rp_id,
        nonce: json.nonce.slice(0, 12) + '…',
        created_at: json.created_at,
        expires_at: json.expires_at,
        ttl_seconds: json.expires_at - json.created_at,
        now: Math.floor(Date.now() / 1000),
      });
      setRpContext(json);
      setOpen(true);
    } catch (error) {
      console.error('[WorldID] startBinding failed', error);
      toast.error({ title: error instanceof Error ? error.message : 'Failed to bind World ID' });
    }
  };

  return (
    <>
      <div className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-4">
        <Typography variant="subtitle" level={2}>
          Bind your Crate to one verified human
        </Typography>
        <Typography variant="body" level={3} className="text-gray-500">
          Complete one World ID 4.0 session proof before you create or evolve your crate.
        </Typography>
        <Button fullWidth onClick={startBinding}>
          Bind with World ID 4.0
        </Button>
        {process.env.NEXT_PUBLIC_WORLD_ENV !== 'production' && <DevBindButton />}
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
            console.log('[WorldID] handleVerify called', {
              protocol_version: result.protocol_version,
              session_id: result.session_id,
              responses: result.responses.length,
              environment: result.environment,
            });
            const response = await fetch('/api/worldid/verify', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify(result),
            });

            if (!response.ok) {
              const json = (await response.json().catch(() => null)) as { error?: string } | null;
              console.error('[WorldID] Backend verification failed', {
                status: response.status,
                error: json,
              });
              throw new Error(json?.error ?? 'World ID verification failed');
            }
            console.log('[WorldID] Backend verification succeeded');
          }}
          onSuccess={async () => {
            toast.success({ title: 'Crate bound to your World ID.' });
            router.refresh();
          }}
          onError={(errorCode) => {
            console.error('[WorldID] IDKit onError', errorCode);
            toast.error({
              title: `World ID error: ${errorCode}. Check console for details.`,
            });
          }}
        />
      ) : null}
    </>
  );
}
