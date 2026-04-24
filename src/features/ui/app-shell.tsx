'use client';

import { BottomBar, SafeAreaView, TopBar, Typography } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  endAdornment?: ReactNode;
};

export function AppShell({ title, subtitle, children, endAdornment }: AppShellProps) {
  const pathname = usePathname();

  return (
    <SafeAreaView edges={['top', 'bottom']} className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-4">
        <TopBar title={title} endAdornment={endAdornment} />
        {subtitle ? (
          <Typography as="p" variant="body" level={3} className="mb-4 text-gray-500">
            {subtitle}
          </Typography>
        ) : null}
        <main className="flex-1 pb-6">{children}</main>
        <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-2">
          <BottomBar>
            <NavLink active={pathname === '/'} href="/">
              Earth
            </NavLink>
            <NavLink active={pathname === '/me'} href="/me">
              My Canon
            </NavLink>
          </BottomBar>
        </div>
      </div>
    </SafeAreaView>
  );
}

function NavLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 rounded-2xl px-4 py-3 text-center text-sm font-medium ${
        active ? 'bg-gray-900 text-white' : 'text-gray-600'
      }`}
    >
      {children}
    </Link>
  );
}
