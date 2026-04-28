import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

import { auth } from '@/lib/auth';
import { anthropic, BUILDER_MODEL } from '@/lib/anthropic/client';
import { SYSTEM_PROMPT } from '@/lib/builder/system-prompt';
import type { ChatStreamEvent } from '@/lib/builder/chat-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
});

// Auth.js v5 — wrap the handler with `auth()` so req.auth is populated from
// the session cookie. `await auth()` inside a Route Handler can fail under
// JWT mode because cookies() resolves before the auth core has parsed them.
export const POST = auth(async req => {
  if (!req.auth?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return new Response(parsed.error.issues[0]?.message ?? 'Bad request', {
      status: 400,
    });
  }
  if (parsed.data.messages[0]?.role !== 'user') {
    return new Response('First message must be user', { status: 400 });
  }

  const stream = anthropic.messages.stream({
    model: BUILDER_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Cache the system prompt for 5 minutes. Sonnet 4.6's minimum cacheable
        // prefix is 2048 tokens; if the prompt is shorter the API silently
        // skips the cache (no error). We verify with usage.cache_read_input_tokens.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: parsed.data.messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(event: ChatStreamEvent) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      }

      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            send({ type: 'text', delta: event.delta.text });
          }
        }
        const final = await stream.finalMessage();
        send({
          type: 'done',
          usage: {
            input_tokens: final.usage.input_tokens,
            output_tokens: final.usage.output_tokens,
            cache_creation_input_tokens:
              final.usage.cache_creation_input_tokens ?? null,
            cache_read_input_tokens:
              final.usage.cache_read_input_tokens ?? null,
          },
        });
      } catch (err) {
        const message =
          err instanceof Anthropic.APIError
            ? `Anthropic ${err.status}: ${err.message}`
            : err instanceof Error
              ? err.message
              : 'Stream error';
        send({ type: 'error', error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Accel-Buffering': 'no',
    },
  });
});
