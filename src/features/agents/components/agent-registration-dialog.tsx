'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@worldcoin/mini-apps-ui-kit-react';

type AgentRegistrationDialogProps = {
  open: boolean;
  mode: 'register' | 'rotate';
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
};

export function AgentRegistrationDialog({
  open,
  mode,
  onOpenChange,
  onConfirm,
  isLoading,
}: AgentRegistrationDialogProps) {
  const title = mode === 'register' ? 'Provision Canon-Agent?' : 'Rotate Canon-Agent?';
  const description =
    mode === 'register'
      ? 'Canon will create a managed wallet for your Canon-Agent and check its AgentBook registration state.'
      : 'Rotation revokes the current active Canon-Agent and provisions a new managed wallet.';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-t-[32px] bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button fullWidth variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button fullWidth disabled={isLoading} onClick={onConfirm}>
            {isLoading
              ? 'Working…'
              : mode === 'register'
                ? 'Provision agent'
                : 'Rotate agent'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
