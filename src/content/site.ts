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
  // The current verified release every version-pinned command on the site
  // derives from — never bump this by editing individual pages. Same commit
  // as the immutable v0.14.0-real-eks-case-study milestone tag; this is the
  // clean public SemVer alias published for production use.
  currentVersion: 'v0.14.0',
  // Same release, without the leading "v" — the shape ghcr.io Docker tags use.
  currentDockerTag: '0.14.0',
  ogImage: '/og/default.svg',
  locale: 'en-US',
  twitterHandle: undefined as string | undefined
} as const;
