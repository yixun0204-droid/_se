import { randomUUID } from 'node:crypto';
import { ValidationError } from './errors.js';

export const TASK_STATUSES = Object.freeze(['todo', 'doing', 'done']);
export const TASK_PRIORITIES = Object.freeze(['low', 'medium', 'high']);
export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 1000;
export const EDITABLE_TASK_FIELDS = Object.freeze([
  'title',
  'description',
  'priority',
  'dueDate',
  'status',
]);

const editableFields = new Set(EDITABLE_TASK_FIELDS);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeTitle(value, errors) {
  if (value === undefined) {
    errors.push({ field: 'title', message: 'is required' });
    return undefined;
  }
  if (typeof value !== 'string') {
    errors.push({ field: 'title', message: 'must be a string' });
    return undefined;
  }
  const title = value.trim();
  if (title.length === 0) {
    errors.push({ field: 'title', message: 'must not be empty' });
    return undefined;
  }
  if (title.length > TITLE_MAX_LENGTH) {
    errors.push({
      field: 'title',
      message: `must be at most ${TITLE_MAX_LENGTH} characters`,
    });
    return undefined;
  }
  return title;
}

function normalizeDescription(value, errors) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') {
    errors.push({ field: 'description', message: 'must be a string or null' });
    return undefined;
  }
  const description = value.trim();
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.push({
      field: 'description',
      message: `must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
    });
    return undefined;
  }
  return description;
}

function normalizeEnum(value, field, allowed, errors) {
  if (typeof value !== 'string') {
    errors.push({ field, message: `must be one of: ${allowed.join(', ')}` });
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (!allowed.includes(normalized)) {
    errors.push({ field, message: `must be one of: ${allowed.join(', ')}` });
    return undefined;
  }
  return normalized;
}

function normalizeDueDate(value, errors) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    errors.push({ field: 'dueDate', message: 'must use YYYY-MM-DD' });
    return undefined;
  }
  const dueDate = value.trim();
  if (dueDate === '') return null;
  if (!DATE_PATTERN.test(dueDate)) {
    errors.push({ field: 'dueDate', message: 'must use YYYY-MM-DD' });
    return undefined;
  }
  const parsed = new Date(`${dueDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dueDate) {
    errors.push({ field: 'dueDate', message: 'must be a valid calendar date' });
    return undefined;
  }
  return dueDate;
}

function toIsoString(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError('now must be a valid date');
  }
  return date.toISOString();
}

export function normalizeTaskInput(input, { partial = false } = {}) {
  if (!isPlainObject(input)) {
    throw new ValidationError([{ field: 'body', message: 'must be a JSON object' }]);
  }

  const errors = [];
  const keys = Object.keys(input);

  for (const key of keys) {
    if (!editableFields.has(key)) {
      errors.push({ field: key, message: 'is not an editable field' });
    }
  }

  if (partial && !keys.some((key) => editableFields.has(key))) {
    errors.push({ field: 'body', message: 'must include at least one editable field' });
  }

  const result = {};

  if (!partial || Object.hasOwn(input, 'title')) {
    const title = normalizeTitle(input.title, errors);
    if (title !== undefined) result.title = title;
  }

  if (!partial || Object.hasOwn(input, 'description')) {
    const description = normalizeDescription(input.description, errors);
    if (description !== undefined) result.description = description;
  }

  if (!partial || Object.hasOwn(input, 'priority')) {
    if (input.priority === undefined) {
      if (!partial) result.priority = 'medium';
    } else {
      const priority = normalizeEnum(input.priority, 'priority', TASK_PRIORITIES, errors);
      if (priority !== undefined) result.priority = priority;
    }
  }

  if (!partial || Object.hasOwn(input, 'dueDate')) {
    const dueDate = normalizeDueDate(input.dueDate, errors);
    if (dueDate !== undefined) result.dueDate = dueDate;
  }

  if (!partial || Object.hasOwn(input, 'status')) {
    if (input.status === undefined) {
      if (!partial) result.status = 'todo';
    } else {
      const status = normalizeEnum(input.status, 'status', TASK_STATUSES, errors);
      if (status !== undefined) result.status = status;
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return result;
}

export function createTask(input, now = new Date()) {
  const value = normalizeTaskInput(input);
  const timestamp = toIsoString(now);

  return {
    id: randomUUID(),
    title: value.title,
    description: value.description,
    priority: value.priority,
    dueDate: value.dueDate,
    status: value.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateTask(task, patch, now = new Date()) {
  if (!isPlainObject(task)) {
    throw new TypeError('task must be an object');
  }

  const value = normalizeTaskInput(patch, { partial: true });

  return {
    ...task,
    ...value,
    updatedAt: toIsoString(now),
  };
}

export function changeTaskStatus(task, status, now = new Date()) {
  return updateTask(task, { status }, now);
}
