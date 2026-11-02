import { ALGORITHM_VERSION } from '../config.js';
import { detectSafety } from '../safety/detect.js';
import { rankDocuments } from '../search/rank.js';
import { redirect, sendHtml, sendJson } from '../http.js';
import { renderHome } from '../views/home.js';
import { renderResults } from '../views/results.js';
import { renderSafety } from '../views/safety.js';

function publicResult(item) {
  const document = item.document;
  return {
    id: document.id,
    title: document.title,
    category: document.category,
    tags: document.tags,
    snippet:
      document.content.length > 180
        ? `${document.content.slice(0, 180)}…`
        : document.content,
    score: item.score,
    matchedTerms: item.matchedTerms,
  };
}

function readQuery(ctx) {
  return (ctx.url.searchParams.get('q') ?? '').trim();
}

export function registerSearchRoutes(router, deps) {
  router.get('/', (ctx) => {
    sendHtml(
      ctx.res,
      renderHome({ documents: deps.documents, preferences: ctx.preferences }),
    );
  });

  router.get('/search', (ctx) => {
    const query = readQuery(ctx);
    if (!query) {
      redirect(ctx.res, '/');
      return;
    }

    const acknowledged = ctx.url.searchParams.get('ack') === '1';
    const safety = detectSafety(query);
    const blocked = safety.severity === 'critical' && !acknowledged;
    const results = blocked ? [] : rankDocuments(query, deps.index);

    const html = blocked
      ? renderSafety({
          query,
          safety,
          preferences: ctx.preferences,
          acknowledged,
        })
      : renderResults({
          query,
          safety,
          results,
          preferences: ctx.preferences,
          acknowledged,
        });

    sendHtml(ctx.res, html);
  });

  router.get('/api/search', (ctx) => {
    const query = readQuery(ctx);
    if (!query) {
      sendJson(ctx.res, 400, {
        error: 'missing_query',
        message: '請提供 q 參數，例如 /api/search?q=資料庫。',
      });
      return;
    }

    const acknowledged = ctx.url.searchParams.get('ack') === '1';
    const safety = detectSafety(query);
    const blocked = safety.severity === 'critical' && !acknowledged;
    const results = blocked ? [] : rankDocuments(query, deps.index);

    sendJson(ctx.res, 200, {
      query,
      algorithm: ALGORITHM_VERSION,
      personalization: false,
      preferencesUsed: false,
      safety: {
        flagged: safety.flagged,
        severity: safety.severity,
        blocked,
        acknowledged,
        categories: safety.categories,
        matches: safety.matches,
      },
      results: results.map(publicResult),
    });
  });
}
