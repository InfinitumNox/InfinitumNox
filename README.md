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

**Bevor** du die Seite irgendwo verlinkst.

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
  pfad.ts              Sorgt dafür, dass Links an beiden Orten stimmen.
  content.config.ts    Welche Felder ein Artikel haben muss.
  content/
    familie/           Markdown → mitwachsen.org/familie/dateiname/
    praxis/
    lernen/
  pages/
    impressum.astro    ← ausfüllen
    datenschutz.astro  ← ausfüllen
  layouts/             Der Rahmen um den Inhalt.
  components/          Kopf, Fuß, Artikelvorschau.
  styles/global.css    Farben und Schriften, alles über Variablen oben.

public/
  admin/config.yml     Die Felder, die sie im Editor sieht.
  admin/sveltia-cms.js Der Editor selbst, bewusst mitgeliefert.
  bilder/              Hochgeladene Titelbilder, über den Editor befüllt.
  fonts/               Schriften, lokal ausgeliefert.

.github/workflows/     Bauanleitung für die Vorschau.
```

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

- Kontaktformular (aktuell nur eine E-Mail-Adresse)
- Newsletter-Anmeldung mit Double-Opt-in über Brevo
- Eine Seite „Über uns"
