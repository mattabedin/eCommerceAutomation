// Wire types shared between the /api/builder/chat route and the client.

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

// NDJSON event shapes streamed from the server. One JSON object per line,
// terminated by a newline so the client can parse incrementally.
export type ChatStreamEvent =
  | { type: 'text'; delta: string }
  | {
      type: 'done';
      usage: {
        input_tokens: number;
        output_tokens: number;
        cache_creation_input_tokens?: number | null;
        cache_read_input_tokens?: number | null;
      };
    }
  | { type: 'error'; error: string };
