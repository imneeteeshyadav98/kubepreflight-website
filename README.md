# KubePreflight website

[![CI](https://github.com/imneeteeshyadav98/kubepreflight-website/actions/workflows/ci.yml/badge.svg)](https://github.com/imneeteeshyadav98/kubepreflight-website/actions/workflows/ci.yml)
[![Deploy](https://github.com/imneeteeshyadav98/kubepreflight-website/actions/workflows/deploy.yml/badge.svg)](https://github.com/imneeteeshyadav98/kubepreflight-website/actions/workflows/deploy.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Marketing and evidence site for [KubePreflight](https://github.com/imneeteeshyadav98/kubepreflight): Kubernetes upgrade readiness, EKS rollback decision support, and CI regression gating. Detailed technical documentation lives in the core repository; this site summarizes the product and routes visitors there.

**Live site:** [kubepreflight.com](https://kubepreflight.com)
**Core repository:** [imneeteeshyadav98/kubepreflight](https://github.com/imneeteeshyadav98/kubepreflight)

## Stack

- [Astro](https://astro.build) — static output, minimal client JavaScript
- Tailwind CSS 4 (via `@tailwindcss/vite`), with design tokens in [`src/styles/tokens.css`](src/styles/tokens.css)
- TypeScript, strict mode
- `@astrojs/sitemap` for sitemap generation
- GitHub Pages + GitHub Actions for hosting and deployment

## Requirements

- Node.js `>=22.12.0` (Astro 5+ requirement)
- npm

If you're on an older default Node via `nvm`, switch before installing or running anything:

```bash
nvm use
```

(`.nvmrc` pins this to 22.)

## Local development

```bash
npm ci
npm run dev
```

Site runs at `http://localhost:4321`.

## Production build

```bash
npm run build:prod
```

Cleans previous output, type-checks, builds, and validates internal links. Production output is
generated in `dist/`.

## Production preview

```bash
npm run prod
```

Runs `build:prod`, then serves the built `dist/` locally at `http://127.0.0.1:4322` — this is
what a deployed build actually looks like, unlike `astro dev`'s live-reload dev server.

## Scripts

| Command                 | Action                                                                    |
| :----------------------- | :------------------------------------------------------------------------- |
| `npm run dev`            | Start the local dev server (live reload)                                  |
| `npm run check`          | Type-check `.astro`/`.ts` files (`astro check`)                           |
| `npm run build`          | Build the production site to `dist/` (no type-check — see `verify` below) |
| `npm run clean`          | Remove `dist/` and `.astro/`                                              |
| `npm run verify`         | `check` → `build` → `check:links`, in order                               |
| `npm run build:prod`     | `clean` → `verify` — the deployable, from-scratch production build        |
| `npm run preview`        | Preview an already-built `dist/` (default Astro preview)                  |
| `npm run preview:prod`   | Preview `dist/` on a fixed `127.0.0.1:4322`                               |
| `npm run prod`           | `build:prod` → `preview:prod` in one step                                 |
| `npm run check:links`    | Verify every internal link/asset in the built `dist/` resolves            |
| `npm run check:browser`  | Headless-browser smoke test: console errors, horizontal overflow          |
| `npm run check:lighthouse` | Performance/accessibility/best-practices/SEO thresholds via Lighthouse  |

`astro build` alone does **not** type-check `.astro` files — that's why `verify`/`build:prod` run
`check` as a separate, explicit step rather than relying on `build` to do it implicitly.

## Environment variables

```bash
cp .env.example .env
```

Only one variable today: `PUBLIC_KUBEPREFLIGHT_VERSION`, documented in `.env.example`. See
[Bumping the pinned KubePreflight release](#bumping-the-pinned-kubepreflight-release) below.

Never commit `.env` or any `.env.*` file other than `.env.example` — `.gitignore` already blocks
this, but the `PUBLIC_` prefix is also worth knowing about: Astro bundles anything with that
prefix into the built site, so it was never appropriate for secrets in the first place. There are
currently no secrets in this repository's build — only public, already-visible values like the
pinned release tag.

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

Static output, deployed to GitHub Pages, served at `kubepreflight.com`.

- CI (`.github/workflows/ci.yml`) runs `npm run check` and `npm run build` on every push and pull request.
- Production deployment (`.github/workflows/deploy.yml`) runs on pushes to `main`, runs `build:prod`, uploads `dist/`, and deploys through GitHub Pages.
- Custom domain is committed through `public/CNAME`; repository Pages source must be set to GitHub Actions.

### Bumping the pinned KubePreflight release

Every version-pinned command on the site (install, Docker, GitHub Action `uses:` refs) derives
from one value: `PUBLIC_KUBEPREFLIGHT_VERSION`. Releasing a new version is a variable change, not
a source edit:

- **Production**: update the `KUBEPREFLIGHT_VERSION` repository Variable (Settings → Secrets and
  variables → Actions → Variables) and re-run the deploy workflow.
- **Local**: copy `.env.example` to `.env` and set it there; `npm run build`/`npm run dev` pick it
  up automatically.

If unset, both fall back to the last release wired into `src/content/site.ts`, so a missing
variable never silently breaks a build. It's a Variable, not a Secret — the value is already
public in every command the site renders.

## Validation

```bash
npm run verify
npm run preview:prod
# in a second terminal:
SMOKE_BASE_URL=http://127.0.0.1:4322 npm run check:browser
LIGHTHOUSE_BASE_URL=http://127.0.0.1:4322 npm run check:lighthouse
```

## Security

See [SECURITY.md](SECURITY.md) and the site's own [/security](https://kubepreflight.com/security) page.

## Support

See [SUPPORT.md](SUPPORT.md) — website bugs belong in this repo's issues, CLI/product bugs belong
in the [core repository](https://github.com/imneeteeshyadav98/kubepreflight/issues).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). This project follows the
[Contributor Covenant](CODE_OF_CONDUCT.md).

## License

[Apache License 2.0](LICENSE).
