'use client';

import { AuthButton } from '@/features/auth/components/auth-button';
import {
  BulletList,
  BulletListItem,
  CircularIcon,
  SafeAreaView,
  Typography,
} from '@worldcoin/mini-apps-ui-kit-react';
import { Spark } from '@worldcoin/mini-apps-ui-kit-react/icons';

function SparkBullet() {
  return (
    <CircularIcon className="size-9 bg-gray-900">
      <Spark className="text-gray-0" />
    </CircularIcon>
  );
}

export function LandingPage() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-white">
      <div className="mx-auto flex h-full max-w-xl flex-col px-6">
        <div className="flex-1 overflow-y-auto pt-10">
          <div className="mb-4 h-10 w-10 rounded-lg bg-gray-900" />

          <Typography as="h1" variant="display" level={1} className="mb-10">
            <span className="block">Real</span>
            <span className="block">Human</span>
            <span className="block">Curation</span>
          </Typography>

          <BulletList>
            <BulletListItem bulletPoint={<SparkBullet />}>
              <Typography variant="body" level={2} className="text-gray-500">
                Fill your <strong>Crate</strong> with People, Places, and Things that inspire you
              </Typography>
            </BulletListItem>
            <BulletListItem bulletPoint={<SparkBullet />}>
              <Typography variant="body" level={2} className="text-gray-500">
                <strong>Deploy your Crate</strong> on the Agentic Web.
              </Typography>
            </BulletListItem>
            <BulletListItem bulletPoint={<SparkBullet />}>
              <Typography variant="body" level={2} className="text-gray-500">
                <strong>Share your Crate</strong> with Others on World Chat.
              </Typography>
            </BulletListItem>
          </BulletList>
        </div>

        <div className="flex-none pb-8 pt-4">
          <div className="flex justify-center">
            <AuthButton isAuthenticated={false} username={null} />
          </div>
        </div>
      </div>
    </SafeAreaView>
  );
}
