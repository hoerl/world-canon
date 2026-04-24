'use client';

import { AuthButton } from '@/features/auth/components/auth-button';
import { EarthCategoryList } from '@/features/earth/components/earth-category-list';
import { EarthCanon } from '@/features/earth/earth-service';
import { AppShell } from '@/features/ui/app-shell';
import { Typography } from '@worldcoin/mini-apps-ui-kit-react';

export function HomePage({
  earth,
  session,
}: {
  earth: EarthCanon;
  session: {
    username: string | null;
  } | null;
}) {
  return (
    <AppShell
      title="Canon"
      subtitle="A portable taste identity primitive for every verified human."
    >
      <div className="space-y-6">
        <section className="space-y-2 rounded-3xl border border-gray-200 bg-white p-4">
          <Typography variant="subtitle" level={2}>
            Earth&apos;s Canon
          </Typography>
          <Typography variant="body" level={3} className="text-gray-500">
            Humanity&apos;s current top Persons, Places, and Things.
          </Typography>
        </section>
        <EarthCategoryList earth={earth} />
        <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-4">
          <Typography variant="subtitle" level={2}>
            Start your Canon
          </Typography>
          <Typography variant="body" level={3} className="text-gray-500">
            Sign in with Wallet Auth, bind one World ID 4.0 session, and publish your Person,
            Place, and Thing.
          </Typography>
          <AuthButton isAuthenticated={Boolean(session)} username={session?.username ?? null} />
        </section>
      </div>
    </AppShell>
  );
}
