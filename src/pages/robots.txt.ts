// Erzeugt beim Bauen automatisch /robots.txt.
//
// Wichtig: Die Vorschau auf GitHub Pages wird komplett für
// Suchmaschinen gesperrt. Sonst stünde derselbe Text später unter
// zwei Adressen im Netz und beide würden schlechter bewertet.
//
// Die KI-Crawler unten sind über "User-agent: *" ohnehin schon
// erlaubt - sie stehen einzeln da, damit das auch klar ersichtlich
// ist und nicht versehentlich verloren geht, falls hier später mal
// etwas für einzelne Bots eingeschränkt wird.
import type { APIRoute } from 'astro';

const IST_VORSCHAU = Boolean(process.env.VORSCHAU_GITHUB);

const KI_CRAWLER = [
  'GPTBot', // OpenAI
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot', // Anthropic
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot', // Perplexity
  'Perplexity-User',
  'Google-Extended', // Google (Gemini-Training)
  'Applebot-Extended', // Apple Intelligence
  'Amazonbot', // Amazon
  'meta-externalagent', // Meta AI
  'CCBot', // Common Crawl (Trainingsdaten vieler Modelle)
  'Bytespider', // ByteDance
  'Diffbot',
  'YouBot',
];

export const GET: APIRoute = ({ site }) => {
  const inhalt = IST_VORSCHAU
    ? `# Vorschau - nicht die echte Seite.
User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /
Disallow: /admin/

${KI_CRAWLER.map((bot) => `User-agent: ${bot}\nAllow: /\nDisallow: /admin/\n`).join('\n')}
Sitemap: ${new URL('sitemap-index.xml', site).href}

# Maschinenlesbare Zusammenfassung der Seite für KI-Systeme:
# ${new URL('llms.txt', site).href}
`;

  return new Response(inhalt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
