import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// I nomi dei campi devono restare allineati a public/admin/config.yml (Sveltia).

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    summary: z.string().optional(),
  }),
});

const eventi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/eventi' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    luogo: z.string().optional(),
    tipo: z.enum(['Gara', 'Seminario', 'Esame', 'Corso', 'Altro']).default('Altro'),
    draft: z.boolean().default(false),
  }),
});

const gallerie = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallerie' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    luogo: z.string().optional(),
    tipo: z.enum([
      'Gara regionale',
      'Gara nazionale',
      'Gara internazionale',
      'Europei/Mondiali IKGA',
      'Seminario',
      'Foto di gruppo',
    ]),
    federazione: z.enum(['FIK', 'IKGA', 'Altro']).default('Altro'),
    draft: z.boolean().default(false),
    foto: z
      .array(
        z.object({
          immagine: z.string(),
          didascalia: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const pagine = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pagine' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(99),
    menu: z.boolean().default(true),
  }),
});

export const collections = { news, eventi, gallerie, pagine };
