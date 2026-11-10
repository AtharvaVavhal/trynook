// Shared by the local dev server and the verification script.
// Production routing is vercel.json alone; this module only *evaluates* those
// rules locally so that what we test is exactly what Vercel will run.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The exact hostname allowlist. Single source of truth for tooling; verify.mjs
 *  checks that vercel.json matches it rule for rule. */
export const HOSTS = Object.freeze({
  'mirror.trynook.in': 'mirror',
  'app.trynook.in': 'app',
  'api.trynook.in': 'api',
  'superadmin.trynook.in': 'superadmin',
  'resident.trynook.in': 'resident',
  'status.trynook.in': 'status',
  'docs.trynook.in': 'docs',
});

/** Local-only preview keys (?preview=app etc.). */
export const PREVIEW_KEYS = Object.freeze(
  Object.fromEntries(Object.entries(HOSTS).map(([host, page]) => [page, host]))
);

export function loadRoutes() {
  return JSON.parse(readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).routes || [];
}

/** Normalise a Host header: lowercase, strip port and a trailing dot. */
export function normalizeHost(raw) {
  let h = String(raw || '').trim().toLowerCase();
  if (h.startsWith('[')) return h.slice(0, h.indexOf(']') + 1);   // IPv6 literal
  h = h.replace(/:\d+$/, '').replace(/\.$/, '');
  return h;
}

function hostMatches(cond, host) {
  const v = cond.value;
  if (v && typeof v === 'object') {
    if ('eq' in v) return host === String(v.eq).toLowerCase();
    throw new Error('Unsupported host condition in vercel.json: ' + JSON.stringify(v));
  }
  throw new Error('Host conditions must use exact { "eq": ... } matching');
}

/** Evaluate vercel.json routes the way Vercel does for our rule shapes:
 *  first matching route wins, otherwise fall through to the filesystem. */
export function resolve(routes, host, pathname) {
  const h = normalizeHost(host);
  for (const r of routes) {
    const conds = r.has || [];
    if (!conds.every((c) => c.type === 'host' && hostMatches(c, h))) continue;
    if (!new RegExp(r.src).test(pathname)) continue;
    return { dest: r.dest, headers: r.headers || {} };
  }
  return { dest: null, headers: {} };   // filesystem (existing site)
}

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
export function isLoopback(host) { return LOOPBACK.has(normalizeHost(host)); }
