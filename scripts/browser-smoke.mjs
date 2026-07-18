import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4322';
const chromeBin = process.env.CHROME_BIN || 'google-chrome-stable';
const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9223);
const userDataDir = mkdtempSync(join(tmpdir(), 'kubepreflight-chrome-'));

const paths = [
  '/',
  '/docs',
  '/eks-upgrade-readiness',
  '/kubernetes-upgrade-checklist',
  '/install',
  '/use-cases',
  '/github-action',
  '/case-study/eks-1-31-to-1-32',
  '/security'
];

const viewports = [
  { width: 390, height: 844, label: 'mobile-390x844' },
  { width: 430, height: 932, label: 'mobile-430x932' },
  { width: 768, height: 500, label: 'tablet-768x500-landscape' },
  { width: 1024, height: 768, label: 'tablet-1024x768' },
  { width: 1280, height: 720, label: 'desktop-1280x720' },
  { width: 1440, height: 900, label: 'desktop-1440x900' },
  { width: 1920, height: 1080, label: 'desktop-1920x1080' }
];

const chrome = spawn(chromeBin, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

let chromeStderr = '';
chrome.stderr.on('data', (chunk) => {
  chromeStderr += chunk.toString();
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(url, attempts = 50) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();

    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data.toString());
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message.result);
        }
        return;
      }

      const listeners = this.listeners.get(message.method) || [];
      for (const listener of listeners) {
        listener(message);
      }
    });
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId;
    this.nextId += 1;

    const payload = { id, method, params };
    if (sessionId) {
      payload.sessionId = sessionId;
    }

    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.ws.send(JSON.stringify(payload));
    return promise;
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  return new Cdp(ws);
}

async function main() {
  const version = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
  const cdp = await connect(version.webSocketDebuggerUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const failures = [];
  const consoleErrors = [];

  cdp.on('Runtime.consoleAPICalled', (message) => {
    if (message.sessionId === sessionId && message.params.type === 'error') {
      consoleErrors.push(message.params.args.map((arg) => arg.value || arg.description || '').join(' '));
    }
  });

  cdp.on('Log.entryAdded', (message) => {
    if (message.sessionId === sessionId && message.params.entry.level === 'error') {
      consoleErrors.push(message.params.entry.text);
    }
  });

  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Log.enable', {}, sessionId);

  for (const viewport of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 768
    }, sessionId);

    for (const path of paths) {
      const beforeConsoleCount = consoleErrors.length;
      const loadEvent = new Promise((resolve) => {
        const listener = (message) => {
          if (message.sessionId === sessionId) {
            resolve();
          }
        };
        cdp.on('Page.loadEventFired', listener);
      });

      await cdp.send('Page.navigate', { url: `${baseUrl}${path}` }, sessionId);
      await loadEvent;
      await sleep(100);

      const result = await cdp.send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => ({
          title: document.title,
          h1Count: document.querySelectorAll('h1').length,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          emailProtectionMarkup: document.querySelectorAll('a[href*="/cdn-cgi/l/email-protection"], .__cf_email__').length,
          copyMismatches: Array.from(document.querySelectorAll('.copy-button'))
            .map((button) => {
              const code = button.closest('.overflow-hidden')?.querySelector('code');
              const encoded = button.dataset.copyTextB64 || '';
              let actual = '';
              try {
                actual = new TextDecoder().decode(
                  Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0))
                );
              } catch {
                actual = '__decode_failed__';
              }
              const expected = (code?.textContent || '')
                .replace(/^\\n/, '')
                .replace(/\\n$/, '')
                .split('\\n')
                .map((line) => line.startsWith('$ ') ? line.slice(2) : line)
                .join('\\n');
              return {
                label: button.getAttribute('aria-label') || '',
                actual,
                expected,
                ok: actual === expected
              };
            })
            .filter((item) => !item.ok)
            .slice(0, 5),
          offenders: Array.from(document.querySelectorAll('*'))
            .map((element) => {
              const rect = element.getBoundingClientRect();
              const overflow = Math.max(element.scrollWidth - element.clientWidth, rect.right - window.innerWidth, -rect.left);
              return {
                tag: element.tagName.toLowerCase(),
                className: typeof element.className === 'string' ? element.className : '',
                text: (element.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 90),
                overflow: Math.round(overflow)
              };
            })
            .filter((item) => item.overflow > 1)
            .sort((a, b) => b.overflow - a.overflow)
            .slice(0, 5),
          activeElement: document.activeElement?.tagName || null
        }))()`
      }, sessionId);

      const value = result.result.value;
      if (value.h1Count !== 1) {
        failures.push(`${viewport.label} ${path}: expected exactly one h1, found ${value.h1Count}`);
      }
      if (value.emailProtectionMarkup > 0) {
        failures.push(`${viewport.label} ${path}: Cloudflare email-protection markup found`);
      }
      if (value.copyMismatches.length > 0) {
        const mismatches = value.copyMismatches
          .map((item) => `${item.label || 'copy button'} copied ${JSON.stringify(item.actual).slice(0, 120)} expected ${JSON.stringify(item.expected).slice(0, 120)}`)
          .join('; ');
        failures.push(`${viewport.label} ${path}: copy payload mismatch; ${mismatches}`);
      }
      const overflow = Math.max(value.scrollWidth, value.bodyScrollWidth) - value.clientWidth;
      if (overflow > 1) {
        const offenders = value.offenders
          .map((item) => `${item.tag}.${item.className} (${item.overflow}px) "${item.text}"`)
          .join('; ');
        failures.push(`${viewport.label} ${path}: horizontal overflow ${overflow}px${offenders ? `; offenders: ${offenders}` : ''}`);
      }

      if (consoleErrors.length > beforeConsoleCount) {
        failures.push(`${viewport.label} ${path}: console error`);
      }
    }
  }

  await cdp.send('Target.closeTarget', { targetId });
  cdp.ws.close();

  if (failures.length > 0 || consoleErrors.length > 0) {
    console.error('Browser smoke check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    for (const error of consoleErrors) {
      console.error(`- console: ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Checked ${paths.length} pages across ${viewports.length} viewport widths. Console errors: 0. Horizontal overflow: 0.`);
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  if (chromeStderr) {
    console.error(chromeStderr.trim());
  }
  process.exitCode = 1;
} finally {
  chrome.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => chrome.once('exit', resolve)),
    sleep(1000)
  ]);
  try {
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch {
    // Chrome can keep profile files open briefly in some CI sandboxes.
  }
}
