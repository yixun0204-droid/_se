import { SEMESTER, SEMESTER_LABEL } from '../config.js';
import { letterGrade } from '../repo.js';
import { layout } from './layout.js';
import {
  announcementForm,
  csrfInput,
  emptyRow,
  esc,
  formatDate,
  formatScore,
  pageHeader,
  roleBadge,
  scheduleText,
  statCard,
} from './common.js';

export function adminDashboard({ user, csrf, ok, err, stats, announcements }) {
  const news = announcements.length
    ? announcements
        .map(
          (item) => `<li class="news-item">
            <span>${item.pinned ? '<span class="badge badge-pinned">置頂</span>' : ''}${esc(item.title)}</span>
            <small>${esc(formatDate(item.createdAt))} · ${esc(item.authorName)}</small>
          </li>`,
        )
        .join('')
    : '<li class="empty-state">目前沒有公告</li>';

  const content = `${pageHeader(
    '管理員儀表板',
    `${SEMESTER_LABEL} · 系統總覽`,
    '<a class="btn btn-primary" href="/admin/announcements/new">發布公告</a>',
  )}
  <div class="stat-grid">
    ${statCard('使用者總數', `${stats.users} 人`, `學生 ${stats.students} · 教師 ${stats.teachers} · 管理員 ${stats.admins}`)}
    ${statCard('開設課程', `${stats.courses} 門`, `開放中 ${stats.openCourses} 門`)}
    ${statCard('選課筆數', `${stats.enrollments} 筆`)}
    ${statCard('公告數量', `${stats.announcements} 則`)}
  </div>
  <div class="two-column">
    <section class="card">
      <div class="card-head"><h2>使用者組成</h2><a class="text-link" href="/admin/users">管理使用者</a></div>
      <div class="role-bars">
        <div><span>學生</span><strong>${esc(stats.students)}</strong></div>
        <div><span>教師</span><strong>${esc(stats.teachers)}</strong></div>
        <div><span>管理員</span><strong>${esc(stats.admins)}</strong></div>
      </div>
      <div class="quick-grid admin-quick">
        <a href="/admin/users/new">新增使用者</a>
        <a href="/admin/courses/new">新增課程</a>
        <a href="/admin/courses">課程管理</a>
        <a href="/admin/announcements">公告管理</a>
      </div>
    </section>
    <section class="card">
      <div class="card-head"><h2>最新公告</h2><a class="text-link" href="/admin/announcements">查看全部</a></div>
      <ul class="news-list">${news}</ul>
    </section>
  </div>`;

  return layout({ title: '管理員儀表板', user, csrf, active: '/admin', content, ok, err });
}

function userFilterTabs(current) {
  return [
    ['', '全部'],
    ['student', '學生'],
    ['teacher', '教師'],
    ['admin', '管理員'],
  ]
    .map(([value, label]) => {
      const href = value ? `/admin/users?role=${value}` : '/admin/users';
      const active = current === value ? ' active' : '';
      return `<a class="tab${active}" href="${href}">${label}</a>`;
    })
    .join('');
}

export function adminUsers({ user, csrf, ok, err, users, roleFilter }) {
  const rows = users.length
    ? users
        .map((item) => {
          const identifier = item.studentId || item.employeeId || '—';
          const self = item.id === user.id;
          return `<tr>
            <td><code>${esc(item.username)}</code></td>
            <td>${esc(item.name)}${self ? ' <span class="badge badge-muted">本人</span>' : ''}</td>
            <td>${roleBadge(item.role)}</td>
            <td>${esc(identifier)}</td>
            <td>${esc(item.department || '—')}</td>
            <td>${esc(formatDate(item.createdAt))}</td>
            <td>
              <div class="row-actions">
                <form method="post" action="/admin/users/${esc(item.id)}/password" class="inline-form reset-form">
                  ${csrfInput(csrf)}
                  <input type="password" name="newPassword" minlength="6" placeholder="新密碼" aria-label="新密碼" required>
                  <button class="btn btn-ghost btn-sm" type="submit">重設密碼</button>
                </form>
                ${
                  self
                    ? '<span class="muted small">不可刪除本人</span>'
                    : `<form method="post" action="/admin/users/${esc(item.id)}/delete" class="inline-form" data-confirm="確定要刪除使用者「${esc(item.name)}」嗎？">
                        ${csrfInput(csrf)}
                        <button class="btn btn-danger btn-sm" type="submit">刪除</button>
                      </form>`
                }
              </div>
            </td>
          </tr>`;
        })
        .join('')
    : emptyRow(7, '查無使用者');

  const content = `${pageHeader(
    '使用者管理',
    `共 ${users.length} 位使用者`,
    '<a class="btn btn-primary" href="/admin/users/new">新增使用者</a>',
  )}
  <div class="tabs">${userFilterTabs(roleFilter)}</div>
  <div class="card table-card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>帳號</th><th>姓名</th><th>角色</th><th>學號/員編</th><th>系所</th><th>建立時間</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;

  return layout({ title: '使用者管理', user, csrf, active: '/admin/users', content, ok, err });
}

export function adminUserForm({ user, csrf, ok, err, values = {} }) {
  const options = [
    ['student', '學生'],
    ['teacher', '教師'],
    ['admin', '管理員'],
  ]
    .map(
      ([value, label]) =>
        `<option value="${value}" ${values.role === value ? 'selected' : ''}>${label}</option>`,
    )
    .join('');

  const content = `${pageHeader(
    '新增使用者',
    '建立學生、教師或管理員帳號',
    '<a class="btn btn-ghost" href="/admin/users">返回列表</a>',
  )}
  <form method="post" action="/admin/users" class="card form narrow-form">
    ${csrfInput(csrf)}
    <div class="form-grid">
      <label>帳號
        <input name="username" required minlength="3" maxlength="20" value="${esc(values.username ?? '')}" placeholder="例如 student4">
      </label>
      <label>密碼
        <input type="password" name="password" required minlength="6" placeholder="至少 6 個字元">
      </label>
      <label>角色
        <select name="role">${options}</select>
      </label>
      <label>姓名
        <input name="name" required maxlength="40" value="${esc(values.name ?? '')}">
      </label>
      <label>系所
        <input name="department" maxlength="60" value="${esc(values.department ?? '')}" placeholder="例如 資訊工程學系">
      </label>
      <label>電子郵件
        <input type="email" name="email" maxlength="80" value="${esc(values.email ?? '')}">
      </label>
      <label>學號（學生）
        <input name="studentId" maxlength="20" value="${esc(values.studentId ?? '')}">
      </label>
      <label>員編（教師／管理員）
        <input name="employeeId" maxlength="20" value="${esc(values.employeeId ?? '')}">
      </label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit">建立帳號</button>
    </div>
  </form>`;

  return layout({ title: '新增使用者', user, csrf, active: '/admin/users', content, ok, err });
}

export function adminCourses({ user, csrf, ok, err, courses }) {
  const rows = courses.length
    ? courses
        .map(
          ({ course, teacherName, count }) => `<tr>
            <td><code>${esc(course.code)}</code></td>
            <td><a class="text-link" href="/admin/courses/${esc(course.id)}">${esc(course.name)}</a></td>
            <td>${esc(teacherName)}</td>
            <td>${esc(course.credits)}</td>
            <td>${esc(scheduleText(course.schedule))}<br><span class="muted">${esc(course.room)}</span></td>
            <td>${esc(count)} / ${esc(course.capacity)}</td>
            <td>${course.open ? '<span class="badge badge-pass">開放</span>' : '<span class="badge badge-muted">關閉</span>'}</td>
            <td>
              <div class="row-actions">
                <a class="btn btn-ghost btn-sm" href="/admin/courses/${esc(course.id)}/edit">編輯</a>
                <form method="post" action="/admin/courses/${esc(course.id)}/toggle" class="inline-form">
                  ${csrfInput(csrf)}
                  <button class="btn btn-ghost btn-sm" type="submit">${course.open ? '關閉' : '開放'}</button>
                </form>
                <form method="post" action="/admin/courses/${esc(course.id)}/delete" class="inline-form" data-confirm="確定要刪除課程「${esc(course.name)}」嗎？相關選課紀錄也會一併刪除。">
                  ${csrfInput(csrf)}
                  <button class="btn btn-danger btn-sm" type="submit">刪除</button>
                </form>
              </div>
            </td>
          </tr>`,
        )
        .join('')
    : emptyRow(8, '目前沒有課程');

  const content = `${pageHeader(
    '課程管理',
    `${SEMESTER_LABEL} · 共 ${courses.length} 門課程`,
    '<a class="btn btn-primary" href="/admin/courses/new">新增課程</a>',
  )}
  <div class="card table-card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>代碼</th><th>課程名稱</th><th>教師</th><th>學分</th><th>時間/地點</th><th>人數</th><th>狀態</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;

  return layout({ title: '課程管理', user, csrf, active: '/admin/courses', content, ok, err });
}

export function adminCourseForm({
  user,
  csrf,
  ok,
  err,
  teachers,
  values = {},
  action,
  heading,
  submitLabel,
}) {
  const options = teachers
    .map(
      (teacher) =>
        `<option value="${esc(teacher.id)}" ${values.teacherId === teacher.id ? 'selected' : ''}>${esc(teacher.name)}（${esc(teacher.department)}）</option>`,
    )
    .join('');

  const content = `${pageHeader(
    heading,
    '排課格式：週一 1-2、週三 3-4（可留空）',
    '<a class="btn btn-ghost" href="/admin/courses">返回列表</a>',
  )}
  <form method="post" action="${esc(action)}" class="card form">
    ${csrfInput(csrf)}
    <div class="form-grid">
      <label>課程代碼
        <input name="code" required maxlength="20" value="${esc(values.code ?? '')}" placeholder="例如 CS104">
      </label>
      <label>課程名稱
        <input name="name" required maxlength="80" value="${esc(values.name ?? '')}">
      </label>
      <label>授課教師
        <select name="teacherId" required>${options}</select>
      </label>
      <label>學分數
        <input type="number" name="credits" min="1" max="6" required value="${esc(values.credits ?? 3)}">
      </label>
      <label>人數上限
        <input type="number" name="capacity" min="1" max="300" required value="${esc(values.capacity ?? 50)}">
      </label>
      <label>上課地點
        <input name="room" maxlength="30" value="${esc(values.room ?? '')}" placeholder="例如 E101">
      </label>
      <label>學期
        <input name="semester" value="${esc(values.semester ?? SEMESTER)}" readonly>
      </label>
      <label>上課時間
        <input name="scheduleText" value="${esc(values.scheduleText ?? '')}" placeholder="Mon 1-2, Wed 3-4">
      </label>
    </div>
    <label>課程說明
      <textarea name="description" rows="5" placeholder="課程大綱與學習目標">${esc(values.description ?? '')}</textarea>
    </label>
    <label class="check-row">
      <input type="checkbox" name="open" value="1" ${values.open === false ? '' : 'checked'}>
      <span>開放選課</span>
    </label>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit">${esc(submitLabel)}</button>
    </div>
  </form>`;

  return layout({ title: heading, user, csrf, active: '/admin/courses', content, ok, err });
}

export function adminCourseDetail({ user, csrf, ok, err, course, roster, teacherName }) {
  const rows = roster.length
    ? roster
        .map(
          ({ enrollment, student }) => `<tr>
            <td><code>${esc(student.studentId ?? '—')}</code></td>
            <td>${esc(student.name)}</td>
            <td>${esc(student.department)}</td>
            <td>${esc(formatScore(enrollment.score))}</td>
            <td>${esc(letterGrade(enrollment.score))}</td>
          </tr>`,
        )
        .join('')
    : emptyRow(5, '目前尚無學生選課');

  const content = `${pageHeader(
    course.name,
    `${course.code} · ${SEMESTER_LABEL}`,
    `<a class="btn btn-ghost" href="/admin/courses/${esc(course.id)}/edit">編輯課程</a>`,
  )}
  <div class="stat-grid">
    ${statCard('授課教師', teacherName)}
    ${statCard('學分', `${course.credits} 學分`)}
    ${statCard('選課人數', `${roster.length} / ${course.capacity}`)}
    ${statCard('狀態', course.open ? '開放選課' : '關閉選課')}
  </div>
  <section class="card">
    <div class="card-head"><h2>課程資訊</h2></div>
    <table class="info-table">
      <tbody>
        <tr><th>上課時間</th><td>${esc(scheduleText(course.schedule))}</td></tr>
        <tr><th>上課地點</th><td>${esc(course.room)}</td></tr>
        <tr><th>課程說明</th><td>${esc(course.description || '未提供')}</td></tr>
      </tbody>
    </table>
  </section>
  <section class="card table-card">
    <div class="card-head"><h2>選課名單</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>學號</th><th>姓名</th><th>系所</th><th>分數</th><th>等第</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;

  return layout({
    title: `${course.code} ${course.name}`,
    user,
    csrf,
    active: '/admin/courses',
    content,
    ok,
    err,
  });
}

export function adminAnnouncements({ user, csrf, ok, err, items }) {
  const list = items.length
    ? items
        .map(
          (item) => `<article class="announcement">
            <div class="announcement-head">
              <h3>${item.pinned ? '<span class="badge badge-pinned">置頂</span>' : ''}${esc(item.title)}</h3>
              <span class="muted">${esc(formatDate(item.createdAt))}</span>
            </div>
            <p class="announcement-content">${esc(item.content)}</p>
            <div class="announcement-meta">發布者：${esc(item.authorName)}</div>
            <div class="announcement-actions">
              <a class="btn btn-ghost btn-sm" href="/admin/announcements/${esc(item.id)}/edit">編輯</a>
              <form method="post" action="/admin/announcements/${esc(item.id)}/delete" class="inline-form" data-confirm="確定要刪除這則公告嗎？">
                ${csrfInput(csrf)}
                <button class="btn btn-danger btn-sm" type="submit">刪除</button>
              </form>
            </div>
          </article>`,
        )
        .join('')
    : '<div class="empty-state">目前沒有公告</div>';

  const content = `${pageHeader(
    '公告管理',
    '管理全站公告與置頂設定',
    '<a class="btn btn-primary" href="/admin/announcements/new">新增公告</a>',
  )}
  <div class="announcement-list">${list}</div>`;

  return layout({
    title: '公告管理',
    user,
    csrf,
    active: '/admin/announcements',
    content,
    ok,
    err,
  });
}

export function adminAnnouncementForm({
  user,
  csrf,
  ok,
  err,
  values = {},
  action,
  heading,
  submitLabel,
}) {
  const content = `${pageHeader(
    heading,
    '公告發布後將顯示於學生與教師端',
    '<a class="btn btn-ghost" href="/admin/announcements">返回列表</a>',
  )}
  ${announcementForm({ action, values, csrf, submitLabel })}`;

  return layout({
    title: heading,
    user,
    csrf,
    active: '/admin/announcements',
    content,
    ok,
    err,
  });
}
