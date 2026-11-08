#!/usr/bin/env node
// Captures every experience at 1440 / 768 / 390 and reports console errors,
// failed requests and horizontal overflow. Requires the dev server running.
//   node tools/screenshots.mjs [outDir] [pageKey...]
// Uses Playwright if available (npx playwright); not a project dependency.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
if (process.env.PLAYWRIGHT_PATH) {
  // Not a repo dependency on purpose: point PLAYWRIGHT_PATH at any install's index.mjs.
  const pw = await import(process.env.PLAYWRIGHT_PATH);
  chromium = pw.chromium || pw.default.chromium;
} else {
  ({ chromium } = require('playwright'));
}

const BASE = process.env.BASE || 'http://localhost:4173';
const out = process.argv[2] || 'screenshots';
const only = process.argv.slice(3);
mkdirSync(out, { recursive: true });

const PAGES = ['app', 'api', 'superadmin', 'resident', 'status', 'docs'];
const SIZES = { desktop: 1440, tablet: 768, mobile: 390 };
const targets = (only.length ? only : [...PAGES, 'root']);

const browser = await chromium.launch();
let problems = 0;
for (const key of targets) {
  for (const [label, width] of Object.entries(SIZES)) {
    const ctx = await browser.newContext({ viewport: { width, height: label === 'mobile' ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    page.on('requestfailed', (r) => errs.push('requestfailed: ' + r.url()));
    page.on('response', (r) => { if (r.status() >= 400) errs.push(`HTTP ${r.status()}: ${r.url()}`); });
    const url = key === 'root' ? BASE + '/' : `${BASE}/?preview=${key}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
    await page.waitForTimeout(300);
    const info = await page.evaluate(() => ({
      title: document.title,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      robots: document.querySelector('meta[name=robots]')?.content || null,
    }));
    if (info.overflow > 0) errs.push(`horizontal overflow ${info.overflow}px`);
    const file = path.join(out, `${key}-${label}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${errs.length ? '✗' : '✓'} ${key.padEnd(10)} ${label.padEnd(7)} ${info.title}  [robots=${info.robots}]`);
    errs.forEach((e) => console.log('    ' + e));
    problems += errs.length;
    await ctx.close();
  }
}
await browser.close();
process.exit(problems ? 1 : 0);
