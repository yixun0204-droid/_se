import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './src/app.js';
import { createTask } from './src/domain/task.js';
import { TaskStore } from './src/store/task-store.js';

const BASE_DIR = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
const dataFile = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(BASE_DIR, 'data', 'tasks.json');

const seed = [
  {
    title: '完成 HW7 測試報告',
    description: '整理單元測試、系統測試與 E2E 測試的執行結果。',
    priority: 'high',
    dueDate: '2026-11-10',
    status: 'doing',
  },
  {
    title: '補齊 Web API 系統測試',
    description: '驗證建立、更新、刪除與查詢任務的 API 行為。',
    priority: 'medium',
    dueDate: '2026-11-12',
    status: 'todo',
  },
  {
    title: '檢查 Playwright 無頭瀏覽器設定',
    description: '確認 E2E 測試可在 headless Chrome 執行。',
    priority: 'low',
    dueDate: null,
    status: 'done',
  },
].map((task, index) => createTask(task, new Date(Date.now() - index * 60_000)));

const store = new TaskStore({ filePath: dataFile, seed });
const { server } = createApp({ store });

server.listen(port, host, () => {
  console.log(`TaskFlow listening on http://${host}:${port}`);
  console.log(`Data file: ${dataFile}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
