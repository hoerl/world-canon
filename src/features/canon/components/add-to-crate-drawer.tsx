'use client';

import { useAddToCrate } from '@/features/canon/add-to-crate-context';
import { CanonCategory } from '@/features/canon/domain';
import { getTagsForCategory, MAX_TAGS_PER_SLOT } from '@/features/canon/tag-registry';
import { DrawerNav } from '@/features/ui/drawer-nav';
import {
  Button,
  Chip,
  Drawer,
  DrawerContent,
  Input,
  Typography,
  useHaptics,
  useToast,
} from '@worldcoin/mini-apps-ui-kit-react';
import { Airplane, Xmark } from '@worldcoin/mini-apps-ui-kit-react/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Step = 1 | 2 | 3 | 4;

const categoryLabels: Record<CanonCategory, string> = {
  person: 'Person',
  place: 'Place',
  thing: 'Thing',
};

const categoryQuestions: Record<CanonCategory, string> = {
  person: 'Who are they?',
  place: 'What place?',
  thing: 'What thing?',
};

function SendButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <Button
      size="icon"
      variant="tertiary"
      disabled={disabled}
      onClick={onClick}
      aria-label="Send"
      type="button"
    >
      <Airplane className="h-4 w-4" />
    </Button>
  );
}

export function AddToCrateDrawer() {
  const { isOpen, close } = useAddToCrate();
  const router = useRouter();
  const { toast } = useToast();
  const haptics = useHaptics();

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<CanonCategory | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [rationale, setRationale] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const rationaleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCategory(null);
      setTitle('');
      setTags([]);
      setRationale('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 2) setTimeout(() => titleRef.current?.focus(), 100);
    if (step === 4) setTimeout(() => rationaleRef.current?.focus(), 100);
  }, [step]);

  const goBack = () => {
    if (step === 4) { setStep(3); return; }
    if (step === 3) { setStep(2); return; }
    if (step === 2) { setStep(1); setCategory(null); setTitle(''); setTags([]); return; }
    close();
  };

  const selectCategory = (cat: CanonCategory) => {
    haptics.selection();
    setCategory(cat);
    setStep(2);
  };

  const submitTitle = () => {
    if (!title.trim()) return;
    haptics.impact('light');
    setStep(3);
  };

  const toggleTag = (tag: string) => {
    haptics.selection();
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const submitTags = () => {
    haptics.impact('light');
    setStep(4);
  };

  const submitRationale = async () => {
    if (!category || !title.trim() || !rationale.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/canon/${category}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), rationale: rationale.trim(), tags }),
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? 'Failed to save');
      }

      haptics.notification('success');
      toast.success({ title: 'Added to your crate.' });
      close();
      router.refresh();
    } catch (error) {
      haptics.notification('error');
      toast.error({ title: error instanceof Error ? error.message : 'Failed to save' });
    } finally {
      setIsSaving(false);
    }
  };

  const atTagLimit = tags.length >= MAX_TAGS_PER_SLOT;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DrawerContent className="mx-auto max-w-xl rounded-t-3xl bg-white px-6 pb-6">
        {step === 1 && (
          <div className="pt-4">
            <div className="mb-1 flex items-center justify-center">
              <Typography variant="subtitle" level={2} className="font-semibold">
                What Inspires You?
              </Typography>
              <Button
                size="icon"
                variant="tertiary"
                onClick={close}
                className="absolute right-6"
                aria-label="Close"
              >
                <Xmark className="h-4 w-4" />
              </Button>
            </div>
            <Typography variant="body" level={3} className="mb-6 text-center text-gray-400">
              Add to your Crate
            </Typography>
            <div className="space-y-3">
              {(['person', 'place', 'thing'] as const).map((cat) => (
                <Button
                  key={cat}
                  variant="tertiary"
                  size="lg"
                  fullWidth
                  onClick={() => selectCategory(cat)}
                >
                  {categoryLabels[cat]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && category && (
          <div className="pt-4">
            <DrawerNav title="What Inspires You" onBack={goBack} onClose={close} />
            <Typography variant="heading" level={2} className="mb-4">
              {categoryQuestions[category]}
            </Typography>
            <form onSubmit={(e) => { e.preventDefault(); submitTitle(); }}>
              <Input
                ref={titleRef}
                label={categoryLabels[category]}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                endAdornment={
                  <SendButton disabled={!title.trim()} onClick={submitTitle} />
                }
              />
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
            <Typography variant="heading" level={2} className="mb-2">
              Add tags
            </Typography>
            <Typography variant="body" level={3} className="mb-4 text-gray-400">
              Pick up to {MAX_TAGS_PER_SLOT} (optional)
            </Typography>
            <div className="mb-6 flex flex-wrap gap-2">
              {getTagsForCategory(category).map((tag) => {
                const selected = tags.includes(tag);
                const disabled = atTagLimit && !selected;
                return (
                  <div
                    key={tag}
                    onClick={disabled ? undefined : () => toggleTag(tag)}
                    className={disabled ? 'cursor-default opacity-40' : 'cursor-pointer'}
                  >
                    <Chip
                      label={tag}
                      variant={selected ? 'success' : 'default'}
                    />
                  </div>
                );
              })}
            </div>
            <Button fullWidth onClick={submitTags}>
              {tags.length > 0 ? `Continue with ${tags.length} tag${tags.length > 1 ? 's' : ''}` : 'Skip tags'}
            </Button>
          </div>
        )}

        {step === 4 && category && (
          <div className="pt-4">
            <DrawerNav title="What Inspires You" onBack={goBack} onClose={close} />
            <Typography variant="body" level={3} className="text-gray-400">
              {categoryQuestions[category]}
            </Typography>
            <Typography variant="body" level={2} className="mb-1 text-gray-500">
              {title}
            </Typography>
            {tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="success" />
                ))}
              </div>
            )}
            <Typography variant="heading" level={2} className="mb-4">
              Why do they matter to you?
            </Typography>
            <form onSubmit={(e) => { e.preventDefault(); submitRationale(); }}>
              <Input
                ref={rationaleRef}
                label="Your reason"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                endAdornment={
                  <SendButton
                    disabled={isSaving || !rationale.trim()}
                    onClick={submitRationale}
                  />
                }
              />
            </form>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
