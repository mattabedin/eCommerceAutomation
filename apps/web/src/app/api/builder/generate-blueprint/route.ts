import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

import { auth } from '@/lib/auth';
import { anthropic, BLUEPRINT_MODEL } from '@/lib/anthropic/client';
import { SYSTEM_PROMPT } from '@/lib/builder/system-prompt';
import {
  BlueprintSchema,
  TOOL_INPUT_SCHEMA,
} from '@/lib/builder/blueprint-schema';
import type { BlueprintStreamEvent } from '@/lib/builder/chat-types';

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

// Stages communicated to the client for the UI build-progress card. They
// don't gate generation — they're signposts driven by elapsed time so the
// client's BuildStages component animates while the model thinks/streams.
const STAGES = [
  'Analyzing the brief',
  'Designing the brand',
  'Choosing palette + voice',
  'Drafting catalogue',
  'Pricing for margin',
  'Wiring SEO + pages',
  'Preview ready',
] as const;

const TOOL_NAME = 'generate_blueprint';

const BLUEPRINT_USER_INSTRUCTION = `You have what you need from the conversation above. Generate the complete store blueprint NOW by calling the ${TOOL_NAME} tool.

Be opinionated. Make decisions where the brief is ambiguous — that's your job. The operator can edit anything afterwards.

Quality bar:
- Brand name: ownable, not generic, no "Inc." or "LLC" suffixes.
- Tagline: punchy, 5–8 words.
- Palette: a deep primary, a complementary secondary that pops on it, a soft accent for surface bands.
- Categories: 3–5 short labels that genuinely span the catalogue.
- 6–8 products: each one a real product (not a placeholder), spread across the categories, with prices that fit the niche and "was" prices ~25–35% above price for a credible discount.
- Hero copy: headline 3–7 words, subhead 1–2 sentences that earn the click.
- Domain: lowercase, hyphens-only, brand-name-derived, ends in .forge.shop.

Do not respond in chat. Just call the tool.`;

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

  const messages = [
    ...parsed.data.messages,
    { role: 'user' as const, content: BLUEPRINT_USER_INSTRUCTION },
  ];

  const stream = anthropic.messages.stream({
    model: BLUEPRINT_MODEL,
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [
      {
        name: TOOL_NAME,
        description:
          'Emit the structured store blueprint that materialises the conversation into a complete, ready-to-render storefront.',
        input_schema: TOOL_INPUT_SCHEMA,
      },
    ],
    tool_choice: { type: 'tool', name: TOOL_NAME },
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(event: BlueprintStreamEvent) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      }

      // Stage progression: cycle through STAGES while generation runs so the
      // build card's progress bar advances visibly. We pause the last stage
      // until we actually have a blueprint, then send it as "complete".
      let stageIndex = 0;
      send({ type: 'stage', index: 0, label: STAGES[0] });
      const stageInterval = setInterval(() => {
        if (stageIndex < STAGES.length - 2) {
          stageIndex++;
          send({ type: 'stage', index: stageIndex, label: STAGES[stageIndex] });
        }
      }, 900);

      let toolJsonAcc = '';

      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'input_json_delta'
          ) {
            toolJsonAcc += event.delta.partial_json;
            send({ type: 'partial', json: toolJsonAcc });
          }
        }

        const final = await stream.finalMessage();
        clearInterval(stageInterval);

        const toolBlock = final.content.find(b => b.type === 'tool_use');
        if (!toolBlock || toolBlock.type !== 'tool_use') {
          throw new Error('Model did not emit the generate_blueprint tool call.');
        }

        const result = BlueprintSchema.safeParse(toolBlock.input);
        if (!result.success) {
          throw new Error(
            `Blueprint validation failed: ${result.error.issues
              .slice(0, 3)
              .map(i => `${i.path.join('.')}: ${i.message}`)
              .join('; ')}`,
          );
        }

        send({
          type: 'stage',
          index: STAGES.length - 1,
          label: STAGES[STAGES.length - 1],
        });
        send({ type: 'blueprint', blueprint: result.data });
        send({
          type: 'done',
          usage: {
            input_tokens: final.usage.input_tokens,
            output_tokens: final.usage.output_tokens,
            cache_creation_input_tokens:
              final.usage.cache_creation_input_tokens ?? null,
            cache_read_input_tokens: final.usage.cache_read_input_tokens ?? null,
          },
        });
      } catch (err) {
        clearInterval(stageInterval);
        const message =
          err instanceof Anthropic.APIError
            ? `Anthropic ${err.status}: ${err.message}`
            : err instanceof Error
              ? err.message
              : 'Generation failed';
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
