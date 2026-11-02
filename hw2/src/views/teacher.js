import { SEMESTER_LABEL } from '../config.js';
import { letterGrade } from '../repo.js';
import { layout } from './layout.js';
import {
  announcementForm,
  csrfInput,
  emptyRow,
  esc,
  formatDate,
  pageHeader,
  scheduleText,
  statCard,
} from './common.js';

export function teacherDashboard({
  user,
  csrf,
  ok,
  err,
  courses,
  totalStudents,
  announcementCount,
  announcements,
}) {
  const courseRows = courses.length
    ? courses
        .map(
          ({ course, count }) => `<tr>
            <td><code>${esc(course.code)}</code></td>
            <td><a class="text-link" href="/teacher/courses/${esc(course.id)}">${esc(course.name)}</a></td>
            <td>${esc(scheduleText(course.schedule))}</td>
            <td>${esc(course.room)}</td>
            <td>${esc(count)} / ${esc(course.capacity)}</td>
            <td>${course.open ? '<span class="badge badge-pass">開放</span>' : '<span class="badge badge-muted">關閉</span>'}</td>
          </tr>`,
        )
        .join('')
    : emptyRow(6, '目前沒有開設課程');

  const news = announcements.length
    ? announcements
        .map(
          (item) => `<li class="news-item">
            <span>${item.pinned ? '<span class="badge badge-pinned">置頂</span>' : ''}${esc(item.title)}</span>
            <small>${esc(formatDate(item.createdAt))}</small>
          </li>`,
        )
        .join('')
    : '<li class="empty-state">尚未發布公告</li>';

  const content = `${pageHeader(
    `教師儀表板`,
    `${user.name} · ${user.department}`,
    '<a class="btn btn-primary" href="/teacher/announcements/new">發布公告</a>',
  )}
  <div class="stat-grid">
    ${statCard('開設課程', `${courses.length} 門`)}
    ${statCard('修課人次', `${totalStudents} 人次`)}
    ${statCard('我的公告', `${announcementCount} 則`)}
    ${statCard('目前學期', SEMESTER_LABEL)}
  </div>
  <div class="two-column">
    <section class="card table-card">
      <div class="card-head">
        <h2>我的課程</h2>
        <a class="text-link" href="/teacher/courses">管理課程</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>代碼</th><th>課程名稱</th><th>時間</th><th>地點</th><th>人數</th><th>狀態</th></tr></thead>
          <tbody>${courseRows}</tbody>
        </table>
      </div>
    </section>
    <section class="card">
      <div class="card-head">
        <h2>最新公告</h2>
        <a class="text-link" href="/teacher/announcements">查看全部</a>
      </div>
      <ul class="news-list">${news}</ul>
    </section>
  </div>`;

  return layout({ title: '教師儀表板', user, csrf, active: '/teacher', content, ok, err });
}

export function teacherCourses({ user, csrf, ok, err, courses }) {
  const rows = courses.length
    ? courses
        .map(
          ({ course, count }) => `<tr>
            <td><code>${esc(course.code)}</code></td>
            <td>${esc(course.name)}</td>
            <td>${esc(course.credits)}</td>
            <td>${esc(scheduleText(course.schedule))}</td>
            <td>${esc(course.room)}</td>
            <td>${esc(count)} / ${esc(course.capacity)}</td>
            <td>${course.open ? '<span class="badge badge-pass">開放</span>' : '<span class="badge badge-muted">關閉</span>'}</td>
            <td><a class="btn btn-ghost btn-sm" href="/teacher/courses/${esc(course.id)}">名單與成績</a></td>
          </tr>`,
        )
        .join('')
    : emptyRow(8, '目前沒有開設課程');

  const content = `${pageHeader('我的課程', `${SEMESTER_LABEL} · 點選課程可登錄成績`)}
  <div class="card table-card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>代碼</th><th>課程名稱</th><th>學分</th><th>時間</th><th>地點</th><th>人數</th><th>狀態</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;

  return layout({ title: '我的課程', user, csrf, active: '/teacher/courses', content, ok, err });
}

export function teacherCourseDetail({ user, csrf, ok, err, course, roster }) {
  const rows = roster.length
    ? roster
        .map(
          ({ enrollment, student }) => `<tr>
            <td><code>${esc(student.studentId ?? '—')}</code></td>
            <td>${esc(student.name)}</td>
            <td>${esc(student.department)}</td>
            <td>${esc(student.email || '—')}</td>
            <td class="score-input-cell">
              <input form="grade-form" class="score-input" type="number" name="score:${esc(enrollment.id)}" min="0" max="100" step="1" value="${enrollment.score === null || enrollment.score === undefined ? '' : esc(enrollment.score)}">
            </td>
            <td>${esc(letterGrade(enrollment.score))}</td>
          </tr>`,
        )
        .join('')
    : emptyRow(6, '目前尚無學生選課');

  const content = `${pageHeader(
    course.name,
    `${course.code} · ${SEMESTER_LABEL}`,
    '<a class="btn btn-ghost" href="/teacher/courses">返回課程列表</a>',
  )}
  <div class="stat-grid">
    ${statCard('學分', `${course.credits} 學分`)}
    ${statCard('選課人數', `${roster.length} / ${course.capacity}`)}
    ${statCard('上課時間', scheduleText(course.schedule))}
    ${statCard('上課地點', course.room)}
  </div>
  <section class="card">
    <div class="card-head">
      <h2>學生名單與成績登錄</h2>
      <span class="muted">分數留空表示未評分，範圍 0-100</span>
    </div>
    <form id="grade-form" method="post" action="/teacher/courses/${esc(course.id)}/grades">
      ${csrfInput(csrf)}
      <div class="table-wrap">
        <table>
          <thead><tr><th>學號</th><th>姓名</th><th>系所</th><th>Email</th><th>分數</th><th>等第</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">儲存成績</button>
      </div>
    </form>
  </section>
  <section class="card">
    <div class="card-head"><h2>課程說明</h2></div>
    <p class="text-block">${esc(course.description || '未提供課程說明')}</p>
  </section>`;

  return layout({
    title: `${course.code} ${course.name}`,
    user,
    csrf,
    active: '/teacher/courses',
    content,
    ok,
    err,
  });
}

export function teacherAnnouncements({ user, csrf, ok, err, items }) {
  const list = items.length
    ? items
        .map(
          (item) => `<article class="announcement">
            <div class="announcement-head">
              <h3>${item.pinned ? '<span class="badge badge-pinned">置頂</span>' : ''}${esc(item.title)}</h3>
              <span class="muted">${esc(formatDate(item.createdAt))}</span>
            </div>
            <p class="announcement-content">${esc(item.content)}</p>
            <div class="announcement-actions">
              <form method="post" action="/teacher/announcements/${esc(item.id)}/delete" class="inline-form" data-confirm="確定要刪除這則公告嗎？">
                ${csrfInput(csrf)}
                <button class="btn btn-danger btn-sm" type="submit">刪除</button>
              </form>
            </div>
          </article>`,
        )
        .join('')
    : '<div class="empty-state">尚未發布公告</div>';

  const content = `${pageHeader(
    '公告管理',
    '管理您所發布的課程與校園公告',
    '<a class="btn btn-primary" href="/teacher/announcements/new">發布新公告</a>',
  )}
  <div class="announcement-list">${list}</div>`;

  return layout({
    title: '公告管理',
    user,
    csrf,
    active: '/teacher/announcements',
    content,
    ok,
    err,
  });
}

export function teacherAnnouncementForm({ user, csrf, ok, err }) {
  const content = `${pageHeader(
    '發布公告',
    '公告將即時顯示於學生端',
    '<a class="btn btn-ghost" href="/teacher/announcements">返回列表</a>',
  )}
  ${announcementForm({
    action: '/teacher/announcements',
    csrf,
    values: {},
    submitLabel: '發布公告',
  })}`;

  return layout({
    title: '發布公告',
    user,
    csrf,
    active: '/teacher/announcements',
    content,
    ok,
    err,
  });
}
