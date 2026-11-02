import { redirect, sendHtml, setCookie } from '../http.js';
import { sanitizePreferences, serializePreferences } from '../preferences.js';
import {
  renderAbout,
  renderHelp,
  renderPreferences,
} from '../views/pages.js';

export function registerPageRoutes(router) {
  router.get('/about', (ctx) => {
    sendHtml(ctx.res, renderAbout({ preferences: ctx.preferences }));
  });

  router.get('/help', (ctx) => {
    sendHtml(ctx.res, renderHelp({ preferences: ctx.preferences }));
  });

  router.get('/preferences', (ctx) => {
    sendHtml(
      ctx.res,
      renderPreferences({
        preferences: ctx.preferences,
        ok: ctx.ok === '1' ? '偏好已儲存。這些設定只會改變外觀，不影響搜尋排序。' : ctx.ok,
        err: ctx.err,
      }),
    );
  });

  router.post('/preferences', (ctx) => {
    const preferences = sanitizePreferences({
      theme: ctx.body.get('theme'),
      density: ctx.body.get('density'),
      showScores: ctx.body.get('showScores') === '1',
    });

    setCookie(ctx.res, 'prefs', serializePreferences(preferences), {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'Lax',
    });

    redirect(ctx.res, '/preferences?ok=1');
  });
}
