// HTML-Assembler für SHG Social-Stories.
// Baut aus Story-Text + Bild-Positionen ein fertiges Article-HTML zusammen,
// das vom n8n-Workflow ins SHG-Repo gepusht wird (social-stories/<altersgruppe>/<slug>.html).
// Lesekumpel-spezifische Features (Quiz, Schatzsuche, Weitererzählen, Wortschatz,
// Persona-Avatar, Emoji-Versionen) sind im neuen SHG-Template nicht mehr enthalten
// und werden hier deshalb ignoriert, selbst wenn die vorgeschalteten Workflow-Nodes
// sie noch liefern.

const data = $('Schatz parsen').first().json;
let template = $input.item.json.data;

const SITE_BASE = 'https://www.ass-elternkreis-nwm.de';
const altersgruppe = (data.altersgruppe || 'allgemein').toString().trim().toLowerCase();
const slug = (data.slug || 'neue-geschichte').toString();
const storyPath = `social-stories/${altersgruppe}/${slug}.html`;
const today = new Date().toISOString().slice(0, 10);
const storyDate = (data.date || today).toString().slice(0, 10);

function htmlEscape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// SEO-Beschreibung: aus description, ohne Lesekumpel-Präfixe.
const descRaw = (data.description || data.title || '').toString().trim();
const metaDescription = descRaw.length > 157 ? descRaw.substring(0, 157).trimEnd() + '…' : descRaw;
const metaKeywords = ['Soziale Geschichte', 'Autismus', 'ASS', 'Carol Gray', data.genre, data.title]
  .filter(Boolean).join(', ');

// Hero = scene 1. Inline-Bilder ab scene 2 (verhindert Doppelung).
const heroImageUrl = `${SITE_BASE}/social-stories/bilder/${slug}-1.png`;
const imageCount = Number(data.imageCount || 0);

// imagePositions baue ich aus den Szenen-Items zusammen — jedes Szene-Item kommt
// aus 'Szenen parsen' und enthält sceneIndex + paragraphIndex (sofern AI ihn lieferte).
// paragraphIndex ist 0-basiert; per Konvention >= 1 (Story beginnt immer mit Prosa).
// Bild scene 1 ist immer Hero; inline-Bilder sind scene >= 2.
const positionsByParagraph = new Map();
try {
  const sceneItems = $('Szenen parsen').all() || [];
  for (const item of sceneItems) {
    const j = item.json || {};
    const scene = j.sceneIndex;
    const pIdx = j.paragraphIndex;
    if (typeof scene === 'number' && scene >= 2 && scene <= imageCount &&
        typeof pIdx === 'number' && pIdx >= 1) {
      positionsByParagraph.set(pIdx, scene);
    }
  }
} catch (e) { /* fallback regelt das */ }

const paragraphs = (data.storyText || '').toString().split(/\n\n+/).map(p => p.trim()).filter(Boolean);
let storyHtml = '';
for (let i = 0; i < paragraphs.length; i++) {
  if (positionsByParagraph.has(i)) {
    const scene = positionsByParagraph.get(i);
    const imgUrl = `${SITE_BASE}/social-stories/bilder/${slug}-${scene}.png`;
    storyHtml += `          <img src="${imgUrl}" alt="${htmlEscape(data.title)} – Bild ${scene}" loading="lazy">\n`;
  }
  storyHtml += `          <p>${htmlEscape(paragraphs[i])}</p>\n`;
}
// Falls keine Position-Mappings vorhanden: alle Bilder ab scene 2 ans Ende, damit nichts verloren geht.
if (positionsByParagraph.size === 0 && imageCount >= 2) {
  for (let scene = 2; scene <= imageCount; scene++) {
    const imgUrl = `${SITE_BASE}/social-stories/bilder/${slug}-${scene}.png`;
    storyHtml += `          <img src="${imgUrl}" alt="${htmlEscape(data.title)} – Bild ${scene}" loading="lazy">\n`;
  }
}

template = template
  .replace(/\{\{STORY_TITLE\}\}/g, htmlEscape(data.title || ''))
  .replace(/\{\{STORY_HTML\}\}/g, storyHtml.trimEnd())
  .replace(/\{\{HERO_IMAGE_URL\}\}/g, heroImageUrl)
  .replace(/\{\{META_DESCRIPTION\}\}/g, htmlEscape(metaDescription))
  .replace(/\{\{META_KEYWORDS\}\}/g, htmlEscape(metaKeywords))
  .replace(/\{\{STORY_PATH\}\}/g, storyPath)
  .replace(/\{\{STORY_DATE\}\}/g, htmlEscape(storyDate))
  .replace(/\{\{SLUG\}\}/g, slug);

// Safety-Net: verbliebene Platzhalter loggen und auf '' stripen
const residuals = template.match(/\{\{[A-Z_]+\}\}/g);
if (residuals) {
  const unique = [...new Set(residuals)];
  console.warn('HTML assemblieren: unresolved placeholders ->', unique.join(', '));
  template = template.replace(/\{\{[A-Z_]+\}\}/g, '');
}

const htmlBase64 = Buffer.from(template, 'utf8').toString('base64');
const storyUrl = `${SITE_BASE}/${storyPath}`;

return {
  json: {
    ...data,
    htmlBase64,
    filePath: storyPath,
    commitMessage: `Social Story: ${data.title || slug}`,
    storyUrl
  }
};
