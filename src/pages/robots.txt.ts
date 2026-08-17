// Erzeugt beim Bauen automatisch /robots.txt.
//
// Wichtig: Die Vorschau auf GitHub Pages wird komplett für
// Suchmaschinen gesperrt. Sonst stünde derselbe Text später unter
// zwei Adressen im Netz und beide würden schlechter bewertet.
//
// Nur die Claude/Anthropic-Bots unten dürfen crawlen, alle anderen
// (auch reguläre Suchmaschinen wie Googlebot oder Bingbot) sind über
// "User-agent: *" gesperrt.
import type { APIRoute } from 'astro';

const IST_VORSCHAU = Boolean(process.env.VORSCHAU_GITHUB);

const KI_CRAWLER = [
  'ClaudeBot', // Anthropic
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'Claude-Web',
];

export const GET: APIRoute = ({ site }) => {
  const inhalt = IST_VORSCHAU
    ? `# Vorschau - nicht die echte Seite.
User-agent: *
Disallow: /
`
    : `${KI_CRAWLER.map((bot) => `User-agent: ${bot}\nAllow: /\nDisallow: /admin/\n`).join('\n')}
User-agent: *
Disallow: /

Sitemap: ${new URL('sitemap-index.xml', site).href}

# Maschinenlesbare Zusammenfassung der Seite für KI-Systeme:
# ${new URL('llms.txt', site).href}
`;

  return new Response(inhalt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
