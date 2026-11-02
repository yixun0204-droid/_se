import { layout } from './layout.js';
import { esc } from './common.js';

export function errorPage({ status, title, message, user = null, csrf = '' }) {
  const home = user ? `/${user.role}` : '/login';
  const homeLabel = user ? '回到首頁' : '回到登入頁';
  const content = `<section class="error-card">
    <div class="error-code">${esc(status)}</div>
    <h1>${esc(title)}</h1>
    <p>${esc(message)}</p>
    <a class="btn btn-primary" href="${esc(home)}">${homeLabel}</a>
  </section>`;

  return layout({ title, user, csrf, content });
}
