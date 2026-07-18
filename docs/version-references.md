# Version references

`src/content/site.ts` exposes three separate version constants. They are not
interchangeable. The latest public release is currently
`v0.15.0-redaction`, while the real-EKS validation and published case-study
evidence remain pinned to `v0.14.0`.

| Constant | What it means | Where it's used | How it changes |
|---|---|---|---|
| `latestReleaseVersion` | The most recent published release. | Install/Docker examples, GitHub Action `uses:` refs, checksum verification commands. | Tracks new releases automatically via `PUBLIC_KUBEPREFLIGHT_VERSION` (see `.env.example`) — a release only needs an env var change and redeploy. |
| `verifiedEKSReleaseVersion` | The release that was actually validated end-to-end against a real EKS cluster. | The homepage hero's "verified against real EKS upgrades" badge. | Bumped manually, only when a new real-EKS validation ships. Never tied to the env var — a new release does not imply a new validation. |
| `caseStudyVersion` | The exact release that produced the EKS 1.31 → 1.32 case-study evidence. | The case-study page and its homepage teaser. | Permanently pinned to that evidence capture. Never rewritten to match the other two constants, even after new releases or new validations. |

## Why three constants instead of one

A single "current version" variable collapses three different claims into
one:

1. "This is what you'd install today" (latest release)
2. "This is the release we personally validated against a real cluster"
(verified-EKS release)
3. "This is the release whose output produced these specific numbers"
(case-study release)

Those claims drift apart the moment a release ships without a fresh EKS
validation — the site would otherwise auto-advertise an unverified release as
verified, or silently rewrite historical case-study evidence to a version
that never produced it. Keeping the constants separate makes that drift
impossible to introduce by accident.

## Adding a new release

- Bump `PUBLIC_KUBEPREFLIGHT_VERSION` (env var / CI deploy config) — this
  alone moves `latestReleaseVersion` and every install/Docker/Action example.
- Only update `verifiedEKSReleaseVersion` in `site.ts` after re-running the
  real-EKS validation against the new release.
- Never update `caseStudyVersion` — it is a historical fact about a specific
  evidence capture, not a pointer to "the current release."

## Current release feature flags

`site.releaseFeatures.supportsRedaction` is `true` for
`v0.15.0-redaction`, the first public release with native sensitive
identifier redaction. `site.releaseFeatures.supportsVersionCommand` is
currently `false`: version/provenance commands exist on the development
branch, but are not available in the `v0.15.0-redaction` binary.
