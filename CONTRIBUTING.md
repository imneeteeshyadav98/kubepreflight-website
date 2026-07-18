# Contributing

This repository is the KubePreflight website (Astro + Tailwind CSS 4, static output, deployed to
GitHub Pages). Contributions to the CLI/product itself belong in the
[core repository](https://github.com/imneeteeshyadav98/kubepreflight) instead.

## Getting started

```bash
nvm use    # Node >=22.12.0 — see .nvmrc
npm ci
npm run dev
```

The dev server runs at `http://localhost:4321`.

## Before opening a pull request

```bash
npm run verify
```

This runs `astro check`, a production build, and the internal link checker. For a full local
production dry run, including a browser smoke test and Lighthouse:

```bash
npm run build:prod
npm run preview:prod
# in a second terminal:
SMOKE_BASE_URL=http://127.0.0.1:4322 npm run check:browser
LIGHTHOUSE_BASE_URL=http://127.0.0.1:4322 npm run check:lighthouse
```

All of the above run in CI on every pull request; a red `verify` step will block review.

## Conventions

- **Design tokens**: colors, spacing, and type live in `src/styles/tokens.css`. Change a value
  there, not in individual components — see the "Design system" section of the
  [README](README.md).
- **No fabricated content.** Every command, version tag, and evidence screenshot on this site is
  meant to be real and independently verifiable. Don't add example output, CLI flags, or
  version pins without checking them against the actual `kubepreflight` binary/CLI help output
  first.
- **No client framework.** The site is static Astro with minimal vanilla JS (see
  `src/components/ui/CodeBlock.astro`'s copy-button script for the pattern) — don't introduce
  React/Vue/Svelte for a single interactive widget.
- **Comments**: only where the *why* isn't obvious from the code itself (a workaround, a
  non-obvious constraint). Don't restate what a well-named variable or component already says.

## Reporting bugs or requesting features

Open an issue — see [SUPPORT.md](SUPPORT.md) for where. For security issues, see
[SECURITY.md](SECURITY.md) instead of a public issue.
