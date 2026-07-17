# Production hardening checklist

Run before the deployment PR:

```bash
npm run verify
npm run preview
SMOKE_BASE_URL=http://127.0.0.1:4322 npm run check:browser
```

Manual browser audit targets:

- Canonical URLs use `https://kubepreflight.com`.
- Sitemap includes `/`, `/install`, `/use-cases`, `/github-action`, `/case-study/eks-1-31-to-1-32`, and `/security`.
- `robots.txt` points to the production sitemap.
- Open Graph and Twitter card previews use `/og/default.svg`.
- Header/footer navigation has no temporary external fallbacks.
- Keyboard focus reaches the skip link, navigation, CTAs, code blocks, and footer links.
- Pages have no console errors and no horizontal scroll at 390px, 768px, and desktop widths.
- Reduced-motion mode disables transitions and smooth scrolling.
- Lighthouse targets: Accessibility >= 95, Best Practices >= 95, SEO >= 95, Performance >= 90.
- Use the headers in `docs/security-headers.md` on the production host.
