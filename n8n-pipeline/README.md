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
| Status | **inactive** — bewusst, vor Aktivierung Repo-Änderungen in n8n Cloud nachziehen |
| Webhook-Pfad | `shg-story` |
| Knotenzahl | 72 (identisch zum Lesekumpel-Original `eHfC95UaMbJMcLTb`) |
| Lokale Definition | [`n8n-config/workflows/shg-story-generator.json`](n8n-config/workflows/shg-story-generator.json) |

Die lokale JSON enthält bereits die SHG-Pfade (Repo: `ass-elternkreis-nwm`,
Webhook: `shg-story`, Template-URL aus SHG-Repo). Die n8n-Cloud-Instanz muss
einmalig nachgezogen werden — entweder per UI oder per REST-Re-Import der JSON.

## Was schon erledigt ist (Stand: 2026-05-23)

Push-Ziele und URLs in den JS-Codes auf SHG umgestellt:

| Stelle | vorher (Lesekumpel) | jetzt (SHG) |
|---|---|---|
| `assemble-html-v2.js` — `filePath` | `demo-texte/<slug>.html` | `social-stories/<altersgruppe>/<slug>.html` |
| `assemble-html-v2.js` — `storyUrl`, Hero-Img, Inline-Imgs | `rala84.github.io/lesekumpel/...` | `www.ass-elternkreis-nwm.de/...` |
| `szenen-parsen-v2.js` — `imageGithubPath` | `bilder/<slug>-<n>.png` | `social-stories/bilder/<slug>-<n>.png` |
| Workflow-JSON — GitHub-Nodes Repository | `RaLa84/lesekumpel` | `RaLa84/ass-elternkreis-nwm` |
| Workflow-JSON — Template-URL (HTTP Request) | `…/lesekumpel/main/n8n-config/demo-template.html` | `…/ass-elternkreis-nwm/main/n8n-pipeline/n8n-config/demo-template.html` |
| Workflow-JSON — Webhook-Pfad | `lesekumpel-story` | `shg-story` |
| Workflow-JSON — Name / id / active | `Lesekumpel — …` / `eHfC95UaMbJMcLTb` / `true` | `SHG-Story-Generator` / *(entfernt)* / `false` |

Fallback in `assemble-html-v2.js`: solange das Webhook-Feld `Altersgruppe`
nicht existiert, landet alles unter `social-stories/allgemein/<slug>.html`.

## Was noch zu tun ist

### Im n8n-Workflow (Cloud-UI)

- Die JSON-Änderungen sind aktuell nur lokal — die **n8n-Cloud-Instanz
  `iKNT46tAjFqf0OM5` muss noch nachgezogen werden** (GitHub-Nodes auf
  `ass-elternkreis-nwm`, Template-URL, Webhook-Pfad, Name). Entweder per
  UI klicken oder Workflow per REST-API ersetzen.
- **Persona-/Neurotyp-Logik** → für Carol-Gray-Stories braucht es andere
  Eingabe-Felder: `Situation`, `Verhaltensziel`, `Altersgruppe`. Sobald
  `Altersgruppe` durch den Webhook kommt, bucketet `assemble-html-v2.js`
  automatisch korrekt.

### In dieser Ordnerstruktur

| Datei | Was anpassen |
|---|---|
| `n8n-config/assemble-html-v2.js` | HTML-Template an SHG-Design: **Tailwind, Forest-Green (#1b4332), Sonnen-Gelb (#FFC107), Inter-Font** — NICHT Coral/Fredoka/Quicksand aus Lesekumpel |
| `n8n-config/daten-vorbereiten-v4.js` | Webhook-Felder umstellen: `Situation`/`Verhaltensziel`/`Altersgruppe` statt `Persona`/`Neurotyp` |
| `n8n-config/bildszenen-vorbereiten-v2.js` | Style-Reference-Pfade (`bilder/bildstil-vorschau/...`) zeigen noch auf das Lesekumpel-CDN; bei Bedarf in SHG-Repo migrieren |
| `prompts/*.md` | Neuer Carol-Gray-Persona-Prompt; die Lesekumpel-Personas (pip-punkt, mia-mitte etc.) dienen nur als Strukturvorlage |
| `n8n-config/.env` | Anlegen aus `.env.example`, mit `N8N_API_KEY` aus der Lesekumpel-Quelle (oder eigenen ableiten) |

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
