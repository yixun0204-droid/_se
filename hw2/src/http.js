import fs from 'node:fs';
import path from 'node:path';
import { MAX_BODY_BYTES } from './config.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  }
  return cookies;
}

export function setCookie(res, name, value, { maxAge, path: cookiePath = '/', httpOnly = true, sameSite = 'Lax' } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${cookiePath}`);
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (httpOnly) parts.push('HttpOnly');
  if (sameSite) parts.push(`SameSite=${sameSite}`);
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearCookie(res, name, { path: cookiePath = '/' } = {}) {
  res.setHeader('Set-Cookie', `${name}=; Path=${cookiePath}; Max-Age=0; HttpOnly; SameSite=Lax`);
}

export function readBody(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, '請求內容超過大小限制'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function sendHtml(res, html, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'same-origin',
  });
  res.end(html);
}

export function redirect(res, location, status = 302) {
  res.writeHead(status, { Location: location });
  res.end();
}

export function redirectWith(res, target, { ok, err } = {}) {
  const params = new URLSearchParams();
  if (ok) params.set('ok', ok);
  if (err) params.set('err', err);
  const query = params.toString();
  if (!query) {
    redirect(res, target);
    return;
  }
  const separator = target.includes('?') ? '&' : '?';
  redirect(res, `${target}${separator}${query}`);
}

export function serveStatic(res, root, pathname) {
  const relative = pathname.slice('/static/'.length);
  if (!relative || relative.includes('\0')) return false;

  const resolvedRoot = path.resolve(root);
  const filePath = path.resolve(resolvedRoot, relative);
  if (filePath !== resolvedRoot && !filePath.startsWith(`${resolvedRoot}${path.sep}`)) {
    return false;
  }

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const extension = path.extname(filePath).toLowerCase();
  const type = CONTENT_TYPES[extension] ?? 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': 'public, max-age=3600',
  });
  res.end(fs.readFileSync(filePath));
  return true;
}
