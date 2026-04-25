'use client';

import { AuthButton } from '@/features/auth/components/auth-button';
import { SafeAreaView, Typography } from '@worldcoin/mini-apps-ui-kit-react';

export function LandingPage() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-white">
      <div className="mx-auto flex h-full max-w-xl flex-col px-6">
        <div className="flex-1 overflow-y-auto pt-10">
          <div className="mb-4 h-10 w-10 bg-gray-900" />

          <Typography as="h1" variant="display" level={1} className="mb-10">
            Real{'\n'}Human{'\n'}Curation
          </Typography>

          <div className="space-y-5">
            <ValueProp
              number="①"
              text={<>Fill your <strong>Crate</strong> with People, Places, and Things that inspire you</>}
            />
            <ValueProp
              number="②"
              text={<><strong>Deploy your Crate</strong> on the Agentic Web.</>}
            />
            <ValueProp
              number="③"
              text={<><strong>Share your Crate</strong> with Others on World Chat.</>}
            />
          </div>
        </div>

        <div className="flex-none pb-6 pt-4">
          <div className="flex justify-center">
            <AuthButton isAuthenticated={false} username={null} />
          </div>
        </div>
      </div>
    </SafeAreaView>
  );
}

function ValueProp({ number, text }: { number: string; text: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-sm text-gray-400">{number}</span>
      <Typography variant="body" level={2} className="text-gray-700">
        {text}
      </Typography>
    </div>
  );
}
