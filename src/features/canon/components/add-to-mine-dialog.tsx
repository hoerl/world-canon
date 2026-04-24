'use client';

import { CanonCategory, CanonSelection } from '@/features/canon/domain';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  useToast,
} from '@worldcoin/mini-apps-ui-kit-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AddToMineDialogProps = {
  category: CanonCategory;
  slot: CanonSelection;
  enabled: boolean;
};

export function AddToMineDialog({ category, slot, enabled }: AddToMineDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!enabled) {
    return (
      <Button fullWidth variant="secondary" disabled>
        Sign in and bind World ID to add this to yours
      </Button>
    );
  }

  return (
    <>
      <Button fullWidth variant="secondary" onClick={() => setOpen(true)}>
        Add to mine
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-t-[32px] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your {category}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current {category} will be preserved in your evolution log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              fullWidth
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const response = await fetch(`/api/canon/${category}`, {
                    method: 'PUT',
                    headers: {
                      'content-type': 'application/json',
                    },
                    body: JSON.stringify(slot),
                  });
                  const json = (await response.json().catch(() => null)) as { error?: string } | null;
                  if (!response.ok) {
                    throw new Error(json?.error ?? 'Failed to add this pick to your canon');
                  }
                  toast.success({ title: `${category} added to your canon.` });
                  setOpen(false);
                  router.refresh();
                } catch (error) {
                  toast.error({
                    title:
                      error instanceof Error
                        ? error.message
                        : 'Failed to add this pick to your canon',
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isLoading ? 'Saving…' : 'Replace mine'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
