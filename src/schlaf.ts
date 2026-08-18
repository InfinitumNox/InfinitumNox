/**
 * Die Rechenlogik des Kita-Schlaf-Rechners.
 *
 * Drei Regeln, die für diese Datei gelten:
 *
 *   1. Hier steht KEINE Schlafzahl. Jeder fachliche Wert kommt aus
 *      src/data/schlaf-regeln.json und wird als Parameter übergeben.
 *      Wer hier eine Zahl einträgt, umgeht die redaktionelle Kontrolle.
 *   2. Reine Funktionen, keine Seiteneffekte. Kein Netz, kein Speicher,
 *      kein Zufall. Dieselben Eingaben ergeben immer dasselbe Ergebnis.
 *   3. Läuft unverändert im Browser. Der Rechner fragt nie einen Server.
 *
 * Die Einschätzung entsteht aus einem festen Entscheidungsbaum
 * (Feld "regeln" in der JSON-Datei), nicht aus einem Sprachmodell.
 */

// ===========================================================
// Typen
// ===========================================================

export type AnliegenId =
  | 'einschlafen'
  | 'nachtwach'
  | 'frueh-wach'
  | 'widerstand'
  | 'neugier';

/** Wo die heutige Zubettgehzeit im Verhältnis zum Fenster liegt. */
export type Lage = 'vor-fenster' | 'im-fenster' | 'nach-fenster';

export interface Eingaben {
  /** Alter in Jahren, 2 bis 10. */
  alter: number;
  /** Aufstehzeit als "HH:MM". */
  aufstehzeit: string;
  mittagsschlaf: boolean;
  /** Dauer des Mittagsschlafs in Minuten. Ohne Mittagsschlaf egal. */
  mittagsschlafMinuten: number;
  /** Aktuelle Zubettgehzeit als "HH:MM". */
  zubettgehzeit: string;
  anliegen: AnliegenId;
}

export interface Ursache {
  id: string;
  titel: string;
  erklaerung: string;
  schritte: string[];
}

export interface Ergebnis {
  /** Empfohlenes Schlaffenster, früheste und späteste Zubettgehzeit. */
  fensterVon: string;
  fensterBis: string;
  /** Empfohlene Zubettgehzeit (Mitte des Fensters). */
  empfehlung: string;
  /** Aktuell minus empfohlen, in Minuten. Positiv = geht später ins Bett. */
  abweichungMinuten: number;
  /** Fertiger Klartextsatz zur Abweichung. */
  abweichungSatz: string;
  lage: Lage;
  ursache: Ursache;
  /** Rechnerischer Nachtschlaf in Minuten, nach Abzug des Mittagsschlafs. */
  nachtschlafMinutenVon: number;
  nachtschlafMinutenBis: number;
  /** Alles, was der Tagesbalken zum Zeichnen braucht - Minuten ab Mitternacht. */
  balken: Balken;
  /** Quellenkürzel, das die verwendete Altersgruppe belegt. */
  quelle: string;
}

export interface Balken {
  aufstehen: number;
  mittagVon: number | null;
  mittagBis: number | null;
  fensterVon: number;
  fensterBis: number;
  empfehlung: number;
  aktuell: number;
  /** Länge der dargestellten Achse in Minuten, beginnend beim Aufstehen. */
  achseLaenge: number;
}

// ===========================================================
// Auswahllisten - gehören zur Bedienung, nicht zur Fachlichkeit,
// und dürfen deshalb hier stehen.
// ===========================================================

export const ALTER_MIN = 2;
export const ALTER_MAX = 10;

export const ALTER_OPTIONEN = Array.from(
  { length: ALTER_MAX - ALTER_MIN + 1 },
  (_, i) => ALTER_MIN + i
);

export const ANLIEGEN: { id: AnliegenId; text: string }[] = [
  { id: 'einschlafen', text: 'Das Einschlafen dauert lange' },
  { id: 'nachtwach', text: 'Mein Kind wacht nachts auf' },
  { id: 'frueh-wach', text: 'Mein Kind wacht sehr früh auf' },
  { id: 'widerstand', text: 'Mein Kind wehrt sich gegen das Zubettgehen' },
  { id: 'neugier', text: 'Nur Neugier' },
];

export const MITTAGSSCHLAF_MIN = 0;
export const MITTAGSSCHLAF_MAX = 150;
export const MITTAGSSCHLAF_SCHRITT = 15;

export const VORGABE: Eingaben = {
  alter: 4,
  aufstehzeit: '06:30',
  mittagsschlaf: true,
  mittagsschlafMinuten: 60,
  zubettgehzeit: '19:30',
  anliegen: 'einschlafen',
};

// ===========================================================
// Zeitrechnung
// ===========================================================

const TAG = 24 * 60;

/** "19:45" -> 1185. Gibt null zurück, wenn die Eingabe unbrauchbar ist. */
export function zuMinuten(zeit: string): number | null {
  const treffer = /^(\d{1,2}):(\d{2})$/.exec(zeit.trim());
  if (!treffer) return null;
  const stunden = Number(treffer[1]);
  const minuten = Number(treffer[2]);
  if (stunden > 23 || minuten > 59) return null;
  return stunden * 60 + minuten;
}

/** 1185 -> "19:45". Rechnet über Mitternacht hinaus korrekt um. */
export function zuUhrzeit(minuten: number): string {
  const m = ((Math.round(minuten) % TAG) + TAG) % TAG;
  const stunden = Math.floor(m / 60);
  return `${String(stunden).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Minuten seit dem Aufstehen. Damit lassen sich Abendzeiten
 * vergleichen, ohne dass Mitternacht die Reihenfolge zerstört:
 * 23:30 ist "später" als 19:00, obwohl beide Zahlen kleiner als
 * 1440 sind - und 00:15 ist noch später, nicht etwa früher.
 */
export function seitAufstehen(zeitpunkt: number, aufstehen: number): number {
  return (((zeitpunkt - aufstehen) % TAG) + TAG) % TAG;
}

/** "1 Stunde 20 Minuten", "45 Minuten", "1 Stunde". */
export function alsDauer(minuten: number): string {
  const m = Math.abs(Math.round(minuten));
  const stunden = Math.floor(m / 60);
  const rest = m % 60;
  const teile: string[] = [];
  if (stunden > 0) teile.push(stunden === 1 ? '1 Stunde' : `${stunden} Stunden`);
  if (rest > 0 || stunden === 0) {
    teile.push(rest === 1 ? '1 Minute' : `${rest} Minuten`);
  }
  return teile.join(' ');
}

// ===========================================================
// Zugriff auf die Regeldatei
// ===========================================================

/* Absichtlich lose typisiert: Die JSON-Datei wird von Hand gepflegt.
   Statt den Bau an einem Tippfehler scheitern zu lassen, prüft
   pruefeRegeln() unten und meldet den Fehler im Klartext. */
export type Regeln = Record<string, any>;

function zahl(regeln: Regeln, pfad: string, ersatz = 0): number {
  const wert = pfad.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), regeln);
  const roh = wert && typeof wert === 'object' ? wert.wert : wert;
  return typeof roh === 'number' && Number.isFinite(roh) ? roh : ersatz;
}

function text(regeln: Regeln, pfad: string, ersatz = ''): string {
  const wert = pfad.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), regeln);
  const roh = wert && typeof wert === 'object' ? wert.wert : wert;
  return typeof roh === 'string' ? roh : ersatz;
}

export function altersgruppe(regeln: Regeln, alter: number): Regeln | null {
  const gruppen: Regeln[] = Array.isArray(regeln.altersgruppen) ? regeln.altersgruppen : [];
  return gruppen.find((g) => alter >= g.von && alter <= g.bis) ?? null;
}

// ===========================================================
// Die Berechnung
// ===========================================================

export function berechne(eingaben: Eingaben, regeln: Regeln): Ergebnis | null {
  const aufstehen = zuMinuten(eingaben.aufstehzeit);
  const aktuell = zuMinuten(eingaben.zubettgehzeit);
  const gruppe = altersgruppe(regeln, eingaben.alter);
  if (aufstehen === null || aktuell === null || !gruppe) return null;

  const einschlafdauer = zahl(regeln, 'grundwerte.einschlafdauer_minuten');
  const anrechnung = zahl(regeln, 'grundwerte.mittagsschlaf_anrechnung');
  const toleranz = zahl(regeln, 'grundwerte.abweichung_toleranz_minuten');

  // Wie viel Schlaf braucht das Kind über 24 Stunden?
  const gesamtVon = (Number(gruppe.gesamtschlafbedarf_stunden_min) || 0) * 60;
  const gesamtBis = (Number(gruppe.gesamtschlafbedarf_stunden_max) || 0) * 60;

  // Der Mittagsschlaf in der Kita geht davon ab - das ist der Kern
  // des Rechners. Wie stark er angerechnet wird, steht in der
  // Regeldatei und nicht hier.
  const mittagsschlafMinuten = eingaben.mittagsschlaf
    ? Math.max(0, eingaben.mittagsschlafMinuten)
    : 0;
  const angerechnet = mittagsschlafMinuten * anrechnung;

  const nachtVon = Math.max(0, Math.min(TAG, gesamtVon - angerechnet));
  const nachtBis = Math.max(0, Math.min(TAG, gesamtBis - angerechnet));

  // Rückwärts von der Aufstehzeit: erst der Nachtschlaf, dann die
  // Zeit, die das Einschlafen selbst noch braucht.
  const fensterVonMin = aufstehen - nachtBis - einschlafdauer;
  const fensterBisMin = aufstehen - nachtVon - einschlafdauer;
  const empfehlungMin = (fensterVonMin + fensterBisMin) / 2;

  // Vergleich auf der Achse "seit dem Aufstehen", damit Mitternacht
  // die Reihenfolge nicht durcheinanderbringt.
  const sAktuell = seitAufstehen(aktuell, aufstehen);
  const sVon = seitAufstehen(fensterVonMin, aufstehen);
  const sBis = seitAufstehen(fensterBisMin, aufstehen);
  const sEmpfehlung = seitAufstehen(empfehlungMin, aufstehen);

  const lage: Lage =
    sAktuell < sVon ? 'vor-fenster' : sAktuell > sBis ? 'nach-fenster' : 'im-fenster';

  const abweichung = Math.round(sAktuell - sEmpfehlung);
  const abweichungSatz = baueAbweichungSatz(abweichung, toleranz, zuUhrzeit(empfehlungMin));

  const ursache = findeUrsache(eingaben, lage, mittagsschlafMinuten, regeln);

  const mittagBeginn = zuMinuten(text(regeln, 'grundwerte.mittagsschlaf_beginn', ''));
  const zeigeMittag = eingaben.mittagsschlaf && mittagsschlafMinuten > 0 && mittagBeginn !== null;

  return {
    fensterVon: zuUhrzeit(fensterVonMin),
    fensterBis: zuUhrzeit(fensterBisMin),
    empfehlung: zuUhrzeit(empfehlungMin),
    abweichungMinuten: abweichung,
    abweichungSatz,
    lage,
    ursache,
    nachtschlafMinutenVon: Math.round(nachtVon),
    nachtschlafMinutenBis: Math.round(nachtBis),
    quelle: typeof gruppe.quelle === 'string' ? gruppe.quelle : '',
    balken: {
      aufstehen,
      mittagVon: zeigeMittag ? mittagBeginn : null,
      mittagBis: zeigeMittag ? mittagBeginn! + mittagsschlafMinuten : null,
      fensterVon: fensterVonMin,
      fensterBis: fensterBisMin,
      empfehlung: empfehlungMin,
      aktuell,
      // Die Achse endet kurz nach dem spätesten dargestellten Punkt,
      // damit rechts nichts abgeschnitten wirkt.
      achseLaenge:
        Math.max(
          sBis,
          sAktuell,
          sEmpfehlung,
          zeigeMittag ? seitAufstehen(mittagBeginn! + mittagsschlafMinuten, aufstehen) : 0
        ) + 30,
    },
  };
}

function baueAbweichungSatz(
  abweichung: number,
  toleranz: number,
  empfehlung: string
): string {
  if (Math.abs(abweichung) <= toleranz) {
    return `Die aktuelle Zubettgehzeit passt: Sie liegt nah an der empfohlenen Zeit von ${empfehlung} Uhr.`;
  }
  if (abweichung > 0) {
    return `Ihr Kind geht ${alsDauer(abweichung)} später ins Bett als empfohlen. Die empfohlene Zeit wäre ${empfehlung} Uhr.`;
  }
  return `Ihr Kind geht ${alsDauer(abweichung)} früher ins Bett als empfohlen. Die empfohlene Zeit wäre ${empfehlung} Uhr.`;
}

/**
 * Der Entscheidungsbaum. Geht die Regeln von oben nach unten durch und
 * nimmt die erste, deren Bedingungen alle zutreffen - Reihenfolge ist
 * Rangfolge. Kein Sprachmodell, keine Gewichtung, keine Zufälligkeit.
 */
function findeUrsache(
  eingaben: Eingaben,
  lage: Lage,
  mittagsschlafMinuten: number,
  regeln: Regeln
): Ursache {
  const liste: Regeln[] = Array.isArray(regeln.regeln) ? regeln.regeln : [];

  const treffer = liste.find((regel) => {
    const wenn = regel?.wenn ?? {};

    if (Array.isArray(wenn.anliegen) && !wenn.anliegen.includes(eingaben.anliegen)) {
      return false;
    }
    if (typeof wenn.lage === 'string' && wenn.lage !== lage) {
      return false;
    }

    const schwelle = wenn.mittagsschlaf_ab_minuten;
    if (schwelle !== null && schwelle !== undefined) {
      // Eine Regel darf statt einer Zahl auf einen Grundwert zeigen,
      // damit die Schwelle nur an einer Stelle gepflegt wird.
      const grenze = typeof schwelle === 'string' ? zahl(regeln, schwelle, Infinity) : schwelle;
      if (!eingaben.mittagsschlaf || mittagsschlafMinuten < grenze) return false;
    }

    return true;
  });

  const gesucht = treffer?.dann ?? regeln.standard_ursache;
  const ursachen: Regeln[] = Array.isArray(regeln.ursachen) ? regeln.ursachen : [];
  const gefunden = ursachen.find((u) => u.id === gesucht) ?? ursachen[0];

  return {
    id: gefunden?.id ?? 'unbekannt',
    titel: gefunden?.titel ?? '',
    erklaerung: gefunden?.erklaerung ?? '',
    schritte: Array.isArray(gefunden?.schritte) ? gefunden.schritte : [],
  };
}

// ===========================================================
// Prüfung der Regeldatei
// ===========================================================

/**
 * Sucht Fehler, die beim Pflegen der JSON-Datei passieren können, und
 * beschreibt sie im Klartext. Wird beim Bauen und im Warnbalken
 * benutzt. Platzhalter sind hier NICHT gemeint - die findet
 * findePlatzhalter() in platzhalter.mjs.
 */
export function pruefeRegeln(regeln: Regeln): string[] {
  const fehler: string[] = [];

  const gruppen: Regeln[] = Array.isArray(regeln.altersgruppen) ? regeln.altersgruppen : [];
  if (gruppen.length === 0) {
    fehler.push('Es ist keine einzige Altersgruppe eingetragen.');
  }

  for (let alter = ALTER_MIN; alter <= ALTER_MAX; alter++) {
    const passende = gruppen.filter((g) => alter >= g.von && alter <= g.bis);
    if (passende.length === 0) {
      fehler.push(`Für ${alter}-jährige Kinder fehlt eine Altersgruppe.`);
    } else if (passende.length > 1) {
      fehler.push(`Für ${alter}-jährige Kinder passen ${passende.length} Altersgruppen. Die Spannen dürfen sich nicht überschneiden.`);
    }
  }

  gruppen.forEach((g, i) => {
    const min = Number(g.gesamtschlafbedarf_stunden_min);
    const max = Number(g.gesamtschlafbedarf_stunden_max);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      fehler.push(`Altersgruppe ${i + 1} (${g.von}-${g.bis} Jahre): Schlafbedarf ist keine Zahl.`);
    } else if (min > max) {
      fehler.push(`Altersgruppe ${i + 1} (${g.von}-${g.bis} Jahre): der Mindestbedarf ist größer als der Höchstbedarf.`);
    }
  });

  const anrechnung = zahl(regeln, 'grundwerte.mittagsschlaf_anrechnung', -1);
  if (anrechnung < 0 || anrechnung > 1) {
    fehler.push('grundwerte.mittagsschlaf_anrechnung muss zwischen 0 und 1 liegen.');
  }

  const beginn = text(regeln, 'grundwerte.mittagsschlaf_beginn', '');
  if (beginn && zuMinuten(beginn) === null) {
    fehler.push(`grundwerte.mittagsschlaf_beginn ist keine Uhrzeit im Format HH:MM ("${beginn}").`);
  }

  const ursachenIds = new Set(
    (Array.isArray(regeln.ursachen) ? regeln.ursachen : []).map((u: Regeln) => u.id)
  );
  if (!ursachenIds.has(regeln.standard_ursache)) {
    fehler.push(`standard_ursache verweist auf "${regeln.standard_ursache}", eine Ursache mit dieser id gibt es nicht.`);
  }

  const gueltigeAnliegen = new Set(ANLIEGEN.map((a) => a.id));
  const gueltigeLagen = new Set(['vor-fenster', 'im-fenster', 'nach-fenster']);

  (Array.isArray(regeln.regeln) ? regeln.regeln : []).forEach((r: Regeln, i: number) => {
    if (!ursachenIds.has(r.dann)) {
      fehler.push(`Regel ${i + 1} zeigt auf die Ursache "${r.dann}", die es nicht gibt.`);
    }
    const wenn = r?.wenn ?? {};
    if (Array.isArray(wenn.anliegen)) {
      wenn.anliegen
        .filter((a: string) => !gueltigeAnliegen.has(a as AnliegenId))
        .forEach((a: string) => fehler.push(`Regel ${i + 1} nennt das unbekannte Anliegen "${a}".`));
    }
    if (typeof wenn.lage === 'string' && !gueltigeLagen.has(wenn.lage)) {
      fehler.push(`Regel ${i + 1} nennt die unbekannte Lage "${wenn.lage}".`);
    }
  });

  return fehler;
}

// ===========================================================
// Ergebnisse teilbar machen
// ===========================================================

/* Nur die eingegebenen Werte wandern in die Adresszeile, damit ein
   Ergebnis weitergegeben werden kann. Nichts davon ist eine
   personenbezogene Angabe: kein Name, kein Geburtsdatum, kein Ort. */

export function zuAdresse(eingaben: Eingaben): URLSearchParams {
  const p = new URLSearchParams();
  p.set('alter', String(eingaben.alter));
  p.set('auf', eingaben.aufstehzeit);
  p.set('mittag', eingaben.mittagsschlaf ? String(eingaben.mittagsschlafMinuten) : 'nein');
  p.set('bett', eingaben.zubettgehzeit);
  p.set('thema', eingaben.anliegen);
  return p;
}

export function ausAdresse(suche: string): Eingaben | null {
  const p = new URLSearchParams(suche);
  if (!p.has('alter')) return null;

  const alter = Number(p.get('alter'));
  const aufstehzeit = p.get('auf') ?? '';
  const zubettgehzeit = p.get('bett') ?? '';
  const mittagRoh = p.get('mittag') ?? 'nein';
  const anliegen = p.get('thema') ?? '';

  if (!Number.isInteger(alter) || alter < ALTER_MIN || alter > ALTER_MAX) return null;
  if (zuMinuten(aufstehzeit) === null || zuMinuten(zubettgehzeit) === null) return null;
  if (!ANLIEGEN.some((a) => a.id === anliegen)) return null;

  const mittagsschlaf = mittagRoh !== 'nein';
  const minuten = mittagsschlaf ? Number(mittagRoh) : VORGABE.mittagsschlafMinuten;
  if (
    mittagsschlaf &&
    (!Number.isFinite(minuten) || minuten < MITTAGSSCHLAF_MIN || minuten > MITTAGSSCHLAF_MAX)
  ) {
    return null;
  }

  return {
    alter,
    aufstehzeit,
    mittagsschlaf,
    mittagsschlafMinuten: mittagsschlaf ? minuten : VORGABE.mittagsschlafMinuten,
    zubettgehzeit,
    anliegen: anliegen as AnliegenId,
  };
}
