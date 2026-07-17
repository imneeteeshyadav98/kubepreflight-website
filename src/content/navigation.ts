export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export const primaryNav: readonly NavItem[] = [
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
      { label: 'Source & docs', href: 'https://github.com/imneeteeshyadav98/kubepreflight', external: true },
      { label: 'Releases', href: 'https://github.com/imneeteeshyadav98/kubepreflight/releases', external: true },
      { label: 'Issues', href: 'https://github.com/imneeteeshyadav98/kubepreflight/issues', external: true }
    ]
  }
];
