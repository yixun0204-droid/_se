import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../../src/app.js';
import { TaskStore } from '../../src/store/task-store.js';

const NOW = new Date('2026-11-03T08:00:00.000Z');

let directory;
let filePath;
let store;
let server;
let base;

beforeEach(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-api-'));
  filePath = path.join(directory, 'data', 'tasks.json');
  store = new TaskStore({ filePath, seed: [] });
  const app = createApp({ store, clock: () => new Date(NOW) });
  server = app.server;

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(directory, { recursive: true, force: true });
});

async function request(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null,
  };
}

function postTask(input) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

async function seedTasks() {
  const alpha = await postTask({
    title: 'Alpha 任務',
    description: '第一個任務',
    priority: 'high',
  });
  const beta = await postTask({
    title: 'Beta 任務',
    description: '第二個任務',
    priority: 'medium',
  });
  const gamma = await postTask({
    title: 'Gamma 任務',
    description: 'Alpha 的延伸',
    priority: 'high',
  });

  await request(`/api/tasks/${beta.body.task.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'doing' }),
  });
  await request(`/api/tasks/${gamma.body.task.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'done' }),
  });

  return {
    alpha: alpha.body.task,
    beta: beta.body.task,
    gamma: gamma.body.task,
  };
}

test('GET /api/health reports service status', async () => {
  const response = await request('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'taskflow-api');
  assert.equal(response.body.version, '1.0.0');
  assert.equal(response.body.timestamp, NOW.toISOString());
});

test('GET /api/tasks starts empty', async () => {
  const response = await request('/api/tasks');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { tasks: [], total: 0 });
});

test('POST /api/tasks creates a task and exposes it through GET', async () => {
  const created = await postTask({
    title: '  建立 API 測試  ',
    description: '  驗證 POST 行為  ',
    priority: 'HIGH',
    dueDate: '2026-12-31',
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.task.title, '建立 API 測試');
  assert.equal(created.body.task.priority, 'high');
  assert.equal(created.body.task.status, 'todo');
  assert.equal(created.body.task.createdAt, NOW.toISOString());

  const list = await request('/api/tasks');
  assert.equal(list.status, 200);
  assert.equal(list.body.total, 1);
  assert.deepEqual(list.body.tasks, [created.body.task]);

  const single = await request(`/api/tasks/${created.body.task.id}`);
  assert.equal(single.status, 200);
  assert.deepEqual(single.body.task, created.body.task);
});

test('POST /api/tasks persists data to the JSON file', async () => {
  const created = await postTask({ title: '持久化 API 任務' });
  const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, created.body.task.id);
  assert.equal(saved[0].title, '持久化 API 任務');
});

test('POST /api/tasks rejects invalid input with validation details', async () => {
  const missingTitle = await postTask({ description: '沒有標題' });
  assert.equal(missingTitle.status, 400);
  assert.equal(missingTitle.body.error, 'validation_error');
  assert.ok(missingTitle.body.details.some((detail) => detail.field === 'title'));

  const badPriority = await postTask({ title: '任務', priority: 'urgent' });
  assert.equal(badPriority.status, 400);
  assert.ok(badPriority.body.details.some((detail) => detail.field === 'priority'));

  const unknownField = await postTask({ title: '任務', owner: 'alice' });
  assert.equal(unknownField.status, 400);
  assert.ok(unknownField.body.details.some((detail) => detail.field === 'owner'));
});

test('PATCH /api/tasks/:id updates selected fields', async () => {
  const created = await postTask({ title: '待更新任務', priority: 'low' });
  const id = created.body.task.id;

  const patched = await request(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: '已更新任務', status: 'doing' }),
  });

  assert.equal(patched.status, 200);
  assert.equal(patched.body.task.title, '已更新任務');
  assert.equal(patched.body.task.status, 'doing');
  assert.equal(patched.body.task.priority, 'low');

  const fetched = await request(`/api/tasks/${id}`);
  assert.deepEqual(fetched.body.task, patched.body.task);
});

test('PUT /api/tasks/:id also accepts a partial update', async () => {
  const created = await postTask({ title: 'PUT 任務' });
  const id = created.body.task.id;

  const updated = await request(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ dueDate: '2026-12-24' }),
  });

  assert.equal(updated.status, 200);
  assert.equal(updated.body.task.dueDate, '2026-12-24');
});

test('PATCH and DELETE return 404 for missing tasks', async () => {
  const patched = await request('/api/tasks/missing', {
    method: 'PATCH',
    body: JSON.stringify({ status: 'done' }),
  });
  assert.equal(patched.status, 404);
  assert.equal(patched.body.error, 'NotFoundError');

  const deleted = await request('/api/tasks/missing', { method: 'DELETE' });
  assert.equal(deleted.status, 404);
});

test('DELETE /api/tasks/:id removes a task', async () => {
  const created = await postTask({ title: '會被刪除的任務' });
  const id = created.body.task.id;

  const deleted = await request(`/api/tasks/${id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 204);

  const fetched = await request(`/api/tasks/${id}`);
  assert.equal(fetched.status, 404);

  const list = await request('/api/tasks');
  assert.equal(list.body.total, 0);
});

test('GET /api/tasks filters by status, priority, and query', async () => {
  const tasks = await seedTasks();

  const done = await request('/api/tasks?status=done');
  assert.deepEqual(done.body.tasks.map((task) => task.id), [tasks.gamma.id]);

  const high = await request('/api/tasks?priority=high');
  assert.deepEqual(
    high.body.tasks.map((task) => task.id),
    [tasks.alpha.id, tasks.gamma.id],
  );

  const search = await request('/api/tasks?q=alpha');
  assert.deepEqual(
    search.body.tasks.map((task) => task.id),
    [tasks.alpha.id, tasks.gamma.id],
  );

  const combined = await request('/api/tasks?status=done&priority=high&q=gamma');
  assert.deepEqual(combined.body.tasks.map((task) => task.id), [tasks.gamma.id]);
});

test('GET /api/tasks rejects invalid filter values', async () => {
  const status = await request('/api/tasks?status=archived');
  assert.equal(status.status, 400);
  assert.ok(status.body.details.some((detail) => detail.field === 'status'));

  const priority = await request('/api/tasks?priority=critical');
  assert.equal(priority.status, 400);
  assert.ok(priority.body.details.some((detail) => detail.field === 'priority'));
});

test('GET /api/stats returns aggregate counts', async () => {
  await seedTasks();
  const response = await request('/api/stats');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.stats, {
    total: 3,
    todo: 1,
    doing: 1,
    done: 1,
    completionRate: 33,
    byPriority: { low: 0, medium: 1, high: 2 },
  });
});

test('DELETE /api/tasks clears all tasks', async () => {
  await seedTasks();
  const cleared = await request('/api/tasks', { method: 'DELETE' });
  assert.equal(cleared.status, 204);

  const list = await request('/api/tasks');
  assert.equal(list.body.total, 0);
});

test('malformed JSON and empty bodies return 400', async () => {
  const malformed = await request('/api/tasks', {
    method: 'POST',
    body: '{"title":',
  });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.error, 'BadRequestError');

  const empty = await request('/api/tasks', { method: 'POST', body: '' });
  assert.equal(empty.status, 400);
});

test('unknown API routes return 404 JSON', async () => {
  const response = await request('/api/unknown');

  assert.equal(response.status, 404);
  assert.equal(response.body.error, 'NotFoundError');
});

test('static files are served with the right content types', async () => {
  const index = await fetch(`${base}/`);
  assert.equal(index.status, 200);
  assert.equal(index.headers.get('content-type'), 'text/html; charset=utf-8');
  const html = await index.text();
  assert.match(html, /TaskFlow/);
  assert.match(html, /data-testid="app-title"/);

  const script = await fetch(`${base}/app.js`);
  assert.equal(script.status, 200);
  assert.equal(script.headers.get('content-type'), 'text/javascript; charset=utf-8');

  const missing = await fetch(`${base}/missing.txt`);
  assert.equal(missing.status, 404);
});

test('the app can be rebuilt against the same data file', async () => {
  const created = await postTask({ title: '重啟後仍存在' });

  await new Promise((resolve) => server.close(resolve));
  const reloadedStore = new TaskStore({ filePath });
  const rebuilt = createApp({ store: reloadedStore, clock: () => new Date(NOW) });
  server = rebuilt.server;
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;

  const fetched = await request(`/api/tasks/${created.body.task.id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.task.title, '重啟後仍存在');
});
