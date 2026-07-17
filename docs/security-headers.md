# Security headers

Recommended headers for the production static host:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
```

Notes:

- The site is static and does not require third-party scripts, analytics, forms, cookies, or authenticated browser storage.
- Astro inlines some CSS in production builds, so the CSP keeps `style-src 'unsafe-inline'`.
- Re-check this file before adding analytics, embeds, custom fonts, or any other third-party resource.
