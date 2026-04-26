import Anthropic from '@anthropic-ai/sdk';
import { CanonService } from '@/features/canon/canon-service';
import { buildTasteProxyPrompt, CLAUDE_MODEL } from '@/features/demo/lib/taste-proxy-prompt';
import { getRequiredEnv } from '@/lib/env';
import { handleRouteError, HttpError, jsonError } from '@/lib/http';

const MAX_QUESTION_LENGTH = 500;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const question = searchParams.get('question');

  if (!slug) {
    return jsonError(400, 'Missing slug parameter');
  }
  if (!question || question.trim().length === 0) {
    return jsonError(400, 'Missing question parameter');
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return jsonError(400, `Question must be under ${MAX_QUESTION_LENGTH} characters`);
  }

  try {
    const canonService = new CanonService();
    const canon = await canonService.getCanonBySlug(slug);
    if (!canon) {
      throw new HttpError(404, 'Crate not found');
    }

    const hasSlot = Object.values(canon.canon).some((v) => v !== null);
    if (!hasSlot) {
      throw new HttpError(422, 'This Crate has no selections yet');
    }

    const evolutions = await canonService.listEvolutionsBySlug(slug);
    const prompt = buildTasteProxyPrompt(canon, evolutions, question.trim());

    const client = new Anthropic({ apiKey: getRequiredEnv('ANTHROPIC_API_KEY') });

    const stream = await client.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      temperature: 1,
      messages: [{ role: 'user', content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
