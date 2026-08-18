// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { findePlatzhalter, platzhalterMeldung } from './src/platzhalter.mjs';

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

/**
 * Notbremse für die redaktionell gepflegten Daten.
 *
 * Solange in einer dieser Dateien auch nur ein Eintrag als Platzhalter
 * markiert ist, würde die Seite Zahlen oder Angaben zeigen, die
 * niemand geprüft hat. Deshalb:
 *
 *   - beim Arbeiten (npm run dev) und in der Vorschau: roter
 *     Warnbalken auf der Seite, der Bau läuft weiter,
 *   - beim Bau der echten Seite: Abbruch mit Klartext-Meldung.
 *
 * Der Unterschied hängt an VORSCHAU_GITHUB - dieselbe Umgebungs-
 * variable, die die Vorschau schon für Suchmaschinen sperrt. Die
 * Vorschau soll ja gerade zeigen, was noch fehlt.
 */
const GEPRUEFTE_DATEIEN = ['src/data/schlaf-regeln.json', 'src/data/autorin.json'];

/**
 * Dieselbe Notbremse für die Rechtsseiten. Ein Impressum mit
 * "VORNAME NACHNAME" ist kein Impressum, sondern ein Abmahngrund.
 * Geprüft wird auf die Platzhalter, die in den Dateien stehen.
 */
const RECHTSSEITEN = [
  'src/pages/impressum.astro',
  'src/pages/datenschutz.astro',
];

const RECHTS_PLATZHALTER = [
  'VORNAME NACHNAME',
  'STRASSE HAUSNUMMER',
  'PLZ ORT',
  'ANSCHRIFT WIE OBEN',
  'VORSITZENDE, STELLVERTRETUNG',
  'Amtsgericht ORT',
  'VR XXXXX',
  '+49 XXX XXXXXXX',
  'VEREINSNAME',
];

const datenPruefen = {
  name: 'mitwachsen:platzhalter-pruefen',
  hooks: {
    'astro:build:start': () => {
      const meldungen = [];

      for (const datei of GEPRUEFTE_DATEIEN) {
        const daten = JSON.parse(
          readFileSync(new URL(`./${datei}`, import.meta.url), 'utf8')
        );
        const offen = findePlatzhalter(daten);
        if (offen.length === 0) continue;

        if (IST_TEST) {
          console.warn(
            `\n[mitwachsen] Vorschau-Bau: ${offen.length} Platzhalter in ${datei}. ` +
              'Für die echte Seite bricht der Bau an dieser Stelle ab.\n'
          );
        } else {
          meldungen.push(platzhalterMeldung(offen, datei));
        }
      }

      for (const datei of RECHTSSEITEN) {
        const inhalt = readFileSync(new URL(`./${datei}`, import.meta.url), 'utf8');
        const offen = RECHTS_PLATZHALTER.filter((p) => inhalt.includes(p));
        if (offen.length === 0) continue;

        const text =
          `Noch nicht ausgefüllt: In ${datei} stehen Platzhalter.\n\n` +
          'Betroffen sind:\n' +
          offen.map((p) => `  - "${p}"`).join('\n') +
          '\n\nImpressum und Datenschutzerklärung sind Pflichtangaben.\n' +
          'Unvollständig sind sie abmahnfähig, deshalb wird die Seite so\n' +
          'nicht gebaut.';

        if (IST_TEST) {
          console.warn(`\n[mitwachsen] Vorschau-Bau: ${offen.length} Platzhalter in ${datei}.\n`);
        } else {
          meldungen.push(text);
        }
      }

      if (meldungen.length > 0) {
        throw new Error(`\n\n${meldungen.join('\n\n')}\n`);
      }
    },
  },
};

export default defineConfig({
  site,
  base: '/',

  // Alle URLs enden mit Schrägstrich: /familie/thema/
  // Einmal festlegen, nie wieder ändern - sonst gibt es zwei
  // Adressen für dieselbe Seite und Google zählt sie doppelt.
  trailingSlash: 'always',

  integrations: [
    datenPruefen,
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
