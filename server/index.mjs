import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { handleApi } from './api.mjs';

const localEnv = loadEnv('production', process.cwd(), '');
for (const key of ['GEMINI_API_KEY', 'GEMINI_MODEL', 'PORT', 'HOST']) {
  if (process.env[key] === undefined && localEnv[key]) process.env[key] = localEnv[key];
}
const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

createServer(async (request, response) => {
  if ((request.url || '').startsWith('/api/')) return handleApi(request, response);
  const requested = decodeURIComponent((request.url || '/').split('?')[0]);
  const path = resolve(root, `.${requested}`);
  if (!path.startsWith(root + sep) && path !== root) {
    response.writeHead(400).end('Bad request');
    return;
  }
  const file = existsSync(path) && statSync(path).isFile() ? path : resolve(root, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(503).end('Build the app first with npm run build.');
    return;
  }
  response.setHeader('Content-Type', contentTypes[extname(file)] || 'application/octet-stream');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  createReadStream(file).pipe(response);
}).listen(Number(process.env.PORT || 4173), process.env.HOST || '0.0.0.0', () => {
  console.log(`JanSetu AI listening on http://${process.env.HOST || 'localhost'}:${process.env.PORT || 4173}`);
});
