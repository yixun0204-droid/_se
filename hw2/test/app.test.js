import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';

let app;
let server;
let base;
let tempDir;

function studentId(username) {
  return app.db.data.users.find((user) => user.username === username).id;
}

function courseByCode(code) {
  return app.db.data.courses.find((course) => course.code === code);
}

function enrollmentOf(username, code) {
  const course = courseByCode(code);
  return app.db.data.enrollments.find(
    (enrollment) =>
      enrollment.courseId === course.id &&
      enrollment.studentId === studentId(username),
  );
}

class Client {
  constructor() {
    this.cookie = '';
    this.csrf = '';
  }

  async request(pathname, options = {}) {
    const headers = { ...(options.headers ?? {}) };
    if (this.cookie) headers.cookie = this.cookie;

    const response = await fetch(`${base}${pathname}`, {
      ...options,
      headers,
      redirect: 'manual',
    });

    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index);
      const value = pair.slice(index + 1);
      if (name === 'sid') {
        this.cookie = value ? `sid=${value}` : '';
      }
    }

    return response;
  }

  async login(username, password, home) {
    const response = await this.request('/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }).toString(),
    });
    assert.equal(response.status, 302, `login failed for ${username}`);
    assert.ok(this.cookie.startsWith('sid='), 'session cookie missing');
    this.csrf = await this.fetchCsrf(home);
    return response;
  }

  async fetchCsrf(pathname) {
    const response = await this.request(pathname);
    const html = await response.text();
    assert.equal(response.status, 200, `expected 200 from ${pathname}`);
    const match = /name="csrf" value="([^"]+)"/.exec(html);
    assert.ok(match, `csrf token missing on ${pathname}`);
    return match[1];
  }

  async post(pathname, fields = {}) {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(fields)) {
      body.set(key, String(value));
    }
    body.set('csrf', this.csrf);

    return this.request(pathname, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  }

  async getText(pathname) {
    const response = await this.request(pathname);
    return { status: response.status, html: await response.text() };
  }
}

before(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nqu-system-'));
  app = createApp({ dbPath: path.join(tempDir, 'db.json') });
  server = app.server;
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('root redirects to login and login page lists demo accounts', async () => {
  const client = new Client();
  const root = await client.request('/');
  assert.equal(root.status, 302);
  assert.equal(root.headers.get('location'), '/login');

  const page = await client.getText('/login');
  assert.equal(page.status, 200);
  assert.match(page.html, /國立金門大學/);
  assert.match(page.html, /student1/);
  assert.match(page.html, /admin123/);
});

test('rejects a wrong password without creating a session', async () => {
  const client = new Client();
  const response = await client.request('/login', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: 'student1', password: 'wrong' }).toString(),
  });
  const html = await response.text();

  assert.equal(response.status, 401);
  assert.match(html, /帳號或密碼錯誤/);
  assert.equal(client.cookie, '');
});

test('passwords are stored as salted hashes', () => {
  const user = app.db.data.users.find((item) => item.username === 'student1');
  assert.notEqual(user.passwordHash, 'student123');
  assert.ok(user.passwordHash.length > 32);
  assert.ok(user.salt.length > 8);
});

test('enforces login and role based access', async () => {
  const anonymous = new Client();
  const redirect = await anonymous.request('/student');
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get('location'), '/login');

  const student = new Client();
  await student.login('student1', 'student123', '/student');
  assert.equal((await student.getText('/admin')).status, 403);

  const teacher = new Client();
  await teacher.login('teacher1', 'teacher123', '/teacher');
  assert.equal((await teacher.getText('/student')).status, 403);
});

test('student dashboard and grade page show seeded data', async () => {
  const client = new Client();
  await client.login('student1', 'student123', '/student');

  const dashboard = await client.getText('/student');
  assert.match(dashboard.html, /楊宜勛/);
  assert.match(dashboard.html, /已選課程/);

  const grades = await client.getText('/student/grades');
  assert.match(grades.html, /程式設計\(一\)/);
  assert.match(grades.html, /88/);
  assert.match(grades.html, /GPA/);
});

test('student can search courses and view the timetable', async () => {
  const client = new Client();
  await client.login('student1', 'student123', '/student');

  const search = await client.getText('/student/courses?q=%E8%B3%87%E6%96%99%E5%BA%AB');
  assert.match(search.html, /資料庫系統/);
  assert.doesNotMatch(search.html, /程式設計\(一\)/);

  const schedule = await client.getText('/student/schedule');
  assert.match(schedule.html, /每週課表/);
  assert.match(schedule.html, /程式設計\(一\)/);
});

test('student can enroll and drop a course', async () => {
  const client = new Client();
  await client.login('student1', 'student123', '/student');
  const course = courseByCode('CS102');

  const enroll = await client.post(`/student/courses/${course.id}/enroll`);
  assert.equal(enroll.status, 302);
  assert.match(enroll.headers.get('location'), /^\/student\/courses\?ok=/);
  assert.ok(enrollmentOf('student1', 'CS102'));

  const drop = await client.post(`/student/courses/${course.id}/drop`);
  assert.equal(drop.status, 302);
  assert.match(drop.headers.get('location'), /^\/student\/courses\?ok=/);
  assert.equal(enrollmentOf('student1', 'CS102'), undefined);
});

test('student cannot enroll in a course with a schedule conflict', async () => {
  const client = new Client();
  await client.login('student1', 'student123', '/student');
  const course = courseByCode('CS103');
  const before = app.db.data.enrollments.length;

  const response = await client.post(`/student/courses/${course.id}/enroll`);
  assert.equal(response.status, 302);
  assert.match(response.headers.get('location'), /^\/student\/courses\?err=/);
  assert.equal(app.db.data.enrollments.length, before);
});

test('student cannot enroll in a full course', async () => {
  const client = new Client();
  await client.login('student1', 'student123', '/student');
  const course = courseByCode('CS102');
  const original = course.capacity;

  try {
    course.capacity = 1;
    const response = await client.post(`/student/courses/${course.id}/enroll`);
    assert.equal(response.status, 302);
    assert.match(response.headers.get('location'), /^\/student\/courses\?err=/);
    assert.equal(enrollmentOf('student1', 'CS102'), undefined);
  } finally {
    course.capacity = original;
  }
});

test('rejects POST requests with a missing or invalid CSRF token', async () => {
  const client = new Client();
  await client.login('student1', 'student123', '/student');
  const course = courseByCode('CS102');

  const missing = await client.request(`/student/courses/${course.id}/enroll`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: '',
  });
  assert.equal(missing.status, 403);

  const invalid = await client.request(`/student/courses/${course.id}/enroll`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'csrf=invalid',
  });
  assert.equal(invalid.status, 403);
  assert.equal(enrollmentOf('student1', 'CS102'), undefined);
});

test('teacher can view own courses and update grades', async () => {
  const client = new Client();
  await client.login('teacher1', 'teacher123', '/teacher');
  const course = courseByCode('CS101');
  const enrollment = enrollmentOf('student1', 'CS101');

  const page = await client.getText(`/teacher/courses/${course.id}`);
  assert.match(page.html, /楊宜勛/);
  assert.match(page.html, /成績登錄/);

  const update = await client.post(`/teacher/courses/${course.id}/grades`, {
    [`score:${enrollment.id}`]: 95,
  });
  assert.equal(update.status, 302);
  assert.match(update.headers.get('location'), /^\/teacher\/courses\/.+\?ok=/);
  assert.equal(enrollment.score, 95);

  const after = await client.getText(`/teacher/courses/${course.id}`);
  assert.match(after.html, /95/);
});

test('teacher cannot access another teachers course', async () => {
  const client = new Client();
  await client.login('teacher1', 'teacher123', '/teacher');
  const other = courseByCode('CS201');

  const page = await client.getText(`/teacher/courses/${other.id}`);
  assert.equal(page.status, 404);

  const enrollment = enrollmentOf('student2', 'CS101');
  const before = enrollment.score;
  const update = await client.post(`/teacher/courses/${other.id}/grades`, {
    [`score:${enrollment.id}`]: 99,
  });
  assert.equal(update.status, 302);
  assert.match(update.headers.get('location'), /^\/teacher\/courses\?err=/);
  assert.equal(enrollment.score, before);
});

test('teacher can create and delete own announcements only', async () => {
  const teacher2 = new Client();
  await teacher2.login('teacher2', 'teacher123', '/teacher');

  const create = await teacher2.post('/teacher/announcements', {
    title: '測試教師公告',
    content: '這是一則測試公告',
    pinned: '1',
  });
  assert.equal(create.status, 302);
  assert.match(create.headers.get('location'), /^\/teacher\/announcements\?ok=/);

  const created = app.db.data.announcements.find((item) => item.title === '測試教師公告');
  assert.ok(created);
  assert.equal(created.authorId, studentId('teacher2'));

  const teacher1 = new Client();
  await teacher1.login('teacher1', 'teacher123', '/teacher');
  const forbidden = await teacher1.post(`/teacher/announcements/${created.id}/delete`);
  assert.equal(forbidden.status, 302);
  assert.match(forbidden.headers.get('location'), /^\/teacher\/announcements\?err=/);
  assert.ok(app.db.data.announcements.some((item) => item.id === created.id));

  const removed = await teacher2.post(`/teacher/announcements/${created.id}/delete`);
  assert.equal(removed.status, 302);
  assert.ok(!app.db.data.announcements.some((item) => item.id === created.id));
});

test('admin can create a user who can log in', async () => {
  const admin = new Client();
  await admin.login('admin', 'admin123', '/admin');
  const username = `ts${Date.now().toString().slice(-8)}`;

  const response = await admin.post('/admin/users', {
    username,
    password: 'testpass123',
    role: 'student',
    name: '測試學生',
    department: '資訊工程學系',
    email: 'test@nqu.edu.tw',
    studentId: `99${Date.now()}`,
  });
  assert.equal(response.status, 302);
  assert.match(response.headers.get('location'), /^\/admin\/users\?ok=/);

  const created = app.db.data.users.find((user) => user.username === username);
  assert.ok(created);
  assert.equal(created.role, 'student');

  const login = new Client();
  await login.login(username, 'testpass123', '/student');
  const dashboard = await login.getText('/student');
  assert.match(dashboard.html, /測試學生/);
});

test('admin can create, toggle and delete a course', async () => {
  const admin = new Client();
  await admin.login('admin', 'admin123', '/admin');
  const teacher = app.db.data.users.find((user) => user.username === 'teacher1');

  const create = await admin.post('/admin/courses', {
    code: 'TS101',
    name: '測試課程',
    teacherId: teacher.id,
    credits: 2,
    capacity: 10,
    room: 'T101',
    scheduleText: '週一 1-2',
    description: '測試用課程',
    open: '1',
  });
  assert.equal(create.status, 302);
  assert.match(create.headers.get('location'), /^\/admin\/courses\?ok=/);

  const course = courseByCode('TS101');
  assert.ok(course);
  assert.deepEqual(course.schedule, [{ day: 1, start: 1, end: 2 }]);

  const detail = await admin.getText(`/admin/courses/${course.id}`);
  assert.equal(detail.status, 200);
  assert.match(detail.html, /測試課程/);

  const toggle = await admin.post(`/admin/courses/${course.id}/toggle`);
  assert.equal(toggle.status, 302);
  assert.equal(course.open, false);

  const remove = await admin.post(`/admin/courses/${course.id}/delete`);
  assert.equal(remove.status, 302);
  assert.equal(courseByCode('TS101'), undefined);
});

test('deleting a course removes related enrollments', async () => {
  const admin = new Client();
  await admin.login('admin', 'admin123', '/admin');
  const teacher = app.db.data.users.find((user) => user.username === 'teacher1');

  await admin.post('/admin/courses', {
    code: 'TS102',
    name: '刪除測試課程',
    teacherId: teacher.id,
    credits: 1,
    capacity: 10,
    room: 'T102',
    scheduleText: '',
    description: '',
    open: '1',
  });
  const course = courseByCode('TS102');
  app.db.data.enrollments.push({
    id: 'test-enrollment',
    courseId: course.id,
    studentId: studentId('student1'),
    semester: course.semester,
    score: null,
    createdAt: new Date().toISOString(),
  });
  app.db.save();

  await admin.post(`/admin/courses/${course.id}/delete`);
  assert.equal(courseByCode('TS102'), undefined);
  assert.ok(!app.db.data.enrollments.some((item) => item.courseId === course.id));
});

test('admin cannot delete own account or a teacher with courses', async () => {
  const admin = new Client();
  await admin.login('admin', 'admin123', '/admin');
  const adminUser = app.db.data.users.find((user) => user.username === 'admin');
  const teacher = app.db.data.users.find((user) => user.username === 'teacher1');

  const self = await admin.post(`/admin/users/${adminUser.id}/delete`);
  assert.equal(self.status, 302);
  assert.match(self.headers.get('location'), /^\/admin\/users\?err=/);
  assert.ok(app.db.data.users.some((user) => user.id === adminUser.id));

  const teacherDelete = await admin.post(`/admin/users/${teacher.id}/delete`);
  assert.equal(teacherDelete.status, 302);
  assert.match(teacherDelete.headers.get('location'), /^\/admin\/users\?err=/);
  assert.ok(app.db.data.users.some((user) => user.id === teacher.id));
});

test('admin announcement content is escaped on the student page', async () => {
  const admin = new Client();
  await admin.login('admin', 'admin123', '/admin');
  const title = '<script>alert(1)</script>';

  await admin.post('/admin/announcements', {
    title,
    content: '<b>內容</b>',
  });
  const created = app.db.data.announcements.find((item) => item.title === title);
  assert.ok(created);

  const student = new Client();
  await student.login('student1', 'student123', '/student');
  const page = await student.getText('/student/announcements');
  assert.match(page.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(page.html, /<script>alert\(1\)<\/script>/);

  await admin.post(`/admin/announcements/${created.id}/delete`);
});

test('admin can edit an announcement', async () => {
  const admin = new Client();
  await admin.login('admin', 'admin123', '/admin');

  await admin.post('/admin/announcements', {
    title: '編輯前公告',
    content: '原始內容',
  });
  const created = app.db.data.announcements.find((item) => item.title === '編輯前公告');
  assert.ok(created);

  const update = await admin.post(`/admin/announcements/${created.id}`, {
    title: '編輯後公告',
    content: '更新內容',
    pinned: '1',
  });
  assert.equal(update.status, 302);
  assert.equal(created.title, '編輯後公告');
  assert.equal(created.content, '更新內容');
  assert.equal(created.pinned, true);

  await admin.post(`/admin/announcements/${created.id}/delete`);
});

test('user can change password and log in with the new one', async () => {
  const client = new Client();
  await client.login('student2', 'student123', '/student');

  const wrong = await client.post('/account/password', {
    current: 'wrong',
    newPassword: 'newpass456',
    confirmPassword: 'newpass456',
  });
  assert.match(wrong.headers.get('location'), /^\/account\/password\?err=/);

  const changed = await client.post('/account/password', {
    current: 'student123',
    newPassword: 'newpass456',
    confirmPassword: 'newpass456',
  });
  assert.match(changed.headers.get('location'), /^\/account\/password\?ok=/);

  const fresh = new Client();
  await fresh.login('student2', 'newpass456', '/student');
  const dashboard = await fresh.getText('/student');
  assert.match(dashboard.html, /陳小華/);
});

test('serves static assets and unknown pages return 404', async () => {
  const css = await fetch(`${base}/static/style.css`);
  assert.equal(css.status, 200);
  assert.match(css.headers.get('content-type'), /text\/css/);
  assert.match(await css.text(), /--navy/);

  const client = new Client();
  const missing = await client.getText('/no-such-page');
  assert.equal(missing.status, 404);
  assert.match(missing.html, /找不到頁面/);
});
