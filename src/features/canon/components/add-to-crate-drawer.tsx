'use client';

import { useAddToCrate } from '@/features/canon/add-to-crate-context';
import { CanonCategory } from '@/features/canon/domain';
import { DrawerNav } from '@/features/ui/drawer-nav';
import {
  Button,
  Drawer,
  DrawerContent,
  Input,
  Typography,
  useToast,
} from '@worldcoin/mini-apps-ui-kit-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Step = 1 | 2 | 3;

const categoryQuestions: Record<CanonCategory, string> = {
  person: 'Who are they?',
  place: 'What place?',
  thing: 'What thing?',
};

export function AddToCrateDrawer() {
  const { isOpen, close } = useAddToCrate();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<CanonCategory | null>(null);
  const [title, setTitle] = useState('');
  const [rationale, setRationale] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const rationaleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCategory(null);
      setTitle('');
      setRationale('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 2) setTimeout(() => titleRef.current?.focus(), 100);
    if (step === 3) setTimeout(() => rationaleRef.current?.focus(), 100);
  }, [step]);

  const goBack = () => {
    if (step === 3) { setStep(2); return; }
    if (step === 2) { setStep(1); setCategory(null); setTitle(''); return; }
    close();
  };

  const selectCategory = (cat: CanonCategory) => {
    setCategory(cat);
    setStep(2);
  };

  const submitTitle = () => {
    if (!title.trim()) return;
    setStep(3);
  };

  const submitRationale = async () => {
    if (!category || !title.trim() || !rationale.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/canon/${category}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), rationale: rationale.trim() }),
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? 'Failed to save');
      }

      toast.success({ title: 'Added to your crate.' });
      close();
      router.refresh();
    } catch (error) {
      toast.error({ title: error instanceof Error ? error.message : 'Failed to save' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DrawerContent className="mx-auto max-w-xl rounded-t-3xl bg-white px-6 pb-6">
        {step === 1 && (
          <div className="pt-4">
            <div className="mb-1 flex items-center justify-center">
              <Typography variant="subtitle" level={2} className="font-semibold">
                What Inspires You?
              </Typography>
              <button
                type="button"
                onClick={close}
                className="absolute right-6 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400"
                aria-label="Close"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
            <Typography variant="body" level={3} className="mb-6 text-center text-gray-400">
              Add to your Crate
            </Typography>
            <div className="space-y-3">
              {(['person', 'place', 'thing'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  className="w-full rounded-2xl border border-gray-200 py-3.5 text-center text-base font-medium text-gray-900 transition-colors active:bg-gray-50"
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && category && (
          <div className="pt-4">
            <DrawerNav title="What Inspires You" onBack={goBack} onClose={close} />
            <Typography variant="heading" level={2} className="mb-6">
              {categoryQuestions[category]}
            </Typography>
            <form onSubmit={(e) => { e.preventDefault(); submitTitle(); }}>
              <Input
                ref={titleRef}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                variant="floating-label"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="mt-6">
                <Button type="submit" fullWidth disabled={!title.trim()}>
                  Next
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && category && (
          <div className="pt-4">
            <DrawerNav title="What Inspires You" onBack={goBack} onClose={close} />
            <Typography variant="body" level={3} className="text-gray-400">
              {categoryQuestions[category]}
            </Typography>
            <Typography variant="body" level={2} className="mb-4 text-gray-500">
              {title}
            </Typography>
            <Typography variant="heading" level={2} className="mb-6">
              Why do they matter to you?
            </Typography>
            <form onSubmit={(e) => { e.preventDefault(); submitRationale(); }}>
              <Input
                ref={rationaleRef}
                label="Your reason"
                variant="floating-label"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
              />
              <div className="mt-6">
                <Button type="submit" fullWidth disabled={isSaving || !rationale.trim()}>
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
