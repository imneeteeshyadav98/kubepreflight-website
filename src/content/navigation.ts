import { site } from './site';

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export const primaryNav: readonly NavItem[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'Install', href: '/install' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'GitHub Action', href: '/github-action' },
  { label: 'Case study', href: '/case-study/eks-1-31-to-1-32' },
  { label: 'Security', href: '/security' }
];

export interface FooterColumn {
  readonly heading: string;
  readonly items: readonly NavItem[];
}

export const footerColumns: readonly FooterColumn[] = [
  {
    heading: 'Product',
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Install', href: '/install' },
      { label: 'Use cases', href: '/use-cases' },
      { label: 'GitHub Action', href: '/github-action' },
      { label: 'Security', href: '/security' }
    ]
  },
  {
    heading: 'Evidence',
    items: [{ label: 'EKS 1.31 → 1.32 case study', href: '/case-study/eks-1-31-to-1-32' }]
  },
  {
    heading: 'Repository',
    items: [
      { label: 'Source & docs', href: site.githubUrl, external: true },
      { label: 'Releases', href: site.releasesUrl, external: true },
      { label: 'Issues', href: site.issuesUrl, external: true },
      { label: 'License (Apache-2.0)', href: site.licenseUrl, external: true }
    ]
  }
];
