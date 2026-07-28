# KubePreflight v1.3.0 release animation

A 17.1-second release animation for "Evidence Integrity and Evaluation
Semantics", produced as **two separately-composed recordings** for two
different destinations rather than one asset stretched or cropped to fit
both:

- **Website** (`kubepreflight.com`'s release-media card, which is
  landscape/`aspect-video`): a native **1920x1080 (16:9)** MP4 + poster,
  with every scene laid out for the wide canvas from scratch —
  `assets-16x9/`, `record-browser-16x9.mjs`, `render-16x9.sh`.
- **LinkedIn / GitHub** (square feeds and README embeds): the original
  native **1080x1080 (1:1)** GIF + preview GIF — `assets/`,
  `record-browser.mjs`, `render.sh`.

Both share the same `theme.css` design tokens, the same verified facts,
and the same 17.1s scene timeline, but are two independent Playwright
recordings, not one video reframed into two shapes. Every number and
label shown is read from real, already-verified evidence — not invented —
and no live AWS/Kubernetes environment is recorded.

## What this is built from

All seven scenes are custom HTML/CSS cards (no real product page or
Console is navigated to in this recording, unlike `demo/v1-launch` in the
core repo, since v1.3.0's core improvement — evaluation coverage and
`not_re_evaluated` — is best explained with synthetic, purpose-built
summary panels rather than a full report/Console screen capture). The
numbers on those panels are not invented: they are read from real
certification evidence already committed to the core repo and
independently cross-checked against it before this animation was built:

- Comparison counts (`New: 1`, `Resolved: 0`, `Not re-evaluated: 8`,
  `Changed: 0`, `Unchanged: 0`) — verified against
  `docs/certification/v1.3.0/comparisons/full-vs-manifests.json` and its
  `gate.json` (`resolvedFindings: 0`, `notReEvaluated: 8`,
  `newBlockers: 1`) in the core repo.
- Reduced-IAM coverage labels (`Rule execution coverage: Complete`,
  `AWS evidence: Partial`, `Overall decision coverage: Partial`,
  `Result: INCOMPLETE`) — verified against
  `docs/certification/v1.3.0/reduced-iam/post-fix-report.md`.
- Certification PASS labels (full-access, reduced-IAM, manifests-only,
  comparison proof) — the four certification checkpoints recorded in
  `docs/certification/v1.3.0/validation-summary.md`, not scan verdicts.
- Rule count (31), findings schema version (1.1), and the
  `not_re_evaluated` wire field name — verified against the core repo's
  `internal/rules` registry and `internal/findings` schema constant.

No account ID, ARN, cluster name, hostname, IP address, or
VPC/subnet/security-group ID appears anywhere in this animation — every
panel is a synthetic summary card, not a captured screenshot of real
infrastructure.

## Directory layout

```
scripts/release-media/v1.3.0/
├── README.md                    this file
├── record-browser.mjs            Playwright recorder -- square (1080x1080), 7 scenes
├── record-browser-16x9.mjs        Playwright recorder -- landscape (1920x1080), 7 scenes
├── render.sh                       ffmpeg encode: square GIF + preview GIF
├── render-16x9.sh                   ffmpeg encode: landscape website MP4 + poster
├── verify.sh                         ffprobe + leak-scan checks against output/
├── assets/                            square scene HTML, shared theme.css/fonts.css
├── assets-16x9/                        landscape scene HTML (own composition per scene,
│                                        not the square scenes resized -- see below)
├── recordings/                          raw Playwright captures (gitignored, reproducible)
└── output/                               all six exports (gitignored, copied into
                                            ../../../public/media/ for the site to serve)
```

Modeled directly on `demo/v1-launch/` in the core repo (the v1.0.0 launch
pipeline) — same `sceneReady`/`fadeOut()` per-scene contract, same
wall-clock-budget `playScene()` helper, same embedded-font `theme.css`
color tokens (`--accent`, `--blocker`, `--warning`, `--pass`, etc.).

### Why two separate recordings, not one asset reshaped

The first cut of this animation was square-only, and the website's
`ReleaseAnnouncement` card embedded it inside a 16:9 (`aspect-video`)
frame — which pillarboxed it: dark bars on both sides, actual content
occupying only the vertical strip in the middle, unreadable at real card
size. Stretching the square recording to 16:9 with `ffmpeg` would have
distorted the text; center-cropping it would have cut off the edges of
every panel. Neither is an acceptable fix for a video that's mostly text.

The actual fix was recomposing every scene natively for whichever canvas
it's shown on. Both `assets/` and `assets-16x9/` express the same seven
beats and the same verified facts, but `assets-16x9/03-comparison.html`
in particular is a genuinely different layout, not a wider version of
`assets/03-comparison.html` — it uses a left/right split (explanation
and the `not_re_evaluated` wire term on the left, the full comparison
table on the right) that only makes sense once there's landscape width
to put it in. Scene 5 similarly reflows from a 2x2 card grid (square) to
a single 4-card row (landscape). Font sizes are close to identical
between the two, since both canvases are 1080px tall — landscape only
needed more *width* used, not larger text.

## How this was produced

1. **Scenes** (`assets/01-*.html` .. `07-*.html`, and their
   `assets-16x9/` counterparts): self-contained pages, fonts embedded as
   base64 (`assets/fonts.css`, copied verbatim from
   `demo/v1-launch/assets/fonts.css` in the core repo, referenced by both
   canvases) so they render offline. Each sets `window.sceneReady = true`
   when its entrance animation finishes and exposes `window.fadeOut()`.
2. **Recording**: two independent, one continuous Playwright session
   each. `record-browser.mjs` navigates the square scenes at 1080x1080;
   `record-browser-16x9.mjs` navigates the landscape scenes at
   1920x1080. Both use the same fixed 17.1s wall-clock timeline — not a
   multi-clip splice, and not the same recording reused twice.
3. **Encoding**: `render.sh` transcodes `recordings/raw-capture.webm`
   (square) into the GIF + preview GIF. `render-16x9.sh` transcodes
   `recordings/raw-capture-16x9.webm` (landscape) into the website MP4 +
   poster. Nothing is re-recorded per format, and neither script touches
   the other's source recording.
4. **Verification** (`verify.sh`): leak scan across both `assets/` and
   `assets-16x9/`, plus resolution/codec/duration/faststart/size checks
   against all four `output/` files (1920x1080 for the MP4/poster,
   1080x1080 for the GIFs).

### Reproducing this locally

Requires Node.js, `playwright` (not a project dependency — installed
locally in this directory, gitignored), and `ffmpeg`/`ffprobe` on `PATH`
(or point `FFMPEG_BIN`/`FFPROBE_BIN` at static binaries, e.g. via
`@ffmpeg-installer/ffmpeg` / `@ffprobe-installer/ffprobe`).

```sh
cd scripts/release-media/v1.3.0
npm install playwright
python3 -m http.server 8899 &        # serve this directory

# Square (LinkedIn/GitHub GIF)
BASE_URL=http://localhost:8899 OUT_DIR=./recordings node record-browser.mjs
./render.sh

# Landscape (website MP4/poster)
BASE_URL=http://localhost:8899 OUT_DIR=./recordings node record-browser-16x9.mjs
./render-16x9.sh

./verify.sh
```

Both recorder scripts accept `CHROMIUM_PATH` to reuse an
already-installed Chrome/Chromium instead of downloading Playwright's
bundled browser (this animation was generated using system
`google-chrome-stable`).

Then copy all four files from `output/` into `../../../public/media/` —
the website's `ReleaseAnnouncement` component
(`src/components/home/ReleaseAnnouncement.astro`) detects the MP4 and
poster at build time via `fs.existsSync` and renders the video
automatically; no component change is needed when new media lands under
the same filenames. The GIF/preview GIF aren't referenced by the website
component at all — they're for manual distribution (LinkedIn upload,
README embed).

## Timeline

Identical beats and durations on both canvases — `assets/<NN>-*.html`
(square) and `assets-16x9/<NN>-*.html` (landscape) are the same seven
scenes, recomposed per canvas, not retimed.

| Scene | File | Window | Content |
|---|---|---|---|
| 1 | `01-title-open.html` | 0.0s – 2.0s | Title: KubePreflight v1.3.0, "Evidence Integrity & Evaluation Semantics" |
| 2 | `02-problem.html` | 2.0s – 4.4s | The problem: `Missing ≠ Resolved` — WH-005 baseline "Warning" → current "Rule not evaluated" (not turned green, not labeled resolved) |
| 3 | `03-comparison.html` | 4.4s – 7.2s | New comparison bucket: `not_re_evaluated`, real certified counts, `Not re-evaluated: 8` highlighted. **Landscape only**: left/right split (explanation left, table right) instead of the square's stacked layout. |
| 4 | `04-coverage.html` | 7.2s – 10.4s | Honest evidence coverage: rule-execution/K8s/AWS/overall coverage, `Result: INCOMPLETE` (amber, never presented as PASS) |
| 5 | `05-surfaces.html` | 10.4s – 12.6s | Consistent across Terminal / Markdown / HTML / Console, 31 rules, schema 1.1. **Landscape only**: single 4-card row instead of the square's 2x2 grid. |
| 6 | `06-certification.html` | 12.6s – 15.1s | Real-EKS certification: full-access / reduced-IAM / manifests-only / comparison proof, all PASS; no infra identifiers |
| 7 | `07-title-close.html` | 15.1s – 17.1s | Closing CTA: kubepreflight.com |

## Verified properties of the six exports

| File | Resolution | Codec | Duration/content | FPS | Size |
|---|---|---|---|---|---|
| `kubepreflight-v1.3.0-evaluation-coverage.mp4` | **1920x1080** | H.264, yuv420p, faststart, no audio | full 17.08s | 25 | 758 KB |
| `kubepreflight-v1.3.0-evaluation-coverage-poster.png` | **1920x1080** | — | still, t=6.8s (the `not_re_evaluated` comparison summary, fully settled) | — | 217 KB |
| `kubepreflight-v1.3.0-evaluation-coverage.gif` | 1080x1080 | palette-optimized | highlight cut, 2.0s–10.4s (the problem → `not_re_evaluated` → honest coverage) | 12 | 1.95 MB |
| `kubepreflight-v1.3.0-evaluation-coverage-preview.gif` | 720x720 | palette-optimized | same 2.0s–10.4s cut | 10 | 909 KB |

The MP4 and poster are landscape (website asset, from
`recordings/raw-capture-16x9.webm`); the two GIFs remain square (social
asset, from `recordings/raw-capture.webm`) — see "Why two separate
recordings" above.

`verify.sh` checks all of the above plus a faststart (`moov` before
`mdat`) byte-offset check on the MP4, so a player can begin playback
before the full file downloads.

## Scale correction (post-launch fix)

The first published version of this animation (composed at the same
1080x1080 canvas but with scene content sized closer to
`demo/v1-launch`'s 1920x1080-native proportions, only lightly adjusted)
looked fine reviewed as full-frame native screenshots, but read as a
small, hard-to-read screenshot floating in a large dark square once
actually embedded in the website's release card at real display size —
caught in production visual review on kubepreflight.com, not before
ship. Root cause: content block widths (~55-60% of the 1080px canvas) and
font sizes were sized for a canvas roughly 1.8x wider, so at the actual
1080x1080 square they left far too much empty margin on every side.
Fixed by widening every scene's content block to ~83-85% of the canvas
width and scaling `theme.css`'s shared tokens and each scene's heading/
support text up by roughly 1.7-2x, then validated at the sizes that
actually matter — temporary 450x450 and 320x320 downscaled frame
previews (not just native 1080x1080) — before re-shipping. The lesson:
inspecting frames at native recording resolution is not sufficient to
catch a small-content defect; validate at the actual display size the
media will render at.

The GIF is deliberately a trimmed cut, not the full 17.1s — same
precedent as `demo/v1-launch/render.sh`'s GIF (a 13s cut of its 30s
master). The cut window was chosen specifically to lead with
`not_re_evaluated` and the honest partial-coverage panel, the release's
most distinctive and visually explainable improvement, rather than
covering every scene at lower quality to fit a size budget.

## Aspect-ratio correction (second post-launch fix)

The scale correction above fixed content occupying too little of the
1080x1080 square canvas, but the website's release-media card is
landscape (`aspect-video`, 16:9) — so even a properly-filled square video
still pillarboxed once embedded there: dark bars on both sides, real
content confined to a narrow center strip. This was a shape mismatch, not
a scale problem, and no amount of resizing the square recording's content
could fix it without stretching or cropping. The fix was a second,
separate 1920x1080 recording with every scene recomposed for the wide
canvas (`assets-16x9/`, `record-browser-16x9.mjs`, `render-16x9.sh`) —
see "Why two separate recordings" above. `ReleaseAnnouncement.astro`
needed only an `object-contain` addition on the `<video>` and fallback
`<img>` (defensive, since native 16:9 media now matches the 16:9
container exactly); the container's `aspect-video` class already
expressed the shape correctly, so no other layout change was needed.

## Sensitive-data checks

`verify.sh` greps `assets/`, `assets-16x9/`, `record-browser.mjs`,
`record-browser-16x9.mjs`, `render.sh`, and `render-16x9.sh` for
AWS ARNs, 12-digit account IDs, access/session key patterns, bearer
tokens, kubeconfig credential-data fields, EC2-internal hostnames, RFC1918
private IP ranges, and VPC/subnet/security-group/instance/volume ID
patterns. Separately, all rendered output files were scanned with
`strings` for the same pattern set plus the real disposable certification
cluster names, and `ffprobe` was used to inspect the MP4's embedded
metadata tags — both clean (only standard `libavformat` encoder tags
present, no comment/title metadata was set).

## Known limitation: poster frame timing

The poster is extracted at t=6.8s, inside the "not_re_evaluated" scene
window (4.4s–7.2s), specifically chosen to land on the comparison summary
with the highlighted `Not re-evaluated: 8` row and the literal
`not_re_evaluated` wire-field label both visible and settled (post
entrance-animation). It does not show the v1.3.0 version/theme title
text, since that lives in scene 1, not scene 3 — the same honest
trade-off `demo/v1-launch`'s README documents for its own poster: a frame
that reads as the actual most-distinctive content beats literal title-text
coverage for a poster's job.
