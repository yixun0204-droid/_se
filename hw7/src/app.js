import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  NotFoundError,
  ValidationError,
} from './domain/errors.js';
import { computeStats, filterTasks } from './domain/stats.js';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  createTask,
  updateTask,
} from './domain/task.js';
import { readJsonBody, sendEmpty, sendJson } from './http.js';

const BASE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_PUBLIC_DIR = path.join(BASE_DIR, 'public');

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function serveStatic(res, publicDir, pathname) {
  const relative = pathname.replace(/^\/+/, '') || 'index.html';
  const root = path.resolve(publicDir);
  const resolved = path.resolve(root, relative);

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return false;
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return false;
  }

  const extension = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[extension] ?? 'application/octet-stream';
  const body = fs.readFileSync(resolved);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': body.length,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
  return true;
}

function parseFilterValue(value, field, allowed) {
  if (value === null || value === '') return '';
  const normalized = value.trim().toLowerCase();
  if (!allowed.includes(normalized)) {
    throw new ValidationError([
      { field, message: `must be one of: ${allowed.join(', ')}` },
    ]);
  }
  return normalized;
}

export function createApp({
  store,
  publicDir = DEFAULT_PUBLIC_DIR,
  clock = () => new Date(),
} = {}) {
  if (!store) {
    throw new TypeError('store is required');
  }

  async function handleApi(req, res, url) {
    const method = req.method ?? 'GET';
    const pathname = url.pathname;

    if (pathname === '/api/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'ok',
        service: 'taskflow-api',
        version: '1.0.0',
        timestamp: clock().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
      });
      return;
    }

    if (pathname === '/api/stats' && method === 'GET') {
      sendJson(res, 200, { stats: computeStats(store.list()) });
      return;
    }

    if (pathname === '/api/tasks') {
      if (method === 'GET') {
        const status = parseFilterValue(
          url.searchParams.get('status'),
          'status',
          TASK_STATUSES,
        );
        const priority = parseFilterValue(
          url.searchParams.get('priority'),
          'priority',
          TASK_PRIORITIES,
        );
        const q = url.searchParams.get('q') ?? '';
        const tasks = filterTasks(store.list(), { status, priority, q });
        sendJson(res, 200, { tasks, total: tasks.length });
        return;
      }

      if (method === 'POST') {
        const body = await readJsonBody(req);
        const task = createTask(body, clock());
        store.create(task);
        sendJson(res, 201, { task });
        return;
      }

      if (method === 'DELETE') {
        store.clear();
        sendEmpty(res, 204);
        return;
      }
    }

    const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskMatch) {
      const id = decodeURIComponent(taskMatch[1]);

      if (method === 'GET') {
        const task = store.get(id);
        if (!task) throw new NotFoundError('Task not found');
        sendJson(res, 200, { task });
        return;
      }

      if (method === 'PATCH' || method === 'PUT') {
        const existing = store.get(id);
        if (!existing) throw new NotFoundError('Task not found');
        const body = await readJsonBody(req);
        const task = updateTask(existing, body, clock());
        store.update(id, task);
        sendJson(res, 200, { task });
        return;
      }

      if (method === 'DELETE') {
        if (!store.delete(id)) throw new NotFoundError('Task not found');
        sendEmpty(res, 204);
        return;
      }
    }

    throw new NotFoundError('Route not found');
  }

  function handleError(res, error) {
    if (res.headersSent) {
      res.destroy();
      return;
    }

    if (error instanceof ValidationError) {
      sendJson(res, 400, {
        error: 'validation_error',
        message: error.message,
        details: error.details,
      });
      return;
    }

    if (error && Number.isInteger(error.statusCode)) {
      sendJson(res, error.statusCode, {
        error: error.name ?? 'request_error',
        message: error.message,
      });
      return;
    }

    console.error(error);
    sendJson(res, 500, {
      error: 'internal_error',
      message: 'Unexpected server error',
    });
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (url.pathname.startsWith('/api/')) {
      handleApi(req, res, url).catch((error) => handleError(res, error));
      return;
    }

    if (url.pathname === '/favicon.ico') {
      sendEmpty(res, 204);
      return;
    }

    if (!serveStatic(res, publicDir, url.pathname)) {
      sendJson(res, 404, {
        error: 'not_found',
        message: 'Static asset not found',
      });
    }
  });

  return { server, store };
}
