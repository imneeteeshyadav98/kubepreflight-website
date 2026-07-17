export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

export const site = {
  name: 'KubePreflight',
  tagline: 'Upgrade Kubernetes with evidence, not assumptions.',
  description:
    'KubePreflight evaluates upgrade readiness, EKS rollback options, and CI regressions before production changes become incidents.',
  url: 'https://kubepreflight.com',
  githubUrl: 'https://github.com/imneeteeshyadav98/kubepreflight',
  githubActionUrl: 'https://github.com/marketplace/actions/kubepreflight',
  // Deep links into the core repo's canonical docs, used as "full reference"
  // links from the local /install and /github-action pages.
  installDocsUrl: 'https://github.com/imneeteeshyadav98/kubepreflight#install',
  ciDocsUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/blob/master/docs/ci-integration.md',
  clusterRoleUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/blob/master/deploy/clusterrole.yaml',
  iamPolicyUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/blob/master/deploy/iam-policy.json',
  releasesUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/releases',
  issuesUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/issues',
  securityDisclosureUrl: 'https://github.com/imneeteeshyadav98/kubepreflight/security/advisories/new',
  currentVersion: 'v0.14.0-real-eks-case-study',
  ogImage: '/og/default.svg',
  locale: 'en-US',
  twitterHandle: undefined as string | undefined
} as const;

export const socialLinks: readonly SocialLink[] = [
  { label: 'GitHub', href: site.githubUrl }
];
