import { redirect, sendHtml } from '../http.js';
import { errorPage } from '../views/errors.js';
import { ROLE_LABELS } from '../config.js';

export function requireLogin(ctx, role = null) {
  if (!ctx.user) {
    redirect(ctx.res, '/login');
    return false;
  }

  if (role && ctx.user.role !== role) {
    sendHtml(
      ctx.res,
      errorPage({
        status: 403,
        title: '權限不足',
        message: `此頁面僅限${ROLE_LABELS[role] ?? role}角色使用。`,
        user: ctx.user,
      }),
      403,
    );
    return false;
  }

  return true;
}
