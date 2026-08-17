// Erzeugt beim Bauen automatisch /robots.txt.
//
// Wichtig: Die Vorschau auf GitHub Pages wird komplett für
// Suchmaschinen gesperrt. Sonst stünde derselbe Text später unter
// zwei Adressen im Netz und beide würden schlechter bewertet.
import type { APIRoute } from 'astro';

const IST_VORSCHAU = Boolean(process.env.VORSCHAU_GITHUB);

export const GET: APIRoute = ({ site }) => {
  const inhalt = IST_VORSCHAU
    ? `# Vorschau - nicht die echte Seite.
User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${new URL('sitemap-index.xml', site).href}
`;

  return new Response(inhalt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
