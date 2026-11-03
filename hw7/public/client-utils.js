export const STATUS_LABELS = Object.freeze({
  todo: '待辦',
  doing: '進行中',
  done: '已完成',
});

export const PRIORITY_LABELS = Object.freeze({
  low: '低',
  medium: '中',
  high: '高',
});

const STATUS_RANK = { todo: 0, doing: 1, done: 2 };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

export function priorityLabel(priority) {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function formatDueDate(dueDate) {
  if (!dueDate) return '無期限';
  const [year, month, day] = dueDate.split('-');
  return `${year}/${month}/${day}`;
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isOverdue(dueDate, today = new Date()) {
  if (!dueDate) return false;
  return dueDate < todayKey(today);
}

export function formatCompletionRate(rate) {
  const value = Number(rate);
  if (!Number.isFinite(value)) return '0%';
  return `${Math.round(value)}%`;
}

export function buildTaskQuery({ status = '', priority = '', q = '' } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);
  if (q.trim()) params.set('q', q.trim());
  return params.toString();
}

export function sortTasks(tasks) {
  return [...tasks].sort((left, right) => {
    const statusDelta =
      (STATUS_RANK[left.status] ?? 9) - (STATUS_RANK[right.status] ?? 9);
    if (statusDelta !== 0) return statusDelta;

    const priorityDelta =
      (PRIORITY_RANK[left.priority] ?? 9) - (PRIORITY_RANK[right.priority] ?? 9);
    if (priorityDelta !== 0) return priorityDelta;

    return String(right.createdAt).localeCompare(String(left.createdAt));
  });
}
