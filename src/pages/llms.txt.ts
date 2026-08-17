// Erzeugt beim Bauen automatisch /llms.txt - eine maschinenlesbare
// Übersicht der Seite nach dem llms.txt-Standard (llmstxt.org). KI-Systeme
// finden hier auf einen Blick, welche Inhalte es gibt und wo sie liegen,
// ohne die ganze Seite crawlen und Layout/Skripte durchsuchen zu müssen.
//
// Wie robots.txt wird auch diese Datei in der Vorschau leer gehalten -
// die Vorschau ist ohnehin für alle Crawler gesperrt.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { BEREICHE } from '../bereiche';

const IST_VORSCHAU = Boolean(process.env.VORSCHAU_GITHUB);

export const GET: APIRoute = async ({ site }) => {
  if (IST_VORSCHAU) {
    return new Response('# Vorschau - nicht die echte Seite. Kein Inhalt.\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const url = (pfad: string) => new URL(pfad, site).href;

  const bereicheMitArtikeln = await Promise.all(
    BEREICHE.map(async (bereich) => {
      const eintraege = await getCollection(bereich.id, ({ data }) => !data.entwurf);
      eintraege.sort(
        (a, z) => z.data.veroeffentlicht.valueOf() - a.data.veroeffentlicht.valueOf()
      );
      return { bereich, eintraege };
    })
  );

  const abschnitte = bereicheMitArtikeln
    .map(({ bereich, eintraege }) => {
      const zeilen = eintraege
        .map((e) => `- [${e.data.titel}](${url(`${bereich.pfad}${e.id}/`)}): ${e.data.beschreibung}`)
        .join('\n');
      return `## ${bereich.name} - ${bereich.fuerWen}\n\n${bereich.beschreibung}\n\n${zeilen || '_Noch keine Artikel._'}`;
    })
    .join('\n\n');

  const inhalt = `# mitwachsen

> Wissen zu Entwicklung, Erziehung und sozialer Arbeit - für Familien, Fachkräfte und Auszubildende.

mitwachsen ist eine deutschsprachige Wissensseite mit drei Bereichen:
Familie (für Eltern), Lernen (für Auszubildende) und Praxis (für
Fachkräfte im Sozialbereich). Die Artikel unten sind nach Bereich
sortiert, neueste zuerst.

${abschnitte}

## Weitere Seiten

- [Blog](${url('blog/')}): Alle Artikel an einem Ort, filterbar nach Bereich.
- [Kontakt](${url('kontakt/')})
- [Impressum](${url('impressum/')})
- [Datenschutz](${url('datenschutz/')})

## Feeds

- [RSS](${url('rss.xml')})
- [Sitemap](${url('sitemap-index.xml')})
`;

  return new Response(inhalt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
