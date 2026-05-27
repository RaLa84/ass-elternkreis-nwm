# Social Story erstellen und deployen

Erstelle eine Carol-Gray-Social-Story zum Thema: **$ARGUMENTS**

Fuehre ALLE Schritte selbstaendig aus — vom Webhook-Trigger bis zum fertigen Commit. Frage nur, wenn die Altersgruppe nicht klar ist.

---

## 1. Carol-Gray-Felder bestimmen

Leite aus dem Thema vier Felder ab:

| Feld | Beschreibung | Beispiel |
|------|-------------|---------|
| **Titel** | Kurzer, neutraler Titel | "Beim Friseur" |
| **Situation** | 3-5 Saetze: was passiert konkret, wo, wer ist dabei, welche sensorischen Reize | "Heute gehe ich zum Friseur. Im Salon gibt es Spiegel, laute Foehns und den Geruch von Shampoo. Die Friseurin waescht mir die Haare und schneidet sie." |
| **Verhaltensziel** | Was soll die Person koennen/aushalten | "mit den sensorischen Reizen klarkommen, still sitzen bleiben, kommunizieren wenn etwas unangenehm ist" |
| **Altersgruppe** | Eines von: `vorschule`, `grundschule`, `teenager`, `junge-erwachsene`, `erwachsene` | "teenager" |

Optional: **Hauptfigur** (`Maedchen`, `Junge`, `nicht-binaer`) — wenn nicht angegeben, rotiert der Workflow automatisch per Hash.

Wenn die Altersgruppe aus $ARGUMENTS nicht klar hervorgeht, frage per AskUserQuestion nach.

## 2. Webhook triggern

```python
import urllib.request, json
body = {
    'Titel': '<TITEL>',
    'Situation': '<SITUATION>',
    'Verhaltensziel': '<VERHALTENSZIEL>',
    'Altersgruppe': '<ALTERSGRUPPE>',
    # Optional: 'Hauptfigur': 'Maedchen' / 'Junge' / 'nicht-binaer'
}
raw = json.dumps(body, ensure_ascii=False).encode('utf-8')
req = urllib.request.Request(
    'https://rala84.app.n8n.cloud/webhook/shg-story',
    data=raw, method='POST',
    headers={'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json'}
)
with urllib.request.urlopen(req, timeout=30) as r:
    print('HTTP', r.status, r.read().decode('utf-8'))
```

Erwartete Antwort: `HTTP 202 {"status":"accepted"}`

## 3. Execution beobachten

API-Key laden aus `c:\Users\raikl\Dev\lesekumpel\n8n-config\.env` (Feld `N8N_API_KEY`).
Workflow-ID: `iKNT46tAjFqf0OM5`

Pollen alle 45 Sekunden bis `status != 'running'`, Timeout 9 Minuten:

```python
GET https://rala84.app.n8n.cloud/api/v1/executions?workflowId=iKNT46tAjFqf0OM5&limit=3&status=running
# Header: X-N8N-API-KEY: <key>
```

Bei **Error**: Fehlerdetails holen:
```python
GET https://rala84.app.n8n.cloud/api/v1/executions/<ID>?includeData=true
```
- Bei `422 "sha wasn't supplied"`: die Story-Dateien existieren schon im Repo. Loesche sie per `git rm` + `git push`, dann triggere den Webhook erneut.
- Bei `safety_violations`: OpenAI hat ein Bild abgelehnt. Einfach nochmal triggern (Probe-Pipeline waehlt stochastisch ein anderes Modell).

## 4. git pull + Dateien identifizieren

```bash
git pull origin main
```

Die neuen Dateien liegen unter:
- `social-stories/<altersgruppe>/<slug>.html`
- `social-stories/bilder/<slug>-{1..5}.png`

Slug ist deterministisch aus Titel + Situation + Altersgruppe gehasht. Finde ihn per:
```bash
ls social-stories/<altersgruppe>/
```

## 5. Hub-Seite aktualisieren

Datei: `social-stories/index.html`

**Wenn die Altersgruppen-Section noch einen Platzhalter hat** ("Hier entstehen bald Geschichten"):
Ersetze den Platzhalter-Block durch ein Card-Grid:
```html
<div class="grid gap-6 sm:grid-cols-2">
  <!-- Story-Card hier -->
</div>
```

**Card-Template** (an die bestehenden Cards in der Datei angelehnt):
```html
<article class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
  <a href="<altersgruppe>/<slug>.html" class="block">
    <img src="bilder/<slug>-1.png" alt="" class="w-full aspect-square object-cover">
  </a>
  <div class="p-5 flex flex-col flex-grow">
    <h3 class="text-lg font-bold text-forest mb-2">
      <a href="<altersgruppe>/<slug>.html" class="hover:underline"><TITEL></a>
    </h3>
    <p class="text-sm text-gray-600 leading-relaxed flex-grow"><KURZE BESCHREIBUNG aus Situation, 1-2 Saetze></p>
    <a href="<altersgruppe>/<slug>.html" class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-forest hover:text-forest-light">Lesen →</a>
  </div>
</article>
```

## 6. Relevante Bestandsseiten suchen + Querverweise einfuegen

Grepe ueber alle FAQ-Dateien (`vorschule/`, `grundschule/`, `teenager/`, `junge-erwachsene/`, `erwachsene/`, `wissen/`) nach Schluesselwoertern aus Titel und Situation.

Pro Treffer entscheide: passt ein Querverweis thematisch? Nur einfuegen wo es KLAR passt — max. 1-3 Querverweise pro Story, eher weniger.

**Lesetipp-Box-Template:**
```html
<div class="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5 my-6">
  <div class="font-bold text-gray-900 mb-2">📖 Lesetipp</div>
  <p><KONTEXTBEZOGENER SATZ>: <a href="../social-stories/<altersgruppe>/<slug>.html" class="text-forest font-medium underline hover:text-forest-light">"<TITEL>"</a>. <KURZER NUTZEN-SATZ>.</p>
</div>
```

Fuege den Block an einer thematisch passenden Stelle ein (nach einem Tipp-Block, vor dem Quellen-Block, oder nach einem relevanten Absatz).

## 7. SEO-Indizes erweitern

**sitemap.xml** — vor `</urlset>` einfuegen:
```xml
<url><loc>https://www.ass-elternkreis-nwm.de/social-stories/<altersgruppe>/<slug>.html</loc><priority>0.7</priority></url>
```

**searchindex.json** — ein neues Objekt am Ende des Arrays:
```json
{
  "title": "<TITEL>",
  "category": "Soziale Geschichten",
  "preview": "<1-2 Saetze aus der Situation>",
  "url": "social-stories/<altersgruppe>/<slug>.html",
  "tags": ["<tag1>", "<tag2>", "<tag3>", "Carol Gray"]
}
```

Nach dem Editieren validieren:
- `python -c "import json; json.load(open('searchindex.json',encoding='utf-8')); print('OK')"` 
- `python -c "import xml.etree.ElementTree as ET; ET.parse('sitemap.xml'); print('OK')"`

## 8. Playwright Live-Test

Warte bis GitHub Pages deployed hat:
```bash
until curl -s "https://www.ass-elternkreis-nwm.de/social-stories/<altersgruppe>/<slug>.html" | grep -q '<title>'; do sleep 5; done
```

Dann per Playwright:
- Seite oeffnen, **0 Console-Errors** verifizieren (die Tailwind-CDN-Warning zaehlt nicht)
- Fullpage-Screenshot erstellen und dem User zeigen
- Browser schliessen, Screenshot-Datei loeschen

## 9. Commit + Push

```
git add -A
git commit -m "Social Story: <TITEL> (<altersgruppe>)

Hub-Seite aktualisiert, <N> Querverweise in Bestandsseiten,
sitemap.xml + searchindex.json ergaenzt.
Generiert via n8n-Workflow iKNT46tAjFqf0OM5."
git push origin main
```

## 10. Status-Report

Zeige dem User:
1. **Live-URL**: `https://www.ass-elternkreis-nwm.de/social-stories/<altersgruppe>/<slug>.html`
2. **Carol-Gray-Plausibilitaet** — pruefe die generierte Story auf:
   - [ ] Ich-Perspektive durchgaengig
   - [ ] Praesens durchgaengig
   - [ ] Kein "stolz auf mich", "gut geschafft", "brav" im Schluss-Absatz
   - [ ] Mindestens 1 COOPERATIVE-Satz ("Mama bleibt", "Die Lehrerin kommt")
   - [ ] 2-3 Optionen im Bewaeltigungs-Absatz (nicht nur eine Strategie)
   - [ ] Affirmative variiert (nicht nur "Das ist okay")
   - [ ] Keine Silbentrennung (wird serverseitig gestrippt, aber pruefen)
3. **Querverweise**: welche Bestandsseiten wurden verlinkt
4. **Hub-Seite**: Bestaetigung dass die Card eingefuegt wurde

---

## Bekannte Fallstricke

- **sha-Konflikt bei Re-Run**: Wenn derselbe Slug schon existiert (gleiche Inputs), scheitert der GitHub-Push-Node mit 422. Loesung: `git rm` der alten Dateien + `git push`, dann Webhook erneut triggern.
- **OpenAI-Safety-False-Positive**: Watercolor-Kinderdarstellungen triggern manchmal OpenAIs `safety_violations=[sexual]`-Filter. Einfach nochmal triggern.
- **Bilder-Alter/Gender**: Der Workflow leitet Alter aus der Altersgruppe ab (vorschule=5, grundschule=9, teenager=15, junge-erwachsene=23, erwachsene=38) und rotiert Gender deterministisch. Optionaler Override via `Hauptfigur`-Feld.
