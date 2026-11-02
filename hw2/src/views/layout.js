import { SEMESTER_LABEL } from '../config.js';
import { csrfInput, esc, flash, roleLabel } from './common.js';

const NAV = {
  student: [
    { path: '/student', label: '儀表板', exact: true },
    { path: '/student/courses', label: '線上選課' },
    { path: '/student/schedule', label: '我的課表' },
    { path: '/student/grades', label: '成績查詢' },
    { path: '/student/announcements', label: '校園公告' },
    { path: '/student/profile', label: '個人資料' },
    { path: '/account/password', label: '修改密碼' },
  ],
  teacher: [
    { path: '/teacher', label: '儀表板', exact: true },
    { path: '/teacher/courses', label: '我的課程' },
    { path: '/teacher/announcements', label: '公告管理', exact: true },
    { path: '/teacher/announcements/new', label: '發布公告' },
    { path: '/account/password', label: '修改密碼' },
  ],
  admin: [
    { path: '/admin', label: '儀表板', exact: true },
    { path: '/admin/users', label: '使用者管理' },
    { path: '/admin/courses', label: '課程管理' },
    { path: '/admin/announcements', label: '公告管理' },
    { path: '/account/password', label: '修改密碼' },
  ],
};

function isActive(item, active) {
  if (item.exact) return active === item.path;
  return active === item.path || active.startsWith(`${item.path}/`);
}

function navHtml(user, active) {
  const items = NAV[user.role] ?? [];
  return items
    .map((item) => {
      const current = isActive(item, active) ? ' aria-current="page"' : '';
      return `<a href="${esc(item.path)}"${current}>${esc(item.label)}</a>`;
    })
    .join('');
}

function userIdentifier(user) {
  return user.studentId || user.employeeId || user.username;
}

function shell({ user, csrf, active, content, ok, err }) {
  return `<header class="topbar">
    <a class="brand" href="/${esc(user.role)}">
      <span class="brand-seal">金大</span>
      <span class="brand-text">
        <strong>國立金門大學</strong>
        <small>校務資訊系統</small>
      </span>
    </a>
    <div class="topbar-right">
      <span class="semester-pill">${esc(SEMESTER_LABEL)}</span>
      <span class="user-chip">
        <span class="avatar">${esc(user.name.slice(0, 1))}</span>
        <span class="user-meta">
          <strong>${esc(user.name)}</strong>
          <small>${esc(roleLabel(user.role))} · ${esc(userIdentifier(user))}</small>
        </span>
      </span>
      <form method="post" action="/logout" class="inline-form">
        ${csrfInput(csrf)}
        <button class="btn btn-ghost btn-sm" type="submit">登出</button>
      </form>
    </div>
  </header>
  <div class="layout">
    <aside class="sidebar">
      <p class="sidebar-title">主選單</p>
      <nav class="side-nav">${navHtml(user, active)}</nav>
      <div class="sidebar-card">
        <span>示範系統</span>
        <p>本系統為現代軟體工程課程專案，資料儲存於本機 JSON 檔案。</p>
      </div>
    </aside>
    <main class="content">
      ${flash(ok, err)}
      ${content}
    </main>
  </div>`;
}

export function layout({ title, user = null, csrf = '', active = '', content, ok = '', err = '' }) {
  const body = user
    ? shell({ user, csrf, active, content, ok, err })
    : `<main class="auth-shell">${flash(ok, err)}${content}</main>`;

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${esc(title)} | 國立金門大學校務資訊系統</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
${body}
<footer class="footer">國立金門大學 校務資訊系統 · 教學示範專案</footer>
<script src="/static/app.js" defer></script>
</body>
</html>`;
}
