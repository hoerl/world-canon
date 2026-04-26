'use client';

import { TwinMatch } from '@/features/twins/domain';
import { TwinCard } from '@/features/twins/components/twin-card';
import { AppBottomBar } from '@/features/ui/app-bottom-bar';
import { Button, SafeAreaView, TopBar, Typography } from '@worldcoin/mini-apps-ui-kit-react';
import { Xmark } from '@worldcoin/mini-apps-ui-kit-react/icons';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAddToCrate } from '@/features/canon/add-to-crate-context';

type TwinsPageProps = {
  session: {
    username: string | null;
    worldSessionId: string | null;
  } | null;
  mySlug: string | null;
  hasCrate: boolean;
};

export function TwinsPage({ session, mySlug, hasCrate }: TwinsPageProps) {
  const [twins, setTwins] = useState<TwinMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { open: openAddDrawer } = useAddToCrate();

  const fetchTwins = useCallback(async () => {
    if (!session?.worldSessionId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/twins');
      if (!res.ok) return;
      const data = (await res.json()) as { twins: TwinMatch[] };
      setTwins(data.twins);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [session?.worldSessionId]);

  useEffect(() => {
    if (hasCrate) {
      fetchTwins();
    } else {
      setLoaded(true);
    }
  }, [hasCrate, fetchTwins]);

  if (!session) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
        <div className="flex h-full flex-col items-center justify-center px-6">
          <Typography variant="body" level={2} className="text-gray-500">
            Sign in to find your taste twins.
          </Typography>
        </div>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="animate-fadeIn fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <TopBar
          title="Taste Twins"
          startAdornment={
            <Link href="/" aria-label="Back">
              <Xmark className="h-5 w-5" />
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto px-6">
          {loading && !loaded && (
            <div className="flex flex-col items-center pt-20">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
              <Typography variant="body" level={2} className="text-gray-400">
                Finding your taste twins...
              </Typography>
            </div>
          )}

          {loaded && !hasCrate && (
            <div className="flex flex-col items-center pt-20 text-center">
              <Typography variant="heading" level={3} className="mb-2">
                Fill your Crate first
              </Typography>
              <Typography variant="body" level={2} className="mb-6 text-gray-400">
                Add a Person, Place, and Thing to discover humans who share your taste.
              </Typography>
              <Button variant="primary" size="lg" onClick={openAddDrawer}>
                Add to Crate
              </Button>
            </div>
          )}

          {loaded && hasCrate && twins.length === 0 && !loading && (
            <div className="flex flex-col items-center pt-20 text-center">
              <Typography variant="heading" level={3} className="mb-2">
                No twins yet
              </Typography>
              <Typography variant="body" level={2} className="text-gray-400">
                As more humans fill their Crates, your taste twins will appear here.
              </Typography>
            </div>
          )}

          {loaded && twins.length > 0 && (
            <div className="space-y-3 pb-6 pt-2">
              {twins.map((twin, i) => (
                <div
                  key={twin.slug}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                >
                  <TwinCard twin={twin} mySlug={mySlug ?? ''} />
                </div>
              ))}
            </div>
          )}
        </main>

        <AppBottomBar />
      </div>
    </SafeAreaView>
  );
}
