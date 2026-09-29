import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import health from '../api/health.mjs';
import analyze from '../api/ai/analyze.mjs';
import report from '../api/ai/report.mjs';
import dataHandler from '../api/data.mjs';
import requestsHandler from '../api/requests.mjs';
import projectsHandler from '../api/projects.mjs';
import impactHandler from '../api/impact.mjs';


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

test('data endpoint returns unified database state', async () => {
  const result = await call(dataHandler, { method: 'GET', url: '/api/data' });
  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.body.complaints));
  assert.ok(Array.isArray(result.body.projects));
  assert.ok(Array.isArray(result.body.recommendations));
  assert.ok(Array.isArray(result.body.gaps));
  assert.ok(Array.isArray(result.body.hotspots));
  assert.ok(Array.isArray(result.body.impacts));
  assert.ok(Array.isArray(result.body.notifications));
});

test('requests CRUD endpoints function properly', async () => {
  const createResult = await call(requestsHandler, {
    method: 'POST',
    url: '/api/requests',
    body: {
      rawText: 'Test road issue in Kanpur district',
      rawLanguage: 'en',
      category: 'road',
      state: 'Uttar Pradesh',
      district: 'Kanpur',
    },
  });
  assert.equal(createResult.status, 201);
  assert.equal(createResult.body.category, 'road');
  assert.equal(createResult.body.district, 'Kanpur');

  const updateResult = await call(requestsHandler, {
    method: 'PUT',
    url: '/api/requests',
    body: { id: createResult.body.id, status: 'resolved' },
  });
  assert.equal(updateResult.status, 200);
  assert.equal(updateResult.body.status, 'resolved');

  const deleteResult = await call(requestsHandler, {
    method: 'DELETE',
    url: `/api/requests?id=${encodeURIComponent(createResult.body.id)}`,
  });
  assert.equal(deleteResult.status, 200);
  assert.equal(deleteResult.body.success, true);
});

test('projects and impact CRUD endpoints function properly', async () => {
  const createProject = await call(projectsHandler, {
    method: 'POST',
    url: '/api/projects',
    body: {
      title: 'Kanpur Paved Access Highway',
      category: 'road',
      state: 'Uttar Pradesh',
      district: 'Kanpur',
      budgetCr: 15.0,
      beneficiariesCount: 50000,
      executingAgency: 'UP PWD',
    },
  });
  assert.equal(createProject.status, 201);
  assert.equal(createProject.body.district, 'Kanpur');

  const recordImpact = await call(impactHandler, {
    method: 'POST',
    url: '/api/impact',
    body: {
      projectId: createProject.body.id,
      projectTitle: createProject.body.title,
      district: 'Kanpur',
      state: 'Uttar Pradesh',
      category: 'road',
      beforeAccessPercent: 30,
      afterAccessPercent: 90,
      complaintReductionPercent: 85,
      citizensBenefitedCount: 50000,
      beforeRequestsCount: 1000,
      afterRequestsCount: 150,
    },
  });
  assert.equal(recordImpact.status, 201);
  assert.equal(recordImpact.body.complaintReductionPercent, 85);
});

