# Production hardening checklist

Run before the deployment PR:

```bash
npm run verify
npm run preview
SMOKE_BASE_URL=http://127.0.0.1:4322 npm run check:browser
LIGHTHOUSE_BASE_URL=http://127.0.0.1:4322 npm run check:lighthouse
git diff --check
```

GitHub Pages repository settings:

- Source: GitHub Actions
- Custom domain after the first deployment: `kubepreflight.com`
- Enforce HTTPS after the certificate becomes available

DNS records:

```text
A      @     185.199.108.153
A      @     185.199.109.153
A      @     185.199.110.153
A      @     185.199.111.153
CNAME  www   imneeteeshyadav98.github.io
```

Do not configure an A record and CNAME for the same host.

Run after production deployment:

```bash
curl -I https://kubepreflight.com
curl -I https://kubepreflight.com/install
curl -I https://kubepreflight.com/use-cases
curl -I https://kubepreflight.com/github-action
curl -I https://kubepreflight.com/case-study/eks-1-31-to-1-32
curl -I https://kubepreflight.com/security
SMOKE_BASE_URL=https://kubepreflight.com npm run check:browser
LIGHTHOUSE_BASE_URL=https://kubepreflight.com npm run check:lighthouse
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
