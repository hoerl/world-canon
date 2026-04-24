'use client';

import { AuthButton } from '@/features/auth/components/auth-button';
import { EarthCanon } from '@/features/earth/earth-service';
import { SafeAreaView, Typography } from '@worldcoin/mini-apps-ui-kit-react';

export function LandingPage({ earth }: { earth: EarthCanon }) {
  const topPerson = earth.person[0];
  const topPlace = earth.place[0];
  const topThing = earth.thing[0];

  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col px-6">
        <div className="flex-1 overflow-y-auto pt-10">
          <Typography as="h1" variant="heading" level={1} className="mb-3">
            Canon
          </Typography>
          <Typography as="p" variant="body" level={2} className="max-w-[280px] text-gray-500">
            One person, one place, one thing. Your taste, verified and permanent.
          </Typography>

          <div className="mt-10 space-y-6">
            <ValueProp
              number="1"
              label="Choose"
              description="Pick the person, place, and thing that define your taste."
            />
            <ValueProp
              number="2"
              label="Verify"
              description="Anchor your canon to one verified human identity."
            />
            <ValueProp
              number="3"
              label="Shape Earth"
              description="Your choices join humanity's living ranking."
            />
          </div>
        </div>

        <div className="flex-none pb-6 pt-4">
          {topPerson && topPlace && topThing ? (
            <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <Typography variant="label" level={2} className="mb-2 text-gray-400">
                Earth's top choices right now
              </Typography>
              <div className="space-y-1">
                <EarthRow label="Person" value={topPerson.title} />
                <EarthRow label="Place" value={topPlace.title} />
                <EarthRow label="Thing" value={topThing.title} />
              </div>
            </div>
          ) : null}

          <AuthButton isAuthenticated={false} username={null} />
        </div>
      </div>
    </SafeAreaView>
  );
}

function ValueProp({
  number,
  label,
  description,
}: {
  number: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <Typography variant="body" level={2} className="mt-0.5 w-4 text-gray-300">
        {number}
      </Typography>
      <div>
        <Typography variant="subtitle" level={2}>
          {label}
        </Typography>
        <Typography variant="body" level={3} className="text-gray-500">
          {description}
        </Typography>
      </div>
    </div>
  );
}

function EarthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Typography variant="label" level={2} className="flex-none text-gray-400">
        {label}
      </Typography>
      <Typography variant="body" level={3} className="text-right">
        {value}
      </Typography>
    </div>
  );
}
