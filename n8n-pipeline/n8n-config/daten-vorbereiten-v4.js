// Eingabe-Pipeline für Carol-Gray-Social-Stories.
//
// Liest die vier Webhook-Felder (Titel, Situation, Verhaltensziel, Altersgruppe)
// und bereitet alles vor, was die downstream Nodes brauchen:
//  - slug (deterministisch hashbasiert, gleiche Eingabe -> gleiche Datei)
//  - imageStylePositive/Negative (fest „Traumwelt", einziger Bildstil)
//  - imageCount = 5 (Hero-Bild + 4 Inline-Bilder zwischen den Absätzen)
//  - description (kurze Variante der Situation für SEO-Meta-Tag)
//  - userPrompt (Variablen-Block für den Carol-Gray-Autor-LLM-Node)
//
// Alle Lesekumpel-Konzepte (Persona, Neurotyp, Bildstil-Auswahl, mitBildern,
// Persona-Meta-Map mit Wortzahlen/Tempus/Avataren) sind entfernt — der Workflow
// produziert ausschließlich Carol-Gray-Social-Stories.

const webhookInput = $('Webhook: Geschichte anfordern').first().json;
const input = webhookInput.body || webhookInput;

const title = (input['Titel'] || '').trim();
const situation = (input['Situation'] || '').trim();
const verhaltensziel = (input['Verhaltensziel'] || '').trim();
const altersgruppeRaw = (input['Altersgruppe'] || 'allgemein').trim().toLowerCase();

const ALLOWED_ALTERSGRUPPEN = ['vorschule', 'grundschule', 'teenager', 'junge-erwachsene', 'erwachsene'];
const altersgruppe = ALLOWED_ALTERSGRUPPEN.includes(altersgruppeRaw) ? altersgruppeRaw : 'allgemein';

// Slug — deterministisch via DJB2-Hash. Gleicher Titel + Situation + Altersgruppe
// -> gleicher Slug -> gleiche Dateipfade (Idempotenz bei Caller-Retry).
const umlautMap = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue' };
const slugBase = (title.toLowerCase()
  .replace(/[äöüßÄÖÜ]/g, c => umlautMap[c] || c)
  .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
  .substring(0, 55) || 'neue-geschichte');
const slugInput = title + '|' + situation + '|' + altersgruppe;
let _h = 5381;
for (let i = 0; i < slugInput.length; i++) { _h = ((_h * 33) ^ slugInput.charCodeAt(i)) | 0; }
const slugSuffix = ((_h >>> 0).toString(36) + '0000').substring(0, 4);
const slug = slugBase + '-' + slugSuffix;

// Bildstil ist fest „Aquarell" — warmes, kinderbuchartiges Handgemalt-Gefühl
// (Beatrix Potter / Quentin Blake). Sorgt für visuelle Konsistenz über alle
// Stories. Frühere Wahl „Traumwelt" produzierte mit ihren großen Anime-Augen
// und kühlem Rim-Light teils distanziert/melancholisch wirkende Gesichter.
const imageStylePositive = "traditional children's book watercolor illustration, hand-painted with warm cream paper texture filling the entire image, soft pastel palette, gentle wet-on-wet washes with visible bleeding edges, loose expressive brush strokes, soft painterly rendering, warm friendly facial expressions, inspired by Beatrix Potter and Quentin Blake, consistent palette and brush handling across all panels of this story, same character proportions and facial features in every panel, full bleed composition extending to all four image edges, no inner framing, subjects and background reach every corner of the image, square 1:1 aspect ratio";
const imageStyleNegative = "no text, no watermarks, no labels, no tags, no annotations, no nameplates, no UI overlays, no callouts, no captions, no speech bubbles, no sign text, no alphanumeric text in image, no letterboxing, no black bars, no white margin, no cream margin, no paper border, no inner matte, no mat board, no illustration frame, no vignette, no aspect-ratio padding, no hard black outlines, no digital vector look, no CGI, no 3D shading, no photorealism, no extra limbs, no duplicate props, no floating objects, no mixed art styles, no style drift, no oversized anime eyes, no rim lighting, no eerie atmosphere, no melancholic faces";

const imageCount = 5;

// Alter & Geschlecht der Hauptfigur ("Ich") für die Bildgenerierung deterministisch
// festlegen. Ohne diese explizite Vorgabe interpretiert der Story-Elemente-Extraktor
// das Alter aus dem Story-Text-Kontext (oft falsch: alle Stories landeten bei 8 J.)
// und wählt das Geschlecht aus seinem Trainingsbias (fast immer männlich).
//
// Alter pro Altersgruppe (Mitte des Bereichs):
const AGE_MAP = {
  'vorschule': 5,
  'grundschule': 9,
  'teenager': 15,
  'junge-erwachsene': 23,
  'erwachsene': 38,
  'allgemein': 9
};
const mainCharacterAge = AGE_MAP[altersgruppe] || 9;

// Geschlecht: optional per Webhook-Feld "Hauptfigur" überschreibbar, sonst
// deterministische Rotation über alle 3 Gender, basierend auf Slug-Hash.
const hauptfigurInput = (input['Hauptfigur'] || '').toString().trim().toLowerCase();
let mainCharacterGender;
if (/m[aä]dchen|frau|weibl/.test(hauptfigurInput))                mainCharacterGender = 'female';
else if (/junge|mann|männl|maennl/.test(hauptfigurInput))         mainCharacterGender = 'male';
else if (/nicht.?binär|nicht.?binaer|non.?binary|nb/.test(hauptfigurInput)) mainCharacterGender = 'non-binary';
else {
  const GENDERS = ['female', 'male', 'non-binary'];
  mainCharacterGender = GENDERS[Math.abs(_h) % GENDERS.length];
}

// SEO-Beschreibung: erste 140 Zeichen der Situation, an Wortgrenze geschnitten.
function shortDesc(text, maxLen) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= maxLen) return s;
  const cut = s.substring(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.6 ? cut.substring(0, lastSpace) : cut).trimEnd() + '…';
}
const description = shortDesc(situation, 140);

// User-Prompt für den Carol-Gray-Autor-LLM. Der System-Prompt (siehe
// n8n-pipeline/prompts/carol-gray-autor.md) liefert die Methodik-Regeln;
// hier kommen nur die situationsspezifischen Variablen rein.
const userPrompt = [
  `Titel: "${title}"`,
  '',
  `Situation: ${situation}`,
  '',
  `Verhaltensziel: ${verhaltensziel}`,
  '',
  `Altersgruppe: ${altersgruppe}`,
  '',
  'Schreibe jetzt die Social Story:',
  '- 200 bis 300 Wörter insgesamt',
  '- genau 6 Absätze, jeweils durch eine Leerzeile getrennt',
  '- Ich-Perspektive, Präsens',
  '- max. 1 bis 2 DIREKTIV-Sätze in der ganzen Geschichte',
  '- folge dem Story-Bogen aus deinem System-Prompt'
].join('\n');

const today = new Date().toISOString().slice(0, 10);

return {
  json: {
    title,
    situation,
    verhaltensziel,
    altersgruppe,
    slug,
    imageCount,
    imageStylePositive,
    imageStyleNegative,
    description,
    userPrompt,
    mainCharacterAge,
    mainCharacterGender,
    date: today
  }
};
