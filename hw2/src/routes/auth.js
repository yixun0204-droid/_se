import { hashPassword, verifyPassword } from '../auth.js';
import { SESSION_TTL_MS } from '../config.js';
import { clearCookie, redirect, redirectWith, sendHtml, setCookie } from '../http.js';
import { changePasswordPage, loginPage } from '../views/auth.js';
import { requireLogin } from './guards.js';

export function registerAuthRoutes(router, { db, sessions }) {
  router.get('/', (ctx) => {
    if (!ctx.user) return redirect(ctx.res, '/login');
    return redirect(ctx.res, `/${ctx.user.role}`);
  });

  router.get('/login', (ctx) => {
    if (ctx.user) return redirect(ctx.res, `/${ctx.user.role}`);
    return sendHtml(ctx.res, loginPage({ ok: ctx.ok, err: ctx.err }));
  });

  router.post('/login', (ctx) => {
    const username = (ctx.body.get('username') ?? '').trim().toLowerCase();
    const password = ctx.body.get('password') ?? '';
    const user = db.data.users.find((item) => item.username === username);

    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      sendHtml(ctx.res, loginPage({ err: '帳號或密碼錯誤', username }), 401);
      return;
    }

    const { token } = sessions.create(user.id);
    setCookie(ctx.res, 'sid', token, {
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
      path: '/',
    });
    redirect(ctx.res, `/${user.role}`);
  });

  router.post('/logout', (ctx) => {
    if (ctx.token) sessions.destroy(ctx.token);
    clearCookie(ctx.res, 'sid');
    redirect(ctx.res, '/login');
  });

  router.get('/account/password', (ctx) => {
    if (!requireLogin(ctx)) return;
    sendHtml(
      ctx.res,
      changePasswordPage({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
      }),
    );
  });

  router.post('/account/password', (ctx) => {
    if (!requireLogin(ctx)) return;

    const current = ctx.body.get('current') ?? '';
    const newPassword = ctx.body.get('newPassword') ?? '';
    const confirmPassword = ctx.body.get('confirmPassword') ?? '';

    if (!verifyPassword(current, ctx.user.salt, ctx.user.passwordHash)) {
      return redirectWith(ctx.res, '/account/password', { err: '目前密碼不正確' });
    }
    if (newPassword.length < 6) {
      return redirectWith(ctx.res, '/account/password', { err: '新密碼至少需要 6 個字元' });
    }
    if (newPassword !== confirmPassword) {
      return redirectWith(ctx.res, '/account/password', { err: '兩次輸入的新密碼不一致' });
    }

    const { salt, passwordHash } = hashPassword(newPassword);
    ctx.user.salt = salt;
    ctx.user.passwordHash = passwordHash;
    ctx.user.updatedAt = new Date().toISOString();
    db.save();

    return redirectWith(ctx.res, '/account/password', { ok: '密碼已更新' });
  });
}
