// Die Rechner der Seite. Ein Rechner ist "verfuegbar", sobald er als
// eigenes Werkzeug online ist. Genau die verfügbaren Rechner bekommen
// auf der Guides-Seite einen eigenen, personalisierten Leitfaden.

export interface Rechner {
  id: string;
  symbol: 'bett' | 'smartphone' | 'mond' | 'kalender';
  titel: string;
  text: string;
  verfuegbar: boolean;
}

export const RECHNER: Rechner[] = [
  {
    id: 'kita-schlaf',
    symbol: 'bett',
    titel: 'Kita-Schlaf',
    text: 'Berechnen Sie empfohlene Schlafzeiten für Kita-Kinder.',
    verfuegbar: true,
  },
  {
    id: 'medienzeit',
    symbol: 'smartphone',
    titel: 'Medienzeit',
    text: 'Empfohlene Bildschirmzeiten nach Alter und Entwicklung.',
    verfuegbar: false,
  },
  {
    id: 'einschlafzeit',
    symbol: 'mond',
    titel: 'Einschlafzeit',
    text: 'Finden Sie die optimale Einschlafzeit für erholsamen Schlaf.',
    verfuegbar: false,
  },
  {
    id: 'schlafroutine',
    symbol: 'kalender',
    titel: 'Schlafroutine',
    text: 'Gestalten Sie wirksame Routinen für besseren Schlaf.',
    verfuegbar: false,
  },
];
