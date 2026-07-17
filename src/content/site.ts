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
  ogImage: '/og/default.png',
  locale: 'en-US',
  twitterHandle: undefined as string | undefined
} as const;

export const socialLinks: readonly SocialLink[] = [
  { label: 'GitHub', href: site.githubUrl }
];
