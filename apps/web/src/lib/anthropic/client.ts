import Anthropic from '@anthropic-ai/sdk';

// Single Anthropic client for the app. The SDK reads ANTHROPIC_API_KEY from env
// automatically. We pass it explicitly so module load fails loudly in dev when
// the key is missing rather than 500ing on the first request.
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey && process.env.NODE_ENV !== 'production') {
  // In production a missing key will cause the first call to throw — that's fine
  // because builds should never call Anthropic. Loud warning in dev/preview.
  // eslint-disable-next-line no-console
  console.warn(
    '[anthropic] ANTHROPIC_API_KEY is not set — /api/builder/chat will fail at runtime.',
  );
}

export const anthropic = new Anthropic({
  apiKey: apiKey ?? 'placeholder',
});

// Pin the model in one place so 2C/2D/2E can swap to Opus 4.7 for blueprint
// generation without scattering literals.
export const BUILDER_MODEL = 'claude-sonnet-4-6';
