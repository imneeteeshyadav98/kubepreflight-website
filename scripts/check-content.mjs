import { readFileSync } from 'node:fs';

// Focused source-level assertions for the prelaunch semantic-clarity fixes.
// Complements check-links.mjs (broken links) and browser-smoke.mjs
// (rendered overflow/console errors) — this one guards copy and structural
// invariants that only exist as source text, not built markup.

const root = new URL('../', import.meta.url);
const readRaw = (path) => readFileSync(new URL(path, root), 'utf8');
// Prose in .astro templates wraps across source lines for readability;
// normalize whitespace so phrase checks match regardless of where a line
// break happens to fall.
const read = (path) => readRaw(path).replace(/\s+/g, ' ');

const failures = [];
function check(label, condition) {
  if (!condition) failures.push(label);
}

// --- Version and repository references must only live in site.ts ---
// A hardcoded "v0.14.0"-shaped literal or the raw repo owner string anywhere
// else means a future release will silently miss that spot (the exact bug
// this refactor exists to prevent).
const sourceFiles = [
  'src/pages/index.astro',
  'src/pages/docs.astro',
  'src/pages/install.astro',
  'src/pages/use-cases.astro',
  'src/pages/github-action.astro',
  'src/pages/security.astro',
  'src/pages/case-study/eks-1-31-to-1-32.astro',
  'src/components/home/Hero.astro',
  'src/components/home/EksEvidence.astro',
  'src/components/home/CiGate.astro',
  'src/content/navigation.ts'
];

for (const file of sourceFiles) {
  const content = read(file);
  check(`${file}: no hardcoded version literal (must reference site.ts constants)`, !/v\d+\.\d+\.\d+/.test(content));
  check(`${file}: no hardcoded repository owner (must reference site.repositoryOwner)`, !content.includes('imneeteeshyadav98'));
}

const siteConfig = readRaw('src/content/site.ts');
check('site.ts: latest release fallback is v0.15.0-redaction', siteConfig.includes("'v0.15.0-redaction'"));
check('site.ts: v0.15.0-redaction supports redaction', siteConfig.includes('supportsRedaction: true'));
check('site.ts: v0.15.0-redaction does not claim version command support', siteConfig.includes('supportsVersionCommand: false'));
check('site.ts: Docker tag is derived without leading v', siteConfig.includes("latestReleaseVersion.replace(/^v/, '')"));

const codeBlock = readRaw('src/components/ui/CodeBlock.astro');
check('CodeBlock.astro: rendered @ signs are entity-escaped to avoid Cloudflare rewriting', codeBlock.includes("replace(/@/g, '&#64;')"));
check('CodeBlock.astro: copy text is stored encoded, not as raw owner/repo@tag HTML', codeBlock.includes('data-copy-text-b64'));
check('CodeBlock.astro: copy text decodes through TextDecoder', codeBlock.includes('new TextDecoder().decode'));

// --- WEB-004: first-user documentation journey ---
const docs = read('src/pages/docs.astro');
for (const phrase of [
  'First-user KubePreflight journey.',
  'KubePreflight assesses whether a Kubernetes or Amazon EKS upgrade is ready to proceed',
  'It does not perform the upgrade or automatically change the cluster',
  'kubepreflight scan \\\\ --target-version 1.32',
  '--redact-sensitive-identifiers',
  'kubepreflight compare \\\\ --baseline previous-findings.json',
  'kubepreflight rollback plan',
  'kubepreflight rollback assess',
  'Infrastructure failure before a trustworthy scan report was produced'
]) {
  check(`docs.astro: required journey phrase present: ${phrase}`, docs.includes(phrase));
}
check('docs.astro: Docker tag uses derived non-v tag', docs.includes('DOCKER_TAG = site.latestDockerTag'));
check('docs.astro: GitHub Action ref uses release constant', docs.includes('ACTION_REF = site.latestGitHubActionRef'));
check('docs.astro: current release does not claim version command support', !/kubepreflight\s+(--version|version)/.test(docs));

// --- Fix #1 / #2: comparison PASS vs upgrade-readiness, strict vs comparison gate ---
const githubAction = read('src/pages/github-action.astro');
check(
  'github-action.astro: PASS-does-not-mean-ready clarification present',
  githubAction.includes('It does not mean the cluster is ready to upgrade')
);
check(
  'github-action.astro: strict-scan-vs-comparison-gate guidance present',
  githubAction.includes('use the comparison gate below instead')
);
check(
  'github-action.astro: supply-chain SHA-pinning note present',
  githubAction.includes('verified commit') && githubAction.includes('SHA')
);
check(
  'github-action.astro: workflows declare explicit permissions',
  (githubAction.match(/permissions: contents: read/g) || []).length >= 2
);

// --- Fix #4: case-study sanitized-evidence wording ---
const caseStudy = read('src/pages/case-study/eks-1-31-to-1-32.astro');
check(
  'case-study: sanitized-identifiers wording present',
  caseStudy.includes('infrastructure identifiers were sanitized')
);
check('case-study: stale "unedited outcome" wording removed', !caseStudy.includes('unedited outcome'));
check(
  'case-study: comparison-gate-pass clarification present',
  caseStudy.includes('does not mean the cluster was') && caseStudy.includes('ready to upgrade')
);

// --- Fix #5 / #6: use-cases badge + non-committal provider wording ---
const useCases = read('src/pages/use-cases.astro');
check('use-cases.astro: badge updated to evidence-based wording', useCases.includes('Evidence-based workflows'));
check('use-cases.astro: fictional-adoption-claims badge removed', !useCases.includes('No fictional adoption claims'));
check('use-cases.astro: non-committal EKS-today heading present', useCases.includes('Amazon EKS is supported today.'));
check(
  'use-cases.astro: delivery-commitment provider wording removed',
  !useCases.includes('GKE and AKS adapters are planned')
);

const trustLimitations = read('src/components/home/TrustLimitations.astro');
check(
  'TrustLimitations.astro: delivery-commitment provider wording removed',
  !trustLimitations.includes('GKE and AKS provider adapters are planned')
);

// --- Fix #7: homepage capability-layers heading ---
const capabilityLayers = read('src/components/home/CapabilityLayers.astro');
check(
  'CapabilityLayers.astro: heading no longer promises one identical recommendation',
  !capabilityLayers.includes('Three layers, one recommendation.')
);
check(
  'CapabilityLayers.astro: rollback layer distinguishes pre-upgrade assessment from live eligibility',
  capabilityLayers.includes('Re-verify live eligibility')
);

// --- Fix #8: operator-judgment boundary present on the pages that need it ---
for (const [file, path] of [
  ['src/pages/use-cases.astro', useCases],
  ['src/pages/security.astro', read('src/pages/security.astro')]
]) {
  check(`${file}: operator-judgment / non-guarantee boundary present`, /does not guarantee that an\s+upgrade or rollback will succeed/.test(path));
}

// --- Navigation: aria-current wired to the active-link check ---
const header = read('src/components/layout/Header.astro');
check('Header.astro: aria-current applied to active nav link', header.includes('aria-current={isActive(item.href)'));
check('Header.astro: subtle active indicator (border), not a filled tab', header.includes('border-signal'));

if (failures.length > 0) {
  console.error(`Content checks failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Content checks passed: ${sourceFiles.length} files scanned for stale references and semantic assertions.`);
