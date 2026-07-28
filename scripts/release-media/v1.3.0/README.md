# KubePreflight v1.3.0 release animation

A 17.1-second square (1080x1080) release animation for "Evidence Integrity
and Evaluation Semantics", plus a trimmed GIF and a poster frame. Every
number and label shown is read from real, already-verified evidence — not
invented — and no live AWS/Kubernetes environment is recorded.

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
├── README.md              this file
├── record-browser.mjs      Playwright recorder (continuous, 7 scenes)
├── render.sh                ffmpeg encode: MP4, poster, GIF, preview GIF
├── verify.sh                  ffprobe + leak-scan checks against output/
├── assets/                     custom scene HTML, shared theme.css/fonts.css
├── recordings/                  raw Playwright capture (gitignored, reproducible)
└── output/                       the four exports (gitignored, copied into
                                    ../../../public/media/ for the site to serve)
```

Modeled directly on `demo/v1-launch/` in the core repo (the v1.0.0 launch
pipeline) — same `sceneReady`/`fadeOut()` per-scene contract, same
wall-clock-budget `playScene()` helper, same embedded-font `theme.css`
color tokens (`--accent`, `--blocker`, `--warning`, `--pass`, etc.), same
`render.sh` / `verify.sh` split. Canvas is 1080x1080 from the start
(recorded square, not cropped after the fact), since this animation only
ever needs the one square format.

## How this was produced

1. **Scenes** (`assets/01-*.html` .. `07-*.html`): self-contained pages,
   fonts embedded as base64 (`assets/fonts.css`, copied verbatim from
   `demo/v1-launch/assets/fonts.css` in the core repo) so they render
   offline. Each sets `window.sceneReady = true` when its entrance
   animation finishes and exposes `window.fadeOut()`.
2. **Recording** (`record-browser.mjs`): one continuous Playwright session
   navigates through all seven scenes on a fixed 17.1s wall-clock
   timeline and records one continuous video — not a multi-clip splice.
3. **Encoding** (`render.sh`): the one raw capture
   (`recordings/raw-capture.webm`) is transcoded to all four final
   formats in `output/` — nothing is re-recorded per format.
4. **Verification** (`verify.sh`): leak scan plus
   resolution/codec/duration/faststart/size checks.

### Reproducing this locally

Requires Node.js, `playwright` (not a project dependency — installed
locally in this directory, gitignored), and `ffmpeg`/`ffprobe` on `PATH`
(or point `FFMPEG_BIN`/`FFPROBE_BIN` at static binaries, e.g. via
`@ffmpeg-installer/ffmpeg` / `@ffprobe-installer/ffprobe`).

```sh
cd scripts/release-media/v1.3.0
npm install playwright
python3 -m http.server 8899 &        # serve this directory
BASE_URL=http://localhost:8899 OUT_DIR=./recordings node record-browser.mjs
./render.sh
./verify.sh
```

`record-browser.mjs` accepts `CHROMIUM_PATH` to reuse an already-installed
Chrome/Chromium instead of downloading Playwright's bundled browser (this
animation was generated using system `google-chrome-stable`).

Then copy the four files from `output/` into `../../../public/media/` —
the website's `ReleaseAnnouncement` component
(`src/components/home/ReleaseAnnouncement.astro`) detects the MP4 and
poster at build time via `fs.existsSync` and renders the video
automatically; no component change is needed when the media lands.

## Timeline

| Scene | File | Window | Content |
|---|---|---|---|
| 1 | `01-title-open.html` | 0.0s – 2.0s | Title: KubePreflight v1.3.0, "Evidence Integrity & Evaluation Semantics" |
| 2 | `02-problem.html` | 2.0s – 4.4s | The problem: `Missing ≠ Resolved` — WH-005 baseline "Warning" → current "Rule not evaluated" (not turned green, not labeled resolved) |
| 3 | `03-comparison.html` | 4.4s – 7.2s | New comparison bucket: `not_re_evaluated`, real certified counts, `Not re-evaluated: 8` highlighted |
| 4 | `04-coverage.html` | 7.2s – 10.4s | Honest evidence coverage: rule-execution/K8s/AWS/overall coverage, `Result: INCOMPLETE` (amber, never presented as PASS) |
| 5 | `05-surfaces.html` | 10.4s – 12.6s | Consistent across Terminal / Markdown / HTML / Console, 31 rules, schema 1.1 |
| 6 | `06-certification.html` | 12.6s – 15.1s | Real-EKS certification: full-access / reduced-IAM / manifests-only / comparison proof, all PASS; no infra identifiers |
| 7 | `07-title-close.html` | 15.1s – 17.1s | Closing CTA: kubepreflight.com |

## Verified properties of the four exports

| File | Resolution | Codec | Duration/content | FPS | Size |
|---|---|---|---|---|---|
| `kubepreflight-v1.3.0-evaluation-coverage.mp4` | 1080x1080 | H.264, yuv420p, faststart, no audio | full 17.08s | 25 | 647 KB |
| `kubepreflight-v1.3.0-evaluation-coverage-poster.png` | 1080x1080 | — | still, t=6.8s (the `not_re_evaluated` comparison summary, fully settled) | — | 187 KB |
| `kubepreflight-v1.3.0-evaluation-coverage.gif` | 1080x1080 | palette-optimized | highlight cut, 2.0s–10.4s (the problem → `not_re_evaluated` → honest coverage) | 12 | 1.95 MB |
| `kubepreflight-v1.3.0-evaluation-coverage-preview.gif` | 720x720 | palette-optimized | same 2.0s–10.4s cut | 10 | 909 KB |

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

## Sensitive-data checks

`verify.sh` greps `assets/`, `record-browser.mjs`, and `render.sh` for
AWS ARNs, 12-digit account IDs, access/session key patterns, bearer
tokens, kubeconfig credential-data fields, EC2-internal hostnames, RFC1918
private IP ranges, and VPC/subnet/security-group/instance/volume ID
patterns. Separately, the four rendered output files were scanned with
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
