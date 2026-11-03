import {
  buildTaskQuery,
  formatCompletionRate,
  formatDueDate,
  isOverdue,
  priorityLabel,
  sortTasks,
  statusLabel,
} from './client-utils.js';

const state = {
  tasks: [],
  stats: null,
  filters: { status: '', priority: '', q: '' },
};

const elements = {
  form: document.querySelector('[data-testid="task-form"]'),
  title: document.querySelector('[data-testid="title-input"]'),
  description: document.querySelector('[data-testid="description-input"]'),
  priority: document.querySelector('[data-testid="priority-select"]'),
  dueDate: document.querySelector('[data-testid="due-date-input"]'),
  submit: document.querySelector('[data-testid="submit-task"]'),
  formError: document.querySelector('[data-testid="form-error"]'),
  search: document.querySelector('[data-testid="search-input"]'),
  statusFilter: document.querySelector('[data-testid="status-filter"]'),
  priorityFilter: document.querySelector('[data-testid="priority-filter"]'),
  refresh: document.querySelector('[data-testid="refresh-tasks"]'),
  list: document.querySelector('[data-testid="task-list"]'),
  empty: document.querySelector('[data-testid="empty-state"]'),
  toast: document.querySelector('[data-testid="toast"]'),
  stats: {
    total: document.querySelector('[data-testid="stat-total"]'),
    todo: document.querySelector('[data-testid="stat-todo"]'),
    doing: document.querySelector('[data-testid="stat-doing"]'),
    done: document.querySelector('[data-testid="stat-done"]'),
    rate: document.querySelector('[data-testid="stat-rate"]'),
  },
};

let toastTimer = null;
let searchTimer = null;

function showToast(message, tone = 'success') {
  elements.toast.textContent = message;
  elements.toast.dataset.tone = tone;
  elements.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove('is-visible');
  }, 2200);
}

function showFormError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = false;
}

function clearFormError() {
  elements.formError.textContent = '';
  elements.formError.hidden = true;
}

function formatApiError(error) {
  if (Array.isArray(error.details) && error.details.length > 0) {
    return error.details.map((detail) => `${detail.field}：${detail.message}`).join('；');
  }
  return error.message || '請求失敗';
}

async function api(pathname, options = {}) {
  const response = await fetch(pathname, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status}`);
    error.details = data.details;
    throw error;
  }
  return data;
}

function renderStats() {
  const stats = state.stats ?? {
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    completionRate: 0,
  };

  elements.stats.total.textContent = String(stats.total);
  elements.stats.todo.textContent = String(stats.todo);
  elements.stats.doing.textContent = String(stats.doing);
  elements.stats.done.textContent = String(stats.done);
  elements.stats.rate.textContent = formatCompletionRate(stats.completionRate);
}

function nextStatus(status) {
  if (status === 'todo') return 'doing';
  if (status === 'doing') return 'done';
  return 'todo';
}

function advanceLabel(status) {
  if (status === 'todo') return '開始';
  if (status === 'doing') return '完成';
  return '重開';
}

function createTaskCard(task) {
  const card = document.createElement('article');
  card.className = `task-card status-${task.status}`;
  card.dataset.testid = 'task-item';
  card.dataset.taskId = task.id;
  card.dataset.status = task.status;
  card.dataset.priority = task.priority;

  const marker = document.createElement('div');
  marker.className = 'task-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.textContent = task.status === 'done' ? '✓' : '';

  const main = document.createElement('div');
  main.className = 'task-main';

  const heading = document.createElement('div');
  heading.className = 'task-heading';

  const title = document.createElement('h3');
  title.className = 'task-title';
  title.dataset.testid = 'task-title';
  title.textContent = task.title;

  const priority = document.createElement('span');
  priority.className = `badge priority-${task.priority}`;
  priority.dataset.testid = 'task-priority';
  priority.textContent = `${priorityLabel(task.priority)}優先`;

  heading.append(title, priority);

  const description = document.createElement('p');
  description.className = 'task-description';
  description.textContent = task.description || '沒有描述';

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const status = document.createElement('span');
  status.className = `badge status-${task.status}`;
  status.dataset.testid = 'task-status';
  status.textContent = statusLabel(task.status);

  const due = document.createElement('span');
  due.className = 'task-due';
  due.dataset.testid = 'task-due';
  if (isOverdue(task.dueDate)) due.classList.add('is-overdue');
  due.textContent = formatDueDate(task.dueDate);

  meta.append(status, due);
  main.append(heading, description, meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const advance = document.createElement('button');
  advance.type = 'button';
  advance.className = 'button ghost';
  advance.dataset.action = 'advance';
  advance.dataset.testid = 'task-advance';
  advance.textContent = advanceLabel(task.status);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'button danger';
  remove.dataset.action = 'delete';
  remove.dataset.testid = 'task-delete';
  remove.textContent = '刪除';

  actions.append(advance, remove);
  card.append(marker, main, actions);

  return card;
}

function renderTasks() {
  elements.list.replaceChildren();

  if (state.tasks.length === 0) {
    elements.empty.hidden = false;
    elements.empty.textContent =
      state.filters.q || state.filters.status || state.filters.priority
        ? '沒有符合目前篩選條件的任務。'
        : '目前沒有任務，建立第一筆吧！';
    return;
  }

  elements.empty.hidden = true;
  const fragment = document.createDocumentFragment();
  for (const task of state.tasks) {
    fragment.append(createTaskCard(task));
  }
  elements.list.append(fragment);
}

function render() {
  renderStats();
  renderTasks();
}

async function loadTasks() {
  const query = buildTaskQuery(state.filters);
  const suffix = query ? `?${query}` : '';

  try {
    const [tasksResponse, statsResponse] = await Promise.all([
      api(`/api/tasks${suffix}`),
      api('/api/stats'),
    ]);
    state.tasks = sortTasks(tasksResponse.tasks);
    state.stats = statsResponse.stats;
    render();
  } catch (error) {
    showToast(formatApiError(error), 'error');
  }
}

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormError();

  const payload = {
    title: elements.title.value,
    description: elements.description.value,
    priority: elements.priority.value,
    dueDate: elements.dueDate.value || null,
  };

  if (!payload.title.trim()) {
    showFormError('請輸入任務標題');
    elements.title.focus();
    return;
  }

  elements.submit.disabled = true;
  try {
    await api('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    elements.form.reset();
    elements.priority.value = 'medium';
    await loadTasks();
    showToast('任務已建立');
    elements.title.focus();
  } catch (error) {
    showFormError(formatApiError(error));
  } finally {
    elements.submit.disabled = false;
  }
});

elements.search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.filters.q = elements.search.value;
    loadTasks();
  }, 220);
});

elements.statusFilter.addEventListener('change', () => {
  state.filters.status = elements.statusFilter.value;
  loadTasks();
});

elements.priorityFilter.addEventListener('change', () => {
  state.filters.priority = elements.priorityFilter.value;
  loadTasks();
});

elements.refresh.addEventListener('click', () => {
  loadTasks();
});

elements.list.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const card = button.closest('[data-task-id]');
  if (!card) return;

  const id = card.dataset.taskId;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  button.disabled = true;
  try {
    if (button.dataset.action === 'advance') {
      const status = nextStatus(task.status);
      await api(`/api/tasks/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadTasks();
      showToast(`任務狀態已更新為「${statusLabel(status)}」`);
    }

    if (button.dataset.action === 'delete') {
      await api(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadTasks();
      showToast('任務已刪除');
    }
  } catch (error) {
    showToast(formatApiError(error), 'error');
    button.disabled = false;
  }
});

loadTasks();
