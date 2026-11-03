import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, filterTasks } from '../../src/domain/stats.js';
import { createTask } from '../../src/domain/task.js';

const NOW = new Date('2026-11-03T08:00:00.000Z');

function makeTasks() {
  return [
    createTask(
      {
        title: 'Alpha 任務',
        description: '第一個任務',
        priority: 'high',
        status: 'todo',
      },
      NOW,
    ),
    createTask(
      {
        title: 'Beta 任務',
        description: '第二個任務',
        priority: 'medium',
        status: 'doing',
      },
      NOW,
    ),
    createTask(
      {
        title: 'Gamma 任務',
        description: 'Alpha 的延伸',
        priority: 'high',
        status: 'done',
      },
      NOW,
    ),
    createTask(
      {
        title: 'Delta 任務',
        description: '第四個任務',
        priority: 'low',
        status: 'done',
      },
      NOW,
    ),
  ];
}

test('computeStats returns zeroed statistics for an empty list', () => {
  assert.deepEqual(computeStats([]), {
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    completionRate: 0,
    byPriority: { low: 0, medium: 0, high: 0 },
  });
});

test('computeStats counts statuses, priorities, and completion rate', () => {
  const stats = computeStats(makeTasks());

  assert.equal(stats.total, 4);
  assert.equal(stats.todo, 1);
  assert.equal(stats.doing, 1);
  assert.equal(stats.done, 2);
  assert.equal(stats.completionRate, 50);
  assert.deepEqual(stats.byPriority, { low: 1, medium: 1, high: 2 });
});

test('computeStats ignores tasks with unknown status or priority', () => {
  const tasks = makeTasks();
  tasks.push({
    id: 'unknown',
    title: '未知',
    description: '',
    status: 'blocked',
    priority: 'critical',
  });

  const stats = computeStats(tasks);
  assert.equal(stats.total, 5);
  assert.equal(stats.todo + stats.doing + stats.done, 4);
  assert.deepEqual(stats.byPriority, { low: 1, medium: 1, high: 2 });
});

test('computeStats rejects non-array input', () => {
  assert.throws(() => computeStats(null), TypeError);
});

test('filterTasks filters by status, priority, and text query', () => {
  const tasks = makeTasks();

  assert.deepEqual(
    filterTasks(tasks, { status: 'done' }).map((task) => task.title),
    ['Gamma 任務', 'Delta 任務'],
  );
  assert.deepEqual(
    filterTasks(tasks, { priority: 'high' }).map((task) => task.title),
    ['Alpha 任務', 'Gamma 任務'],
  );
  assert.deepEqual(
    filterTasks(tasks, { q: 'alpha' }).map((task) => task.title),
    ['Alpha 任務', 'Gamma 任務'],
  );
  assert.deepEqual(
    filterTasks(tasks, { status: 'done', priority: 'high' }).map((task) => task.title),
    ['Gamma 任務'],
  );
});

test('filterTasks searches descriptions and trims query values', () => {
  const tasks = makeTasks();
  assert.deepEqual(
    filterTasks(tasks, { q: '  第二個  ' }).map((task) => task.title),
    ['Beta 任務'],
  );
});

test('filterTasks returns a new array and all tasks when no filters are set', () => {
  const tasks = makeTasks();
  const result = filterTasks(tasks);

  assert.notEqual(result, tasks);
  assert.equal(result.length, tasks.length);
  assert.deepEqual(result, tasks);
});

test('filterTasks rejects non-array input', () => {
  assert.throws(() => filterTasks('tasks'), TypeError);
});
