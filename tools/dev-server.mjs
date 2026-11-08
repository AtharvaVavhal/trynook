#!/usr/bin/env node
// Local preview server for the Nook ecosystem. Zero dependencies.
//
//   node tools/dev-server.mjs            -> http://localhost:4173
//
// It applies the real vercel.json host routes, so behaviour matches production.
// Two local-only ways to pick a subdomain experience:
//   http://localhost:4173/?preview=app        (app | api | superadmin | resident | status | docs)
//   http://app.localhost:4173/                (browsers resolve *.localhost to loopback)
// Both are honoured ONLY when the request's own Host is loopback. This file is
// never deployed (see .vercelignore); production routing uses the Host alone.
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';
import { ROOT, PREVIEW_KEYS, loadRoutes, resolve, normalizeHost, isLoopback } from './routing.mjs';

const PORT = Number(process.env.PORT || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.json': 'application/json', '.mp3': 'audio/mpeg', '.md': 'text/markdown; charset=utf-8', '.ico': 'image/x-icon',
};

/** Which hostname should routing see for this request? */
export function effectiveHost(rawHost, searchParams) {
  const host = normalizeHost(rawHost);
  if (isLoopback(host)) {
    const key = searchParams.get('preview');
    if (key && Object.prototype.hasOwnProperty.call(PREVIEW_KEYS, key)) return PREVIEW_KEYS[key];
    return host;
  }
  const m = host.match(/^([a-z]+)\.localhost$/);
  if (m && Object.prototype.hasOwnProperty.call(PREVIEW_KEYS, m[1])) return PREVIEW_KEYS[m[1]];
  return host;
}

function send404(res) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('404 Not Found'); }

const server = http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, 'http://local'); } catch { return send404(res); }
  const routes = loadRoutes();               // re-read each request so edits apply live
  const host = effectiveHost(req.headers.host, url.searchParams);
  const { dest, headers } = resolve(routes, host, url.pathname);

  let rel = decodeURIComponent(dest || url.pathname);
  let file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return send404(res);
  try {
    let st = statSync(file);
    if (st.isDirectory()) { file = path.join(file, 'index.html'); st = statSync(file); }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'content-length': st.size, 'cache-control': 'no-store', 'x-nook-routed-host': host, ...headers,
    });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  } catch { send404(res); }
});

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Nook ecosystem preview on http://localhost:${PORT}`);
    for (const k of Object.keys(PREVIEW_KEYS)) console.log(`  ${k.padEnd(11)} http://localhost:${PORT}/?preview=${k}`);
    console.log(`  root site   http://localhost:${PORT}/`);
  });
}
