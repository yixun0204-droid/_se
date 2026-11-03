import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  changeTaskStatus,
  createTask,
  normalizeTaskInput,
  updateTask,
} from '../../src/domain/task.js';
import { ValidationError } from '../../src/domain/errors.js';

const NOW = new Date('2026-11-03T08:00:00.000Z');
const LATER = new Date('2026-11-04T09:30:00.000Z');

function expectValidationError(action, field) {
  assert.throws(action, (error) => {
    assert.ok(error instanceof ValidationError);
    assert.equal(error.statusCode, 400);
    assert.ok(
      error.details.some((detail) => detail.field === field),
      `expected a validation detail for ${field}`,
    );
    return true;
  });
}

test('createTask trims input and applies defaults', () => {
  const task = createTask(
    {
      title: '  撰寫測試  ',
      description: '  單元測試與系統測試  ',
      priority: ' HIGH ',
      dueDate: '2026-12-31',
      status: ' TODO ',
    },
    NOW,
  );

  assert.equal(task.title, '撰寫測試');
  assert.equal(task.description, '單元測試與系統測試');
  assert.equal(task.priority, 'high');
  assert.equal(task.status, 'todo');
  assert.equal(task.dueDate, '2026-12-31');
  assert.equal(task.createdAt, NOW.toISOString());
  assert.equal(task.updatedAt, NOW.toISOString());
  assert.match(task.id, /^[0-9a-f-]{36}$/);
});

test('createTask applies defaults when optional fields are omitted', () => {
  const task = createTask({ title: '只有標題' }, NOW);

  assert.equal(task.description, '');
  assert.equal(task.priority, 'medium');
  assert.equal(task.status, 'todo');
  assert.equal(task.dueDate, null);
});

test('createTask rejects missing, empty, and non-string titles', () => {
  expectValidationError(() => createTask({}, NOW), 'title');
  expectValidationError(() => createTask({ title: '   ' }, NOW), 'title');
  expectValidationError(() => createTask({ title: 42 }, NOW), 'title');
});

test('createTask rejects titles and descriptions over the limits', () => {
  expectValidationError(
    () => createTask({ title: 'x'.repeat(121) }, NOW),
    'title',
  );
  expectValidationError(
    () => createTask({ title: 'ok', description: 'x'.repeat(1001) }, NOW),
    'description',
  );
});

test('createTask rejects invalid priority and status', () => {
  expectValidationError(
    () => createTask({ title: 'ok', priority: 'urgent' }, NOW),
    'priority',
  );
  expectValidationError(
    () => createTask({ title: 'ok', status: 'archived' }, NOW),
    'status',
  );
});

test('due dates must be real calendar dates in YYYY-MM-DD format', () => {
  const leapDay = createTask({ title: 'leap', dueDate: '2024-02-29' }, NOW);
  assert.equal(leapDay.dueDate, '2024-02-29');

  expectValidationError(
    () => createTask({ title: 'bad leap', dueDate: '2025-02-29' }, NOW),
    'dueDate',
  );
  expectValidationError(
    () => createTask({ title: 'bad format', dueDate: '2026/12/31' }, NOW),
    'dueDate',
  );
  expectValidationError(
    () => createTask({ title: 'bad month', dueDate: '2026-13-01' }, NOW),
    'dueDate',
  );
});

test('createTask rejects unknown fields and non-object bodies', () => {
  expectValidationError(
    () => createTask({ title: 'ok', owner: 'alice' }, NOW),
    'owner',
  );
  expectValidationError(() => createTask(null, NOW), 'body');
  expectValidationError(() => createTask([], NOW), 'body');
});

test('updateTask applies a partial patch and preserves untouched fields', () => {
  const task = createTask(
    {
      title: '原始標題',
      description: '原始描述',
      priority: 'low',
      dueDate: '2026-11-20',
    },
    NOW,
  );

  const updated = updateTask(task, { title: '  新標題  ', priority: 'high' }, LATER);

  assert.equal(updated.id, task.id);
  assert.equal(updated.title, '新標題');
  assert.equal(updated.description, '原始描述');
  assert.equal(updated.priority, 'high');
  assert.equal(updated.dueDate, '2026-11-20');
  assert.equal(updated.createdAt, task.createdAt);
  assert.equal(updated.updatedAt, LATER.toISOString());
});

test('updateTask can clear the due date with null', () => {
  const task = createTask({ title: '有期限', dueDate: '2026-11-20' }, NOW);
  const updated = updateTask(task, { dueDate: null }, LATER);
  assert.equal(updated.dueDate, null);
});

test('updateTask rejects empty patches, unknown fields, and invalid values', () => {
  const task = createTask({ title: '任務' }, NOW);

  expectValidationError(() => updateTask(task, {}, LATER), 'body');
  expectValidationError(() => updateTask(task, { id: 'other' }, LATER), 'id');
  expectValidationError(() => updateTask(task, { title: '   ' }, LATER), 'title');
  expectValidationError(() => updateTask(task, { status: 'nope' }, LATER), 'status');
});

test('changeTaskStatus updates status and timestamp', () => {
  const task = createTask({ title: '任務' }, NOW);
  const doing = changeTaskStatus(task, 'doing', LATER);

  assert.equal(doing.status, 'doing');
  assert.equal(doing.updatedAt, LATER.toISOString());
});

test('normalizeTaskInput returns normalized values without generating ids', () => {
  const value = normalizeTaskInput({
    title: '  API 驗證  ',
    priority: 'Low',
    status: 'DONE',
  });

  assert.deepEqual(value, {
    title: 'API 驗證',
    description: '',
    priority: 'low',
    dueDate: null,
    status: 'done',
  });
  assert.equal(value.id, undefined);
});
