import { createApp } from '../src/app.js';

export async function startServer(options = {}) {
  const app = createApp(options);
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;

  return {
    app,
    base,
    async close() {
      await new Promise((resolve) => app.server.close(resolve));
    },
  };
}

export async function getJson(base, pathname, headers = {}) {
  const response = await fetch(`${base}${pathname}`, { headers });
  return {
    status: response.status,
    body: await response.json(),
  };
}

export async function getText(base, pathname, headers = {}) {
  const response = await fetch(`${base}${pathname}`, { headers });
  return {
    status: response.status,
    html: await response.text(),
    headers: response.headers,
  };
}
