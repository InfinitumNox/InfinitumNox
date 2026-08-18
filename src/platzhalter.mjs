/**
 * Sucht in einem beliebigen Datenobjekt nach nicht ausgefüllten
 * Einträgen. Als "nicht ausgefüllt" gilt jedes Objekt, das
 * "_platzhalter": true trägt.
 *
 * Bewusst als .mjs in schlichtem JavaScript: Diese Datei wird von zwei
 * sehr verschiedenen Stellen benutzt und muss an beiden ohne Umbau
 * laufen -
 *
 *   1. von astro.config.mjs, also direkt von Node beim Bauen
 *      (dort gibt es keinen TypeScript-Übersetzer),
 *   2. vom Rechner selbst, um den roten Warnbalken zu füllen.
 *
 * Damit gibt es genau eine Wahrheit darüber, was ein Platzhalter ist.
 */

/**
 * @param {unknown} knoten - beliebiger Ausschnitt der Daten
 * @param {string} pfad - interner Parameter für die Rekursion
 * @returns {string[]} Pfade aller Platzhalter, z. B. "altersgruppen[0]"
 */
export function findePlatzhalter(knoten, pfad = '') {
  const treffer = [];

  if (Array.isArray(knoten)) {
    knoten.forEach((eintrag, i) => {
      treffer.push(...findePlatzhalter(eintrag, `${pfad}[${i}]`));
    });
    return treffer;
  }

  if (knoten && typeof knoten === 'object') {
    if (knoten._platzhalter === true) {
      treffer.push(pfad || '(Wurzel)');
    }
    for (const [schluessel, wert] of Object.entries(knoten)) {
      if (schluessel === '_platzhalter') continue;
      treffer.push(
        ...findePlatzhalter(wert, pfad ? `${pfad}.${schluessel}` : schluessel)
      );
    }
    return treffer;
  }

  return treffer;
}

/**
 * Baut aus den gefundenen Platzhaltern eine Meldung, die auch jemand
 * versteht, der nicht programmiert.
 *
 * @param {string[]} pfade
 * @param {string} datei
 */
export function platzhalterMeldung(pfade, datei = 'src/data/schlaf-regeln.json') {
  return [
    `Noch nicht ausgefüllt: In ${datei} stehen ${pfade.length} Einträge,`,
    'die als Platzhalter markiert sind.',
    '',
    'Betroffen sind:',
    ...pfade.map((p) => `  - ${p}`),
    '',
    'So geht es weiter:',
    `  1. In ${datei} den echten Wert eintragen.`,
    '  2. In demselben Eintrag die Zeile "_platzhalter": true löschen.',
    '  3. Erneut bauen.',
    '',
    'Die Seite wird absichtlich nicht gebaut, solange sie ungeprüfte',
    'Angaben ausgeben würde.',
  ].join('\n');
}
