'use client';

import { useAddToCrate } from '@/features/canon/add-to-crate-context';
import Link from 'next/link';

export function BottomNav() {
  const { open } = useAddToCrate();

  return (
    <nav className="flex-none px-6 pb-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled
          className="flex h-10 w-10 items-center justify-center text-gray-300"
          aria-label="Search"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5 18 18" />
          </svg>
        </button>

        <button
          type="button"
          onClick={open}
          className="min-h-[44px] rounded-full bg-gray-900 px-8 py-3 text-base font-medium text-white active:scale-[0.97] transition-transform"
        >
          Add to Crate
        </button>

        <Link
          href="/me"
          className="flex h-10 w-10 items-center justify-center text-gray-500"
          aria-label="My Crate"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="7" r="4" />
            <path d="M2 19c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
