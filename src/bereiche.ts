// Die drei Bereiche der Seite. Wenn später ein vierter dazukommt,
// wird er hier eingetragen - Navigation, Startseite und Farben
// ziehen sich alles von hier.

export type BereichId = 'familie' | 'praxis' | 'lernen';

export interface Bereich {
  id: BereichId;
  name: string;
  pfad: string;
  fuerWen: string;
  beschreibung: string;
}

export const BEREICHE: Bereich[] = [
  {
    id: 'familie',
    name: 'Eltern',
    pfad: '/familie/',
    fuerWen: 'Für Eltern und Angehörige',
    beschreibung:
      'Unterstützung für den Alltag zu Hause - einfach, verständlich und praxisnah.',
  },
  {
    id: 'lernen',
    name: 'Lernen',
    pfad: '/lernen/',
    fuerWen: 'Für Auszubildende',
    beschreibung:
      'Konzepte und Grundlagen für ein besseres Verständnis kindlicher Entwicklung.',
  },
  {
    id: 'praxis',
    name: 'Praxis',
    pfad: '/praxis/',
    fuerWen: 'Für Fachkräfte im Sozialbereich',
    beschreibung:
      'Konkrete Impulse und Methoden für den Kita-Alltag und die pädagogische Arbeit.',
  },
];

export function bereichVon(id: BereichId): Bereich {
  const b = BEREICHE.find((x) => x.id === id);
  if (!b) throw new Error(`Bereich "${id}" ist nicht in bereiche.ts eingetragen.`);
  return b;
}
