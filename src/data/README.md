# Die fachlichen Werte des Kita-Schlaf-Rechners

Alles, was der Rechner an Schlafwissen braucht, steht in
`schlaf-regeln.json`. Im Programmcode steht keine einzige Schlafzahl.
Das heißt: Die Werte lassen sich ändern, ohne dass jemand Entwicklerin
sein muss — und ohne dass am Rechner selbst etwas kaputtgehen kann.

## Die wichtigste Regel

Jeder Eintrag, der noch nicht fachlich geprüft ist, trägt die Zeile:

```json
"_platzhalter": true
```

Solange auch nur ein einziger solcher Eintrag in der Datei steht,
passiert Folgendes:

- **Beim Arbeiten** (`npm run dev`) und in der Vorschau steht ein roter
  Warnbalken über dem Rechner, der alle offenen Stellen auflistet.
- **Beim Bau der echten Seite** bricht der Vorgang mit einer
  Fehlermeldung ab. Die Seite kann so gar nicht erst online gehen.

Das ist Absicht. Ein Schlafrechner mit ausgedachten Zahlen wäre
schlimmer als kein Schlafrechner.

Wenn ein Wert eingetragen und geprüft ist: die Zeile `"_platzhalter": true`
löschen oder auf `false` setzen. Erst dann gilt der Eintrag als fertig.

## Was in der Datei steht

### `stand`

Datum der letzten fachlichen Prüfung. Erscheint unter dem Ergebnis als
„Stand: …". Bei jeder inhaltlichen Änderung mit aktualisieren.

### `quellen`

Die Empfehlungen, auf die sich die Werte stützen — vorbereitet sind
DGSM, DGKJ und BZgA. Pro Quelle: Titel, vollständige Adresse und das
Datum, an dem sie abgerufen wurde. Diese Liste erscheint unter dem
Ergebnis.

### `grundwerte`

| Schlüssel | Bedeutung |
|---|---|
| `einschlafdauer_minuten` | Zeit zwischen „Licht aus" und tatsächlichem Einschlafen. Der Rechner schlägt die Zubettgehzeit um diesen Wert früher vor als den rechnerischen Schlafbeginn. |
| `mittagsschlaf_anrechnung` | Wie stark der Mittagsschlaf auf den Nachtschlaf angerechnet wird. `1` = jede Minute Mittagsschlaf verkürzt die Nacht um eine Minute, `0` = gar nicht. Alles zwischen 0 und 1 ist erlaubt. |
| `abweichung_toleranz_minuten` | Ab wie vielen Minuten Abweichung der Rechner die aktuelle Zubettgehzeit überhaupt kommentiert. |
| `mittagsschlaf_lang_ab_minuten` | Ab welcher Dauer der Mittagsschlaf als lang gilt. Wird in den Regeln als Bedingung benutzt. |

### `altersgruppen`

Eine Zeile pro Altersspanne, mit `von` und `bis` in Jahren. Die Spannen
müssen 2 bis 10 lückenlos abdecken und sich nicht überschneiden.
Zeilen dürfen frei zusammengefasst oder aufgeteilt werden — zum
Beispiel eine Zeile pro Lebensjahr, wenn die Quellen das hergeben.

`gesamtschlafbedarf_stunden_min` und `_max` meinen den Bedarf über
**24 Stunden**, also Nacht **plus** Mittagsschlaf. Den Mittagsschlaf
zieht der Rechner selbst ab. Dezimalzahlen sind erlaubt (`10.5`).

`quelle` nimmt das Kürzel aus der Quellenliste auf, damit unter dem
Ergebnis steht, worauf sich genau diese Altersgruppe stützt.

### `ursachen`

Die möglichen Einschätzungen des Rechners. Jede besteht aus
Überschrift, Erklärung und genau drei Schritten. Die `id` wird von den
Regeln unten angesprochen und darf nicht umbenannt werden, ohne die
Regeln mit anzupassen.

### `regeln` — der Entscheidungsbaum

Der Rechner geht die Liste **von oben nach unten** durch und nimmt die
**erste** Regel, deren Bedingungen alle zutreffen. Die Reihenfolge ist
also eine Rangfolge: Was oben steht, gewinnt.

Eine Bedingung mit `null` trifft immer zu.

| Feld | Mögliche Werte |
|---|---|
| `anliegen` | Liste aus `einschlafen`, `nachtwach`, `frueh-wach`, `widerstand`, `neugier` — oder `null` für alle |
| `lage` | `vor-fenster` (geht früher ins Bett als empfohlen), `im-fenster`, `nach-fenster` (später) — oder `null` |
| `mittagsschlaf_ab_minuten` | Zahl, `null`, oder der Text `grundwerte.mittagsschlaf_lang_ab_minuten`, um den Wert von oben zu übernehmen |

`dann` enthält die `id` der Ursache, die bei einem Treffer angezeigt
wird. `standard_ursache` greift, wenn keine einzige Regel passt.

### `abgrenzung`

Der Hinweis, wann die Frage in die kinderärztliche Praxis gehört und
nicht in einen Plan. Erscheint immer, unabhängig vom Ergebnis.

### `ausblick`

Der Textblock zum geplanten 14-Tage-Umstellungsplan unter dem Ergebnis.
Solange nichts verkauft wird, steht dort kein Preis und kein Kaufknopf.

## Wenn etwas nicht stimmt

Der Rechner prüft die Datei beim Bauen und meldet sich mit Klartext,
wenn eine Altersgruppe fehlt, eine Regel auf eine unbekannte Ursache
zeigt oder eine Zahl außerhalb des erlaubten Bereichs liegt. Diese
Meldungen stehen im Bau-Protokoll und im roten Balken über dem Rechner.
