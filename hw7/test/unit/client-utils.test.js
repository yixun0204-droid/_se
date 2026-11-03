import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTaskQuery,
  formatCompletionRate,
  formatDueDate,
  isOverdue,
  priorityLabel,
  sortTasks,
  statusLabel,
  todayKey,
} from '../../public/client-utils.js';

test('labels map known statuses and priorities', () => {
  assert.equal(statusLabel('todo'), '待辦');
  assert.equal(statusLabel('doing'), '進行中');
  assert.equal(statusLabel('done'), '已完成');
  assert.equal(statusLabel('unknown'), 'unknown');

  assert.equal(priorityLabel('low'), '低');
  assert.equal(priorityLabel('medium'), '中');
  assert.equal(priorityLabel('high'), '高');
  assert.equal(priorityLabel('unknown'), 'unknown');
});

test('formatDueDate renders empty and ISO dates', () => {
  assert.equal(formatDueDate(null), '無期限');
  assert.equal(formatDueDate(''), '無期限');
  assert.equal(formatDueDate('2026-11-03'), '2026/11/03');
});

test('isOverdue compares due dates with the provided day', () => {
  const today = new Date('2026-11-03T12:00:00.000Z');
  assert.equal(todayKey(today), '2026-11-03');
  assert.equal(isOverdue('2026-11-02', today), true);
  assert.equal(isOverdue('2026-11-03', today), false);
  assert.equal(isOverdue('2026-11-04', today), false);
  assert.equal(isOverdue(null, today), false);
});

test('formatCompletionRate rounds values and handles invalid input', () => {
  assert.equal(formatCompletionRate(0), '0%');
  assert.equal(formatCompletionRate(33.4), '33%');
  assert.equal(formatCompletionRate(66.6), '67%');
  assert.equal(formatCompletionRate('nope'), '0%');
});

test('buildTaskQuery omits empty values and trims search text', () => {
  assert.equal(buildTaskQuery(), '');
  assert.equal(buildTaskQuery({ status: 'todo' }), 'status=todo');
  assert.equal(
    buildTaskQuery({ status: 'done', priority: 'high', q: '  alpha  ' }),
    'status=done&priority=high&q=alpha',
  );
});

test('sortTasks orders by status, priority, then newest first', () => {
  const tasks = [
    {
      id: 'done-low',
      status: 'done',
      priority: 'low',
      createdAt: '2026-11-03T08:00:00.000Z',
    },
    {
      id: 'todo-high-old',
      status: 'todo',
      priority: 'high',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 'todo-high-new',
      status: 'todo',
      priority: 'high',
      createdAt: '2026-11-02T08:00:00.000Z',
    },
    {
      id: 'doing-medium',
      status: 'doing',
      priority: 'medium',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
  ];

  assert.deepEqual(
    sortTasks(tasks).map((task) => task.id),
    ['todo-high-new', 'todo-high-old', 'doing-medium', 'done-low'],
  );
  assert.notEqual(sortTasks(tasks), tasks);
});
