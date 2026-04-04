import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z
      .array(
        z.string().regex(/^[a-z0-9-]+$/, 'Tags must be lowercase kebab-case'),
      )
      .default([]),
    series: z
      .object({
        name: z.string(),
        part: z.number(),
        total: z.number(),
      })
      .optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    href: z.string().url(),
    status: z.enum(['Live', 'WIP']),
    year: z.string(),
    order: z.number(),
  }),
});

export const collections = { blog, projects };
