import { DEFAULT_PREFERENCES } from '../preferences.js';
import { esc, flash } from './common.js';

const NAV = [
  { path: '/', label: '首頁', exact: true },
  { path: '/about', label: '演算法說明' },
  { path: '/help', label: '求助資源' },
  { path: '/preferences', label: '偏好設定' },
];

function isActive(item, active) {
  if (item.exact) return active === item.path;
  return active === item.path || active.startsWith(`${item.path}/`);
}

function navHtml(active) {
  return NAV.map((item) => {
    const current = isActive(item, active) ? ' aria-current="page"' : '';
    return `<a href="${esc(item.path)}"${current}>${esc(item.label)}</a>`;
  }).join('');
}

export function layout({
  title,
  preferences = DEFAULT_PREFERENCES,
  active = '',
  content = '',
  ok = '',
  err = '',
}) {
  const theme = preferences.theme === 'dark' ? 'dark' : 'light';
  const density = preferences.density === 'compact' ? 'compact' : 'comfortable';

  return `<!doctype html>
<html lang="zh-Hant" data-theme="${esc(theme)}" data-density="${esc(density)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="安心搜尋：不受個人偏好影響的搜尋排序，並在敏感搜尋時優先提供求助資源。">
  <title>${esc(title)} | 安心搜尋</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
<header class="topbar">
  <a class="brand" href="/">
    <span class="brand-mark">安</span>
    <span class="brand-text">
      <strong>安心搜尋</strong>
      <small>公平排序 · 即時關懷</small>
    </span>
  </a>
  <nav class="main-nav" aria-label="主要導覽">${navHtml(active)}</nav>
</header>
<main class="page">
  ${flash(ok, err)}
  ${content}
</main>
<footer class="footer">
  <p>安心搜尋 · 現代軟體工程課程專案</p>
  <p>本系統為教學示範，不提供醫療診斷。若你或身邊的人有立即危險，請撥打 119 或 110。</p>
</footer>
</body>
</html>`;
}
