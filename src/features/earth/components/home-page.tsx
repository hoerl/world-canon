'use client';

import { EarthFeed } from '@/features/earth/components/earth-feed';
import { EarthSphere } from '@/features/earth/components/earth-sphere';
import { EarthCanon } from '@/features/earth/earth-service';
import { AppBottomBar } from '@/features/ui/app-bottom-bar';
import { BrandIntro } from '@/features/ui/brand-intro';
import { LandingPage } from '@/features/ui/landing-page';
import { SafeAreaView, Typography } from '@worldcoin/mini-apps-ui-kit-react';
import { useCallback, useState } from 'react';

const INTRO_KEY = 'crate.intro.played';

export function HomePage({
  earth,
  session,
}: {
  earth: EarthCanon;
  session: {
    username: string | null;
  } | null;
}) {
  const [introDone, setIntroDone] = useState(() =>
    typeof window === 'undefined' ? true : sessionStorage.getItem(INTRO_KEY) === '1'
  );

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, '1');
    setIntroDone(true);
  }, []);

  if (!session) {
    return <LandingPage />;
  }

  if (!introDone) {
    return <BrandIntro onComplete={handleIntroComplete} />;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="animate-fadeIn fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <div className="flex flex-col items-center px-6 pt-16">
          <Typography as="h1" variant="heading" level={1} className="text-center">
            Taste of Humanity
          </Typography>
          <Typography variant="body" level={3} className="text-gray-400">
            Connected
          </Typography>

          <EarthSphere earth={earth} />
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-background to-transparent" />
          <main className="h-full overflow-y-auto" style={{ overscrollBehaviorY: 'auto' }}>
            <EarthFeed earth={earth} />
          </main>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-background to-transparent" />
        </div>

        <AppBottomBar />
      </div>
    </SafeAreaView>
  );
}
