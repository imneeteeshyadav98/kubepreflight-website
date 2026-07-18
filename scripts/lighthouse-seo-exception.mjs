// The Cloudflare "Content-Signal" robots.txt directive is a deliberate,
// accepted choice on kubepreflight.com: it keeps search crawling allowed
// while restricting AI-training use. Lighthouse's robots.txt parser does
// not yet recognize that directive and flags it as an "Unknown directive",
// which costs 8 SEO points on every production page for a line that isn't
// actually a mistake.
//
// evaluateSeo() draws a narrow exception around exactly that situation, so
// automated checks reflect the accepted decision instead of either (a)
// permanently failing on an intentional tradeoff, or (b) lowering the SEO
// bar for everyone and hiding a real future regression (missing canonical,
// broken title/meta description, a genuinely malformed robots.txt, etc).
// Every other SEO failure — on any hostname, at any score — still fails.

export const PRODUCTION_HOSTNAME = 'kubepreflight.com';
export const SEO_EXCEPTION_FLOOR = 90;
const CONTENT_SIGNAL_MARKER = 'Content-Signal';

/**
 * @param {object} input
 * @param {string} input.hostname - hostname the audit ran against
 * @param {number} input.score - SEO category score, 0-100
 * @param {number} input.threshold - the normal passing threshold (unchanged, 95)
 * @param {string[]} input.failingAudits - ids of SEO-category audits that failed
 * @param {{ items?: { line?: string }[] }} [input.robotsTxtDetails] - the
 *   `robots-txt` audit's `details`, when that audit is present/failing
 * @returns {{ passed: boolean, exceptionApplied: boolean, warning: string | null }}
 */
export function evaluateSeo({ hostname, score, threshold, failingAudits, robotsTxtDetails }) {
  if (score >= threshold) {
    return { passed: true, exceptionApplied: false, warning: null };
  }

  const isProduction = hostname === PRODUCTION_HOSTNAME;
  const meetsFloor = score >= SEO_EXCEPTION_FLOOR;
  const onlyRobotsTxtFails = failingAudits.length === 1 && failingAudits[0] === 'robots-txt';
  const items = robotsTxtDetails?.items ?? [];
  const allContentSignal = items.length > 0 && items.every((item) => (item.line ?? '').includes(CONTENT_SIGNAL_MARKER));

  const exceptionApplies = isProduction && meetsFloor && onlyRobotsTxtFails && allContentSignal;

  if (!exceptionApplies) {
    return { passed: false, exceptionApplied: false, warning: null };
  }

  return {
    passed: true,
    exceptionApplied: true,
    warning:
      `ACCEPTED SEO EXCEPTION: score ${score} — Cloudflare Content-Signal is not recognized by Lighthouse.\n` +
      'Search crawling remains enabled; AI training restriction is intentional.'
  };
}
