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

// Bildstil ist fest „Traumwelt" — sorgt für visuelle Konsistenz über alle Stories.
const imageStylePositive = "dreamlike magical digital painting, soft glowing volumetric light, ethereal misty atmosphere, luminous pastel palette with high contrast highlights, rim lighting on characters, inspired by Ori and the Blind Forest and Studio Ghibli night scenes, consistent luminosity and palette across all panels of this story, same character proportions and facial features in every panel, full bleed composition extending to all four image edges, no inner framing, subjects and background reach every corner of the image, square 1:1 aspect ratio";
const imageStyleNegative = "no text, no watermarks, no labels, no tags, no annotations, no nameplates, no UI overlays, no callouts, no captions, no speech bubbles, no sign text, no alphanumeric text in image, no letterboxing, no black bars, no white margin, no cream margin, no paper border, no inner matte, no mat board, no illustration frame, no vignette, no aspect-ratio padding, no harsh black outlines, no flat cartoon shading, no photorealism, no gritty realism, no extra limbs, no duplicate props, no floating objects, no mixed art styles, no style drift";

const imageCount = 5;

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
    date: today
  }
};
