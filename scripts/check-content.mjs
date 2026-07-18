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
  'src/pages/eks-upgrade-readiness.astro',
  'src/pages/kubernetes-upgrade-checklist.astro',
  'src/pages/kubernetes-deprecated-api-checker.astro',
  'src/pages/eks-rollback-readiness.astro',
  'src/pages/kubernetes-upgrade-ci-guide.astro',
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

// --- SEO-001A: Amazon EKS upgrade readiness guide ---
const eksGuide = read('src/pages/eks-upgrade-readiness.astro');
for (const phrase of [
  'Amazon EKS Upgrade Readiness Guide',
  'Assess Kubernetes APIs, admission webhooks, workloads, PodDisruptionBudgets',
  'Removed and deprecated Kubernetes APIs',
  'Admission webhook incompatibility',
  'PDB and eviction constraints',
  'Managed add-on compatibility',
  'Rollback readiness is related, but separate',
  'A clean assessment reduces known upgrade risk',
  'KubePreflight assesses and explains; it does not perform upgrades, rollbacks',
  'Does report redaction remove every possible secret?'
]) {
  check(`eks-upgrade-readiness.astro: required guide phrase present: ${phrase}`, eksGuide.includes(phrase));
}
check(
  'eks-upgrade-readiness.astro: current release does not claim version command support',
  !/kubepreflight\s+(--version|version)/.test(eksGuide)
);
check(
  'eks-upgrade-readiness.astro: uses Cloudflare-safe CodeBlock for command example',
  eksGuide.includes('<CodeBlock') && eksGuide.includes('copyLabel="Copy EKS readiness scan"')
);

// --- SEO-001B: Kubernetes upgrade checklist ---
const upgradeChecklist = read('src/pages/kubernetes-upgrade-checklist.astro');
for (const phrase of [
  'Kubernetes Upgrade Checklist',
  'not just Amazon EKS',
  'Pre-upgrade preparation',
  'Admission webhooks',
  'Workloads and disruption',
  'Nodes and capacity',
  'Add-ons and controllers',
  'Cluster health',
  'Upgrade should not proceed',
  'It does not perform upgrades, apply remediations, or mutate cluster resources'
]) {
  check(`kubernetes-upgrade-checklist.astro: required phrase present: ${phrase}`, upgradeChecklist.includes(phrase));
}
check(
  'kubernetes-upgrade-checklist.astro: current release does not claim version command support',
  !/kubepreflight\s+(--version|version)/.test(upgradeChecklist)
);
check(
  'kubernetes-upgrade-checklist.astro: uses Cloudflare-safe CodeBlock for command example',
  upgradeChecklist.includes('<CodeBlock') && upgradeChecklist.includes('copyLabel="Copy scan command"')
);

// --- SEO-001C: Kubernetes deprecated API checker ---
const apiChecker = read('src/pages/kubernetes-deprecated-api-checker.astro');
for (const phrase of [
  'Kubernetes Deprecated API Checker',
  'Live cluster objects',
  'Raw manifests',
  'Helm chart templates',
  'Controllers and operators',
  'CRDs and conversion webhooks',
  'Commonly removed and deprecated Kubernetes APIs',
  'It does not edit manifests, apply changes, or perform the migration for you'
]) {
  check(`kubernetes-deprecated-api-checker.astro: required phrase present: ${phrase}`, apiChecker.includes(phrase));
}
check(
  'kubernetes-deprecated-api-checker.astro: current release does not claim version command support',
  !/kubepreflight\s+(--version|version)/.test(apiChecker)
);
check(
  'kubernetes-deprecated-api-checker.astro: uses Cloudflare-safe CodeBlock for command example',
  apiChecker.includes('<CodeBlock') && apiChecker.includes('copyLabel="Copy scan command"')
);

// --- SEO-001D: EKS rollback readiness guide ---
const rollbackGuide = read('src/pages/eks-rollback-readiness.astro');
for (const phrase of [
  'EKS Rollback Readiness Guide',
  'Eligibility',
  'Readiness',
  'Recommendation',
  'rollback_preferred',
  'fix_forward_preferred',
  'operator_decision_required',
  'do_not_proceed',
  'It does not execute an EKS rollback, and technical eligibility alone is not a safety guarantee',
  'Rollback assessment currently requires --provider eks'
]) {
  check(`eks-rollback-readiness.astro: required phrase present: ${phrase}`, rollbackGuide.includes(phrase));
}
check(
  'eks-rollback-readiness.astro: current release does not claim version command support',
  !/kubepreflight\s+(--version|version)/.test(rollbackGuide)
);
check(
  'eks-rollback-readiness.astro: uses Cloudflare-safe CodeBlock for command examples',
  rollbackGuide.includes('<CodeBlock') && rollbackGuide.includes('copyLabel="Copy rollback plan command"')
);

// --- SEO-001E: Kubernetes upgrade CI guide ---
const ciGuide = read('src/pages/kubernetes-upgrade-ci-guide.astro');
for (const phrase of [
  'Kubernetes Upgrade CI Guide',
  'Absolute gate',
  'Comparison gate',
  '.gitlab-ci.yml',
  'Jenkinsfile stage',
  'There is a first-party GitHub Action for GitHub Actions specifically'
]) {
  check(`kubernetes-upgrade-ci-guide.astro: required phrase present: ${phrase}`, ciGuide.includes(phrase));
}
check(
  'kubernetes-upgrade-ci-guide.astro: no fabricated official Jenkins/GitLab plugin claim',
  ciGuide.includes('There is a first-party GitHub Action. For Jenkins, GitLab CI, and other systems, run the CLI or Docker image as an ordinary pipeline step')
);
check(
  'kubernetes-upgrade-ci-guide.astro: current release does not claim version command support',
  !/kubepreflight\s+(--version|version)/.test(ciGuide)
);
check(
  'kubernetes-upgrade-ci-guide.astro: docker examples invoke docker run, not the image as a bare command',
  ciGuide.includes('docker run --rm') && ciGuide.includes('entrypoint: [""]')
);
check(
  'kubernetes-upgrade-ci-guide.astro: uses Cloudflare-safe CodeBlock for command examples',
  ciGuide.includes('<CodeBlock') && ciGuide.includes('copyLabel="Copy generic CI script"')
);

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
