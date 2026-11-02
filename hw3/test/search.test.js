import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from '../src/search/tokenize.js';
import { rankDocuments } from '../src/search/rank.js';
import { getJson, getText, startServer } from '../test-support/helpers.js';

let server;

before(async () => {
  server = await startServer();
});

after(async () => {
  await server.close();
});

test('tokenizer splits Chinese into bigrams and keeps Latin words', () => {
  assert.deepEqual(tokenize('資料庫 SQL'), ['sql', '資料', '料庫']);
  assert.deepEqual(tokenize('AI 與機器學習'), ['ai', '與機', '機器', '器學', '學習']);
});

test('the most relevant document is ranked first', () => {
  const results = rankDocuments('資料庫', server.app.index);
  assert.ok(results.length > 0);
  assert.equal(results[0].document.id, 'doc-001');
});

test('ranking is deterministic for the same query', () => {
  const first = rankDocuments('健康 睡眠', server.app.index);
  const second = rankDocuments('健康 睡眠', server.app.index);
  assert.deepEqual(
    first.map((item) => [item.document.id, item.score]),
    second.map((item) => [item.document.id, item.score]),
  );
});

test('different preference cookies produce identical API results', async () => {
  const light = encodeURIComponent(
    JSON.stringify({ theme: 'light', density: 'comfortable', showScores: true }),
  );
  const dark = encodeURIComponent(
    JSON.stringify({ theme: 'dark', density: 'compact', showScores: false }),
  );

  const first = await getJson(server.base, '/api/search?q=健康', {
    cookie: `prefs=${light}`,
  });
  const second = await getJson(server.base, '/api/search?q=健康', {
    cookie: `prefs=${dark}`,
  });

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(first.body.personalization, false);
  assert.equal(first.body.preferencesUsed, false);
  assert.ok(first.body.results.length > 0);
  assert.deepEqual(
    first.body.results.map((item) => [item.id, item.score]),
    second.body.results.map((item) => [item.id, item.score]),
  );
});

test('preferences are stored and only change presentation', async () => {
  const response = await fetch(`${server.base}/preferences`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      theme: 'dark',
      density: 'compact',
      showScores: '0',
    }).toString(),
    redirect: 'manual',
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/preferences?ok=1');

  const setCookie = response.headers.getSetCookie()[0];
  assert.match(setCookie, /prefs=/);
  const cookie = setCookie.split(';')[0];

  const page = await getText(server.base, '/preferences', { cookie });
  assert.equal(page.status, 200);
  assert.match(page.html, /data-theme="dark"/);
  assert.match(page.html, /data-density="compact"/);

  const results = await getText(server.base, '/search?q=健康', { cookie });
  assert.equal(results.status, 200);
  assert.match(results.html, /排序不受偏好影響/);
  assert.match(results.html, /class="result"/);
});

test('query text is escaped in HTML output', async () => {
  const page = await getText(
    server.base,
    `/search?q=${encodeURIComponent('<script>alert(1)</script>')}`,
  );
  assert.equal(page.status, 200);
  assert.ok(!page.html.includes('<script>alert(1)</script>'));
});

test('empty query redirects to the home page', async () => {
  const response = await fetch(`${server.base}/search?q=%20%20`, {
    redirect: 'manual',
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/');
});

test('API requires a query parameter', async () => {
  const { status, body } = await getJson(server.base, '/api/search');
  assert.equal(status, 400);
  assert.equal(body.error, 'missing_query');
});

test('about page documents the non-personalized algorithm', async () => {
  const page = await getText(server.base, '/about');
  assert.equal(page.status, 200);
  assert.match(page.html, /TF-IDF/);
  assert.match(page.html, /不會影響排序/);
  assert.match(page.html, /personalization: false/);
});

test('static CSS is served with the right content type', async () => {
  const response = await fetch(`${server.base}/static/style.css`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/css/);
});

test('unknown pages return 404 and unsupported methods return 405', async () => {
  const missing = await getText(server.base, '/missing-page');
  assert.equal(missing.status, 404);

  const wrongMethod = await fetch(`${server.base}/about`, { method: 'POST' });
  assert.equal(wrongMethod.status, 405);
});
