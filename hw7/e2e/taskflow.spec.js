import { test, expect } from '@playwright/test';

async function clearTasks(request) {
  const response = await request.get('/api/tasks');
  const { tasks } = await response.json();
  for (const task of tasks) {
    await request.delete(`/api/tasks/${task.id}`);
  }
}

async function createTask(page, title, options = {}) {
  await page.getByTestId('title-input').fill(title);
  if (options.description) {
    await page.getByTestId('description-input').fill(options.description);
  }
  if (options.priority) {
    await page.getByTestId('priority-select').selectOption(options.priority);
  }
  if (options.dueDate) {
    await page.getByTestId('due-date-input').fill(options.dueDate);
  }
  await page.getByTestId('submit-task').click();
  await expect(page.getByTestId('task-item').filter({ hasText: title })).toBeVisible();
}

test.beforeEach(async ({ request, page }) => {
  await clearTasks(request);
  await page.goto('/');
  await expect(page.getByTestId('app-title')).toHaveText('TaskFlow 任務流');
});

test('shows the empty state when there are no tasks', async ({ page }) => {
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('stat-total')).toHaveText('0');
  await expect(page.getByTestId('stat-rate')).toHaveText('0%');
});

test('creates a task from the form and renders its details', async ({ page }) => {
  await createTask(page, '完成 E2E 測試', {
    description: '用 Playwright 驗證新增流程',
    priority: 'high',
    dueDate: '2026-12-31',
  });

  const item = page.getByTestId('task-item');
  await expect(item).toHaveCount(1);
  await expect(item.getByTestId('task-title')).toHaveText('完成 E2E 測試');
  await expect(item.getByTestId('task-priority')).toHaveText('高優先');
  await expect(item.getByTestId('task-status')).toHaveText('待辦');
  await expect(item.getByTestId('task-due')).toHaveText('2026/12/31');
  await expect(page.getByTestId('stat-total')).toHaveText('1');
  await expect(page.getByTestId('stat-todo')).toHaveText('1');
});

test('shows a validation message when the title is empty', async ({ page }) => {
  await page.getByTestId('submit-task').click();

  await expect(page.getByTestId('form-error')).toBeVisible();
  await expect(page.getByTestId('form-error')).toHaveText('請輸入任務標題');
  await expect(page.getByTestId('task-item')).toHaveCount(0);
});

test('moves a task through todo, doing, done, and back to todo', async ({ page }) => {
  await createTask(page, '狀態流程任務');
  const item = page.getByTestId('task-item');

  await expect(item.getByTestId('task-status')).toHaveText('待辦');

  await item.getByTestId('task-advance').click();
  await expect(item.getByTestId('task-status')).toHaveText('進行中');
  await expect(page.getByTestId('stat-doing')).toHaveText('1');

  await item.getByTestId('task-advance').click();
  await expect(item.getByTestId('task-status')).toHaveText('已完成');
  await expect(page.getByTestId('stat-done')).toHaveText('1');
  await expect(page.getByTestId('stat-rate')).toHaveText('100%');

  await item.getByTestId('task-advance').click();
  await expect(item.getByTestId('task-status')).toHaveText('待辦');
  await expect(page.getByTestId('stat-rate')).toHaveText('0%');
});

test('filters tasks by search text, status, and priority', async ({ page, request }) => {
  const alpha = await request.post('/api/tasks', {
    data: { title: 'Alpha 任務', description: '搜尋 alpha', priority: 'high' },
  });
  const beta = await request.post('/api/tasks', {
    data: { title: 'Beta 任務', description: '其他內容', priority: 'low' },
  });
  const betaTask = (await beta.json()).task;
  await request.patch(`/api/tasks/${betaTask.id}`, { data: { status: 'done' } });

  const alphaTask = (await alpha.json()).task;
  expect(alphaTask.id).toBeTruthy();

  await page.reload();
  await expect(page.getByTestId('task-item')).toHaveCount(2);

  await page.getByTestId('search-input').fill('alpha');
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-title')).toHaveText('Alpha 任務');

  await page.getByTestId('search-input').fill('');
  await expect(page.getByTestId('task-item')).toHaveCount(2);

  await page.getByTestId('status-filter').selectOption('done');
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-title')).toHaveText('Beta 任務');

  await page.getByTestId('status-filter').selectOption('');
  await page.getByTestId('priority-filter').selectOption('high');
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-title')).toHaveText('Alpha 任務');
});

test('deletes a task and returns to the empty state', async ({ page }) => {
  await createTask(page, '刪除我');
  await expect(page.getByTestId('task-item')).toHaveCount(1);

  await page.getByTestId('task-delete').click();

  await expect(page.getByTestId('task-item')).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('stat-total')).toHaveText('0');
});

test('keeps tasks after a full page reload', async ({ page }) => {
  await createTask(page, '重新載入後仍在');

  await page.reload();

  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-title')).toHaveText('重新載入後仍在');
});
