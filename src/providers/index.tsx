'use client';
import { AddToCrateProvider } from '@/features/canon/add-to-crate-context';
import { AddToCrateDrawer } from '@/features/canon/components/add-to-crate-drawer';
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { Toaster } from '@worldcoin/mini-apps-ui-kit-react';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const ErudaProvider = dynamic(
  () => import('@/providers/Eruda').then((c) => c.ErudaProvider),
  { ssr: false },
);

interface ClientProvidersProps {
  children: ReactNode;
}
export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErudaProvider>
      <MiniKitProvider props={{ appId: process.env.NEXT_PUBLIC_APP_ID }}>
        <AddToCrateProvider>
          {children}
          <AddToCrateDrawer />
        </AddToCrateProvider>
        <Toaster />
      </MiniKitProvider>
    </ErudaProvider>
  );
}
