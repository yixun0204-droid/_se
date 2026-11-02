import { DAY_LABELS, PERIODS, ROLE_LABELS } from '../config.js';

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

export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatScore(score) {
  return score === null || score === undefined ? '—' : String(score);
}

export function formatFixed(value, digits = 1) {
  return value === null || value === undefined ? '—' : value.toFixed(digits);
}

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}

export function roleBadge(role) {
  return `<span class="badge badge-${esc(role)}">${esc(roleLabel(role))}</span>`;
}

export function csrfInput(csrf) {
  return `<input type="hidden" name="csrf" value="${esc(csrf ?? '')}">`;
}

export function flash(ok, err) {
  const parts = [];
  if (ok) parts.push(`<div class="flash flash-ok" role="status">${esc(ok)}</div>`);
  if (err) parts.push(`<div class="flash flash-err" role="alert">${esc(err)}</div>`);
  return parts.join('');
}

export function pageHeader(title, subtitle = '', actions = '') {
  return `<div class="page-header">
    <div>
      <h1>${esc(title)}</h1>
      ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
    </div>
    ${actions ? `<div class="page-actions">${actions}</div>` : ''}
  </div>`;
}

export function statCard(label, value, hint = '') {
  return `<div class="stat-card">
    <span class="stat-label">${esc(label)}</span>
    <strong class="stat-value">${esc(value)}</strong>
    ${hint ? `<span class="stat-hint">${esc(hint)}</span>` : ''}
  </div>`;
}

export function emptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" class="empty-cell">${esc(message)}</td></tr>`;
}

export function scheduleText(schedule) {
  if (!schedule || schedule.length === 0) return '未排課';
  return schedule
    .map((slot) => {
      const day = DAY_LABELS[slot.day] ?? `週${slot.day}`;
      const periods = slot.start === slot.end ? `${slot.start}` : `${slot.start}-${slot.end}`;
      return `${day} ${periods}`;
    })
    .join('、');
}

export function timetableHtml(items) {
  const grid = new Map();
  for (const item of items) {
    for (const slot of item.course.schedule) {
      for (let period = slot.start; period <= slot.end; period++) {
        grid.set(`${slot.day}-${period}`, item);
      }
    }
  }

  const head = [1, 2, 3, 4, 5]
    .map((day) => `<th>${DAY_LABELS[day]}</th>`)
    .join('');

  const rows = PERIODS.map((period) => {
    const cells = [1, 2, 3, 4, 5]
      .map((day) => {
        const item = grid.get(`${day}-${period.number}`);
        if (!item) return '<td class="tt-empty"></td>';
        return `<td><div class="tt-course">
          <strong>${esc(item.course.name)}</strong>
          <span>${esc(item.course.room)}</span>
          ${item.teacherName ? `<span>${esc(item.teacherName)}</span>` : ''}
        </div></td>`;
      })
      .join('');
    return `<tr>
      <th class="period-number">${period.number}</th>
      <td class="period-time">${period.time}</td>
      ${cells}
    </tr>`;
  }).join('');

  return `<div class="table-wrap">
    <table class="timetable">
      <thead><tr><th>節次</th><th>時間</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

export function announcementCards(items, { linkBase = null } = {}) {
  if (items.length === 0) {
    return '<div class="empty-state">目前沒有公告</div>';
  }

  return items
    .map((item) => {
      const title = linkBase
        ? `<a href="${esc(linkBase)}/${esc(item.id)}">${esc(item.title)}</a>`
        : esc(item.title);
      return `<article class="announcement">
        <div class="announcement-head">
          <h3>${item.pinned ? '<span class="badge badge-pinned">置頂</span>' : ''}${title}</h3>
          <span class="muted">${esc(formatDate(item.createdAt))}</span>
        </div>
        <p class="announcement-content">${esc(item.content)}</p>
        <div class="announcement-meta">發布者：${esc(item.authorName ?? '—')}</div>
      </article>`;
    })
    .join('');
}

export function announcementForm({ action, values = {}, csrf, submitLabel = '儲存公告' }) {
  return `<form method="post" action="${esc(action)}" class="card form">
    ${csrfInput(csrf)}
    <label>公告標題
      <input name="title" maxlength="120" required value="${esc(values.title ?? '')}" placeholder="請輸入公告標題">
    </label>
    <label>公告內容
      <textarea name="content" rows="9" required placeholder="請輸入公告內容">${esc(values.content ?? '')}</textarea>
    </label>
    <label class="check-row">
      <input type="checkbox" name="pinned" value="1" ${values.pinned ? 'checked' : ''}>
      <span>置頂公告</span>
    </label>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit">${esc(submitLabel)}</button>
    </div>
  </form>`;
}
