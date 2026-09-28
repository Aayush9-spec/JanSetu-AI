import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import health from '../api/health.mjs';
import analyze from '../api/ai/analyze.mjs';
import report from '../api/ai/report.mjs';

const originalApiKey = process.env.GEMINI_API_KEY;
before(() => { delete process.env.GEMINI_API_KEY; });
after(() => {
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalApiKey;
});

async function call(handler, { method = 'POST', url, body } = {}) {
  const headers = {};
  let responseBody = '';
  const response = {
    statusCode: 200,
    setHeader: (name, value) => { headers[name.toLowerCase()] = value; },
    end: value => { responseBody = value; },
  };
  await handler({ method, url, body }, response);
  return { status: response.statusCode, headers, body: JSON.parse(responseBody) };
}

test('health function reports server-only Gemini configuration', async () => {
  const result = await call(health, { method: 'GET', url: '/api/health' });
  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'ok');
  assert.equal(result.body.geminiConfigured, false);
  assert.equal(result.headers['cache-control'], 'no-store');
});

test('analysis rejects short text and does not expose provider configuration', async () => {
  const result = await call(analyze, { url: '/api/ai/analyze', body: { text: 'no' } });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /five characters/);
});

test('analysis returns a controlled unavailable status with no server key', async () => {
  const result = await call(analyze, { url: '/api/ai/analyze', body: { text: 'Water service is unavailable.' } });
  assert.equal(result.status, 503);
  assert.deepEqual(result.body, { error: 'AI provider is not configured.' });
});

test('report function validates missing input and reports unavailable AI safely', async () => {
  const missing = await call(report, { url: '/api/ai/report', body: {} });
  assert.equal(missing.status, 400);
  const unavailable = await call(report, { url: '/api/ai/report', body: { report: '{"requestCount":2}' } });
  assert.equal(unavailable.status, 503);
  assert.deepEqual(unavailable.body, { error: 'AI provider is not configured.' });
});

test('malformed request bodies receive a client error', async () => {
  const result = await call(analyze, { url: '/api/ai/analyze', body: '{invalid' });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /Invalid JSON/);
});
