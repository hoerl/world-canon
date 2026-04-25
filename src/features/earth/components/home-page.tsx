'use client';

import { EarthRankings } from '@/features/earth/components/earth-rankings';
import { EarthSphere } from '@/features/earth/components/earth-sphere';
import { EarthCanon } from '@/features/earth/earth-service';
import { AppBottomBar } from '@/features/ui/app-bottom-bar';
import { LandingPage } from '@/features/ui/landing-page';
import { SafeAreaView, Typography } from '@worldcoin/mini-apps-ui-kit-react';

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
    return <LandingPage />;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <main className="flex-1 overflow-y-auto px-6">
          <div className="flex flex-col items-center pt-8">
            <Typography as="h1" variant="heading" level={1} className="text-center">
              Earth
            </Typography>
            <Typography variant="body" level={3} className="text-gray-400">
              Connected
            </Typography>

            <EarthSphere />
            <EarthRankings earth={earth} />
          </div>
        </main>

        <AppBottomBar />
      </div>
    </SafeAreaView>
  );
}
