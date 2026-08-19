// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Die Domain kommt aus SITE_URL, damit sie sich an einer einzigen
 * Stelle umstellen lässt - siehe .github/workflows/vorschau.yml.
 * Zum Testen zeigt sie auf infinitumnox.com, später einfach auf
 * https://mitwachsen.org umstellen.
 *
 * Die Seite läuft immer unter der Wurzel der jeweiligen Domain
 * (base '/'), egal ob Test- oder echte Domain - beide werden über
 * eine eigene Domain angesprochen, nicht über einen Unterpfad wie
 * bei den Standard-github.io-Adressen.
 *
 * VORSCHAU_GITHUB markiert unabhängig davon, ob dieser Bau noch eine
 * Testversion ist. Testversionen werden bei Google gesperrt
 * (robots.txt, noindex) - unabhängig davon, welche Domain gerade
 * eingestellt ist.
 */
const site = process.env.SITE_URL ?? 'https://mitwachsen.org';
const IST_TEST = Boolean(process.env.VORSCHAU_GITHUB);

export default defineConfig({
  site,
  base: '/',

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
      'import.meta.env.IST_VORSCHAU': JSON.stringify(IST_TEST),
    },
  },
});
