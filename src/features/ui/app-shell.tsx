'use client';

import { SafeAreaView, Typography } from '@worldcoin/mini-apps-ui-kit-react';
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
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <header className="flex-none px-6 pt-2 pb-1">
          <div className="flex items-center justify-between">
            <Typography as="h1" variant="heading" level={1}>
              {title}
            </Typography>
            {endAdornment}
          </div>
          {subtitle ? (
            <Typography as="p" variant="body" level={3} className="mt-1 text-gray-500">
              {subtitle}
            </Typography>
          ) : null}
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-8">{children}</main>

        <nav className="flex-none border-t border-gray-100 px-6">
          <div className="flex">
            <NavTab active={pathname === '/'} href="/">
              Earth
            </NavTab>
            <NavTab active={pathname === '/me'} href="/me">
              My Canon
            </NavTab>
          </div>
        </nav>
      </div>
    </SafeAreaView>
  );
}

function NavTab({
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
      className={`flex-1 py-3.5 text-center text-sm font-medium ${
        active ? 'text-gray-900' : 'text-gray-400'
      }`}
    >
      {children}
    </Link>
  );
}
