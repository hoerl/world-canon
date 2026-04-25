import Anthropic from '@anthropic-ai/sdk';
import { CanonService } from '@/features/canon/canon-service';
import { buildShopperPrompt, CLAUDE_MODEL } from '@/features/demo/lib/shopper-prompt';
import { getRequiredEnv } from '@/lib/env';
import { handleRouteError, HttpError, jsonError } from '@/lib/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return jsonError(400, 'Missing slug parameter');
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
    const prompt = buildShopperPrompt(canon, evolutions);

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
