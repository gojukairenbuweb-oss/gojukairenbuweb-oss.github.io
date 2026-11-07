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
    date: z.coerce.date(), // data di inizio
    data_fine: z.coerce.date().optional(), // per eventi su più giorni
    luogo: z.string().optional(),
    tipo: z.enum(['Gara', 'Seminario', 'Esame', 'Corso', 'Altro']).default('Altro'),
    draft: z.boolean().default(false),
  }),
});

// Categorie come nel vecchio sito (menu "Foto Gallery")
export const CATEGORIE_GALLERIE = [
  { nome: 'Foto di gruppo', slug: 'foto-di-gruppo' },
  { nome: 'Gare regionali', slug: 'gare-regionali' },
  { nome: 'Gare nazionali', slug: 'gare-nazionali' },
  { nome: 'Gare internazionali', slug: 'gare-internazionali' },
  { nome: 'Campionati Europei & Mondiali I.K.G.A.', slug: 'europei-mondiali-ikga' },
  { nome: 'Seminari I.K.G.A.', slug: 'seminari-ikga' },
] as const;
const nomiCategorie = CATEGORIE_GALLERIE.map((c) => c.nome) as [string, ...string[]];

const gallerie = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallerie' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    periodo: z.string().optional(),
    luogo: z.string().optional(),
    categoria: z.enum(nomiCategorie),
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

export const SEZIONI = ['Chi siamo', 'La Storia', 'I.K.G.A.', 'Gli atleti', 'Altro'] as const;

const pagine = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pagine' }),
  schema: z.object({
    title: z.string(),
    sezione: z.enum(SEZIONI).default('Altro'),
    order: z.number().default(99),
    menu: z.boolean().default(true),
    cover: z.string().optional(),
    cover_alt: z.string().optional(),
    galleria: z
      .array(z.object({ immagine: z.string(), didascalia: z.string().optional() }))
      .default([]),
    allegati: z.array(z.object({ titolo: z.string(), file: z.string() })).default([]),
    // album fotografici aggiuntivi con titolo proprio (es. "Diplomi"), mostrati dopo il testo
    album: z
      .array(
        z.object({
          titolo: z.string(),
          foto: z.array(z.object({ immagine: z.string(), didascalia: z.string().optional() })).default([]),
        }),
      )
      .default([]),
  }),
});

export const collections = { news, eventi, gallerie, pagine };
