'use client';

import { useAddToCrate } from '@/features/canon/add-to-crate-context';
import { BottomBar, Button } from '@worldcoin/mini-apps-ui-kit-react';
import { Group, User, UserSolid } from '@worldcoin/mini-apps-ui-kit-react/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppBottomBar() {
  const { open } = useAddToCrate();
  const pathname = usePathname();
  const isOnMe = pathname === '/me';
  const isOnTwins = pathname === '/twins';
  const ProfileIcon = isOnMe ? UserSolid : User;

  return (
    <BottomBar>
      <div className="flex items-center justify-between px-6 pb-5">
        <Link
          href="/twins"
          className={`flex h-10 w-10 items-center justify-center ${isOnTwins ? 'text-gray-900' : 'text-gray-500'}`}
          aria-label="Taste Twins"
        >
          <Group className="h-5 w-5" />
        </Link>

        <Button variant="primary" size="lg" onClick={open}>
          Add to Crate
        </Button>

        <Link
          href="/me"
          className="flex h-10 w-10 items-center justify-center text-gray-500"
          aria-label="My Crate"
        >
          <ProfileIcon className="h-5 w-5" />
        </Link>
      </div>
    </BottomBar>
  );
}
