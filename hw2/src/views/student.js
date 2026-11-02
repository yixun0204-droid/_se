import { DAY_LABELS, SEMESTER_LABEL } from '../config.js';
import { letterGrade } from '../repo.js';
import { layout } from './layout.js';
import {
  announcementCards,
  csrfInput,
  emptyRow,
  esc,
  formatDate,
  formatScore,
  formatFixed,
  pageHeader,
  scheduleText,
  statCard,
  timetableHtml,
} from './common.js';

function todayTime(course, day) {
  return course.schedule
    .filter((slot) => slot.day === day)
    .map((slot) => (slot.start === slot.end ? `第 ${slot.start} 節` : `第 ${slot.start}-${slot.end} 節`))
    .join('、');
}

export function studentDashboard({
  user,
  csrf,
  ok,
  err,
  stats,
  todayItems,
  todayDay,
  announcements,
}) {
  const todayList = todayItems.length
    ? todayItems
        .map(
          (item) => `<li class="class-item">
            <span class="class-time">${esc(todayTime(item.course, todayDay))}</span>
            <span class="class-body">
              <strong>${esc(item.course.name)}</strong>
              <small>${esc(item.course.room)} · ${esc(item.teacherName)}</small>
            </span>
          </li>`,
        )
        .join('')
    : '<li class="empty-state">今天沒有安排課程</li>';

  const latest = announcements.length
    ? announcements
        .map(
          (item) => `<li class="news-item">
            <a href="/student/announcements/${esc(item.id)}">${esc(item.title)}</a>
            <small>${esc(formatDate(item.createdAt))} · ${esc(item.authorName)}</small>
          </li>`,
        )
        .join('')
    : '<li class="empty-state">目前沒有公告</li>';

  const content = `${pageHeader(
    `歡迎回來，${user.name}`,
    `${SEMESTER_LABEL} · ${user.department}`,
    '<a class="btn btn-ghost" href="/student/schedule">查看完整課表</a>',
  )}
  <div class="stat-grid">
    ${statCard('已選課程', `${stats.enrollmentCount} 門`)}
    ${statCard('總學分', `${stats.credits} 學分`)}
    ${statCard('平均成績', formatFixed(stats.average), '僅計已評分課程')}
    ${statCard('通過學分', `${stats.passedCredits} 學分`)}
  </div>
  <div class="two-column">
    <section class="card">
      <div class="card-head">
        <h2>今日課程（${esc(DAY_LABELS[todayDay] ?? '週末')}）</h2>
      </div>
      <ul class="class-list">${todayList}</ul>
    </section>
    <section class="card">
      <div class="card-head">
        <h2>最新公告</h2>
        <a class="text-link" href="/student/announcements">查看全部</a>
      </div>
      <ul class="news-list">${latest}</ul>
    </section>
  </div>
  <section class="card quick-links">
    <h2>快速功能</h2>
    <div class="quick-grid">
      <a href="/student/courses">線上選課</a>
      <a href="/student/grades">成績查詢</a>
      <a href="/student/schedule">我的課表</a>
      <a href="/student/profile">個人資料</a>
    </div>
  </section>`;

  return layout({ title: '學生儀表板', user, csrf, active: '/student', content, ok, err });
}

export function studentCourses({ user, csrf, ok, err, courses, query, enrolledCount }) {
  const rows = courses.length
    ? courses
        .map(({ course, teacherName, count, enrolled, full, conflictName }) => {
          let action;
          if (enrolled) {
            action = `<form method="post" action="/student/courses/${esc(course.id)}/drop" class="inline-form" data-confirm="確定要退選「${esc(course.name)}」嗎？">
              ${csrfInput(csrf)}
              <button class="btn btn-danger btn-sm" type="submit">退選</button>
            </form>`;
          } else if (full) {
            action = '<span class="badge badge-muted">已額滿</span>';
          } else if (conflictName) {
            action = `<span class="error-text">與 ${esc(conflictName)} 衝堂</span>`;
          } else {
            action = `<form method="post" action="/student/courses/${esc(course.id)}/enroll" class="inline-form">
              ${csrfInput(csrf)}
              <button class="btn btn-primary btn-sm" type="submit">選課</button>
            </form>`;
          }

          return `<tr>
            <td><code>${esc(course.code)}</code></td>
            <td>
              <strong>${esc(course.name)}</strong>
              <p class="table-note">${esc(course.description)}</p>
            </td>
            <td>${esc(teacherName)}</td>
            <td>${esc(course.credits)}</td>
            <td>${esc(scheduleText(course.schedule))}<br><span class="muted">${esc(course.room)}</span></td>
            <td>${esc(count)} / ${esc(course.capacity)}</td>
            <td>${action}</td>
          </tr>`;
        })
        .join('')
    : emptyRow(7, '查無符合條件的課程');

  const content = `${pageHeader(
    '線上選課',
    `${SEMESTER_LABEL} · 目前共選 ${enrolledCount} 門課`,
    '<a class="btn btn-ghost" href="/student/schedule">查看課表</a>',
  )}
  <form method="get" action="/student/courses" class="toolbar">
    <input name="q" value="${esc(query)}" placeholder="搜尋課程代碼、名稱或教師">
    <button class="btn btn-primary" type="submit">搜尋</button>
    ${query ? '<a class="btn btn-ghost" href="/student/courses">清除</a>' : ''}
  </form>
  <div class="card table-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>代碼</th>
            <th>課程名稱</th>
            <th>授課教師</th>
            <th>學分</th>
            <th>上課時間</th>
            <th>選課人數</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;

  return layout({ title: '線上選課', user, csrf, active: '/student/courses', content, ok, err });
}

export function studentSchedule({ user, csrf, ok, err, items, todayDay }) {
  const rows = items.length
    ? items
        .map(
          ({ course, teacherName }) => `<tr>
            <td><code>${esc(course.code)}</code></td>
            <td>${esc(course.name)}</td>
            <td>${esc(teacherName)}</td>
            <td>${esc(scheduleText(course.schedule))}</td>
            <td>${esc(course.room)}</td>
            <td>${esc(course.credits)} 學分</td>
          </tr>`,
        )
        .join('')
    : emptyRow(6, '本學期尚未選課');

  const content = `${pageHeader(
    '我的課表',
    `${SEMESTER_LABEL} · 共 ${items.length} 門課`,
    '<a class="btn btn-primary" href="/student/courses">前往選課</a>',
  )}
  <section class="card">
    <div class="card-head">
      <h2>每週課表</h2>
      <span class="muted">今日：${esc(DAY_LABELS[todayDay] ?? '週末')}</span>
    </div>
    ${timetableHtml(items)}
  </section>
  <section class="card table-card">
    <div class="card-head"><h2>課程明細</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>代碼</th><th>課程名稱</th><th>教師</th><th>時間</th><th>地點</th><th>學分</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;

  return layout({ title: '我的課表', user, csrf, active: '/student/schedule', content, ok, err });
}

export function studentGrades({ user, csrf, ok, err, stats }) {
  const rows = stats.records.length
    ? stats.records
        .map(({ course, enrollment }) => {
          const score = enrollment.score;
          let status;
          if (score === null || score === undefined) {
            status = '<span class="badge badge-muted">未評分</span>';
          } else if (score >= 60) {
            status = '<span class="badge badge-pass">通過</span>';
          } else {
            status = '<span class="badge badge-fail">未通過</span>';
          }
          return `<tr>
            <td><code>${esc(course.code)}</code></td>
            <td>${esc(course.name)}</td>
            <td>${esc(course.credits)}</td>
            <td class="score-cell">${esc(formatScore(score))}</td>
            <td>${esc(letterGrade(score))}</td>
            <td>${status}</td>
          </tr>`;
        })
        .join('')
    : emptyRow(6, '本學期尚未選課');

  const content = `${pageHeader('成績查詢', `${SEMESTER_LABEL} 成績一覽`)}
  <div class="stat-grid">
    ${statCard('平均成績', formatFixed(stats.average), '學分加權')}
    ${statCard('GPA', formatFixed(stats.gpa, 2), '4.0 制')}
    ${statCard('已通過學分', `${stats.passedCredits} 學分`)}
    ${statCard('已評分課程', `${stats.gradedCount} 門`, `共選 ${stats.enrollmentCount} 門`)}
  </div>
  <div class="card table-card">
    <div class="card-head"><h2>成績明細</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>代碼</th><th>課程名稱</th><th>學分</th><th>分數</th><th>等第</th><th>狀態</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;

  return layout({ title: '成績查詢', user, csrf, active: '/student/grades', content, ok, err });
}

export function studentProfile({ user, csrf, ok, err, stats }) {
  const content = `${pageHeader('個人資料', '學生基本資料與本學期選課摘要')}
  <div class="two-column">
    <section class="card">
      <div class="card-head"><h2>基本資料</h2></div>
      <table class="info-table">
        <tbody>
          <tr><th>姓名</th><td>${esc(user.name)}</td></tr>
          <tr><th>帳號</th><td>${esc(user.username)}</td></tr>
          <tr><th>學號</th><td>${esc(user.studentId ?? '—')}</td></tr>
          <tr><th>系所</th><td>${esc(user.department)}</td></tr>
          <tr><th>電子郵件</th><td>${esc(user.email || '—')}</td></tr>
          <tr><th>建立時間</th><td>${esc(formatDate(user.createdAt))}</td></tr>
        </tbody>
      </table>
    </section>
    <section class="card">
      <div class="card-head"><h2>本學期摘要</h2></div>
      <div class="stat-grid compact">
        ${statCard('已選課程', `${stats.enrollmentCount} 門`)}
        ${statCard('總學分', `${stats.credits} 學分`)}
        ${statCard('平均成績', formatFixed(stats.average))}
        ${statCard('通過學分', `${stats.passedCredits} 學分`)}
      </div>
      <div class="form-actions">
        <a class="btn btn-primary" href="/student/schedule">查看課表</a>
        <a class="btn btn-ghost" href="/student/grades">查看成績</a>
      </div>
    </section>
  </div>`;

  return layout({ title: '個人資料', user, csrf, active: '/student/profile', content, ok, err });
}

export function studentAnnouncements({ user, csrf, ok, err, items }) {
  const content = `${pageHeader('校園公告', `${SEMESTER_LABEL} 公告列表`)}
  <div class="announcement-list">
    ${announcementCards(items, { linkBase: '/student/announcements' })}
  </div>`;

  return layout({
    title: '校園公告',
    user,
    csrf,
    active: '/student/announcements',
    content,
    ok,
    err,
  });
}

export function studentAnnouncementDetail({ user, csrf, ok, err, item }) {
  const content = `${pageHeader('公告內容', item.title, '<a class="btn btn-ghost" href="/student/announcements">返回列表</a>')}
  <article class="card announcement-detail">
    <div class="announcement-head">
      <h2>${item.pinned ? '<span class="badge badge-pinned">置頂</span>' : ''}${esc(item.title)}</h2>
      <span class="muted">${esc(formatDate(item.createdAt))}</span>
    </div>
    <p class="announcement-content">${esc(item.content)}</p>
    <div class="announcement-meta">發布者：${esc(item.authorName)}</div>
  </article>`;

  return layout({ title: item.title, user, csrf, active: '/student/announcements', content, ok, err });
}
