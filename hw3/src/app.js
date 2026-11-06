import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAX_BODY_BYTES } from './config.js';
import {
  HttpError,
  parseCookies,
  readBody,
  sendHtml,
  serveStatic,
} from './http.js';
import { parsePreferences } from './preferences.js';
import { createRouter } from './router.js';
import { registerPageRoutes } from './routes/pages.js';
import { registerSearchRoutes } from './routes/search.js';
import { buildIndex } from './search/index.js';
import { errorPage } from './views/errors.js';

function moduleBaseDir() {
  try {
    return path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  } catch {
    return process.cwd();
  }
}

export function createApp({ documents, documentsPath, publicDir } = {}) {
  const baseDir = moduleBaseDir();
  const resolvedPublicDir = publicDir ?? path.join(baseDir, 'public');
  const resolvedDocumentsPath =
    documentsPath ?? path.join(baseDir, 'data', 'documents.json');

  const loadedDocuments =
    documents ?? JSON.parse(fs.readFileSync(resolvedDocumentsPath, 'utf8'));

  if (!Array.isArray(loadedDocuments)) {
    throw new Error('documents 必須是陣列');
  }

  const index = buildIndex(loadedDocuments);
  const router = createRouter();
  const deps = { index, documents: loadedDocuments, publicDir: resolvedPublicDir };

  registerSearchRoutes(router, deps);
  registerPageRoutes(router, deps);

  const server = http.createServer(async (req, res) => {
    let preferences = { ...parsePreferences('') };

    try {
      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

      if (url.pathname.startsWith('/static/')) {
        if (serveStatic(res, resolvedPublicDir, url.pathname)) return;
        sendHtml(
          res,
          errorPage({
            status: 404,
            title: '找不到檔案',
            message: '您要求的靜態資源不存在。',
            preferences,
          }),
          404,
        );
        return;
      }

      const cookies = parseCookies(req.headers.cookie ?? '');
      preferences = parsePreferences(cookies.prefs ?? '');

      const match = router.find(req.method, url.pathname);
      if (!match) {
        sendHtml(
          res,
          errorPage({
            status: 404,
            title: '找不到頁面',
            message: '您要求的頁面不存在。',
            preferences,
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
            preferences,
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

      const ctx = {
        req,
        res,
        url,
        body,
        params: match.params,
        preferences,
        cookies,
        index,
        documents: loadedDocuments,
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
              preferences,
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
            preferences,
          }),
          500,
        );
      } else {
        res.end();
      }
    }
  });

  return { server, index, documents: loadedDocuments };
}
