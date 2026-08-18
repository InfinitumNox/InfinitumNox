# mitwachsen.org

Statische Website mit Astro. Inhalte liegen als Markdown in
`src/content/`, geschrieben wird über eine Weboberfläche unter `/admin/`.

Es gibt zwei Stufen. **Stufe 1 kostet nichts und lässt sich jederzeit wieder
löschen.** Fang damit an. Stufe 2 erst, wenn dir gefällt, was du siehst.

---

# Stufe 1 — Vorschau auf GitHub Pages

Ergebnis: Die echte Seite läuft unter
`https://DEINNAME.github.io/mitwachsen/` — inklusive Editor. Keine Domain,
kein Cloudflare, keine Kosten.

### 1.1 Repository anlegen

Auf GitHub ein neues Repository namens `mitwachsen` erstellen.

**Es muss öffentlich sein.** GitHub Pages funktioniert bei privaten
Repositories nur mit bezahltem Konto. In dieser Stufe ist das kein Problem —
es stehen nur Blindtexte drin.

### 1.2 Dateien hochladen

Im Repository: **Add file → Upload files**, dann den Inhalt dieses Ordners
hineinziehen.

Diese Ordner **nicht** mit hochladen, die entstehen automatisch:
`node_modules`, `dist`, `.astro`

Der versteckte Ordner `.github` **muss** mit — darin steht die Bauanleitung.
Falls dein Dateimanager ihn nicht anzeigt: bei Windows unter Ansicht
„Ausgeblendete Elemente" anhaken, bei macOS `Cmd + Shift + .` drücken.

### 1.3 Pages einschalten

Im Repository: **Settings → Pages → Source** auf **GitHub Actions** stellen.

Fertig. Unter dem Reiter **Actions** kannst du zusehen, wie gebaut wird. Nach
ein bis zwei Minuten ist die Seite da. Ab jetzt baut sich alles bei jeder
Änderung von selbst neu.

### 1.4 Editor benutzen

`public/admin/config.yml` steht bereits auf `InfinitumNox/InfinitumNox`. Nur
bei einer Kopie unter einem anderen Konto muss dort `repo:` angepasst werden.

Dann `https://DEINNAME.github.io/mitwachsen/admin/` aufrufen. Der Login geht
über **„Sign In Using Access Token"**. Den Token erzeugst du einmalig:

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**
2. Unter **Repository access** nur `mitwachsen` auswählen
3. Unter **Permissions → Repository permissions** bei **Contents** auf
   **Read and write** stellen
4. Token erzeugen, kopieren, im Editor einfügen

Der Token ist wie ein Passwort — nicht weitergeben, nirgends abspeichern.

Ab hier funktioniert alles echt: Sie schreibt einen Artikel, klickt
speichern, und ein bis zwei Minuten später steht er auf der Seite. Genau so
läuft es später auch.

---

# Stufe 2 — Livegang unter mitwachsen.org

Erst machen, wenn Stufe 1 überzeugt.

### 2.1 Cloudflare-Konto und Domain

[cloudflare.com](https://cloudflare.com) registrieren, dann unter **Domain
Registration → Register Domain** `mitwachsen.org` kaufen. Rund 10 $ im Jahr,
ohne Aufschlag.

**Nicht woanders kaufen und dann umziehen.** Eine frisch registrierte Domain
darf 60 Tage lang nicht transferiert werden. Das ist eine Regel der
Registrierungsstelle.

### 2.2 Cloudflare Pages verbinden

**Workers & Pages → Create → Pages → Connect to Git**, dasselbe Repository
auswählen.

| Feld | Wert |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |

Wichtig: Hier **keine** Variable `VORSCHAU_GITHUB` setzen. Ohne sie baut das
Projekt automatisch für die echte Domain.

Falls das Repository jetzt privat werden soll: Bei Cloudflare geht das,
GitHub Pages hört dann allerdings auf zu funktionieren.

### 2.3 Domain zuweisen

In den Pages-Einstellungen unter **Custom domains** `mitwachsen.org`
hinzufügen. Ein Klick, weil die Domain schon bei Cloudflare liegt.

### 2.4 Impressum und Datenschutz ausfüllen

**Bevor** du die Seite irgendwo verlinkst. Der Bau bricht ohnehin ab,
solange dort Platzhalter stehen — siehe „Was ausgefüllt werden muss".

- `src/pages/impressum.astro` — Block ganz oben, alle
  GROSSBUCHSTABEN-Platzhalter ersetzen. Bei einem Verein `rechtsform` auf
  `'verein'` stellen.
- `src/pages/datenschutz.astro` — ebenso. Abschnitte zu Diensten, die du
  nicht nutzt, komplett löschen.

Die Datenschutzerklärung beschreibt genau diesen Aufbau (Cloudflare,
Plausible, Brevo). Sie ist trotzdem eine Rohfassung und kein Rechtsrat —
einmal gegenprüfen lassen.

### 2.5 E-Mail-Adresse

Cloudflare bietet kein Postfach.

- **Empfangen:** Dashboard → **Email → Email Routing**, kostenlos
  weiterleiten.
- **Senden:** Postfach bei [mailbox.org](https://mailbox.org) oder
  [Posteo](https://posteo.de), 1–3 € im Monat.

### 2.6 Bequemer Editor-Login

Damit sie keinen Token mehr braucht, sondern nur auf „Sign In with GitHub"
klickt: eine GitHub OAuth App anlegen, den Worker `sveltia-cms-auth` bei
Cloudflare aufsetzen, dann in `public/admin/config.yml` die Zeile `base_url`
einkommentieren. Optional — der Token funktioniert weiter.

### 2.7 Statistik

Konto bei [plausible.io](https://plausible.io), dann in
`src/layouts/Basis.astro` vor `</head>`:

```html
<script defer data-domain="mitwachsen.org" src="https://plausible.io/js/script.js"></script>
```

Kein Cookie-Banner nötig, solange nichts Einwilligungspflichtiges dazukommt.
Sobald irgendwo ein YouTube-Video oder eine Google-Karte eingebettet wird,
ändert sich das.

### 2.8 Bei Google anmelden

[Search Console](https://search.google.com/search-console) → Property vom Typ
**Domain** → TXT-Eintrag im Cloudflare-DNS hinterlegen. Dann unter
**Sitemaps** eintragen:

```
https://mitwachsen.org/sitemap-index.xml
```

Die Vorschau auf GitHub Pages ist für Suchmaschinen gesperrt und stört dabei
nicht.

---

## Wo was liegt

```
src/
  bereiche.ts          Die drei Bereiche. Ein vierter kommt hier rein.
  rechner.ts           Welche Rechner es gibt. published steuert die Anzeige.
  schlaf.ts            Rechenlogik des Kita-Schlaf-Rechners. Ohne Schlafzahlen.
  platzhalter.mjs      Findet nicht ausgefüllte Einträge in den Datendateien.
  pfad.ts              Sorgt dafür, dass Links an beiden Orten stimmen.
  content.config.ts    Welche Felder ein Artikel haben muss.
  data/
    schlaf-regeln.json ← AUSFÜLLEN. Alle fachlichen Werte des Rechners.
    autorin.json       ← AUSFÜLLEN. Name, Foto, Texte über dich.
    README.md          Erklärt jedes einzelne Feld der beiden Dateien.
  content/
    familie/           Markdown → mitwachsen.org/familie/dateiname/
    praxis/
    lernen/
  pages/
    index.astro        Startseite: Überschrift, Rechner, Autorin, Artikel.
    ueber.astro        Über mich. Text kommt aus data/autorin.json.
    impressum.astro    ← AUSFÜLLEN
    datenschutz.astro  ← AUSFÜLLEN
    guides/            Nicht verlinkt, auf noindex. Wartet auf ein Produkt.
  layouts/             Der Rahmen um den Inhalt.
  components/
    SchlafRechner.astro  Formular, Ergebnis und Tagesbalken.
    Autorin.astro        Der Vertrauensbaustein unter dem Rechner.
    Quellen.astro        Quellenliste mit Stand-Datum.
    Kopf.astro, Fuss.astro, BlogKarte.astro, ArtikelKarte.astro, Symbol.astro
  styles/global.css    Farben, Schriften, Abstands- und Größenskala.

public/
  admin/config.yml     Die Felder, die sie im Editor sieht.
  admin/sveltia-cms.js Der Editor selbst, bewusst mitgeliefert.
  bilder/              Hochgeladene Titelbilder, über den Editor befüllt.
  fonts/               Schriften, lokal ausgeliefert.

.github/workflows/     Bauanleitung für die Vorschau.
```

---

## Was ausgefüllt werden muss, bevor die Seite online geht

Die Seite baut sich **absichtlich nicht**, solange eine dieser Stellen
noch Platzhalter enthält. Beim Bauen erscheint dann eine Meldung im
Klartext, die genau sagt, welcher Eintrag fehlt.

In der Vorschau (mit `VORSCHAU_GITHUB`) bricht der Bau nicht ab —
stattdessen steht ein roter Warnbalken über dem Rechner, der alle
offenen Stellen auflistet. So lässt sich der Zwischenstand ansehen,
ohne dass er versehentlich live gehen kann.

| Datei | Was da rein muss |
| --- | --- |
| `src/data/schlaf-regeln.json` | Schlafbedarf pro Altersgruppe, Einschlafdauer, Anrechnung des Mittagsschlafs, die Texte zu den Einschätzungen, der Abgrenzungshinweis und die Quellen. Jedes Feld ist in `src/data/README.md` erklärt. |
| `src/data/autorin.json` | Name, Foto, zwei Sätze für den Baustein unter dem Rechner und der längere Text für die Seite `/ueber/`. |
| `src/pages/impressum.astro` | Alle GROSSBUCHSTABEN-Platzhalter. |
| `src/pages/datenschutz.astro` | Ebenso. |

**So wird ein Eintrag als fertig markiert:** den echten Wert eintragen
und im selben Eintrag die Zeile `"_platzhalter": true` löschen. Erst
dann gilt er als geprüft.

Die Schlafwerte gehören aus den Empfehlungen von DGSM, DGKJ und BZgA
übernommen, mit Quellenangabe pro Altersgruppe. Sie sind bewusst nicht
vorbelegt: Ein Schlafrechner mit ausgedachten Zahlen wäre schlimmer als
kein Schlafrechner.

---

## Regeln, die du nicht brechen solltest

**Interne Links immer über `pfad()` schreiben**, nie als festes
`href="/familie/"`. Sonst funktioniert die Vorschau nicht mehr, weil sie im
Unterordner liegt.

**Schriften niemals über Google Fonts CDN einbinden.** Dabei geht die
IP-Adresse jedes Besuchers an Google. Dafür ist in Deutschland abgemahnt
worden. Die Schriften liegen deshalb in `public/fonts/`.

**URL-Struktur nicht mehr ändern.** Alle Adressen enden mit Schrägstrich.
Falls doch etwas umziehen muss: `public/_redirects` mit einer
301-Weiterleitung, dann bleibt der SEO-Wert erhalten.

**Dateinamen sind URLs.** `wutanfaelle-im-supermarkt.md` wird zu
`/familie/wutanfaelle-im-supermarkt/`. Kleinbuchstaben, Bindestriche, keine
Umlaute.

---

## Lokal arbeiten

Brauchst du nur, wenn du am Aussehen etwas ändern willst.

```bash
npm install     # einmalig
npm run dev     # localhost:4321
npm run build   # baut nach dist/

# So testest du die Vorschau-Fassung:
VORSCHAU_GITHUB="deinname/mitwachsen" npm run build
```

---

## Was noch fehlt

- Die fachlichen Werte in `src/data/schlaf-regeln.json` (siehe oben)
- Foto und Texte in `src/data/autorin.json`
- Artikel zum Thema Schlaf. Die drei vorhandenen Texte sind
  Beispieltexte und sollten ersetzt oder auf `entwurf: true` gesetzt
  werden, bevor die Seite öffentlich wird.
- Kontaktformular (aktuell nur eine E-Mail-Adresse)
- Newsletter-Anmeldung mit Double-Opt-in über Brevo
- Das Bezahlprodukt (14-Tage-Umstellungsplan) und damit die Seite
  `/guides/`, die so lange unverlinkt und auf noindex bleibt
