'use client';

import { AppBottomBar } from '@/features/ui/app-bottom-bar';
import { SafeAreaView, TopBar, Typography } from '@worldcoin/mini-apps-ui-kit-react';
import { ReactNode } from 'react';

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  endAdornment?: ReactNode;
};

export function AppShell({ title, subtitle, children, endAdornment }: AppShellProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <TopBar title={title} endAdornment={endAdornment} />
        {subtitle ? (
          <Typography as="p" variant="body" level={3} className="px-6 text-gray-500">
            {subtitle}
          </Typography>
        ) : null}

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-8">{children}</main>

        <AppBottomBar />
      </div>
    </SafeAreaView>
  );
}
