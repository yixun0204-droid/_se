import { TASK_PRIORITIES, TASK_STATUSES } from './task.js';

export function computeStats(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('tasks must be an array');
  }

  const stats = {
    total: tasks.length,
    todo: 0,
    doing: 0,
    done: 0,
    completionRate: 0,
    byPriority: Object.fromEntries(TASK_PRIORITIES.map((priority) => [priority, 0])),
  };

  for (const task of tasks) {
    if (TASK_STATUSES.includes(task.status)) {
      stats[task.status] += 1;
    }
    if (Object.hasOwn(stats.byPriority, task.priority)) {
      stats.byPriority[task.priority] += 1;
    }
  }

  stats.completionRate = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  return stats;
}

export function filterTasks(tasks, { status, priority, q } = {}) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('tasks must be an array');
  }

  const needle = typeof q === 'string' ? q.trim().toLowerCase() : '';
  const wantedStatus = typeof status === 'string' ? status.trim().toLowerCase() : '';
  const wantedPriority = typeof priority === 'string' ? priority.trim().toLowerCase() : '';

  return tasks.filter((task) => {
    if (wantedStatus && task.status !== wantedStatus) return false;
    if (wantedPriority && task.priority !== wantedPriority) return false;
    if (!needle) return true;

    const title = task.title.toLowerCase();
    const description = (task.description ?? '').toLowerCase();
    return title.includes(needle) || description.includes(needle);
  });
}
