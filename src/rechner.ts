// Die Rechner der Seite.
//
// "published" steuert allein, ob ein Rechner im Frontend auftaucht.
// Ein Rechner, der hier auf false steht, wird nirgends angezeigt -
// nicht auf der Startseite, nicht in der Navigation, nicht im Footer.
// Die Daten bleiben trotzdem stehen, damit sie beim Freischalten nur
// noch umgestellt werden müssen.
//
// Stand v1: Nur der Kita-Schlaf-Rechner ist fertig. Die anderen drei
// sind Ideen, keine Versprechen - deshalb sieht sie niemand.

export interface Rechner {
  id: string;
  symbol: 'bett' | 'smartphone' | 'mond' | 'kalender';
  titel: string;
  text: string;
  /** Nur true = im Frontend sichtbar. Siehe Kommentar oben. */
  published: boolean;
}

export const RECHNER: Rechner[] = [
  {
    id: 'kita-schlaf',
    symbol: 'bett',
    titel: 'Kita-Schlaf',
    text: 'Berechnen Sie empfohlene Schlafzeiten für Kita-Kinder.',
    published: true,
  },
  {
    id: 'medienzeit',
    symbol: 'smartphone',
    titel: 'Medienzeit',
    text: 'Empfohlene Bildschirmzeiten nach Alter und Entwicklung.',
    published: false,
  },
  {
    id: 'einschlafzeit',
    symbol: 'mond',
    titel: 'Einschlafzeit',
    text: 'Finden Sie die optimale Einschlafzeit für erholsamen Schlaf.',
    published: false,
  },
  {
    id: 'schlafroutine',
    symbol: 'kalender',
    titel: 'Schlafroutine',
    text: 'Gestalten Sie wirksame Routinen für besseren Schlaf.',
    published: false,
  },
];

/** Genau die Rechner, die im Frontend erscheinen dürfen. */
export const SICHTBARE_RECHNER = RECHNER.filter((r) => r.published);
