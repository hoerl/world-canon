'use client';

import { Button, SafeAreaView, Typography, useToast } from '@worldcoin/mini-apps-ui-kit-react';
import { Xmark } from '@worldcoin/mini-apps-ui-kit-react/icons';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { SAMPLE_QUESTIONS } from '@/features/demo/lib/proxy-questions';

type ProxyResponse = {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  crateReferences: string[];
};

type Status = 'idle' | 'streaming' | 'done' | 'error';

function parseProxyResponse(raw: string): ProxyResponse | null {
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

const CONFIDENCE_LABELS: Record<ProxyResponse['confidence'], string> = {
  high: 'High confidence',
  medium: 'Inferring from trajectory',
  low: 'Limited signal',
};

export function TasteProxyPage({ defaultSlug }: { defaultSlug: string | null }) {
  const [slug, setSlug] = useState(defaultSlug ?? '');
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [response, setResponse] = useState<ProxyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const questionRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();

  const canSubmit =
    slug.trim().length > 0 &&
    question.trim().length > 0 &&
    status !== 'streaming';

  async function handleSubmit() {
    if (!canSubmit) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('streaming');
    setResponse(null);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({
        slug: slug.trim(),
        question: question.trim(),
      });
      const res = await fetch(
        `/api/demo/taste-proxy?${params.toString()}`,
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

      const parsed = parseProxyResponse(buffer);
      if (!parsed) {
        throw new Error('Failed to parse proxy response');
      }

      setResponse(parsed);
      setStatus('done');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(msg);
      setStatus('error');
      toast.error({ title: msg });
    }
  }

  function handleAskAnother() {
    setQuestion('');
    setResponse(null);
    setStatus('idle');
    setTimeout(() => questionRef.current?.focus(), 0);
  }

  function handleResetCrate() {
    setSlug('');
    setQuestion('');
    setResponse(null);
    setStatus('idle');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <header className="flex-none px-6 pt-2 pb-1">
          <div className="flex items-center justify-between">
            <Typography as="h1" variant="heading" level={1}>
              Taste Proxy
            </Typography>
            <Link href="/">
              <Button size="icon" variant="tertiary" aria-label="Close">
                <Xmark className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <Typography as="p" variant="body" level={3} className="mt-1 text-gray-500">
            Ask anything about someone&apos;s taste. The proxy answers from their Crate.
          </Typography>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-8">
          {/* Slug input */}
          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <Typography variant="body" level={3} className="mb-3 text-gray-500">
              Whose taste are you asking about?
            </Typography>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. matt"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Question input */}
          <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4">
            <Typography variant="body" level={3} className="mb-3 text-gray-500">
              Ask anything about their taste
            </Typography>
            <textarea
              ref={questionRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask anything about their taste..."
              rows={2}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400"
            />

            {/* Sample question chips */}
            {question.length === 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuestion(q)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 transition-colors active:bg-gray-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <Button
              fullWidth
              size="sm"
              variant="primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="mt-3"
            >
              {status === 'streaming' ? 'Thinking...' : 'Ask the Proxy'}
            </Button>
          </div>

          {/* Streaming / response */}
          {status === 'streaming' && (
            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                <Typography variant="body" level={3} className="text-gray-400">
                  The proxy is reasoning from their Crate...
                </Typography>
              </div>
            </div>
          )}

          {status === 'done' && response && (
            <div className="animate-in fade-in mt-6">
              {/* Answer card */}
              <div className="rounded-3xl border border-gray-200 bg-white p-4">
                <Typography variant="body" level={2}>
                  {response.answer}
                </Typography>

                {/* Confidence label */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      response.confidence === 'high'
                        ? 'bg-success-500'
                        : response.confidence === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-gray-300'
                    }`}
                  />
                  <Typography variant="label" level={2} className="text-gray-400">
                    {CONFIDENCE_LABELS[response.confidence]}
                  </Typography>
                </div>

                {/* Crate references */}
                {response.crateReferences.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {response.crateReferences.map((ref, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleAskAnother}
                >
                  Ask Another Question
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
