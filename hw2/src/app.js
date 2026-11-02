import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSessionStore, secureEqual } from './auth.js';
import { MAX_BODY_BYTES } from './config.js';
import { openDb } from './db.js';
import {
  HttpError,
  parseCookies,
  readBody,
  redirect,
  sendHtml,
  serveStatic,
} from './http.js';
import { createRouter } from './router.js';
import { createSeedData } from './seed.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerStudentRoutes } from './routes/student.js';
import { registerTeacherRoutes } from './routes/teacher.js';
import { errorPage } from './views/errors.js';

const BASE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const DEFAULT_DB_PATH = path.join(BASE_DIR, 'data', 'db.json');

export function createApp({ dbPath = DEFAULT_DB_PATH, sessionTtlMs } = {}) {
  const db = openDb(dbPath, createSeedData);
  const sessions = createSessionStore({ ttlMs: sessionTtlMs });
  const router = createRouter();
  const deps = { db, sessions };

  registerAuthRoutes(router, deps);
  registerStudentRoutes(router, deps);
  registerTeacherRoutes(router, deps);
  registerAdminRoutes(router, deps);

  const server = http.createServer(async (req, res) => {
    let user = null;
    let csrf = '';

    try {
      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

      if (url.pathname.startsWith('/static/')) {
        if (serveStatic(res, PUBLIC_DIR, url.pathname)) return;
        sendHtml(
          res,
          errorPage({
            status: 404,
            title: '找不到檔案',
            message: '您要求的靜態資源不存在。',
          }),
          404,
        );
        return;
      }

      const cookies = parseCookies(req.headers.cookie ?? '');
      const token = cookies.sid ?? '';
      const session = sessions.get(token);
      user = session
        ? db.data.users.find((item) => item.id === session.userId) ?? null
        : null;
      csrf = session?.csrf ?? '';

      const match = router.find(req.method, url.pathname);
      if (!match) {
        sendHtml(
          res,
          errorPage({
            status: 404,
            title: '找不到頁面',
            message: '您要求的頁面不存在。',
            user,
            csrf,
          }),
          404,
        );
        return;
      }

      if (match.methodNotAllowed) {
        sendHtml(
          res,
          errorPage({
            status: 405,
            title: '不支援的請求方法',
            message: '這個頁面不支援目前的 HTTP 方法。',
            user,
            csrf,
          }),
          405,
        );
        return;
      }

      let body = new URLSearchParams();
      if (req.method === 'POST') {
        const raw = await readBody(req, MAX_BODY_BYTES);
        body = new URLSearchParams(raw);
      }

      if (req.method === 'POST' && url.pathname !== '/login') {
        if (!session) {
          redirect(res, '/login');
          return;
        }
        if (!secureEqual(body.get('csrf') ?? '', session.csrf)) {
          sendHtml(
            res,
            errorPage({
              status: 403,
              title: '表單驗證失敗',
              message: '表單驗證碼不正確，請重新整理頁面後再試一次。',
              user,
              csrf,
            }),
            403,
          );
          return;
        }
      }

      const ctx = {
        req,
        res,
        url,
        db,
        sessions,
        token,
        session,
        user,
        body,
        params: match.params,
        ok: url.searchParams.get('ok') ?? '',
        err: url.searchParams.get('err') ?? '',
      };

      await match.handler(ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        if (!res.headersSent) {
          sendHtml(
            res,
            errorPage({
              status: error.status,
              title: '請求錯誤',
              message: error.message,
              user,
              csrf,
            }),
            error.status,
          );
        } else {
          res.end();
        }
        return;
      }

      console.error(error);
      if (!res.headersSent) {
        sendHtml(
          res,
          errorPage({
            status: 500,
            title: '系統錯誤',
            message: '系統發生未預期的錯誤，請稍後再試。',
            user,
            csrf,
          }),
          500,
        );
      } else {
        res.end();
      }
    }
  });

  return { server, db, sessions };
}
