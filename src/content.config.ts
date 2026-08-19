import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tips = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tips' }),
  schema: z.object({
    title: z.string(),
    pillar: z.enum(['exercise', 'diet', 'supplements', 'mental-health', 'immune-health']),
    summary: z.string().max(200),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    featured: z.boolean().optional().default(false),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { tips };
