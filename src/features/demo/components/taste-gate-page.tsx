'use client';

import { Button, SafeAreaView, Typography, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { Xmark } from '@worldcoin/mini-apps-ui-kit-react/icons';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { TASTE_GATES } from '@/features/demo/lib/gates';

type GateVerdict = {
  verdict: 'in' | 'not_quite';
  headline: string;
  reasoning: string;
  highlights: string[];
  suggestion?: string;
};

type Status = 'idle' | 'streaming' | 'done' | 'error';

function parseVerdict(raw: string): GateVerdict | null {
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  const start = cleaned.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

export function TasteGatePage({ defaultSlug }: { defaultSlug: string | null }) {
  const [slug, setSlug] = useState(defaultSlug ?? '');
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [verdict, setVerdict] = useState<GateVerdict | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const canSubmit = slug.trim().length > 0 && status !== 'streaming';

  async function handleEvaluate(gateId: string) {
    if (!canSubmit) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedGate(gateId);
    setStatus('streaming');
    setVerdict(null);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({
        slug: slug.trim(),
        gate: gateId,
      });
      const res = await fetch(
        `/api/demo/taste-gate?${params.toString()}`,
        { signal: controller.signal },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }

      const parsed = parseVerdict(buffer);
      if (!parsed) {
        throw new Error('Failed to parse gate verdict');
      }

      setVerdict(parsed);
      setStatus('done');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(msg);
      setStatus('error');
      toast.error({ title: msg });
    }
  }

  function handleTryAnotherGate() {
    setSelectedGate(null);
    setVerdict(null);
    setStatus('idle');
  }

  function handleResetCrate() {
    setSlug('');
    setSelectedGate(null);
    setVerdict(null);
    setStatus('idle');
  }

  const isIn = verdict?.verdict === 'in';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <header className="flex-none px-6 pt-2 pb-1">
          <div className="flex items-center justify-between">
            <Typography as="h1" variant="heading" level={1}>
              Taste Gate
            </Typography>
            <Link href="/">
              <Button size="icon" variant="tertiary" aria-label="Close">
                <Xmark className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <Typography as="p" variant="body" level={3} className="mt-1 text-gray-500">
            Does your Crate open the door? Find out.
          </Typography>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-8">
          {/* Slug input */}
          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <Typography variant="body" level={3} className="mb-3 text-gray-500">
              Enter a Crate to evaluate
            </Typography>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. matt"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Gate selection or verdict */}
          {status !== 'done' && status !== 'streaming' && (
            <div className="mt-6">
              <Typography variant="heading" level={2} className="mb-4">
                Choose a gate
              </Typography>
              <div className="flex flex-col gap-3">
                {TASTE_GATES.map((gate) => (
                  <button
                    key={gate.id}
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => handleEvaluate(gate.id)}
                    className="rounded-3xl border border-gray-200 bg-white p-4 text-left transition-colors active:bg-gray-50 disabled:opacity-50"
                  >
                    <Typography variant="subtitle" level={2}>
                      {gate.name}
                    </Typography>
                    <Typography variant="body" level={3} className="mt-1 text-gray-500">
                      {gate.tagline}
                    </Typography>
                    <Typography variant="label" level={2} className="mt-2 text-gray-400">
                      {gate.criteria}
                    </Typography>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Streaming state */}
          {status === 'streaming' && (
            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                <Typography variant="body" level={3} className="text-gray-400">
                  Evaluating against {TASTE_GATES.find((g) => g.id === selectedGate)?.name ?? 'gate'}...
                </Typography>
              </div>
            </div>
          )}

          {/* Verdict */}
          {status === 'done' && verdict && (
            <div className="animate-in fade-in mt-6">
              <div
                className={`rounded-3xl border p-4 ${
                  isIn
                    ? 'border-success-700 bg-success-100'
                    : 'border-gray-200 bg-gray-0'
                }`}
              >
                {/* Verdict badge */}
                <Typography
                  variant="label"
                  level={1}
                  className={isIn ? 'text-success-700' : 'text-gray-400'}
                >
                  {isIn ? "You're in" : 'Not quite'}
                </Typography>

                {/* Headline */}
                <Typography variant="heading" level={2} className="mt-2">
                  {verdict.headline}
                </Typography>

                {/* Reasoning */}
                <Typography variant="body" level={2} className="mt-3">
                  {verdict.reasoning}
                </Typography>

                {/* Highlights */}
                {verdict.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {verdict.highlights.map((h, i) => (
                      <span
                        key={i}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          isIn
                            ? 'border-success-700 bg-white text-success-700'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggestion for not_quite */}
                {!isIn && verdict.suggestion && (
                  <Typography
                    variant="body"
                    level={3}
                    className="mt-3 text-gray-400 italic"
                  >
                    {verdict.suggestion}
                  </Typography>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleTryAnotherGate}
                >
                  Try Another Gate
                </Button>
                <Button
                  variant="tertiary"
                  fullWidth
                  onClick={handleResetCrate}
                >
                  Try Another Crate
                </Button>
              </div>
            </div>
          )}

          {/* Error state */}
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
