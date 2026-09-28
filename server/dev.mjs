import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createServer as createViteServer, loadEnv } from 'vite';
import { handleApi } from './api.mjs';

const localEnv = loadEnv('development', process.cwd(), '');
for (const key of ['GEMINI_API_KEY', 'GEMINI_MODEL', 'PORT', 'HOST', 'VITE_HMR_PORT']) {
  if (process.env[key] === undefined && localEnv[key]) process.env[key] = localEnv[key];
}
const hmrPort = Number(process.env.VITE_HMR_PORT);
const vite = await createViteServer({
  server: {
    middlewareMode: true,
    hmr: { server: undefined, ...(Number.isInteger(hmrPort) && hmrPort > 0 ? { port: hmrPort } : {}) },
  },
  appType: 'custom',
});
const server = createServer((request, response) => {
  if ((request.url || '').startsWith('/api/')) {
    void handleApi(request, response);
    return;
  }
  vite.middlewares(request, response, async error => {
    if (error) {
      vite.ssrFixStacktrace(error);
      response.statusCode = 500;
      response.end('Development server error');
      return;
    }
    if (request.method === 'GET' && request.headers.accept?.includes('text/html')) {
      try {
        const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');
        const html = await vite.transformIndexHtml(request.url || '/', template);
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(html);
      } catch (transformError) {
        console.error('Unable to serve the development app entry point.', transformError);
        response.statusCode = 500;
        response.end('Unable to render the development app.');
      }
      return;
    }
    response.statusCode = 404;
    response.end('Not found.');
  });
});
server.listen(Number(process.env.PORT || 4173), process.env.HOST || '0.0.0.0', () => {
  console.log(`JanSetu AI development server listening on http://${process.env.HOST || 'localhost'}:${process.env.PORT || 4173}`);
});
server.on('close', () => void vite.close());
