import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTask, updateTask } from '../../src/domain/task.js';
import { TaskStore } from '../../src/store/task-store.js';

const NOW = new Date('2026-11-03T08:00:00.000Z');
const LATER = new Date('2026-11-04T08:00:00.000Z');

let directory;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-store-'));
});

afterEach(() => {
  fs.rmSync(directory, { recursive: true, force: true });
});

function dataFile() {
  return path.join(directory, 'nested', 'tasks.json');
}

test('list returns a defensive copy of stored tasks', () => {
  const task = createTask({ title: '原始任務' }, NOW);
  const store = new TaskStore({ seed: [task] });

  const listed = store.list();
  listed[0].title = '被外部修改';

  assert.equal(store.get(task.id).title, '原始任務');
});

test('create, get, update, and delete operate on tasks', () => {
  const store = new TaskStore();
  const task = createTask({ title: '第一筆' }, NOW);

  assert.deepEqual(store.list(), []);
  assert.equal(store.get(task.id), null);

  store.create(task);
  assert.equal(store.list().length, 1);
  assert.deepEqual(store.get(task.id), task);

  const updated = updateTask(task, { status: 'done' }, LATER);
  assert.deepEqual(store.update(task.id, updated), updated);
  assert.equal(store.get(task.id).status, 'done');

  assert.equal(store.update('missing', updated), null);
  assert.equal(store.delete(task.id), true);
  assert.equal(store.delete(task.id), false);
  assert.deepEqual(store.list(), []);
});

test('clear removes every task', () => {
  const store = new TaskStore({
    seed: [
      createTask({ title: 'A' }, NOW),
      createTask({ title: 'B' }, NOW),
    ],
  });

  store.clear();
  assert.deepEqual(store.list(), []);
});

test('tasks are persisted to disk and reloaded by a new store', () => {
  const filePath = dataFile();
  const first = new TaskStore({ filePath });
  const task = createTask(
    {
      title: '持久化任務',
      description: '會被寫入 JSON 檔',
      priority: 'high',
      dueDate: '2026-12-01',
    },
    NOW,
  );

  first.create(task);

  const second = new TaskStore({ filePath });
  assert.deepEqual(second.list(), [task]);

  const updated = updateTask(task, { status: 'doing' }, LATER);
  second.update(task.id, updated);

  const third = new TaskStore({ filePath });
  assert.equal(third.get(task.id).status, 'doing');
});

test('clear is persisted to disk', () => {
  const filePath = dataFile();
  const first = new TaskStore({ filePath });
  first.create(createTask({ title: '會被清除' }, NOW));
  first.clear();

  const second = new TaskStore({ filePath });
  assert.deepEqual(second.list(), []);
});

test('seed is used only when the data file does not exist', () => {
  const filePath = dataFile();
  const seeded = createTask({ title: '種子任務' }, NOW);
  const first = new TaskStore({ filePath, seed: [seeded] });
  assert.equal(first.list().length, 1);

  first.clear();
  const second = new TaskStore({ filePath, seed: [seeded] });
  assert.deepEqual(second.list(), []);
});

test('invalid data files are rejected', () => {
  const filePath = dataFile();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, '{"not":"an array"}', 'utf8');

  assert.throws(() => new TaskStore({ filePath }), /JSON array/);
});

test('a store without a file path works in memory only', () => {
  const store = new TaskStore();
  const task = createTask({ title: '記憶體任務' }, NOW);
  store.create(task);

  assert.equal(store.get(task.id).title, '記憶體任務');
});
