'use client';

import { CanonCategory, CanonSelection } from '@/features/canon/domain';
import {
  BottomBar,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Form,
  Input,
  TextArea,
  useToast,
} from '@worldcoin/mini-apps-ui-kit-react';
import { useEffect, useState } from 'react';

type CanonEditorFormProps = {
  category: CanonCategory;
  initialValue: CanonSelection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (value: CanonSelection) => Promise<void>;
};

export function CanonEditorForm({
  category,
  initialValue,
  open,
  onOpenChange,
  onSave,
}: CanonEditorFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [rationale, setRationale] = useState(initialValue?.rationale ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initialValue?.title ?? '');
      setRationale(initialValue?.rationale ?? '');
    }
  }, [initialValue, open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-xl rounded-t-[32px] bg-white px-4 pb-4">
        <DrawerHeader>
          <DrawerTitle>Evolve your {category}</DrawerTitle>
        </DrawerHeader>
        <Form.Root
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSaving(true);
            try {
              await onSave({
                title,
                rationale,
              });
              toast.success({ title: `${category} saved.` });
              onOpenChange(false);
            } catch (error) {
              toast.error({
                title: error instanceof Error ? error.message : `Failed to save ${category}`,
              });
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <Input
            label="Title"
            variant="floating-label"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextArea
            label="One-sentence rationale"
            variant="floating-label"
            rows={4}
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
          />
          <div className="pt-2">
            <BottomBar>
              <Button
                type="button"
                fullWidth
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" fullWidth disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Evolve taste'}
              </Button>
            </BottomBar>
          </div>
        </Form.Root>
      </DrawerContent>
    </Drawer>
  );
}
