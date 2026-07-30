// These version constants are semantically different and must not be
// collapsed into one "current version" — see docs/version-references.md.
//
// - latestReleaseVersion: what install/Docker/GitHub Action *example*
//   commands are pinned to. Tracks new releases automatically.
// - verifiedEKSReleaseVersion: the most recent release actually validated
//   end-to-end against a real, disposable EKS cluster. "Verified against
//   real EKS upgrades" copy must use this, not latestReleaseVersion — bump
//   it only when a new real-EKS validation ships, never automatically.
// - caseStudyVersion: the exact release that produced the EKS 1.31 -> 1.32
//   case-study evidence. Permanently pinned to that evidence capture; never
//   rewrite it just to match the other constants.
// - secTrust002ReleaseVersion: the exact release the SEC-TRUST-002 live-EKS
//   validation narrative and its embedded video are about. Historically
//   this was the same value as verifiedEKSReleaseVersion (both were v1.0.0),
//   but the two claims are different — "the SEC-TRUST-002 story happened on
//   this release" versus "this is the most recently validated release" —
//   and they diverge the moment a later release gets its own real-EKS
//   validation. Keep this pinned to v1.0.0 permanently; never move it to
//   follow verifiedEKSReleaseVersion.
// - contextAwareGatingDemoVersion: the exact release whose recorded demo
//   media (/media/kubepreflight-<version>-context-aware-gating.*) is on
//   disk. Permanently pinned to that capture; never derived from
//   latestReleaseVersion, or the demo asset paths silently 404 on every
//   release that doesn't re-record the same feature demo.
//
// v1.3.1 is the current public release: a certification-driven patch for
// safer evidence sharing and documented least-privilege Kubernetes access.
// Redaction was re-verified against real EKS-derived evidence and the
// documented Kubernetes RBAC role was verified on a disposable Kind cluster,
// so verifiedEKSReleaseVersion moves to v1.3.1 with it.
//
// v1.3.0 remains a historical feature release ("Evidence Integrity and
// Evaluation Semantics"): native applicability/execution tracking for all 31
// rules, findings schema 1.1 with backward-compatible legacy 1.0
// normalization, a not_re_evaluated comparison bucket that stops a
// disappeared finding from being misread as resolved, and combined
// rule-execution/evidence-plane decision coverage. It was certified against a
// real, disposable Amazon EKS cluster across full-access, reduced-IAM, and
// manifests-only modes. v1.1.0 added context-aware upgrade gating and was
// release-locked with isolated Kind, published-artifact, and GHCR
// verification; its demo capture is preserved via
// contextAwareGatingDemoVersion, independent of the current release.
// v1.0.0 remains the fixed SEC-TRUST-002 story (see secTrust002ReleaseVersion
// above): scan/plan/compare/rollback assessment run for the released binary
// and digest-pinned container against a real disposable EKS cluster. The
// artifacts actually exercised live were tagged v1.0.0-rc.1 (which that run
// caught a real rollback bug in) and v1.0.0-rc.2 (clean); v1.0.0 shipped
// that exact product code unchanged -- see /case-study/eks-1-31-to-1-32 for
// how the two relate. v0.14.0 remains pinned as the EKS 1.31 -> 1.32
// case-study evidence release specifically; it is a separate, earlier fact
// from SEC-TRUST-002 and must not be conflated with v1.0.0, v1.1.0, or
// v1.3.0, or v1.3.1.

// Tracks new releases. Set via PUBLIC_KUBEPREFLIGHT_VERSION (see
// .env.example) so a future release only needs an env var change +
// redeploy — never a source edit. Falls back to the last release wired in
// here if the env var isn't set, so local dev and CI never break silently.
const latestReleaseVersion = import.meta.env.PUBLIC_KUBEPREFLIGHT_VERSION?.trim() || 'v1.3.1';

// Fixed historical facts, deliberately NOT env-driven — see comment above.
const verifiedEKSReleaseVersion = 'v1.3.1';
const caseStudyVersion = 'v0.14.0';
const secTrust002ReleaseVersion = 'v1.0.0';
const contextAwareGatingDemoVersion = 'v1.1.0';
// SEC-TRUST-002: the RC where the live-EKS run found a real product bug,
// and the RC it re-verified clean against afterward. Fixed historical
// facts like caseStudyVersion above — the story of how secTrust002ReleaseVersion
// got its proof, not something that moves with new releases.
const secTrust002BugFoundVersion = 'v1.0.0-rc.1';
const secTrust002VerifiedCleanVersion = 'v1.0.0-rc.2';
const latestDockerTag = latestReleaseVersion.replace(/^v/, '');
const latestGitHubActionRef = latestReleaseVersion;
const repositoryOwner = 'imneeteeshyadav98';
const repositoryName = 'kubepreflight';
// Deep link to the current release's GitHub Releases entry. Derived from
// latestReleaseVersion so it never drifts out of sync with the tag it
// points to.
const latestReleaseUrl = `https://github.com/${repositoryOwner}/${repositoryName}/releases/tag/${latestReleaseVersion}`;

// Verified capability claims for the current release, used by the homepage
// release-announcement card. Keep this list to what the release actually
// shipped and what certification actually confirmed — see
// docs/version-references.md before editing.
const latestReleaseHighlights = [
  'Redacts sensitive identifiers consistently across terminal, JSON, Markdown, HTML, compare, and rollback output',
  'Adds redaction for AWS infrastructure identifiers, endpoints, hostnames, IPs, tokens, and local paths',
  'Complete read-only Kubernetes-plane evidence coverage using the documented role',
  'Preserves rule semantics, schemas, fingerprints, scores, gates, rollback recommendations, and exit codes'
];

const latestReleaseSummary =
  'A certification-driven patch release focused on safer evidence sharing and least-privilege Kubernetes access.';
const latestReleaseVerification =
  'The redaction fixes are verified against a real Amazon EKS environment. Kubernetes RBAC coverage is verified on a disposable Kind cluster.';
const readOnlyReleaseClaim =
  'KubePreflight remains fully read-only and does not execute upgrades, rollbacks, remediation, or cluster mutations.';

const releaseHistory = [
  {
    version: 'v1.3.1',
    title: 'Redaction and documented RBAC certification fixes',
    summary: latestReleaseSummary,
    highlights: latestReleaseHighlights,
    verification: latestReleaseVerification,
    readOnlyClaim: readOnlyReleaseClaim,
    url: `https://github.com/${repositoryOwner}/${repositoryName}/releases/tag/v1.3.1`,
    current: true
  },
  {
    version: 'v1.3.0',
    title: 'Rule execution evidence and evaluation coverage',
    summary:
      'Evidence integrity feature release for rule applicability, execution-state tracking, findings schema 1.1, the not_re_evaluated comparison bucket, and combined rule-execution/evidence-plane decision coverage.',
    highlights: [
      'Native applicability and execution-state tracking for all 31 rules',
      'Findings schema 1.1 with backward-compatible legacy 1.0 normalization',
      'not_re_evaluated comparison bucket for findings whose rules did not rerun',
      'Certified on disposable Amazon EKS infrastructure across full-access, reduced-IAM, and manifests-only modes'
    ],
    verification:
      'The v1.3.0 evidence release remains part of release history; v1.3.1 is the safer patch available now.',
    readOnlyClaim: undefined,
    url: `https://github.com/${repositoryOwner}/${repositoryName}/releases/tag/v1.3.0`,
    current: false
  }
] as const;

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
  latestReleaseUrl,
  latestReleaseHighlights,
  latestReleaseSummary,
  latestReleaseVerification,
  readOnlyReleaseClaim,
  releaseHistory,
  verifiedEKSReleaseVersion,
  caseStudyVersion,
  secTrust002ReleaseVersion,
  contextAwareGatingDemoVersion,
  secTrust002BugFoundVersion,
  secTrust002VerifiedCleanVersion,
  releaseFeatures: {
    supportsVersionCommand: true,
    supportsRedaction: true
  },
  repositoryOwner,
  repositoryName,
  ogImage: '/og/default.svg',
  locale: 'en-US',
  twitterHandle: undefined as string | undefined
} as const;
