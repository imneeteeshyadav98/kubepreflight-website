# Security policy

This repository is the KubePreflight marketing/documentation website: a static Astro site with no
backend, no authentication, no user accounts, and no server-side data storage. It is built to
static HTML/CSS/JS and served from GitHub Pages. The realistic attack surface here is narrow —
mainly the build/CI pipeline and third-party dependencies — but we still want to hear about
anything that looks wrong.

For vulnerabilities in the **KubePreflight CLI/product itself** (the tool this site documents),
report them against the core repository instead:
[imneeteeshyadav98/kubepreflight security advisories](https://github.com/imneeteeshyadav98/kubepreflight/security/advisories/new).

## Reporting a vulnerability on this website

Please **do not open a public GitHub issue** for a suspected security vulnerability.

Use GitHub's private vulnerability reporting instead:
[Report a vulnerability](https://github.com/imneeteeshyadav98/kubepreflight-website/security/advisories/new).

Include, where relevant:

- the affected URL or file
- steps to reproduce
- what you expected vs. what happened
- whether you believe it affects the deployed site, the build pipeline, or a dependency

## What's in scope

- Content injection, XSS, or markup that escapes the site's static output unexpectedly
- Dependency vulnerabilities with a real, demonstrable impact on this repository's build or
  output (not just an advisory ID with no exploit path for a static site)
- Supply-chain concerns in `.github/workflows/*.yml` (e.g. an unpinned action, a step that could
  exfiltrate secrets)
- Exposed secrets or credentials committed to this repository

## What's out of scope

- Findings that only apply to a locally-run dev server (`astro dev`), not the deployed site
- Missing security headers that GitHub Pages itself doesn't support setting (see
  [`docs/security-headers.md`](docs/security-headers.md) for what's already documented there)
- Generic vulnerability scanner output with no concrete exploit path against this site

## Response

This is maintained on a best-effort basis by a small team — see [SUPPORT.md](SUPPORT.md). There is
no guaranteed response SLA, but security reports are prioritized over other issues.
