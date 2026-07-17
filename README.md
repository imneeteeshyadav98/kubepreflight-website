# kubepreflight-website

Marketing and evidence site for [KubePreflight](https://github.com/imneeteeshyadav98/kubepreflight). Detailed technical documentation lives in the core repository; this site summarizes the product and routes visitors there.

## Stack

- [Astro](https://astro.build) — static output, minimal client JavaScript
- Tailwind CSS 4 (via `@tailwindcss/vite`), with design tokens in [`src/styles/tokens.css`](src/styles/tokens.css)
- TypeScript, strict mode
- `@astrojs/sitemap` for sitemap generation

## Requirements

- Node.js `>=22.12.0` (Astro 5+ requirement)

If you're on an older default Node via `nvm`, switch before installing or running anything:

```bash
source ~/.nvm/nvm.sh
nvm use 22
```

## Development

```bash
npm install
npm run dev
```

Site runs at `http://localhost:4321`.

## Scripts

| Command           | Action                                                 |
| :----------------- | :------------------------------------------------------ |
| `npm run dev`      | Start the local dev server                              |
| `npm run check`    | Type-check `.astro`/`.ts` files (`astro check`)          |
| `npm run build`    | Type-check, then build the production site to `dist/`   |
| `npm run preview`  | Preview the production build locally                     |

`astro build` alone does **not** type-check `.astro` files — `npm run build` always runs `astro check` first, and CI runs both steps explicitly.

## Project structure

```text
src/
├── components/
│   ├── brand/       # Logo
│   ├── layout/      # Header, Footer, Container, Section
│   ├── ui/          # Button, Badge, IconLink, CodeBlock
│   ├── seo/         # SEO metadata component
│   └── home/        # Homepage-specific sections
├── content/         # Typed site copy and navigation data
├── layouts/         # BaseLayout
├── pages/           # File-based routes
└── styles/          # tokens.css (design tokens) + global.css (Tailwind + base styles)
```

## Design system

The visual direction is "operational intelligence": deep ink/graphite surfaces, warm off-white light sections, restrained signal-green and electric-blue accents, editorial serif headings, and monospace engineering details. Tokens are defined once in `src/styles/tokens.css` and exposed to Tailwind utilities via `@theme inline` in `src/styles/global.css` — change a value there, not in components.

Headings and mono text use system font stacks (no webfont network requests), which keeps the site fast and avoids third-party font-loading privacy concerns.

## Deployment

Static output, deployed to GitHub Pages, served at `kubepreflight.com`. CI (`.github/workflows/ci.yml`) runs `npm run check` and `npm run build` on every push and pull request.
