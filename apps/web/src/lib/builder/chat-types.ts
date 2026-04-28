// Wire types shared between the /api/builder/* routes and the client.

import type { Blueprint } from './blueprint-schema';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

// Conversational chat — /api/builder/chat
export type ChatStreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'done'; usage: Usage }
  | { type: 'error'; error: string };

// Blueprint generation — /api/builder/generate-blueprint
export type BlueprintStreamEvent =
  | { type: 'stage'; index: number; label: string }
  | { type: 'partial'; json: string }
  | { type: 'blueprint'; blueprint: Blueprint }
  | { type: 'done'; usage: Usage }
  | { type: 'error'; error: string };
