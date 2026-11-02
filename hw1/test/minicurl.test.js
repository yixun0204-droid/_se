import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../bin/minicurl.js', import.meta.url));

let server;
let baseUrl;

function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const chunks = [];

  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    const isHead = req.method === 'HEAD';

    switch (url.pathname) {
      case '/hello':
        res.writeHead(200, {
          'Content-Type': 'text/plain',
          'X-Test': 'value',
        });
        res.end(isHead ? undefined : 'hello world');
        break;
      case '/echo':
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            method: req.method,
            body,
            headers: req.headers,
          }),
        );
        break;
      case '/redirect':
        res.writeHead(302, { Location: '/hello' });
        res.end();
        break;
      case '/status/404':
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('not found');
        break;
      case '/slow':
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('late');
        }, 2000);
        break;
      default:
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ method: req.method, headers: req.headers }));
    }
  });
}

function runCli(args, options = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [BIN, ...args], {
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const out = [];
    const err = [];

    child.stdout.on('data', (chunk) => out.push(chunk));
    child.stderr.on('data', (chunk) => err.push(chunk));
    child.on('close', (code) => {
      resolvePromise({
        code,
        stdout: Buffer.concat(out).toString(),
        stderr: Buffer.concat(err).toString(),
      });
    });
  });
}

before(async () => {
  server = http.createServer(handler);
  await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolvePromise) => server.close(resolvePromise));
});

test('performs a basic GET request', async () => {
  const result = await runCli([`${baseUrl}/hello`]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'hello world');
});

test('includes response headers with -i', async () => {
  const result = await runCli(['-i', `${baseUrl}/hello`]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /^HTTP\/1\.1 200 OK\r\n/);
  assert.match(result.stdout, /Content-Type: text\/plain\r\n/);
  assert.match(result.stdout, /\r\n\r\nhello world$/);
});

test('sends form data with -d and defaults to POST', async () => {
  const result = await runCli(['-d', 'name=alice', `${baseUrl}/echo`]);
  assert.equal(result.code, 0);
  const echoed = JSON.parse(result.stdout);
  assert.equal(echoed.method, 'POST');
  assert.equal(echoed.body, 'name=alice');
  assert.match(echoed.headers['content-type'], /application\/x-www-form-urlencoded/);
});

test('sends JSON with --json', async () => {
  const result = await runCli(['--json', '{"a":1}', `${baseUrl}/echo`]);
  assert.equal(result.code, 0);
  const echoed = JSON.parse(result.stdout);
  assert.equal(echoed.method, 'POST');
  assert.equal(echoed.body, '{"a":1}');
  assert.equal(echoed.headers['content-type'], 'application/json');
});

test('joins multiple -d values with &', async () => {
  const result = await runCli(['-d', 'a=1', '-d', 'b=2', `${baseUrl}/echo`]);
  const echoed = JSON.parse(result.stdout);
  assert.equal(echoed.body, 'a=1&b=2');
});

test('supports custom method and headers', async () => {
  const result = await runCli([
    '-X',
    'PUT',
    '-H',
    'X-Custom: yes',
    '-d',
    'payload',
    `${baseUrl}/echo`,
  ]);
  const echoed = JSON.parse(result.stdout);
  assert.equal(echoed.method, 'PUT');
  assert.equal(echoed.headers['x-custom'], 'yes');
});

test('does not follow redirects by default', async () => {
  const result = await runCli([`${baseUrl}/redirect`]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, '');
});

test('follows redirects with -L', async () => {
  const result = await runCli(['-L', `${baseUrl}/redirect`]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'hello world');
});

test('writes output to a file with -o', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'minicurl-'));
  const outFile = path.join(dir, 'page.txt');
  const result = await runCli(['-o', outFile, `${baseUrl}/hello`]);
  assert.equal(result.code, 0);
  assert.equal(fs.readFileSync(outFile, 'utf8'), 'hello world');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('fails on HTTP errors with -f', async () => {
  const result = await runCli(['-f', `${baseUrl}/status/404`]);
  assert.equal(result.code, 22);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /404/);
});

test('returns 0 for HTTP errors without -f', async () => {
  const result = await runCli([`${baseUrl}/status/404`]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'not found');
});

test('fetches headers only with -I', async () => {
  const result = await runCli(['-I', `${baseUrl}/hello`]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /^HTTP\/1\.1 200 OK\r\n/);
  assert.doesNotMatch(result.stdout, /hello world/);
});

test('sends basic auth with -u', async () => {
  const result = await runCli(['-u', 'alice:secret', `${baseUrl}/echo`]);
  const echoed = JSON.parse(result.stdout);
  const expected = `Basic ${Buffer.from('alice:secret').toString('base64')}`;
  assert.equal(echoed.headers.authorization, expected);
});

test('sends a custom User-Agent with -A', async () => {
  const result = await runCli(['-A', 'minicurl-test', `${baseUrl}/echo`]);
  const echoed = JSON.parse(result.stdout);
  assert.equal(echoed.headers['user-agent'], 'minicurl-test');
});

test('rejects unknown options with exit code 2', async () => {
  const result = await runCli(['--nope', `${baseUrl}/hello`]);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /unknown option/);
});

test('rejects a missing URL with exit code 2', async () => {
  const result = await runCli([]);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /no URL specified/);
});

test('prints help text', async () => {
  const result = await runCli(['--help']);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /Usage: minicurl/);
});

test('times out with --max-time and exit code 28', async () => {
  const result = await runCli(['--max-time', '0.2', `${baseUrl}/slow`]);
  assert.equal(result.code, 28);
  assert.match(result.stderr, /timed out/);
});
