import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { handleApi } from './api.mjs';

const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server: undefined } }, appType: 'custom' });
const server = createServer((request, response) => {
  if ((request.url || '').startsWith('/api/')) {
    void handleApi(request, response);
    return;
  }
  vite.middlewares(request, response, error => {
    if (error) {
      vite.ssrFixStacktrace(error);
      response.statusCode = 500;
      response.end('Development server error');
    }
  });
});
server.listen(Number(process.env.PORT || 4173), process.env.HOST || '0.0.0.0', () => {
  console.log(`JanSetu AI development server listening on http://${process.env.HOST || 'localhost'}:${process.env.PORT || 4173}`);
});
server.on('close', () => void vite.close());
