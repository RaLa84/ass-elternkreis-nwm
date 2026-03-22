# Styleguide — ASS Elternkreis NWM

Design-Referenz basierend auf der modernisierten `index.html`. Alle Seiten sollen nach diesem Guide migriert werden.

**Designprinzip:** Empathisch, klar, modern, beruhigend — viel Whitespace, weiche Schatten, abgerundete Ecken, dezente Animationen.

---

## 1. Technologie

| Tool | Einbindung |
|------|-----------|
| Tailwind CSS | `<script src="https://cdn.tailwindcss.com">` + Inline-Config |
| Inter Font | Google Fonts: `Inter:wght@400;500;600;700;800` |
| Animationen | Custom CSS in `style.css` + IntersectionObserver in JS |
| Icons | Inline-SVGs (Heroicons-Stil), kein Icon-Font |

### Head-Template (in jede Seite)

```html
<!-- Google Fonts: Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#1b4332', light: '#2d6a4f' },
        sunflower: { DEFAULT: '#FFC107', hover: '#E6A800' },
        brown: '#3E2723',
        softwhite: '#FAFAF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
</script>

<!-- Custom Styles (Animationen etc.) -->
<link rel="stylesheet" href="style.css">
```

> **Unterordner** (z.B. `vorschule/`): Pfade anpassen zu `../style.css`, `../images/...` etc.

---

## 2. Farbpalette

| Rolle | Wert | Tailwind-Klasse | Verwendung |
|-------|------|-----------------|------------|
| Primaer (Waldgruen) | `#1b4332` | `text-forest`, `bg-forest` | Headlines, Navbar-Text, Footer-BG |
| Primaer Hell | `#2d6a4f` | `text-forest-light` | Hover-States, Badges, Subtitles |
| Akzent (Gelb) | `#FFC107` | `bg-sunflower`, `text-sunflower` | CTA-Buttons, Icon-Kreise, Badges |
| Akzent Hover | `#E6A800` | `bg-sunflower-hover` | Button-Hover |
| Text | `#3E2723` | `text-brown` | Body-Text (global), Text auf gelben Flaechen |
| Hintergrund | `#FAFAF8` | `bg-softwhite` | Seiten-Hintergrund |
| Karten | `#FFFFFF` | `bg-white` | Cards, Formular-Container |
| Subtle Tint | — | `bg-forest/[0.03]` | Abwechselnde Sektions-Hintergruende |
| Grau (Text) | — | `text-gray-500` bis `text-gray-700` | Body-Text, Beschreibungen |
| Grau (Rand) | — | `border-forest/20` | Dezente Trennlinien, Rahmen |

---

## 3. Typografie

**Font:** Inter (Google Fonts), Fallback: system-ui, sans-serif

| Element | Tailwind-Klassen |
|---------|-----------------|
| Seiten-Titel (H1) | `text-4xl sm:text-5xl md:text-7xl font-extrabold text-forest tracking-tight` |
| Abschnitt-Titel (H2) | `text-3xl sm:text-4xl font-extrabold text-forest` |
| Karten-Titel (H3) | `text-xl font-bold text-gray-900` |
| Kleiner Titel (H3) | `text-lg font-bold text-gray-900` |
| Fliesstext (gross) | `text-lg leading-relaxed text-gray-700` |
| Beschreibung | `text-gray-600 leading-relaxed` |
| Subtitle | `text-gray-500` |
| Label | `text-sm font-semibold text-gray-700` |
| Badge | `text-xs font-semibold uppercase tracking-wide` |
| Nav-Link | `text-sm font-medium text-gray-600` |
| Klein/Meta | `text-xs text-gray-500` |

---

## 4. Abstaende (Spacing)

| Kontext | Werte |
|---------|-------|
| Sektion (vertikal) | `py-16 sm:py-20` |
| Sektion (horizontal) | `px-4` |
| Karten-Padding | `p-6` (kompakt) / `p-8` (standard) / `p-8 sm:p-10` (gross) |
| Titel nach Inhalt | `mb-8` bis `mb-12` |
| Grid-Gap | `gap-4` (eng) / `gap-6` (mittel) / `gap-8` (weit) |
| Formular-Felder | `space-y-5` |

### Container-Breiten

| Kontext | Klasse |
|---------|--------|
| Navbar | `max-w-7xl mx-auto` |
| Breiter Inhalt (Grids) | `max-w-6xl mx-auto` |
| Standard-Inhalt | `max-w-4xl mx-auto` |
| Schmaler Inhalt/CTA | `max-w-3xl mx-auto` |
| Formulare | `max-w-2xl mx-auto` |

---

## 5. Ecken & Schatten

| Element | Border-Radius | Schatten |
|---------|--------------|---------|
| Karten | `rounded-2xl` | `shadow-md hover:shadow-xl` |
| Buttons (Pill) | `rounded-full` | `shadow-lg hover:shadow-xl` |
| Buttons (eckig) | `rounded-xl` | `shadow-md hover:shadow-lg` |
| Inputs | `rounded-xl` | — |
| Badges | `rounded-full` | `shadow-sm` oder keiner |
| Kleine Kacheln | `rounded-xl` | `shadow-sm hover:shadow-md` |
| Container/Boxen | `rounded-2xl` | `shadow-sm` |

---

## 6. Komponenten

### Button — Primaer (CTA)

```html
<a href="#" class="inline-flex items-center gap-2 bg-sunflower hover:bg-sunflower-hover text-brown font-bold px-8 py-3.5 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
  Button-Text
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 12H5m7-7l7 7-7 7"/>
  </svg>
</a>
```

### Button — Sekundaer (Outline)

```html
<a href="#" class="inline-flex items-center gap-2 text-sm font-medium text-forest hover:text-forest-light transition-colors border border-forest/20 rounded-full px-5 py-2.5 hover:bg-forest/5">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">...</svg>
  Button-Text
</a>
```

### Karte — Standard

```html
<div class="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8">
  <!-- Inhalt -->
</div>
```

### Karte — Klickbar (Link)

```html
<a href="#" class="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 text-center hover:-translate-y-0.5">
  <div class="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-forest/20 transition-colors">
    <svg class="w-5 h-5 text-forest" ...></svg>
  </div>
  <h3 class="text-sm font-bold text-gray-900">Titel</h3>
  <p class="text-xs text-gray-500">Beschreibung</p>
</a>
```

### Icon-Kreis

```html
<!-- Gross (Features) -->
<div class="w-16 h-16 rounded-full bg-sunflower/20 flex items-center justify-center">
  <svg class="w-7 h-7 text-sunflower" ...></svg>
</div>

<!-- Klein (Kacheln) -->
<div class="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center">
  <svg class="w-5 h-5 text-forest" ...></svg>
</div>
```

### Badge / Tag

```html
<!-- Gruen -->
<span class="inline-flex items-center bg-forest/10 text-forest text-xs font-semibold px-3 py-1 rounded-full">
  Label
</span>

<!-- Gelb -->
<span class="inline-flex items-center bg-sunflower/20 text-brown text-xs font-semibold px-3 py-1 rounded-full">
  Label
</span>
```

### Formular-Input

```html
<div>
  <label for="feldname" class="block text-sm font-semibold text-gray-700 mb-1.5">
    Feldname <span class="text-red-500">*</span>
  </label>
  <input type="text" id="feldname" name="feldname" required
    class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-colors">
</div>
```

### Gestrichelte Box (Intro/CTA)

```html
<div class="border border-dashed border-forest-light/30 rounded-2xl p-8 sm:p-10 bg-white shadow-sm">
  <!-- Inhalt -->
</div>
```

---

## 7. Navbar (alle Seiten identisch)

```html
<nav class="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="index.html" class="flex items-center gap-2 text-forest font-bold text-lg hover:opacity-80 transition-opacity">
        <img src="images/ASS_infinity_awareness_symbol.png" alt="ASS Elternkreis Logo" width="32" height="26">
        ASS Elternkreis NWM
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center gap-1">
        <a href="index.html#contact" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Kontakt</a>
        <a href="index.html#termine" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Termine</a>
        <a href="about.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Ueber uns</a>
        <a href="erste-schritte.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Erste Schritte</a>
        <a href="links.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Links</a>
        <a href="hilfsmittel.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Hilfsmittel</a>
        <a href="blog.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Blog</a>
        <a href="faq.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">FAQ</a>
      </div>

      <!-- Mobile Hamburger -->
      <button id="navToggle" type="button" class="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Navigation umschalten" aria-expanded="false">
        <svg id="navIconOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg id="navIconClose" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div id="mobileMenu" class="lg:hidden hidden pb-4">
      <div class="flex flex-col gap-1 pt-2 border-t border-gray-100">
        <a href="index.html#contact" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Kontakt</a>
        <a href="index.html#termine" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Termine</a>
        <a href="about.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Ueber uns</a>
        <a href="erste-schritte.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Erste Schritte</a>
        <a href="links.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Links</a>
        <a href="hilfsmittel.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Hilfsmittel</a>
        <a href="blog.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">Blog</a>
        <a href="faq.html" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-forest hover:bg-forest/5 transition-colors">FAQ</a>
      </div>
    </div>
  </div>
</nav>
```

> **Unterordner-Seiten** (z.B. `vorschule/frage-001.html`): Alle `href` mit `../` prefixen.

---

## 8. Footer (alle Seiten identisch)

```html
<footer class="bg-forest text-white py-10 px-4">
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
      <a href="about.html" class="text-sm text-white/70 hover:text-white transition-colors">Ueber uns</a>
      <a href="index.html#contact" class="text-sm text-white/70 hover:text-white transition-colors">Kontakt</a>
      <a href="index.html#termine" class="text-sm text-white/70 hover:text-white transition-colors">Termine</a>
      <a href="links.html" class="text-sm text-white/70 hover:text-white transition-colors">Links</a>
      <a href="blog.html" class="text-sm text-white/70 hover:text-white transition-colors">Blog</a>
      <a href="faq.html" class="text-sm text-white/70 hover:text-white transition-colors">FAQ</a>
      <a href="impressum.html" class="text-sm text-white/70 hover:text-white transition-colors">Impressum</a>
      <a href="datenschutz.html" class="text-sm text-white/70 hover:text-white transition-colors">Datenschutz</a>
    </div>
    <p class="text-center text-sm text-white/50">&copy; 2024&ndash;2026 Antje und Raik Lasner</p>
  </div>
</footer>
```

---

## 9. Seiten-Template (Grundgeruest)

```html
<!DOCTYPE html>
<html lang="de" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="...">
    <meta name="robots" content="index, follow">
    <title>Seitenname — ASS Elternkreis NWM</title>
    <link rel="canonical" href="https://www.ass-elternkreis-nwm.de/seitenname.html">
    <link rel="icon" href="images/logoneu.jpg" type="image/jpg">

    <!-- [Head-Template von oben einfuegen] -->
</head>

<body class="bg-softwhite text-brown font-sans antialiased">

    <!-- Skip to content -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-forest">
      Zum Inhalt springen
    </a>

    <!-- [Navbar einfuegen] -->

    <main id="main-content">

      <!-- Seiten-Header -->
      <section class="py-12 sm:py-16 px-4 bg-forest/[0.03]">
        <div class="max-w-4xl mx-auto animate-on-scroll">
          <h1 class="text-4xl sm:text-5xl font-extrabold text-forest tracking-tight mb-4">Seitenname</h1>
          <p class="text-lg text-gray-500">Optionaler Untertitel oder Beschreibung.</p>
        </div>
      </section>

      <!-- Inhalts-Sektionen: abwechselnd bg-softwhite und bg-forest/[0.03] -->
      <section class="py-16 sm:py-20 px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Inhalt -->
        </div>
      </section>

    </main>

    <!-- [Footer einfuegen] -->

    <!-- Back to Top -->
    <button type="button" class="back-to-top" aria-label="Nach oben scrollen">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
      </svg>
    </button>

    <!-- Scripts -->
    <!-- Mobile Nav Toggle -->
    <script>
    (function() {
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('mobileMenu');
        var iconOpen = document.getElementById('navIconOpen');
        var iconClose = document.getElementById('navIconClose');
        toggle.addEventListener('click', function() {
            var isOpen = !menu.classList.contains('hidden');
            menu.classList.toggle('hidden');
            iconOpen.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
            toggle.setAttribute('aria-expanded', !isOpen);
        });
        menu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                menu.classList.add('hidden');
                iconOpen.classList.remove('hidden');
                iconClose.classList.add('hidden');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    })();
    </script>

    <!-- Scroll Animations -->
    <script>
    (function() {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.animate-on-scroll').forEach(function(el) { observer.observe(el); });
    })();
    </script>

    <!-- Back-to-top -->
    <script>
    (function() {
        var btn = document.querySelector('.back-to-top');
        if (!btn) return;
        window.addEventListener('scroll', function() {
            btn.classList.toggle('visible', window.scrollY > 300);
        });
        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();
    </script>

</body>
</html>
```

---

## 10. Animationen

### CSS-Klassen (bereits in style.css)

| Klasse | Effekt | Verwendung |
|--------|--------|------------|
| `animate-fade-in` | Fade-in + slide-up beim Laden | Hero-Inhalte |
| `animate-on-scroll` | Fade-in beim Scrollen (via IntersectionObserver) | Alle Sektionsinhalte |
| `hover:-translate-y-1` | 4px nach oben bei Hover | Karten |
| `hover:-translate-y-0.5` | 2px nach oben bei Hover | Buttons, kleine Kacheln |
| `hover:shadow-xl` | Schatten-Vergroesserung | Karten |
| `transition-all duration-300` | Sanfte Transition | Alles mit Hover-Effekt |

### Barrierefreiheit

```css
@media (prefers-reduced-motion: reduce) {
    .animate-fade-in { animation: none; opacity: 1; }
    .animate-on-scroll { opacity: 1; transform: none; transition: none; }
}
```

---

## 11. Grid-Muster

| Layout | Tailwind-Klassen |
|--------|-----------------|
| 3 gleiche Karten | `grid grid-cols-1 md:grid-cols-3 gap-8` |
| 2 Karten | `grid grid-cols-1 md:grid-cols-2 gap-6` |
| 5 Kacheln | `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4` |
| 2-Spalten Form | `grid grid-cols-1 sm:grid-cols-2 gap-5` |
| 3-Schritte | `grid grid-cols-1 md:grid-cols-3 gap-6` |
| Tabellen-Ersatz | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |

---

## 12. Barrierefreiheit — Checkliste

- [ ] Skip-to-content Link vorhanden
- [ ] Semantisches HTML: `<nav>`, `<main>`, `<section>`, `<footer>`
- [ ] Alle Bilder haben `alt`-Text
- [ ] Interaktive Elemente ohne sichtbaren Text haben `aria-label`
- [ ] Formular-Labels mit `for`-Attribut
- [ ] Required-Felder visuell und semantisch markiert
- [ ] Focus-Styles sichtbar (nicht entfernt)
- [ ] `prefers-reduced-motion` respektiert
- [ ] Kontraste mindestens AA (besser AAA)

### Kontrast-Referenz

| Kombination | Ratio | WCAG |
|-------------|-------|------|
| Forest (#1b4332) auf Weiss | 11.4:1 | AAA |
| Brown (#3E2723) auf Gelb (#FFC107) | 9.2:1 | AAA |
| Gray-600 auf Weiss | 5.7:1 | AA |
| White/70 auf Forest | 7.8:1 | AAA |

---

## 13. Migrations-Reihenfolge

| Nr. | Seite | Aufwand | Besonderheit |
|-----|-------|---------|-------------|
| 1 | about.html | Mittel | Team-Karten mit Fotos |
| 2 | blog.html | Mittel | News-Karten, Artikelvorschau |
| 3 | erste-schritte.html | Mittel | Schritte-Karten, Tipps |
| 4 | links.html | Mittel | Tabellen zu Karten/Grid |
| 5 | hilfsmittel.html | Mittel | Aid-Karten, Tabellen |
| 6 | faq.html | Klein | Hub-Seite, aehnlich wie Wissen-Grid |
| 7 | impressum.html | Klein | Nur Fliesstext |
| 8 | datenschutz.html | Klein | Nur Fliesstext |
| 9 | 100 FAQ-Seiten | Gross | Template-basiert, Batch-Migration |

### Bootstrap-Ersetzungen

| Bootstrap | Tailwind-Aequivalent |
|-----------|---------------------|
| `.container` | `max-w-4xl mx-auto px-4` |
| `.row .col-md-4` | `grid grid-cols-1 md:grid-cols-3 gap-8` |
| `.card .card-body` | `bg-white rounded-2xl shadow-md p-8` |
| `.btn .btn-primary` | Siehe Button-Komponente oben |
| `.btn-outline-secondary` | Siehe Button sekundaer oben |
| `.table .table-striped` | Karten-Grid oder `divide-y` |
| `.navbar` | Siehe Navbar-Komponente oben |
| `.badge` | Siehe Badge-Komponente oben |
| `.border-bottom` | `border-b border-gray-200` |
| `.text-secondary` | `text-gray-500` |
| `.bg-light` | `bg-forest/[0.03]` |
| `.shadow-sm` | `shadow-sm` (identisch) |
