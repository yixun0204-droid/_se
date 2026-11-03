import {
  BadRequestError,
  PayloadTooLargeError,
} from './domain/errors.js';

export const MAX_BODY_BYTES = 64 * 1024;

export function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(payload);
}

export function sendEmpty(res, status = 204) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end();
}

export function readJsonBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let size = 0;
    const chunks = [];

    function fail(error) {
      if (settled) return;
      settled = true;
      reject(error);
    }

    req.on('data', (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > maxBytes) {
        fail(new PayloadTooLargeError());
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (settled) return;
      if (size === 0) {
        fail(new BadRequestError('Request body must be valid JSON'));
        return;
      }

      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        settled = true;
        resolve(body);
      } catch {
        fail(new BadRequestError('Request body must be valid JSON'));
      }
    });

    req.on('error', fail);
  });
}
