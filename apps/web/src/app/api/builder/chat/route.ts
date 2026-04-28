import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

import { auth } from '@/lib/auth';
import { anthropic, BUILDER_MODEL } from '@/lib/anthropic/client';
import { SYSTEM_PROMPT } from '@/lib/builder/system-prompt';
import {
  appendMessage,
  ensureConversation,
} from '@/lib/builder/conversation-helpers';
import type { ChatStreamEvent } from '@/lib/builder/chat-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  conversationId: z.string().optional(),
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

export const POST = auth(async req => {
  if (!req.auth?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = req.auth.user.id;

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

  // Find or create the conversation. New ones get a title from the first
  // user message; existing ones must belong to the signed-in user.
  const lastUser = [...parsed.data.messages]
    .reverse()
    .find(m => m.role === 'user');
  const ensure = await ensureConversation({
    userId,
    conversationId: parsed.data.conversationId,
    firstUserMessage: parsed.data.messages[0]?.content,
  });
  if (!ensure.ok) {
    return new Response(ensure.error, { status: ensure.status });
  }
  const { conversationId } = ensure;

  // Persist the latest user turn before kicking off generation. Older turns
  // are already in the DB (they were persisted on prior calls).
  if (lastUser) {
    await appendMessage(conversationId, 'user', lastUser.content);
  }

  const stream = anthropic.messages.stream({
    model: BUILDER_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
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

      let assistantText = '';

      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            assistantText += event.delta.text;
            send({ type: 'text', delta: event.delta.text });
          }
        }
        const final = await stream.finalMessage();
        // Persist the full assistant turn after the stream closes so later
        // resumes see exactly what the user saw.
        if (assistantText.trim()) {
          await appendMessage(conversationId, 'assistant', assistantText);
        }
        send({
          type: 'done',
          conversationId,
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
