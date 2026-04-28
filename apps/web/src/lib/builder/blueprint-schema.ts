import { z } from 'zod';

// The Blueprint is the structured artifact Claude generates via tool use in
// Phase 2C. It captures everything needed to render a storefront preview and
// (in Phase 2D) materialise into real DB rows.
//
// The Zod schema is the source of truth. The TOOL_INPUT_SCHEMA below mirrors
// the shape as JSON Schema — what Anthropic's Messages API accepts on the
// `input_schema` of a tool definition. Keep them in sync.

export const ProductSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe('Product name — evocative, ownable, never generic.'),
  category: z
    .string()
    .min(1)
    .describe('Category from the brand catalog (must match one of the categories array).'),
  price: z
    .number()
    .positive()
    .describe('Price in USD (whole dollars or one decimal). Reasonable for the niche.'),
  was: z
    .number()
    .positive()
    .describe('Compare-at price — slightly higher than price for a psychological discount.'),
  description: z
    .string()
    .min(10)
    .describe('1–2 short sentences describing the product.'),
  tone: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .describe('Hex color (#xxxxxx) representing the product visual tile in the storefront preview.'),
});

export const BlueprintSchema = z.object({
  brand_name: z
    .string()
    .min(1)
    .describe('Brand name — usually one or two words. Memorable, ownable, no generic suffixes like "Co." unless intentional.'),
  tagline: z
    .string()
    .min(3)
    .describe('5–8 word tagline. Punchy, action-oriented or evocative.'),
  niche: z
    .string()
    .min(3)
    .describe('What you sell, in 3–5 words.'),
  target_audience: z
    .string()
    .min(3)
    .describe('Who you sell to — e.g. "urban dog owners, 25-45".'),
  brand_tone: z
    .string()
    .min(3)
    .describe('Brand voice descriptors separated by " · " (e.g. "premium · warm · stylish").'),
  colors: z
    .object({
      primary: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .describe('Primary brand hex — usually a deep, defining color used for nav/headlines.'),
      secondary: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .describe('Secondary hex — accent color, complements primary (used for emphasis text).'),
      accent: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .describe('Accent hex — usually a soft, light background tone for surface bands.'),
    })
    .describe('Brand color palette in hex format.'),
  categories: z
    .array(z.string().min(1))
    .min(2)
    .max(6)
    .describe('Product categories — 2–6 short labels, capitalised, no punctuation.'),
  domain: z
    .string()
    .regex(/^[a-z0-9-]+\.forge\.shop$/)
    .describe('Subdomain on forge.shop. lowercase + hyphens only, no spaces.'),
  hero_headline: z
    .string()
    .min(3)
    .describe('Hero headline — 3–7 words. Evocative, conveys the brand promise.'),
  hero_subhead: z
    .string()
    .min(10)
    .describe('Hero subhead — 1–2 sentences. Expands on the headline.'),
  products: z
    .array(ProductSchema)
    .min(6)
    .max(8)
    .describe('6–8 hero products spanning the categories. Each must reference a real category from the categories array.'),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;
export type BlueprintProduct = z.infer<typeof ProductSchema>;

// JSON Schema mirror for Anthropic tool definition. Hand-written rather than
// generated to keep dependencies minimal and the shape obvious in PRs.
export const TOOL_INPUT_SCHEMA = {
  type: 'object' as const,
  required: [
    'brand_name',
    'tagline',
    'niche',
    'target_audience',
    'brand_tone',
    'colors',
    'categories',
    'domain',
    'hero_headline',
    'hero_subhead',
    'products',
  ],
  properties: {
    brand_name: {
      type: 'string',
      description: BlueprintSchema.shape.brand_name.description,
    },
    tagline: {
      type: 'string',
      description: BlueprintSchema.shape.tagline.description,
    },
    niche: {
      type: 'string',
      description: BlueprintSchema.shape.niche.description,
    },
    target_audience: {
      type: 'string',
      description: BlueprintSchema.shape.target_audience.description,
    },
    brand_tone: {
      type: 'string',
      description: BlueprintSchema.shape.brand_tone.description,
    },
    colors: {
      type: 'object',
      required: ['primary', 'secondary', 'accent'],
      properties: {
        primary: { type: 'string', description: 'Primary hex like #111827' },
        secondary: { type: 'string', description: 'Secondary hex like #D4AF37' },
        accent: { type: 'string', description: 'Accent hex like #F9FAFB' },
      },
      description: BlueprintSchema.shape.colors.description,
    },
    categories: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 6,
      description: BlueprintSchema.shape.categories.description,
    },
    domain: {
      type: 'string',
      description: BlueprintSchema.shape.domain.description,
    },
    hero_headline: {
      type: 'string',
      description: BlueprintSchema.shape.hero_headline.description,
    },
    hero_subhead: {
      type: 'string',
      description: BlueprintSchema.shape.hero_subhead.description,
    },
    products: {
      type: 'array',
      minItems: 6,
      maxItems: 8,
      items: {
        type: 'object',
        required: ['name', 'category', 'price', 'was', 'description', 'tone'],
        properties: {
          name: { type: 'string', description: 'Product name — evocative.' },
          category: { type: 'string', description: 'Must match one of the categories.' },
          price: { type: 'number', description: 'Price in USD.' },
          was: { type: 'number', description: 'Compare-at price (must be > price).' },
          description: { type: 'string', description: '1–2 sentence description.' },
          tone: {
            type: 'string',
            description: 'Hex color for the visual product tile (#xxxxxx).',
          },
        },
      },
      description: BlueprintSchema.shape.products.description,
    },
  },
};
