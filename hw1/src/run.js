import fs from 'node:fs';
import { parseArgs, helpText, UsageError, VERSION } from './parse-args.js';
import { performRequest, hasHeader } from './client.js';

function setHeader(headers, name, value) {
  const existing = Object.keys(headers).find(
    (key) => key.toLowerCase() === name.toLowerCase(),
  );
  headers[existing ?? name] = value;
}

function getHeader(headers, name) {
  const key = Object.keys(headers).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  return key ? headers[key] : undefined;
}

function buildRequest(opts) {
  const headers = {};

  for (const raw of opts.headers) {
    const index = raw.indexOf(':');
    if (index <= 0) {
      throw new UsageError(`invalid header: ${raw}`);
    }
    const name = raw.slice(0, index).trim();
    const value = raw.slice(index + 1).trim();
    if (!name) {
      throw new UsageError(`invalid header: ${raw}`);
    }
    setHeader(headers, name, value);
  }

  const hasData = opts.dataParts.length > 0 || opts.json;
  let method;
  if (opts.head) {
    method = 'HEAD';
  } else if (opts.method) {
    method = opts.method.toUpperCase();
  } else {
    method = hasData ? 'POST' : 'GET';
  }

  let body = null;
  if (hasData && method !== 'HEAD') {
    body = opts.dataParts.join('&');
  }

  if (opts.json) {
    if (!hasHeader(headers, 'content-type')) {
      setHeader(headers, 'Content-Type', 'application/json');
    }
  } else if (body !== null && !hasHeader(headers, 'content-type')) {
    setHeader(headers, 'Content-Type', 'application/x-www-form-urlencoded');
  }

  if (opts.user && !hasHeader(headers, 'authorization')) {
    const encoded = Buffer.from(opts.user).toString('base64');
    setHeader(headers, 'Authorization', `Basic ${encoded}`);
  }

  if (opts.userAgent) {
    setHeader(headers, 'User-Agent', opts.userAgent);
  }

  if (opts.referer) {
    setHeader(headers, 'Referer', opts.referer);
  }

  return { method, headers, body };
}

function formatResponseHead(response) {
  const lines = [
    `HTTP/${response.httpVersion} ${response.status} ${response.statusMessage}`,
  ];
  for (let i = 0; i < response.rawHeaders.length; i += 2) {
    lines.push(`${response.rawHeaders[i]}: ${response.rawHeaders[i + 1]}`);
  }
  return `${lines.join('\r\n')}\r\n\r\n`;
}

function describeError(error) {
  return error?.message ?? String(error);
}

function mapError(error) {
  if (error?.code === 'ETIMEDOUT') return 28;
  if (error?.code === 'ENOTFOUND' || error?.code === 'EAI_AGAIN') return 6;
  if (error?.code === 'ECONNREFUSED') return 7;
  if (/certificate|self[- ]signed|TLS|SSL/i.test(describeError(error))) return 60;
  return 1;
}

export async function run(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (error) {
    if (error instanceof UsageError) {
      stderr.write(`minicurl: ${error.message}\n`);
      stderr.write("Try 'minicurl --help' for more information.\n");
      return 2;
    }
    throw error;
  }

  if (opts.help) {
    stdout.write(helpText());
    return 0;
  }

  if (opts.version) {
    stdout.write(`minicurl ${VERSION}\n`);
    return 0;
  }

  if (opts.urls.length === 0) {
    stderr.write('minicurl: no URL specified\n');
    stderr.write("Try 'minicurl --help' for more information.\n");
    return 2;
  }

  let request;
  try {
    request = buildRequest(opts);
  } catch (error) {
    if (error instanceof UsageError) {
      stderr.write(`minicurl: ${error.message}\n`);
      return 2;
    }
    throw error;
  }

  const log = (message) => stderr.write(`${message}\n`);
  const verbose = opts.verbose && !opts.silent;
  const include = opts.include || opts.head;

  let exitCode = 0;

  for (const url of opts.urls) {
    try {
      const response = await performRequest({
        url,
        method: request.method,
        headers: request.headers,
        body: request.body,
        maxTime: opts.maxTime,
        insecure: opts.insecure,
        location: opts.location,
        verbose,
        log,
      });

      if (opts.fail && response.status >= 400) {
        if (!opts.silent) {
          stderr.write(
            `minicurl: HTTP error ${response.status} ${response.statusMessage}\n`,
          );
        }
        exitCode = 22;
        continue;
      }

      const parts = [];
      if (include) {
        parts.push(Buffer.from(formatResponseHead(response)));
      }
      parts.push(response.body);
      const payload = Buffer.concat(parts);

      if (opts.output) {
        fs.writeFileSync(opts.output, payload);
        if (verbose) {
          log(`* Saved response to ${opts.output}`);
        }
      } else {
        stdout.write(payload);
      }

      if (verbose) {
        log(`* Completed in ${response.elapsed} ms`);
      }
    } catch (error) {
      if (!opts.silent) {
        stderr.write(`minicurl: (${url}) ${describeError(error)}\n`);
      }
      exitCode = mapError(error);
    }
  }

  return exitCode;
}
