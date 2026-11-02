import http from 'node:http';
import https from 'node:https';

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function sendOnce({ url, method, headers, body, maxTime, insecure, verbose, log }) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      reject(new Error(`invalid URL: ${url}`));
      return;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      reject(new Error(`unsupported protocol: ${parsed.protocol}`));
      return;
    }

    const transport = parsed.protocol === 'https:' ? https : http;
    const reqHeaders = { ...headers };
    if (body !== null) {
      if (!hasHeader(reqHeaders, 'content-length')) {
        reqHeaders['Content-Length'] = String(Buffer.byteLength(body));
      }
    }

    const options = { method, headers: reqHeaders };
    if (parsed.protocol === 'https:' && insecure) {
      options.rejectUnauthorized = false;
    }

    if (verbose) {
      log(`> ${method} ${parsed.pathname}${parsed.search} HTTP/1.1`);
      log(`> Host: ${parsed.host}`);
      for (const [key, value] of Object.entries(reqHeaders)) {
        log(`> ${key}: ${value}`);
      }
      log('>');
    }

    const startedAt = Date.now();
    const req = transport.request(parsed, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (verbose) {
          log(`< HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`);
          for (let i = 0; i < res.rawHeaders.length; i += 2) {
            log(`< ${res.rawHeaders[i]}: ${res.rawHeaders[i + 1]}`);
          }
          log('<');
        }
        resolve({
          url,
          status: res.statusCode,
          statusMessage: res.statusMessage,
          httpVersion: res.httpVersion,
          headers: res.headers,
          rawHeaders: res.rawHeaders,
          body: Buffer.concat(chunks),
          elapsed: Date.now() - startedAt,
        });
      });
      res.on('error', reject);
    });

    req.on('error', reject);

    if (maxTime) {
      req.setTimeout(maxTime * 1000, () => {
        const error = new Error(`operation timed out after ${maxTime} seconds`);
        error.code = 'ETIMEDOUT';
        req.destroy(error);
      });
    }

    if (body !== null) {
      req.write(body);
    }
    req.end();
  });
}

export async function performRequest({
  url,
  method,
  headers,
  body,
  maxTime = null,
  insecure = false,
  location = false,
  maxRedirects = 10,
  verbose = false,
  log = () => {},
}) {
  let current = { url, method, body };

  for (let redirects = 0; ; redirects++) {
    const response = await sendOnce({
      ...current,
      headers,
      maxTime,
      insecure,
      verbose,
      log,
    });

    if (location && REDIRECT_STATUSES.has(response.status) && response.headers.location) {
      if (redirects >= maxRedirects) {
        throw new Error(`too many redirects (more than ${maxRedirects})`);
      }

      let nextUrl;
      try {
        nextUrl = new URL(response.headers.location, current.url).toString();
      } catch {
        throw new Error(`invalid redirect location: ${response.headers.location}`);
      }

      if (verbose) {
        log(`* Following redirect to ${nextUrl}`);
      }

      let nextMethod = current.method;
      let nextBody = current.body;
      if (
        response.status === 303 ||
        ((response.status === 301 || response.status === 302) &&
          nextMethod !== 'GET' &&
          nextMethod !== 'HEAD')
      ) {
        nextMethod = nextMethod === 'HEAD' ? 'HEAD' : 'GET';
        nextBody = null;
      }

      current = { url: nextUrl, method: nextMethod, body: nextBody };
      continue;
    }

    return response;
  }
}

export function hasHeader(headers, name) {
  const target = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === target);
}
