import { evaluateSeo, PRODUCTION_HOSTNAME } from './lighthouse-seo-exception.mjs';

const threshold = 95;
const contentSignalDetails = {
  items: [{ line: 'Content-Signal: search=yes,ai-train=no,use=reference', message: 'Unknown directive' }]
};

const failures = [];
function check(label, condition) {
  if (!condition) failures.push(label);
}

// 1. SEO 92 + only Content-Signal robots warning -> pass with accepted warning.
{
  const result = evaluateSeo({
    hostname: PRODUCTION_HOSTNAME,
    score: 92,
    threshold,
    failingAudits: ['robots-txt'],
    robotsTxtDetails: contentSignalDetails
  });
  check('production + only content-signal robots-txt failure: passes', result.passed === true);
  check('production + only content-signal robots-txt failure: exception applied', result.exceptionApplied === true);
  check('production + only content-signal robots-txt failure: warning mentions score', result.warning?.includes('score 92') ?? false);
  check(
    'production + only content-signal robots-txt failure: warning explains the tradeoff',
    (result.warning?.includes('Search crawling remains enabled') && result.warning?.includes('AI training restriction is intentional')) ?? false
  );
}

// 2. SEO 92 + missing canonical (alongside robots-txt) -> fail.
{
  const result = evaluateSeo({
    hostname: PRODUCTION_HOSTNAME,
    score: 92,
    threshold,
    failingAudits: ['robots-txt', 'canonical'],
    robotsTxtDetails: contentSignalDetails
  });
  check('production + canonical also failing: fails', result.passed === false);
  check('production + canonical also failing: no exception applied', result.exceptionApplied === false);
}

// 3. SEO 92 + robots failure unrelated to Content-Signal -> fail.
{
  const result = evaluateSeo({
    hostname: PRODUCTION_HOSTNAME,
    score: 92,
    threshold,
    failingAudits: ['robots-txt'],
    robotsTxtDetails: { items: [{ line: "Disallow: **", message: 'Syntax not understood' }] }
  });
  check('production + unrelated robots-txt failure: fails', result.passed === false);
  check('production + unrelated robots-txt failure: no exception applied', result.exceptionApplied === false);
}

// 4. SEO below the 90 floor -> fail, even with an otherwise-qualifying shape.
{
  const result = evaluateSeo({
    hostname: PRODUCTION_HOSTNAME,
    score: 85,
    threshold,
    failingAudits: ['robots-txt'],
    robotsTxtDetails: contentSignalDetails
  });
  check('below SEO_EXCEPTION_FLOOR: fails', result.passed === false);
  check('below SEO_EXCEPTION_FLOOR: no exception applied', result.exceptionApplied === false);
}

// 5. Non-production hostname with the same otherwise-qualifying shape -> follows normal threshold.
{
  const result = evaluateSeo({
    hostname: '127.0.0.1',
    score: 92,
    threshold,
    failingAudits: ['robots-txt'],
    robotsTxtDetails: contentSignalDetails
  });
  check('non-production hostname: fails (normal threshold applies)', result.passed === false);
  check('non-production hostname: no exception applied', result.exceptionApplied === false);
}

// 6. SEO 95+ -> normal pass, no exception warning, regardless of hostname/audits.
{
  const result = evaluateSeo({
    hostname: PRODUCTION_HOSTNAME,
    score: 96,
    threshold,
    failingAudits: [],
    robotsTxtDetails: undefined
  });
  check('SEO at/above threshold: passes', result.passed === true);
  check('SEO at/above threshold: no exception applied', result.exceptionApplied === false);
  check('SEO at/above threshold: no warning printed', result.warning === null);
}

if (failures.length > 0) {
  console.error(`Lighthouse SEO exception checks failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Lighthouse SEO exception checks passed: 6 scenarios verified.');
