# Version references

`src/content/site.ts` exposes several separate version constants. They are
not interchangeable. The latest public release is currently `v1.3.0`, which
is also the latest release with a real-EKS validation (see below), the
published EKS 1.31 → 1.32 case-study evidence remains pinned to `v0.14.0`,
the SEC-TRUST-002 live-EKS story remains pinned to `v1.0.0`, and the
context-aware-gating demo recording remains pinned to `v1.1.0`.

| Constant | What it means | Where it's used | How it changes |
|---|---|---|---|
| `latestReleaseVersion` | The most recent published release. | Install/Docker examples, GitHub Action `uses:` refs, checksum verification commands. | Tracks new releases automatically via `PUBLIC_KUBEPREFLIGHT_VERSION` (see `.env.example`) — a release only needs an env var change and redeploy. |
| `verifiedEKSReleaseVersion` | The most recent release that was validated end-to-end against a real EKS cluster. | The homepage hero's "verified against real EKS upgrades" badge. | Bumped manually, only when a new real-EKS validation ships. Never tied to the env var — a new release does not imply a new validation. |
| `caseStudyVersion` | The exact release that produced the EKS 1.31 → 1.32 case-study evidence. | The case-study page and its homepage teaser. | Permanently pinned to that evidence capture. Never rewritten to match the other constants, even after new releases or new validations. |
| `secTrust002ReleaseVersion` | The exact release the SEC-TRUST-002 live-EKS validation narrative (and its embedded launch video) is about. | The case-study page's "ships the exact product code..." paragraph and "Watch the `<version>` run" heading. | Permanently pinned to `v1.0.0`. Do not repoint this at `verifiedEKSReleaseVersion` — they happened to share a value when v1.0.0 was also the most-recently-validated release, but they are different claims and will diverge again the next time a later release gets its own real-EKS validation. |
| `contextAwareGatingDemoVersion` | The exact release whose recorded demo media (`/media/kubepreflight-<version>-context-aware-gating.*`) is actually on disk. | `docs.astro`'s context-aware-gating video, poster, and captions paths, and that video's `aria-label`. | Permanently pinned to `v1.1.0`. Never derived from `latestReleaseVersion` — that recording was made once, for one release; deriving the path from the current release would silently 404 the demo on every release that doesn't re-record it. |

## Why so many constants instead of one

A single "current version" variable collapses unrelated claims into one:

1. "This is what you'd install today" (latest release)
2. "This is the release we most recently validated against a real cluster"
(verified-EKS release)
3. "This is the release whose output produced these specific numbers"
(case-study release)
4. "This is the release the SEC-TRUST-002 story happened on" (a fixed
historical fact, not "whichever release is most recently verified")
5. "This is the release whose demo we actually recorded" (a fixed asset
pin, not "whichever release is current")

Those claims drift apart the moment a release ships without a fresh EKS
validation, or without a fresh feature-demo recording — the site would
otherwise auto-advertise an unverified release as verified, silently
rewrite historical case-study or SEC-TRUST-002 evidence to a version that
never produced it, or 404 a demo video that was never re-recorded. Keeping
the constants separate makes that drift impossible to introduce by
accident. `secTrust002ReleaseVersion` and `contextAwareGatingDemoVersion`
were split out from `verifiedEKSReleaseVersion`/`latestReleaseVersion`
respectively during the v1.3.0 refresh specifically because the v1.3.0
bump would otherwise have silently corrupted both — see the v1.3.0 entry
in the core repo's release history for the full story.

## Adding a new release

- Bump `PUBLIC_KUBEPREFLIGHT_VERSION` (env var / CI deploy config) — this
  alone moves `latestReleaseVersion` and every install/Docker/Action example.
- Only update `verifiedEKSReleaseVersion` in `site.ts` after re-running the
  real-EKS validation against the new release.
- Never update `caseStudyVersion`, `secTrust002ReleaseVersion`, or
  `contextAwareGatingDemoVersion` — each is a historical fact about a
  specific evidence or media capture, not a pointer to "the current
  release."
- If the new release ships its own feature-demo recording, add a new fixed
  constant for it (following `contextAwareGatingDemoVersion`'s pattern)
  rather than reusing `latestReleaseVersion` for the asset path.

## Current release feature flags

`site.releaseFeatures.supportsRedaction` is `true` for current releases.
`site.releaseFeatures.supportsVersionCommand` is `true` for `v1.1.0` onward.
The current release also supports context-aware upgrade gating with
`--upgrade-context`, findings schema `1.1` with legacy `1.0` normalization,
and the `not_re_evaluated` comparison bucket; the real-EKS validation
constant should still move only after a fresh real-EKS validation, not
merely because a new release shipped.
