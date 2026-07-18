// The current verified KubePreflight release every version-pinned command
// on the site derives from. Set via PUBLIC_KUBEPREFLIGHT_VERSION (see
// .env.example) so a future release only needs an env var change + redeploy
// — never a source edit. Falls back to the last release wired in here if the
// env var isn't set, so local dev and CI never break silently.
const currentVersion = import.meta.env.PUBLIC_KUBEPREFLIGHT_VERSION?.trim() || 'v0.14.0';

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
  currentVersion,
  // Same release, without the leading "v" — the shape ghcr.io Docker tags use.
  // Derived, not a second env var, so the two can never drift out of sync.
  currentDockerTag: currentVersion.replace(/^v/, ''),
  ogImage: '/og/default.svg',
  locale: 'en-US',
  twitterHandle: undefined as string | undefined
} as const;
