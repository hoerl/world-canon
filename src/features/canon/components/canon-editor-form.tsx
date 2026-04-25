'use client';

import { CanonCategory, CanonSelection } from '@/features/canon/domain';
import {
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (value: CanonSelection) => Promise<void>;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CanonEditorForm({
  category,
  open,
  onOpenChange,
  onSave,
}: CanonEditorFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [rationale, setRationale] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setRationale('');
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-xl rounded-t-3xl bg-white px-6 pb-6">
        <DrawerHeader>
          <DrawerTitle>
            Your {category}
          </DrawerTitle>
        </DrawerHeader>
        <Form.Root
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSaving(true);
            try {
              await onSave({ title, rationale });
              toast.success({ title: `${capitalize(category)} saved.` });
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
          <div className="space-y-4">
            <Input
              label="Title"
              variant="floating-label"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <TextArea
              label="One-sentence rationale"
              variant="floating-label"
              rows={3}
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
            />
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              fullWidth
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </Form.Root>
      </DrawerContent>
    </Drawer>
  );
}
