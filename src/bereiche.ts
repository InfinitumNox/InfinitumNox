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
    name: 'Familie',
    pfad: '/familie/',
    fuerWen: 'Für Eltern und Angehörige',
    beschreibung:
      'Was im Alltag mit Kindern wirklich hilft - ohne Fachjargon, ohne erhobenen Zeigefinger.',
  },
  {
    id: 'praxis',
    name: 'Praxis',
    pfad: '/praxis/',
    fuerWen: 'Für Fachkräfte im Sozialbereich',
    beschreibung:
      'Methoden, Fallbeispiele und Werkzeuge für die tägliche Arbeit mit Kindern und Familien.',
  },
  {
    id: 'lernen',
    name: 'Lernen',
    pfad: '/lernen/',
    fuerWen: 'Für Auszubildende',
    beschreibung:
      'Grundlagen erklärt, Prüfungswissen sortiert, Praxisaufgaben mit Lösungswegen.',
  },
];

export function bereichVon(id: BereichId): Bereich {
  const b = BEREICHE.find((x) => x.id === id);
  if (!b) throw new Error(`Bereich "${id}" ist nicht in bereiche.ts eingetragen.`);
  return b;
}
