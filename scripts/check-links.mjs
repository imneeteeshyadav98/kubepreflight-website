import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;
const publicDir = new URL('../public/', import.meta.url).pathname;
const htmlFiles = [];
const missing = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    const stat = statSync(file);
    if (stat.isDirectory()) {
      walk(file);
    } else if (extname(file) === '.html') {
      htmlFiles.push(file);
    }
  }
}

function existsInBuild(pathname) {
  const cleanPath = normalize(pathname.replace(/^\/+/, ''));
  const candidates = [
    join(distDir, cleanPath),
    join(distDir, cleanPath, 'index.html'),
    join(publicDir, cleanPath)
  ];

  return candidates.some((candidate) => existsSync(candidate));
}

if (!existsSync(distDir)) {
  console.error('dist/ does not exist. Run `npm run build` before `npm run check:links`.');
  process.exit(1);
}

walk(distDir);

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, 'utf8');
  const matches = html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g);

  for (const [, rawUrl] of matches) {
    if (
      rawUrl.startsWith('http:') ||
      rawUrl.startsWith('https:') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:') ||
      rawUrl.startsWith('#') ||
      rawUrl.startsWith('data:')
    ) {
      continue;
    }

    const [pathname] = rawUrl.split('#');
    if (!pathname || pathname.startsWith('javascript:')) {
      continue;
    }

    if (!existsInBuild(pathname)) {
      missing.push(`${htmlFile.replace(distDir, 'dist/')} -> ${rawUrl}`);
    }
  }
}

if (missing.length > 0) {
  console.error(`Broken local links/assets found (${missing.length}):`);
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files. Broken local links/assets: 0`);
