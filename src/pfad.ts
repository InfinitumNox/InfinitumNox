/**
 * Baut interne Links so, dass sie an beiden Orten funktionieren:
 *
 *   mitwachsen.org/familie/                    (die echte Seite)
 *   benutzername.github.io/mitwachsen/familie/ (die Vorschau)
 *
 * Der Grund: Auf GitHub Pages liegt die Seite in einem Unterordner.
 * Ein fest eingetragenes "/familie/" würde dort auf
 * benutzername.github.io/familie/ zeigen - und damit ins Leere.
 *
 * Deshalb NIEMALS href="/irgendwas/" direkt schreiben,
 * sondern immer href={pfad('/irgendwas/')}.
 */
export function pfad(ziel: string): string {
  const basis = import.meta.env.BASE_URL.replace(/\/$/, '');
  return basis + (ziel.startsWith('/') ? ziel : `/${ziel}`);
}
