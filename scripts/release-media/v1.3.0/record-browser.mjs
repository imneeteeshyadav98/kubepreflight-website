// Records the KubePreflight v1.3.0 release animation as one continuous
// video: seven custom HTML "scene" pages (title, problem, comparison,
// coverage, surfaces, certification, closing title), all built from
// numbers independently verified against real certification evidence in
// the core repo (docs/certification/v1.3.0/) -- no live AWS/Kubernetes
// environment is recorded; every panel is synthetic, styled to match the
// product's real report/Console output.
//
// Modeled directly on demo/v1-launch/record-browser.mjs in the core repo
// (the v1.0.0 launch pipeline) -- same playScene() wall-clock-budget
// approach, same sceneReady/fadeOut contract per scene -- adapted to a
// native 1080x1080 square canvas (recorded square from the start, not
// cropped after the fact) and a pure custom-scene sequence with no real
// product page navigation.
//
// Requires `playwright` installed locally (not a project dependency --
// see README.md in this directory). Requires BASE_URL to point at a
// static server whose root contains this directory's assets/ folder.
//
// Usage: BASE_URL=http://localhost:PORT OUT_DIR=./recordings node record-browser.mjs
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8899';
const OUT_DIR = process.env.OUT_DIR || './recordings';
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || undefined;
const FADE_MS = 240;

mkdirSync(OUT_DIR, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

// See demo/v1-launch/record-browser.mjs for why this is wall-clock-based
// rather than a fixed extra wait() on top of sceneReady: waiting for
// sceneReady takes a variable amount of time (staggered card reveals),
// and a fixed extra wait silently overshoots the intended total duration.
async function playScene(page, url, targetMs, { waitForReady = true, fade = true, fadeMs = FADE_MS } = {}) {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'load' });
  if (waitForReady) {
    await page.waitForFunction(() => window.sceneReady === true, { timeout: targetMs + 2000 });
  }
  const appliedFadeMs = fade ? fadeMs : 0;
  const elapsed = Date.now() - start;
  await wait(targetMs - appliedFadeMs - elapsed);
  if (fade) {
    await page.evaluate(() => window.fadeOut && window.fadeOut());
    await wait(appliedFadeMs);
  }
}

async function finishRecording(context, page, outputName) {
  await page.close();
  await context.close();

  // Playwright names the video file "page@<guid>.webm" -- rename to
  // something predictable for render.sh to pick up.
  const files = readdirSync(OUT_DIR).filter((f) => f.startsWith('page@') && f.endsWith('.webm'));
  if (files.length === 1) {
    renameSync(join(OUT_DIR, files[0]), join(OUT_DIR, outputName));
    console.log(`Recording saved: ${join(OUT_DIR, outputName)}`);
  } else {
    console.log(`Recording(s) saved in ${OUT_DIR}:`, files);
  }
}

async function record(browser) {
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1080 },
    recordVideo: { dir: OUT_DIR, size: { width: 1080, height: 1080 } }
  });
  const page = await context.newPage();
  const t0 = Date.now();

  // 0.0s - 2.0s: opening title card
  await playScene(page, `${BASE_URL}/assets/01-title-open.html`, 2000, { waitForReady: false });

  // 2.0s - 4.4s: the problem -- missing != resolved
  await playScene(page, `${BASE_URL}/assets/02-problem.html`, 2400);

  // 4.4s - 7.2s: new comparison semantics -- not_re_evaluated
  await playScene(page, `${BASE_URL}/assets/03-comparison.html`, 2800);

  // 7.2s - 10.4s: honest evidence coverage
  await playScene(page, `${BASE_URL}/assets/04-coverage.html`, 3200);

  // 10.4s - 12.6s: consistent across every surface
  await playScene(page, `${BASE_URL}/assets/05-surfaces.html`, 2200);

  // 12.6s - 15.1s: real-EKS certification
  await playScene(page, `${BASE_URL}/assets/06-certification.html`, 2500);

  // 15.1s - 17.1s: closing title card
  await playScene(page, `${BASE_URL}/assets/07-title-close.html`, 2000, { waitForReady: false, fade: false });

  console.log(`Timeline: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await finishRecording(context, page, 'raw-capture.webm');
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  await record(browser);
  await browser.close();
}

main().catch((err) => {
  console.error('RECORD_FAIL', err);
  process.exit(1);
});
