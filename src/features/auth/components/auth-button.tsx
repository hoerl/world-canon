'use client';

import { CANON_SIGN_IN_STATEMENT } from '@/features/auth/constants';
import { Button, Typography, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AuthButtonProps = {
  isAuthenticated: boolean;
  username: string | null;
};

export function AuthButton({ isAuthenticated, username }: AuthButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!MiniKit.isInWorldApp()) {
      toast.error({ title: 'Open Canon inside World App to sign in.' });
      return;
    }

    try {
      const nonceResponse = await fetch('/api/auth/nonce');
      const nonceJson = (await nonceResponse.json()) as { nonce: string };

      const result = await MiniKit.walletAuth({
        nonce: nonceJson.nonce,
        statement: CANON_SIGN_IN_STATEMENT,
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      });

      await fetch('/api/auth/complete-siwe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          payload: result.data,
          profile: {
            username: MiniKit.user?.username ?? null,
            profilePictureUrl: MiniKit.user?.profilePictureUrl ?? null,
          },
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const json = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(json?.error ?? 'Wallet authentication failed');
        }
      });

      toast.success({ title: 'Signed in to Canon.' });
      router.refresh();
    } catch (error) {
      toast.error({
        title: error instanceof Error ? error.message : 'Wallet authentication failed',
      });
    }
  };

  if (isAuthenticated) {
    return (
      <div className="space-y-3">
        <Typography as="p" variant="body" level={3} className="text-gray-500">
          Signed in{username ? ` as ${username}` : ''}.
        </Typography>
        <Button asChild fullWidth>
          <Link href="/me">Open my canon</Link>
        </Button>
      </div>
    );
  }

  return (
    <Button fullWidth onClick={handleSignIn}>
      Sign in with Wallet Auth
    </Button>
  );
}
