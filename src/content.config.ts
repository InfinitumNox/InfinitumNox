import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Diese Felder muss jeder Artikel im Kopfbereich (Frontmatter) haben.
// Fehlt eins, bricht der Build ab - das ist Absicht: lieber ein
// Fehler beim Bauen als eine kaputte Seite live.
const artikelSchema = z.object({
  titel: z.string().max(70, 'Maximal 70 Zeichen, sonst kürzt Google.'),
  beschreibung: z
    .string()
    .max(160, 'Maximal 160 Zeichen - das ist der Text im Google-Ergebnis.'),
  veroeffentlicht: z.coerce.date(),
  aktualisiert: z.coerce.date().optional(),
  titelbild: z.string().optional(),
  autorin: z.string().default('Redaktion'),
  schlagworte: z.array(z.string()).default([]),
  // Auf true setzen, solange der Artikel noch nicht fertig ist.
  // Entwürfe werden lokal angezeigt, aber nicht veröffentlicht.
  entwurf: z.boolean().default(false),
});

const familie = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/familie' }),
  schema: artikelSchema,
});

const praxis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/praxis' }),
  schema: artikelSchema,
});

const lernen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lernen' }),
  schema: artikelSchema,
});

export const collections = { familie, praxis, lernen };
