// These three version constants are semantically different and must not be
// collapsed into one "current version" — see docs/version-references.md.
//
// - latestReleaseVersion: what install/Docker/GitHub Action *example*
//   commands are pinned to. Tracks new releases automatically.
// - verifiedEKSReleaseVersion: the release actually validated end-to-end
//   against a real EKS cluster. "Verified against real EKS upgrades" copy
//   must use this, not latestReleaseVersion — bump it only when a new
//   real-EKS validation ships, never automatically.
// - caseStudyVersion: the exact release that produced the EKS 1.31 -> 1.32
//   case-study evidence. Permanently pinned to that evidence capture; never
//   rewrite it just to match the other two constants.
//
// v1.0.0 is the current public release, and also the latest real-EKS
// validation: SEC-TRUST-002 ran scan/plan/compare/rollback assessment for
// the released binary and digest-pinned container against a real disposable
// EKS cluster. The artifacts actually exercised live were tagged
// v1.0.0-rc.1 (which that run caught a real rollback bug in) and
// v1.0.0-rc.2 (clean); v1.0.0 ships that exact product code unchanged --
// see /case-study/eks-1-31-to-1-32 for how the two relate. v0.14.0 remains
// pinned as the EKS 1.31 -> 1.32 case-study evidence release specifically;
// it is a separate, earlier fact from the SEC-TRUST-002 validation above
// and must not be conflated with it.

// Tracks new releases. Set via PUBLIC_KUBEPREFLIGHT_VERSION (see
// .env.example) so a future release only needs an env var change +
// redeploy — never a source edit. Falls back to the last release wired in
// here if the env var isn't set, so local dev and CI never break silently.
const latestReleaseVersion = import.meta.env.PUBLIC_KUBEPREFLIGHT_VERSION?.trim() || 'v1.0.0';

// Fixed historical facts, deliberately NOT env-driven — see comment above.
const verifiedEKSReleaseVersion = 'v1.0.0';
const caseStudyVersion = 'v0.14.0';
// SEC-TRUST-002: the RC where the live-EKS run found a real product bug,
// and the RC it re-verified clean against afterward. Fixed historical
// facts like caseStudyVersion above — the story of how verifiedEKSReleaseVersion
// got its proof, not something that moves with new releases.
const secTrust002BugFoundVersion = 'v1.0.0-rc.1';
const secTrust002VerifiedCleanVersion = 'v1.0.0-rc.2';
const latestDockerTag = latestReleaseVersion.replace(/^v/, '');
const latestGitHubActionRef = latestReleaseVersion;

export const site = {
  name: 'KubePreflight',
  tagline: 'Upgrade Kubernetes with evidence, not assumptions.',
  description:
    'KubePreflight evaluates upgrade readiness, EKS rollback options, and CI regressions before production changes become incidents.',
  url: 'https://kubepreflight.com',
  githubUrl: 'https://github.com/imneeteeshyadav98/kubepreflight',
  // Deep links into the core repo's canonical docs, used as "full reference"
  // links from the local /install and /github-action pages.
  installDocsUrl: 'https://github.com/imneeteeshyadav98/kubepreflight#install',
  ciDocsUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/blob/master/docs/ci-integration.md',
  clusterRoleUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/blob/master/deploy/clusterrole.yaml',
  iamPolicyUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/blob/master/deploy/iam-policy.json',
  licenseUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/blob/master/LICENSE',
  releasesUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/releases',
  issuesUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/issues',
  securityDisclosureUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/security/advisories/new',
  latestReleaseVersion,
  // Same release, without the leading "v" — the shape ghcr.io Docker tags use.
  // Derived, not a second env var, so the two can never drift out of sync.
  latestDockerTag,
  latestGitHubActionRef,
  verifiedEKSReleaseVersion,
  caseStudyVersion,
  secTrust002BugFoundVersion,
  secTrust002VerifiedCleanVersion,
  releaseFeatures: {
    supportsVersionCommand: true,
    supportsRedaction: true
  },
  repositoryOwner: 'imneeteeshyadav98',
  repositoryName: 'kubepreflight',
  ogImage: '/og/default.svg',
  locale: 'en-US',
  twitterHandle: undefined as string | undefined
} as const;
