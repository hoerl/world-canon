'use client';

import { AuthButton } from '@/features/auth/components/auth-button';
import { EarthCategoryList } from '@/features/earth/components/earth-category-list';
import { EarthCanon } from '@/features/earth/earth-service';
import { AppShell } from '@/features/ui/app-shell';
import { LandingPage } from '@/features/ui/landing-page';
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
  if (!session) {
    return <LandingPage earth={earth} />;
  }

  return (
    <AppShell title="Earth" subtitle="What humanity chooses, together.">
      <div className="space-y-8">
        <EarthCategoryList earth={earth} />

        <section className="rounded-3xl border border-gray-200 bg-white p-5">
          <Typography variant="subtitle" level={2} className="mb-1">
            Your Canon
          </Typography>
          <Typography variant="body" level={3} className="mb-4 text-gray-500">
            Shape the rankings. Publish your Person, Place, and Thing.
          </Typography>
          <AuthButton isAuthenticated username={session.username} />
        </section>
      </div>
    </AppShell>
  );
}
