// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Das Projekt kann an zwei Orten gebaut werden:
 *
 * 1. ECHTE SEITE (Standard)
 *    npm run build
 *    -> https://mitwachsen.org/familie/
 *
 * 2. VORSCHAU auf GitHub Pages
 *    Umgebungsvariable VORSCHAU_GITHUB="benutzername/mitwachsen" setzen.
 *    Der Arbeitsablauf in .github/workflows/ macht das automatisch.
 *    -> https://benutzername.github.io/mitwachsen/familie/
 *
 * Der Unterschied ist bewusst über eine Variable gelöst und nicht
 * durch Hin- und Herändern der Datei. Sonst geht irgendwann eine
 * halb umgestellte Fassung live.
 */
const VORSCHAU = process.env.VORSCHAU_GITHUB;

let site = 'https://mitwachsen.org';
let base = '/';

if (VORSCHAU) {
  const [benutzer, repo] = VORSCHAU.split('/');
  site = `https://${benutzer.toLowerCase()}.github.io`;
  base = `/${repo}/`;
}

export default defineConfig({
  site,
  base,

  // Alle URLs enden mit Schrägstrich: /familie/thema/
  // Einmal festlegen, nie wieder ändern - sonst gibt es zwei
  // Adressen für dieselbe Seite und Google zählt sie doppelt.
  trailingSlash: 'always',

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],

  build: {
    format: 'directory',
  },

  vite: {
    define: {
      // Damit die Seiten wissen, ob sie gerade als Vorschau gebaut werden
      'import.meta.env.IST_VORSCHAU': JSON.stringify(Boolean(VORSCHAU)),
    },
  },
});
