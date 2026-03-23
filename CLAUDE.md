# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS website for "ASS Elternkreis NWM" — a support group for parents of autistic children in Nordwestmecklenburg, Germany. All content is in German.

- **Domain:** www.ass-elternkreis-nwm.de
- **Hosting:** GitHub Pages (see CNAME)
- **No build system** — files are served as-is, no package manager or bundler

## Tech Stack

- HTML5, vanilla CSS/JS
- Bootstrap 5 (css/bootstrap.min.css, js/bootstrap.min.js)
- Rubik Variable Font (self-hosted in Rubik/)
- SheetDB API for contact form submissions (endpoint hardcoded in index.html)

## Development

No build, test, or lint commands. Open HTML files directly in a browser or use any local static server (e.g., `python -m http.server`).

## Architecture

### Main Pages (root)

| File | Purpose |
|------|---------|
| index.html | Home: hero, feature cards, events (#f1), contact form (#contact) |
| about.html | Team member profiles |
| blog.html | News/blog content |
| faq.html | FAQ hub linking to 100+ individual question pages |
| links.html | Resource tables (organizations, local services, diagnosis centers) |

### FAQ System (100+ questions across 5 age-group directories)

- `vorschule/frage-001.html` through `frage-020.html` (ages 0–6)
- `grundschule/frage-021.html` through `frage-040.html` (ages 6–12)
- `teenager/frage-041.html` through `frage-060.html` (ages 12–18)
- `junge-erwachsene/frage-061.html` through `frage-080.html` (ages 18–30)
- `erwachsene/frage-081.html` through `frage-100.html` (ages 30+)

Each FAQ page is a standalone HTML file with: breadcrumb navigation, category badge, article content, sources section, and prev/next navigation buttons. All FAQ pages share the same template structure.

### Styling

- `style.css` — main site styles; CSS custom properties define the color scheme (greens, sunflower yellow `#FFC107`, brown `#3E2723`)
- `stylefaq.css` — FAQ-specific styles with its own CSS variables
- Bootstrap classes used throughout for layout and responsive design

### Contact Form Integration

The contact form in index.html POSTs JSON (name, email, phone, message) to `https://sheetdb.io/api/v1/7z6kfdr7nwb17`, which stores submissions in a Google Sheet.

## Key Conventions

- All pages share the same Bootstrap navbar and footer structure
- FAQ file naming: `frage-NNN.html` with zero-padded three-digit numbers
- Images stored in `images/` — mix of PNG, JPG, WebP, and SVG
- SEO: meta tags, Open Graph, JSON-LD organization schema on index.html
