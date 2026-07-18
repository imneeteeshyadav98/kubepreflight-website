import { writeFileSync, mkdirSync } from 'node:fs';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { evaluateSeo } from './lighthouse-seo-exception.mjs';

const baseUrl = process.env.LIGHTHOUSE_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4322';
const hostname = new URL(baseUrl).hostname;
const chromePath = process.env.CHROME_BIN || undefined;

const paths = ['/', '/docs', '/eks-upgrade-readiness', '/kubernetes-upgrade-checklist', '/kubernetes-deprecated-api-checker', '/eks-rollback-readiness', '/install', '/use-cases', '/github-action', '/case-study/eks-1-31-to-1-32', '/security'];

const thresholds = {
  performance: 90,
  accessibility: 95,
  'best-practices': 95,
  seo: 95
};

const outDir = new URL('../lighthouse-reports/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const chrome = await chromeLauncher.launch({
  chromePath,
  chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
});

const failures = [];
const summary = [];

try {
  for (const path of paths) {
    const url = `${baseUrl}${path}`;
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: Object.keys(thresholds),
      logLevel: 'error'
    });

    const scores = {};
    for (const key of Object.keys(thresholds)) {
      scores[key] = Math.round((result.lhr.categories[key]?.score ?? 0) * 100);
    }

    const slug = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
    writeFileSync(`${outDir}${slug}.json`, result.report);

    summary.push({ path, scores });

    for (const [key, min] of Object.entries(thresholds)) {
      if (key === 'seo') continue; // evaluated separately below via evaluateSeo()
      if (scores[key] < min) {
        failures.push(`${path}: ${key} ${scores[key]} < ${min}`);
      }
    }

    const seoCategory = result.lhr.categories.seo;
    const failingSeoAudits = seoCategory.auditRefs
      .map((ref) => result.lhr.audits[ref.id])
      .filter((audit) => audit && audit.score !== null && audit.score < 1)
      .map((audit) => audit.id);

    const seoResult = evaluateSeo({
      hostname,
      score: scores.seo,
      threshold: thresholds.seo,
      failingAudits: failingSeoAudits,
      robotsTxtDetails: result.lhr.audits['robots-txt']?.details
    });

    if (seoResult.warning) {
      console.log(`\n${path}\n${seoResult.warning}`);
    }
    if (!seoResult.passed) {
      failures.push(`${path}: seo ${scores.seo} < ${thresholds.seo}`);
    }
  }
} finally {
  chrome.kill();
}

console.log('Lighthouse scores (performance / accessibility / best-practices / seo):');
for (const { path, scores } of summary) {
  console.log(`  ${path.padEnd(32)} ${scores.performance}/${scores.accessibility}/${scores['best-practices']}/${scores.seo}`);
}

if (failures.length > 0) {
  console.error('\nLighthouse check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nAll pages meet the production thresholds.');
}
