import { layout } from './layout.js';

export function errorPage({ status, title, message, preferences }) {
  return layout({
    title: `${status} ${title}`,
    preferences,
    content: `<section class="panel error-panel">
      <p class="eyebrow">錯誤 ${status}</p>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="crisis-actions">
        <a class="btn btn-primary" href="/">回到首頁</a>
        <a class="btn btn-ghost" href="/help">求助資源</a>
      </div>
    </section>`,
  });
}
