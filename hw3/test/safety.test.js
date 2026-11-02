import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { detectSafety } from '../src/safety/detect.js';
import { getJson, getText, startServer } from '../test-support/helpers.js';

let server;

before(async () => {
  server = await startServer();
});

after(async () => {
  await server.close();
});

test('detects critical Chinese self-harm keywords', () => {
  const result = detectSafety('我想自殺');
  assert.equal(result.flagged, true);
  assert.equal(result.severity, 'critical');
  assert.ok(result.categories.some((category) => category.id === 'suicide'));
});

test('detects obfuscated Chinese keywords with spaces or punctuation', () => {
  assert.equal(detectSafety('自 殺').severity, 'critical');
  assert.equal(detectSafety('自-殺').severity, 'critical');
  assert.equal(detectSafety('自\u3000殺').severity, 'critical');
});

test('detects English self-harm phrases', () => {
  assert.equal(detectSafety('I want to kill myself').severity, 'critical');
  assert.equal(detectSafety('I have been self-harming').severity, 'critical');
});

test('detects concern-level distress and physical keywords', () => {
  const distressed = detectSafety('如何幫助憂鬱的朋友');
  assert.equal(distressed.flagged, true);
  assert.equal(distressed.severity, 'concern');
  assert.ok(distressed.categories.some((category) => category.id === 'severe_distress'));

  const physical = detectSafety('最近一直失眠');
  assert.equal(physical.severity, 'concern');
  assert.ok(physical.categories.some((category) => category.id === 'physical'));
});

test('detects harm to others as critical', () => {
  const result = detectSafety('我想殺人');
  assert.equal(result.severity, 'critical');
  assert.ok(result.categories.some((category) => category.id === 'harm_others'));
});

test('prevention and help-seeking queries are still treated with care', () => {
  assert.equal(detectSafety('自殺防治').severity, 'critical');
  assert.equal(detectSafety('想了解自我傷害的警訊').severity, 'critical');
});

test('common false positives are excluded', () => {
  assert.equal(detectSafety('想死你了').flagged, false);
  assert.equal(detectSafety('不想活動').flagged, false);
  assert.equal(detectSafety('自殺突擊隊').flagged, false);
  assert.equal(detectSafety('系統崩潰').flagged, false);
});

test('critical query shows a care page instead of normal results', async () => {
  const page = await getText(
    server.base,
    `/search?q=${encodeURIComponent('自殺')}`,
  );

  assert.equal(page.status, 200);
  assert.match(page.html, /我們在乎你/);
  assert.match(page.html, /1925/);
  assert.match(page.html, /1995/);
  assert.match(page.html, /119/);
  assert.match(page.html, /繼續查看結果/);
  assert.ok(!page.html.includes('class="result"'));
});

test('acknowledged critical query shows results together with the care banner', async () => {
  const page = await getText(
    server.base,
    `/search?q=${encodeURIComponent('自殺')}&ack=1`,
  );

  assert.equal(page.status, 200);
  assert.match(page.html, /class="result"/);
  assert.match(page.html, /care-banner/);
  assert.match(page.html, /1925/);
});

test('concern-level query shows the care banner and results', async () => {
  const page = await getText(
    server.base,
    `/search?q=${encodeURIComponent('失眠')}`,
  );

  assert.equal(page.status, 200);
  assert.match(page.html, /care-banner/);
  assert.match(page.html, /class="result"/);
});

test('API blocks critical queries until acknowledged', async () => {
  const blocked = await getJson(
    server.base,
    `/api/search?q=${encodeURIComponent('自殺')}`,
  );

  assert.equal(blocked.status, 200);
  assert.equal(blocked.body.safety.flagged, true);
  assert.equal(blocked.body.safety.severity, 'critical');
  assert.equal(blocked.body.safety.blocked, true);
  assert.deepEqual(blocked.body.results, []);

  const acknowledged = await getJson(
    server.base,
    `/api/search?q=${encodeURIComponent('自殺')}&ack=1`,
  );

  assert.equal(acknowledged.body.safety.blocked, false);
  assert.equal(acknowledged.body.safety.acknowledged, true);
  assert.ok(acknowledged.body.results.length > 0);
});

test('API flags concern queries without blocking results', async () => {
  const { status, body } = await getJson(
    server.base,
    `/api/search?q=${encodeURIComponent('失眠')}`,
  );

  assert.equal(status, 200);
  assert.equal(body.safety.flagged, true);
  assert.equal(body.safety.severity, 'concern');
  assert.equal(body.safety.blocked, false);
  assert.ok(body.results.length > 0);
});

test('help page lists crisis and emergency resources', async () => {
  const page = await getText(server.base, '/help');
  assert.equal(page.status, 200);
  for (const phone of ['1925', '1995', '1980', '113', '119', '110']) {
    assert.match(page.html, new RegExp(phone));
  }
  assert.match(page.html, /立即危險/);
});

test('critical query containing HTML is escaped', async () => {
  const page = await getText(
    server.base,
    `/search?q=${encodeURIComponent('自殺<script>alert(1)</script>')}`,
  );

  assert.equal(page.status, 200);
  assert.ok(!page.html.includes('<script>alert(1)</script>'));
});
