// RSS-Feed über alle drei Bereiche. Kostet nichts, hilft Stammlesern
// und Diensten, die neue Texte automatisch aufgreifen.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { BEREICHE } from '../bereiche';

export async function GET(context: APIContext) {
  const alle = await Promise.all(
    BEREICHE.map(async (b) => {
      const eintraege = await getCollection(b.id, ({ data }) => !data.entwurf);
      return eintraege.map((e) => ({
        title: e.data.titel,
        description: e.data.beschreibung,
        pubDate: e.data.veroeffentlicht,
        link: `${b.pfad}${e.id}/`,
        categories: [b.name, ...e.data.schlagworte],
      }));
    })
  );

  return rss({
    title: 'mitwachsen',
    description:
      'Wissen zu Entwicklung, Erziehung und sozialer Arbeit - für Familien, Fachkräfte und Auszubildende.',
    site: context.site!,
    items: alle.flat().sort((a, z) => z.pubDate.valueOf() - a.pubDate.valueOf()),
    customData: '<language>de-de</language>',
  });
}
