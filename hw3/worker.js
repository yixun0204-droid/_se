import { handleAsNodeRequest } from 'cloudflare:node';
import { createApp } from './src/app.js';
import documents from './data/documents.json' with { type: 'json' };
import stylesheet from './public/style.css';

const PORT = 8080;

const { server } = createApp({ documents });
server.listen(PORT);

const STATIC_HEADERS = {
  'Content-Type': 'text/css; charset=utf-8',
  'Cache-Control': 'public, max-age=3600',
  'X-Content-Type-Options': 'nosniff',
};

export default {
  fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === '/static/style.css') {
      return new Response(stylesheet, { headers: STATIC_HEADERS });
    }

    return handleAsNodeRequest(PORT, request);
  },
};
