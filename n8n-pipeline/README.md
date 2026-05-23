# n8n-Pipeline (Basis für Social Stories)

Dieser Ordner ist eine **1:1-Kopie der Story-Generierungspipeline aus dem
Lesekumpel-Projekt** (`c:\Users\raikl\Dev\lesekumpel`). Er dient als Bauklotz,
aus dem die Social-Stories-Pipeline (Carol-Gray-Methodik) für die SHG-Website
entstehen soll.

**Bei Kopierzeitpunkt unverändert übernommen — die Push-/Pfadanpassungen sind
inzwischen erledigt; die Carol-Gray-Logik fehlt noch.**

## Zugehöriger n8n-Workflow

| Feld | Wert |
|---|---|
| Name | `SHG-Story-Generator` |
| ID | `iKNT46tAjFqf0OM5` (in n8n Cloud) |
| URL | https://rala84.app.n8n.cloud/workflow/iKNT46tAjFqf0OM5 |
| Status | **active** — produktiv, generiert Stories direkt ins SHG-Repo |
| Webhook-Pfad | `shg-story` |
| Knotenzahl | 34 (von 72 reduziert) |
| Lokale Definition | [`n8n-config/workflows/shg-story-generator.json`](n8n-config/workflows/shg-story-generator.json) (Spiegel der Cloud) |

## Was schon erledigt ist (Stand: 2026-05-23)

### 1. Push-Ziele und URLs in den JS-Codes auf SHG umgestellt

| Stelle | vorher (Lesekumpel) | jetzt (SHG) |
|---|---|---|
| `assemble-html-v2.js` — `filePath` | `demo-texte/<slug>.html` | `social-stories/<altersgruppe>/<slug>.html` |
| `assemble-html-v2.js` — `storyUrl`, Hero-Img, Inline-Imgs | `rala84.github.io/lesekumpel/...` | `www.ass-elternkreis-nwm.de/...` |
| `szenen-parsen-v2.js` — `imageGithubPath` | `bilder/<slug>-<n>.png` | `social-stories/bilder/<slug>-<n>.png` |
| Workflow GitHub-Nodes — Repository | `RaLa84/lesekumpel` | `RaLa84/ass-elternkreis-nwm` |
| Workflow Template-URL (HTTP Request) | `…/lesekumpel/main/n8n-config/demo-template.html` | `…/ass-elternkreis-nwm/main/n8n-pipeline/n8n-config/demo-template.html` |
| Workflow Webhook-Pfad | `lesekumpel-story` | `shg-story` |
| Workflow Name | `Lesekumpel — Neuroinclusive Story Generator` | `SHG-Story-Generator` |

Fallback in `assemble-html-v2.js`: solange das Webhook-Feld `Altersgruppe`
nicht existiert, landet alles unter `social-stories/allgemein/<slug>.html`.

### 2. HTML-Template komplett auf SHG-Design umgebaut

`demo-template.html` ist von 1857 → ~210 Zeilen geschrumpft: SHG-Navbar +
Footer 1:1 wie [`vorschule/frage-001.html`](../vorschule/frage-001.html),
Tailwind CDN + Forest/Sunflower-Farben + Inter-Font, Hero-Bild geblurrt mit
Titel-Overlay, Article-Card mit `prose-custom`, Inline-Bilder zwischen den
Absätzen, Survey-Widget mit SheetDB-POST, "Zur Übersicht"-Link. Keine
Lesekumpel-Spiele (Quiz/Schatzsuche/Weiterdenken/Wortschatz), keine Persona-
Card, keine Coral/Fredoka-Fonts.

### 3. n8n-Workflow auf Mindest-Pipeline reduziert (72 → 34 Knoten)

Folgendes ist aus dem Workflow gelöscht:

- **Guardrail-Node** (`Guardrail: Kind-Safe + Matrix`)
- **Titel-Korrektur** (`📝 Titel korrigieren` + `⚙️ Gemini (Titel)`)
- **Persona-Switch + 8 von 9 Persona-Writern**: nur `🌉 Mia Mitte (Flüssig)`
  und ihr Gemini-Tool bleiben. `Switch: Welche Persona?` entfällt;
  `Daten vorbereiten` geht direkt zu Mia Mitte
- **Quiz-Chain**: `🧠 Quizmaster`, `⚙️ Gemini (Quiz)`, `Quiz parsen`
- **Schatzsuche-Chain**: `🔍 Schatzmeister`, `⚙️ Gemini (Schatz)`, `Schatz parsen`
- **Weiterdenken-Chain**: `🌟 Weiterdenker`, `⚙️ Gemini (Weiterdenken)`, `Weiterdenken parsen`
- **Linguistik-Chain**: `📚 Linguistik-Anreicherung`, `⚙️ Gemini (Linguistik)`, `Linguistik parsen`
- **Emoji-Chain**: `😊 Emoji-Tagger`, `⚙️ Gemini (Emoji)`, `Emoji parsen`,
  `😊 Summary-Tagger`, `Summary-Emoji parsen`

Konsequenz für `assemble-html-v2.js`: liest die Story-Daten nun aus
`$('Geschichte parsen').first().json` statt aus dem gelöschten `Schatz parsen`.

Spart pro Lauf 8 LLM-Calls und macht den Workflow lesbar — die Bild-Pipeline
(Story-Elemente → Bildszenen → Probe-Scout → Bild-Loop mit Gemini-Generator
oder Style-Ref-Fallback → GitHub-Push) bleibt unverändert.

### 4. Carol-Gray-Umstellung (2026-05-23)

Workflow erzeugt jetzt ausschließlich Social Stories nach der Methode von
Carol Gray (1993). Eingabevertrag und Story-Stil wurden hart umgestellt —
keine Rückkompatibilität zu den Lesekumpel-Feldern.

**Neuer Webhook-Vertrag** (`POST https://rala84.app.n8n.cloud/webhook/shg-story`):

```json
{
  "Titel": "Besuch beim Zahnarzt",
  "Situation": "Heute gehe ich zum Zahnarzt zur Kontrolle. Mama kommt mit. Wir warten kurz, dann werde ich auf dem Behandlungsstuhl untersucht.",
  "Verhaltensziel": "ruhig im Behandlungsstuhl liegen, den Mund öffnen lassen, mit Bohrergeräusch, hellem Licht und ungewohnten Berührungen klarkommen",
  "Altersgruppe": "grundschule"
}
```

`Altersgruppe`-Whitelist: `vorschule` · `grundschule` · `teenager` ·
`junge-erwachsene` · `erwachsene`. Ungültige Werte fallen auf `allgemein`.

**Festgesetzte Defaults** (visuelle Konsistenz über alle Stories):

- 200–300 Wörter Story-Text
- 6 Absätze (Einstieg → Vorbereitung → Erste Schritte → Höhepunkt →
  Bewältigung → Abschluss)
- 5 Bilder (Bild 1 = geblurrtes Hero + klar nach Absatz 1, Bilder 2–5
  zwischen den weiteren Absätzen)
- Bildstil fest `Traumwelt`

**Code-Änderungen**:

- [prompts/carol-gray-autor.md](prompts/carol-gray-autor.md) neu — System-Prompt
  mit Satztypen-Taxonomie (DESKRIPTIV/PERSPEKTIVISCH/DIREKTIV/AFFIRMATIV),
  Verhältnis-Regel, Story-Bogen, Sprachregeln je Altersgruppe
- [`daten-vorbereiten-v4.js`](n8n-config/daten-vorbereiten-v4.js) komplett
  neu (17 KB → ~100 Zeilen). Liest Carol-Gray-Felder, validiert Altersgruppe,
  fest `imageCount: 5` und Bildstil Traumwelt, baut `userPrompt` aus den
  Webhook-Variablen
- Cloud-Workflow: `🌉 Mia Mitte (Flüssig)` umbenannt zu `✍️ Carol-Gray-Autor`,
  System-Prompt ersetzt; `⚙️ Gemini (Mia)` umbenannt zu `⚙️ Gemini (Carol-Gray)`;
  Connections aktualisiert
- `assemble-html-v2.js` unverändert — `data.altersgruppe` kommt nun befüllt
  durch und bucketet Stories automatisch nach `social-stories/<altersgruppe>/<slug>.html`

## Was noch zu tun ist

- **GitHub-Push-Node** ist auf `operation: create`. Wenn die Story-Dateien
  (HTML + Bilder) im Repo schon existieren, scheitert ein Re-Run mit
  422 *"sha wasn't supplied"*. Workaround: vor jedem Re-Run die alten
  Artefakte per `git rm` löschen. Sauberer wäre Operation `edit` mit
  Lookup der aktuellen SHA — separater Task.
- **`bildszenen-vorbereiten-v2.js`**: Style-Reference-Pfade
  (`bilder/bildstil-vorschau/...`) zeigen noch auf das Lesekumpel-CDN.
  Bei Bedarf in SHG-Repo migrieren.
- **`social-stories/index.html`** als Hub-Seite mit 5 Altersgruppen-Kacheln
  und Übersicht der generierten Stories.
- **`searchindex.json`-Erweiterung** für Site-Suche um Social-Story-Einträge.
- **Lesekumpel-Persona-Prompts** (`prompts/mia-mitte.md`, `pip-punkt.md` etc.)
  können entfernt werden — sie werden vom Workflow nicht mehr referenziert,
  Carol-Gray-Autor hat seinen eigenen Prompt-File.
- **`n8n-config/.env`**: aus `.env.example` anlegen mit `N8N_API_KEY` aus
  der Lesekumpel-Quelle (oder eigenen erzeugen).

## SHG-Design-Constraints (wichtig für `assemble-html-v2.js`)

Das SHG-Hauptprojekt nutzt:
- **Tailwind CSS via CDN** (kein Build)
- **Bootstrap 5** als Fallback in älteren Seiten
- **Inter-Font** (Google Fonts) auf modernen Seiten, **Rubik** lokal in älteren
- **Farben**: Forest-Green `#1b4332` (Headings/Navbar), Sunflower-Yellow
  `#FFC107` (CTA), Brown `#3E2723` (Body-Text)
- **Wiederverwendbare CSS-Klassen**: `prose-custom`, `animate-on-scroll`,
  Tailwind-Grid `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Detailregeln: siehe `../STYLEGUIDE.md` und `../style.css` im Projekt-Root

Die HTML-Story-Templates müssen sich in dieses Design einfügen — also Navbar
und Footer aus `../index.html` als Includes oder als Copy-Block übernehmen,
nicht das Lesekumpel-Coral-Design.

## Empfohlene Output-Struktur für generierte Stories

```
../social-stories/
├── index.html              (Hub mit 5 Altersgruppen-Kacheln)
├── vorschule/
├── grundschule/
├── teenager/
├── junge-erwachsene/
└── erwachsene/
```

Plus `searchindex.json` (Projekt-Root) muss um Story-Einträge erweitert werden,
damit die Site-Suche sie findet.

## Was NICHT mitkopiert wurde

- `bilder/`, `comics/` aus Lesekumpel — Bildstil passt nicht zu Social Stories
- `texte/`, `demo-texte/`, `comicgeschichten/` — Lesekumpel-Output
- Lesekumpel-CSS und `design-system.html` — eigenes SHG-Design vorhanden
- `.env` selbst — Secrets bleiben strikt nur in der Lesekumpel-Quelle und in
  n8n-Cloud; hier ist nur `n8n-config/.env.example` als Vorlage

## Referenzen aus Lesekumpel (zum Nachlesen)

- `design-system.md` — Lesekumpel-Design-System (zum Vergleich, nicht 1:1
  übernehmen)
- `leseapp_konzeption.md` — Lesekumpel-Projektvision (als Inspiration)
- `knowledge-base/themen/autismus-lesen.md` — evidenzbasierte Fakten über
  Lesen bei Autismus (höchst relevant für Carol-Gray-Persona)
- `knowledge-base/themen/adhs-lesen.md`, `lrs-legasthenie.md`, `daz-lesen.md`
- `knowledge-base/praxis/tipps-eltern.md`, `tipps-lehrkraefte.md`
- `knowledge-base/meta/schema.md` — Dokumentschema der Wissensbasis

## Quick-Reference: API-Zugang

```
N8N_URL=https://rala84.app.n8n.cloud
N8N_API_KEY=<aus Lesekumpel-.env oder neu erzeugen>
```

Workflow per REST API ansprechen, **nicht** per n8n-MCP (laut Lesekumpel-Erfahrung
unzuverlässig):

```powershell
$h=@{'X-N8N-API-KEY'=$env:N8N_API_KEY}
Invoke-RestMethod -Uri "$env:N8N_URL/api/v1/workflows/iKNT46tAjFqf0OM5" -Headers $h
```
