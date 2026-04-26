'use client';

import { Button, Input, SafeAreaView, Spinner, TopBar, Typography, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { Xmark } from '@worldcoin/mini-apps-ui-kit-react/icons';
import Link from 'next/link';
import { useRef, useState } from 'react';

type GiftItem = {
  name: string;
  description: string;
  priceRange: string;
  whyTheyLoveIt: string;
};

type Status = 'idle' | 'streaming' | 'done' | 'error';

function extractCompleteObjects(raw: string): { items: GiftItem[]; rest: string } {
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  const items: GiftItem[] = [];
  let rest = cleaned;

  while (true) {
    const start = rest.indexOf('{');
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = start; i < rest.length; i++) {
      const ch = rest[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
    }

    if (end === -1) break;

    try {
      items.push(JSON.parse(rest.slice(start, end + 1)));
    } catch {
      break;
    }
    rest = rest.slice(end + 1);
  }

  return { items, rest };
}

export function ShopperPage({ defaultSlug }: { defaultSlug: string | null }) {
  const [slug, setSlug] = useState(defaultSlug ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const canSubmit = slug.trim().length > 0 && status !== 'streaming';

  async function handleSubmit() {
    if (!canSubmit) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('streaming');
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({ slug: slug.trim() });
      for (const g of gifts) {
        params.append('exclude', g.name);
      }
      const res = await fetch(
        `/api/demo/shopper?${params.toString()}`,
        { signal: controller.signal },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let prevCount = 0;
      const existing = [...gifts];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const { items } = extractCompleteObjects(buffer);
        if (items.length > prevCount) {
          prevCount = items.length;
          setGifts([...existing, ...items]);
        }
      }

      setStatus('done');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(msg);
      setStatus('error');
      toast.error({ title: msg });
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <TopBar
          title="Gift Finder"
          endAdornment={
            <Button size="icon" variant="tertiary" asChild aria-label="Close">
              <Link href="/">
                <Xmark className="h-5 w-5" />
              </Link>
            </Button>
          }
        />
        <Typography as="p" variant="body" level={3} className="px-6 text-gray-500">
          AI-curated gifts based on a Crate&apos;s taste profile.
        </Typography>

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <Typography variant="body" level={3} className="mb-3 text-gray-500">
              Enter a WorldID to find the perfect gift
            </Typography>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  label="e.g. matt"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                variant="primary"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {status === 'streaming' ? 'Finding...' : 'Find Gifts'}
              </Button>
            </form>
          </div>

          {(status === 'streaming' || (status === 'done' && gifts.length > 0)) && (
            <div className="mt-6">
              <Typography variant="heading" level={2} className="mb-4">
                Gifts for {slug}
              </Typography>

              <div className="flex flex-col gap-4">
                {gifts.map((gift, i) => (
                  <div
                    key={i}
                    className="animate-in fade-in rounded-3xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between">
                      <Typography variant="subtitle" level={2}>
                        {gift.name}
                      </Typography>
                      <Typography
                        variant="label"
                        level={2}
                        className="ml-3 flex-none text-gray-400"
                      >
                        {gift.priceRange}
                      </Typography>
                    </div>
                    <Typography
                      variant="body"
                      level={3}
                      className="mt-2 text-gray-500"
                    >
                      {gift.description}
                    </Typography>
                    <Typography
                      variant="body"
                      level={3}
                      className="mt-2 text-gray-400 italic"
                    >
                      {gift.whyTheyLoveIt}
                    </Typography>
                  </div>
                ))}

                {status === 'streaming' && (
                  <div className="rounded-3xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Spinner />
                      <Typography variant="body" level={3} className="text-gray-400">
                        {gifts.length === 0 ? 'Curating gifts...' : 'Finding more...'}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>

              {status === 'done' && (
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-4"
                  onClick={handleSubmit}
                >
                  Find More Gifts
                </Button>
              )}
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <Typography variant="body" level={2} className="text-amber-800">
                {errorMessage}
              </Typography>
            </div>
          )}
        </main>
      </div>
    </SafeAreaView>
  );
}
