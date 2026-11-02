import { HOTLINES } from '../safety/resources.js';

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function flash(ok, err) {
  const parts = [];
  if (ok) parts.push(`<div class="flash flash-ok" role="status">${esc(ok)}</div>`);
  if (err) parts.push(`<div class="flash flash-err" role="alert">${esc(err)}</div>`);
  return parts.join('');
}

export function searchForm({ query = '', large = false } = {}) {
  return `<form class="search-form${large ? ' search-form-lg' : ''}" method="get" action="/search" role="search">
    <label class="sr-only" for="q">搜尋關鍵字</label>
    <input id="q" name="q" type="search" value="${esc(query)}" placeholder="輸入關鍵字，例如：資料庫、睡眠、壓力" autocomplete="off" required>
    <button class="btn btn-primary" type="submit">搜尋</button>
  </form>`;
}

export function hotlineCard(item) {
  return `<article class="hotline hotline-${esc(item.tone)}">
    <div class="hotline-head">
      <h3>${esc(item.name)}</h3>
      <span class="hotline-hours">${esc(item.hours)}</span>
    </div>
    <p>${esc(item.description)}</p>
    <a class="hotline-phone" href="tel:${esc(item.phone)}">${esc(item.phone)}</a>
  </article>`;
}

export function hotlineCards({ limit } = {}) {
  const items = limit ? HOTLINES.slice(0, limit) : HOTLINES;
  return `<div class="hotline-grid">${items.map(hotlineCard).join('')}</div>`;
}

export function careBanner({ severity, acknowledged = false, categories = [] }) {
  const labels = categories.map((category) => category.label).join('、');
  const title =
    severity === 'critical'
      ? acknowledged
        ? '你選擇繼續查看結果，但我們仍想陪著你'
        : '先停一下，讓我們關心你'
      : '先照顧自己，再繼續搜尋';

  return `<section class="care-banner" role="status" aria-live="polite">
    <div class="care-banner-text">
      <h2>${esc(title)}</h2>
      <p>${
        labels
          ? `我們注意到這則搜尋可能與「${esc(labels)}」有關。`
          : '我們注意到這則搜尋可能與情緒或身體健康有關。'
      }你不需要獨自面對。</p>
      <p>如果情況緊急，請撥打 <a href="tel:119">119</a> 或 <a href="tel:110">110</a>；需要有人陪你說話，可以撥打 <a href="tel:1925">1925</a> 或 <a href="tel:1995">1995</a>。</p>
    </div>
    <div class="care-banner-actions">
      <a class="btn btn-primary" href="/help">查看求助資源</a>
      <a class="btn btn-ghost" href="tel:1925">撥打 1925</a>
    </div>
  </section>`;
}

export function statRow(items) {
  return `<div class="stat-row">${items
    .map(
      (item) =>
        `<div class="stat"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></div>`,
    )
    .join('')}</div>`;
}
