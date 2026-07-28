// Records the KubePreflight v1.3.0 website release video as a native
// 1920x1080 (16:9) landscape recording -- a separate composition from
// record-browser.mjs's 1080x1080 square recording (used for the
// LinkedIn/GitHub GIF), not a crop or stretch of it. The website's
// release-media card is landscape (aspect-video), so the website's MP4
// and poster need scenes actually laid out for that shape -- see
// assets-16x9/03-comparison.html's left/right split in particular.
//
// Same playScene() wall-clock-budget approach and sceneReady/fadeOut
// contract as record-browser.mjs and demo/v1-launch/record-browser.mjs
// in the core repo.
//
// Requires `playwright` installed locally (see README.md). Requires
// BASE_URL to point at a static server whose root contains this
// directory's assets-16x9/ folder.
//
// Usage: BASE_URL=http://localhost:PORT OUT_DIR=./recordings node record-browser-16x9.mjs
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
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();
  const t0 = Date.now();

  // Same 17.1s timeline as the square recording, for consistency.
  await playScene(page, `${BASE_URL}/assets-16x9/01-title-open.html`, 2000, { waitForReady: false });
  await playScene(page, `${BASE_URL}/assets-16x9/02-problem.html`, 2400);
  await playScene(page, `${BASE_URL}/assets-16x9/03-comparison.html`, 2800);
  await playScene(page, `${BASE_URL}/assets-16x9/04-coverage.html`, 3200);
  await playScene(page, `${BASE_URL}/assets-16x9/05-surfaces.html`, 2200);
  await playScene(page, `${BASE_URL}/assets-16x9/06-certification.html`, 2500);
  await playScene(page, `${BASE_URL}/assets-16x9/07-title-close.html`, 2000, { waitForReady: false, fade: false });

  console.log(`Timeline: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await finishRecording(context, page, 'raw-capture-16x9.webm');
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
