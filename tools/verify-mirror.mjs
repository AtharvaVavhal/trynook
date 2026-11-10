#!/usr/bin/env node
// Browser QA: start `node tools/dev-server.mjs` first. Uses an existing Playwright
// install; no runtime dependency or build step is added to the website.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { ROOT, HOSTS, loadRoutes, resolve } from './routing.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const source = readFileSync(`${ROOT}/ecosystem/mirror/platforms.js`, 'utf8');
const { platforms, categories } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const known = platforms.filter(p => p.url);
assert.equal(platforms.length, 7);
assert.equal(known.length, 6);
assert.equal(new Set(known.map(p => p.url)).size, known.length);
for (const p of known) {
  assert.equal(new URL(p.url).protocol, 'https:');
  const original = readFileSync(`${ROOT}/${p.source}`, 'utf8');
  assert.ok(original.includes(new URL(p.url).hostname));
  assert.ok(original.includes('Coming soon'));
}
const routes = loadRoutes();
for (const [host, key] of Object.entries(HOSTS)) {
  assert.equal(resolve(routes, host, '/').dest, `/ecosystem/${key}/index.html`);
  assert.equal(resolve(routes, host, '/deep/link').dest, `/ecosystem/${key}/index.html`);
  assert.equal(resolve(routes, host, '/assets/nook-favicon.svg').dest, null);
  assert.equal(resolve(routes, host, `/ecosystem/${key}/${key}.css`).dest, null);
}
assert.equal(resolve(routes, 'trynook.in', '/').dest, null);
assert.equal(resolve(routes, 'other.trynook.in', '/').dest, null);
assert.equal(resolve(routes, 'mirror.trynook.in.evil.example', '/').dest, null);
console.log('PASS configuration, content provenance and all host routing regressions');
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {});
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto('http://localhost:4173/?preview=mirror', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.platform-card:visible').count(), 7);
    assert.equal(await page.locator('.platform-link').count(), 6);
    assert.equal(await page.locator('.pending-card a').count(), 0);
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://mirror.trynook.in/');
    assert.equal(await page.locator('h1').count(), 1);
    assert.ok(await page.locator('meta[name=description]').getAttribute('content'));
    assert.equal(await page.locator('#year').textContent(), String(new Date().getFullYear()));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.ok(await page.evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth > 0)));
    const assetPaths = await page.locator('script[src],link[rel=stylesheet],img[src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src') || n.getAttribute('href')));
    for (const path of assetPaths) assert.ok(existsSync(`${ROOT}${path}`), path);
    for (const p of known) {
      assert.equal(await page.locator(`#platform-${p.id} a`).getAttribute('href'), p.url);
      assert.equal(await page.locator(`.atlas-node.node-${p.id}`).getAttribute('href'), p.url);
      assert.equal(await page.locator(`#footer-links a[href="${p.url}"]`).count(), 1);
    }
    await page.locator('#search').fill('FINANCES');
    assert.equal(await page.locator('.platform-card:visible').count(), 1);
    await page.locator('#search').fill('  residents  ');
    assert.equal(await page.locator('.platform-card:visible').count(), 2);
    await page.locator('#search').fill('<script>alert(1)</script>');
    assert.equal(await page.locator('.platform-card:visible').count(), 0);
    assert.equal(await page.locator('#empty').isVisible(), true);
    await page.locator('#reset').click();
    assert.equal(await page.locator('.platform-card:visible').count(), 7);
    for (const c of categories.filter(c => c.id !== 'all')) {
      const button = page.getByRole('button', { name: c.label, exact: true });
      await button.click(); assert.equal(await button.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.platform-card:visible').count(), 2);
    }
    await page.getByRole('button', { name: 'All platforms', exact: true }).click();
    await page.getByRole('button', { name: 'Everyday experiences', exact: true }).click();
    await page.locator('#search').fill('finances');
    assert.equal(await page.locator('.platform-card:visible').count(), 1);
    await page.locator('#search').fill('');
    if (width <= 760) {
      const menu = page.getByRole('button', { name: 'Menu' });
      await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape'); assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      await menu.click(); await page.locator('#navigation a[href="#about"]').click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      assert.ok(page.url().endsWith('#about'));
    }
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#header').evaluate(el => el.classList.contains('scrolled')), true);
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: search, filters, reset, links, menu, assets, metadata, reduced motion, console, overflow`);
    await context.close();
  }
} finally { await browser.close(); }
