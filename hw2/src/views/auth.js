import { layout } from './layout.js';
import { csrfInput, esc, pageHeader } from './common.js';

const DEMO_ACCOUNTS = [
  { role: '管理員', username: 'admin', password: 'admin123' },
  { role: '教師', username: 'teacher1', password: 'teacher123' },
  { role: '教師', username: 'teacher2', password: 'teacher123' },
  { role: '學生', username: 'student1', password: 'student123' },
  { role: '學生', username: 'student2', password: 'student123' },
];

export function loginPage({ ok = '', err = '', username = '' }) {
  const rows = DEMO_ACCOUNTS.map(
    (account) => `<tr>
      <td>${esc(account.role)}</td>
      <td><code>${esc(account.username)}</code></td>
      <td><code>${esc(account.password)}</code></td>
    </tr>`,
  ).join('');

  const content = `<div class="login-page">
    <section class="login-card">
      <div class="login-brand">
        <span class="brand-seal brand-seal-lg">金大</span>
        <div>
          <h1>國立金門大學</h1>
          <p>校務資訊系統</p>
        </div>
      </div>
      <p class="muted">請使用學號或教職員帳號登入</p>
      <form method="post" action="/login" class="form login-form">
        <label>帳號
          <input name="username" value="${esc(username)}" autocomplete="username" required autofocus placeholder="例如 student1">
        </label>
        <label>密碼
          <input type="password" name="password" autocomplete="current-password" required placeholder="請輸入密碼">
        </label>
        <button class="btn btn-primary btn-block" type="submit">登入系統</button>
      </form>
      <div class="demo-box">
        <h2>課程示範帳號</h2>
        <table>
          <thead><tr><th>角色</th><th>帳號</th><th>密碼</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
    <section class="login-side">
      <h2>金門大學校務資訊系統</h2>
      <p>整合選課、課表、成績、公告與課程管理，提供學生、教師與行政人員一站式服務。</p>
      <ul>
        <li>學生：線上選課、課表、成績與公告</li>
        <li>教師：課程名單與成績登錄</li>
        <li>管理員：帳號、課程與公告管理</li>
      </ul>
      <p class="login-note">此為教學示範系統，請勿輸入真實個人資料。</p>
    </section>
  </div>`;

  return layout({ title: '登入', user: null, content, ok, err });
}

export function changePasswordPage({ user, csrf, ok = '', err = '' }) {
  const content = `${pageHeader('修改密碼', '定期更換密碼可提升帳號安全')}
  <form method="post" action="/account/password" class="card form narrow-form">
    ${csrfInput(csrf)}
    <label>目前密碼
      <input type="password" name="current" autocomplete="current-password" required>
    </label>
    <label>新密碼
      <input type="password" name="newPassword" autocomplete="new-password" minlength="6" required>
      <small class="field-hint">至少 6 個字元</small>
    </label>
    <label>確認新密碼
      <input type="password" name="confirmPassword" autocomplete="new-password" minlength="6" required>
    </label>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit">更新密碼</button>
    </div>
  </form>`;

  return layout({ title: '修改密碼', user, csrf, active: '/account/password', content, ok, err });
}
