import crypto from 'node:crypto';
import { hashPassword } from '../auth.js';
import { SEMESTER } from '../config.js';
import { redirectWith, sendHtml } from '../http.js';
import {
  allCourses,
  announcementsSorted,
  canDeleteUser,
  courseById,
  enrollmentCount,
  enrollmentsForCourse,
  teachers,
  userByUsername,
} from '../repo.js';
import {
  adminAnnouncementForm,
  adminAnnouncements,
  adminCourseDetail,
  adminCourseForm,
  adminCourses,
  adminDashboard,
  adminUserForm,
  adminUsers,
} from '../views/admin.js';
import { scheduleText } from '../views/common.js';
import { errorPage } from '../views/errors.js';
import { requireLogin } from './guards.js';

const DAY_ALIASES = {
  一: 1,
  週一: 1,
  星期一: 1,
  mon: 1,
  monday: 1,
  二: 2,
  週二: 2,
  星期二: 2,
  tue: 2,
  tuesday: 2,
  三: 3,
  週三: 3,
  星期三: 3,
  wed: 3,
  wednesday: 3,
  四: 4,
  週四: 4,
  星期四: 4,
  thu: 4,
  thursday: 4,
  五: 5,
  週五: 5,
  星期五: 5,
  fri: 5,
  friday: 5,
};

function parseScheduleText(text) {
  if (!text) return [];
  const tokens = text
    .split(/[,，、;；]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const schedule = [];

  for (const token of tokens) {
    const match = /^([^\d]+?)\s*(\d{1,2})(?:\s*[-~到]\s*(\d{1,2}))?\s*(?:節|堂)?$/u.exec(token);
    if (!match) {
      throw new Error(`無法解析上課時間「${token}」，請使用例如「週一 1-2」的格式`);
    }

    const day = DAY_ALIASES[match[1].trim().toLowerCase()];
    const start = Number(match[2]);
    const end = match[3] ? Number(match[3]) : start;

    if (!day || start < 1 || start > 8 || end < start || end > 8) {
      throw new Error(`上課時間「${token}」不合法，請確認星期與節次（1-8）`);
    }

    schedule.push({ day, start, end });
  }

  return schedule;
}

function parseCourseInput(db, body, currentId = null) {
  const values = {
    code: (body.get('code') ?? '').trim().toUpperCase(),
    name: (body.get('name') ?? '').trim(),
    teacherId: (body.get('teacherId') ?? '').trim(),
    credits: (body.get('credits') ?? '').trim(),
    capacity: (body.get('capacity') ?? '').trim(),
    room: (body.get('room') ?? '').trim(),
    scheduleText: (body.get('scheduleText') ?? '').trim(),
    description: (body.get('description') ?? '').trim(),
    open: body.get('open') === '1',
    semester: SEMESTER,
  };

  if (!/^[A-Z0-9-]{2,20}$/.test(values.code)) {
    return { values, error: '課程代碼需為 2-20 碼英文、數字或連字號' };
  }
  if (db.data.courses.some((course) => course.code === values.code && course.id !== currentId)) {
    return { values, error: `課程代碼 ${values.code} 已存在` };
  }
  if (!values.name) {
    return { values, error: '課程名稱不可空白' };
  }
  if (values.name.length > 80) {
    return { values, error: '課程名稱不可超過 80 個字元' };
  }

  const teacher = db.data.users.find(
    (user) => user.id === values.teacherId && user.role === 'teacher',
  );
  if (!teacher) {
    return { values, error: '請選擇有效的授課教師' };
  }

  const credits = Number(values.credits);
  if (!Number.isInteger(credits) || credits < 1 || credits > 6) {
    return { values, error: '學分數需為 1 到 6 的整數' };
  }

  const capacity = Number(values.capacity);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 300) {
    return { values, error: '人數上限需為 1 到 300 的整數' };
  }

  let schedule;
  try {
    schedule = parseScheduleText(values.scheduleText);
  } catch (error) {
    return { values, error: error.message };
  }

  return {
    values,
    data: {
      code: values.code,
      name: values.name,
      teacherId: values.teacherId,
      credits,
      capacity,
      room: values.room,
      semester: SEMESTER,
      schedule,
      description: values.description,
      open: values.open,
    },
  };
}

function findAnnouncement(db, id) {
  return db.data.announcements.find((item) => item.id === id) ?? null;
}

export function registerAdminRoutes(router, { db, sessions }) {
  router.get('/admin', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const users = db.data.users;
    const stats = {
      users: users.length,
      students: users.filter((user) => user.role === 'student').length,
      teachers: users.filter((user) => user.role === 'teacher').length,
      admins: users.filter((user) => user.role === 'admin').length,
      courses: db.data.courses.length,
      openCourses: db.data.courses.filter((course) => course.open).length,
      enrollments: db.data.enrollments.length,
      announcements: db.data.announcements.length,
    };

    sendHtml(
      ctx.res,
      adminDashboard({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        stats,
        announcements: announcementsSorted(db, { limit: 4 }),
      }),
    );
  });

  router.get('/admin/users', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const roleFilter = ['student', 'teacher', 'admin'].includes(
      ctx.url.searchParams.get('role') ?? '',
    )
      ? ctx.url.searchParams.get('role')
      : '';

    const roleOrder = { student: 0, teacher: 1, admin: 2 };
    const users = db.data.users
      .filter((user) => !roleFilter || user.role === roleFilter)
      .sort(
        (a, b) =>
          roleOrder[a.role] - roleOrder[b.role] ||
          a.name.localeCompare(b.name, 'zh-Hant'),
      );

    sendHtml(
      ctx.res,
      adminUsers({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        users,
        roleFilter,
      }),
    );
  });

  router.get('/admin/users/new', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    sendHtml(
      ctx.res,
      adminUserForm({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        values: {},
      }),
    );
  });

  router.post('/admin/users', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const values = {
      username: (ctx.body.get('username') ?? '').trim().toLowerCase(),
      role: (ctx.body.get('role') ?? '').trim(),
      name: (ctx.body.get('name') ?? '').trim(),
      email: (ctx.body.get('email') ?? '').trim(),
      department: (ctx.body.get('department') ?? '').trim(),
      studentId: (ctx.body.get('studentId') ?? '').trim(),
      employeeId: (ctx.body.get('employeeId') ?? '').trim(),
    };
    const password = ctx.body.get('password') ?? '';

    const fail = (message, status = 400) =>
      sendHtml(
        ctx.res,
        adminUserForm({
          user: ctx.user,
          csrf: ctx.session.csrf,
          ok: '',
          err: message,
          values,
        }),
        status,
      );

    if (!/^[a-z0-9_]{3,20}$/.test(values.username)) {
      return fail('帳號需為 3-20 碼小寫英文、數字或底線');
    }
    if (userByUsername(db, values.username)) {
      return fail('這個帳號已存在');
    }
    if (!['student', 'teacher', 'admin'].includes(values.role)) {
      return fail('請選擇有效的角色');
    }
    if (!values.name) {
      return fail('姓名不可空白');
    }
    if (password.length < 6) {
      return fail('密碼至少需要 6 個字元');
    }
    if (values.studentId && db.data.users.some((user) => user.studentId === values.studentId)) {
      return fail('這個學號已存在');
    }
    if (
      values.employeeId &&
      db.data.users.some((user) => user.employeeId === values.employeeId)
    ) {
      return fail('這個員編已存在');
    }

    const { salt, passwordHash } = hashPassword(password);
    const now = new Date().toISOString();
    db.data.users.push({
      id: crypto.randomUUID(),
      username: values.username,
      passwordHash,
      salt,
      role: values.role,
      name: values.name,
      email: values.email,
      department: values.department,
      studentId: values.studentId || null,
      employeeId: values.employeeId || null,
      createdAt: now,
      updatedAt: now,
    });
    db.save();

    return redirectWith(ctx.res, '/admin/users', {
      ok: `已建立「${values.name}」的帳號`,
    });
  });

  router.post('/admin/users/:id/password', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const target = db.data.users.find((user) => user.id === ctx.params.id);
    const newPassword = ctx.body.get('newPassword') ?? '';

    if (!target) {
      return redirectWith(ctx.res, '/admin/users', { err: '找不到使用者' });
    }
    if (newPassword.length < 6) {
      return redirectWith(ctx.res, '/admin/users', { err: '新密碼至少需要 6 個字元' });
    }

    const { salt, passwordHash } = hashPassword(newPassword);
    target.salt = salt;
    target.passwordHash = passwordHash;
    target.updatedAt = new Date().toISOString();
    db.save();

    return redirectWith(ctx.res, '/admin/users', {
      ok: `已重設「${target.name}」的密碼`,
    });
  });

  router.post('/admin/users/:id/delete', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const target = db.data.users.find((user) => user.id === ctx.params.id);

    if (!target) {
      return redirectWith(ctx.res, '/admin/users', { err: '找不到使用者' });
    }
    if (target.id === ctx.user.id) {
      return redirectWith(ctx.res, '/admin/users', { err: '不可刪除自己的帳號' });
    }

    const result = canDeleteUser(db, target);
    if (!result.ok) {
      return redirectWith(ctx.res, '/admin/users', { err: result.message });
    }

    db.data.users = db.data.users.filter((user) => user.id !== target.id);
    db.data.enrollments = db.data.enrollments.filter(
      (enrollment) => enrollment.studentId !== target.id,
    );
    db.data.announcements = db.data.announcements.filter(
      (announcement) => announcement.authorId !== target.id,
    );
    sessions.destroyUser(target.id);
    db.save();

    return redirectWith(ctx.res, '/admin/users', { ok: `已刪除「${target.name}」` });
  });

  router.get('/admin/courses', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const courses = allCourses(db).map((course) => ({
      course,
      teacherName:
        db.data.users.find((user) => user.id === course.teacherId)?.name ?? '未指派',
      count: enrollmentCount(db, course.id),
    }));

    sendHtml(
      ctx.res,
      adminCourses({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        courses,
      }),
    );
  });

  router.get('/admin/courses/new', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    sendHtml(
      ctx.res,
      adminCourseForm({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        teachers: teachers(db),
        values: { credits: 3, capacity: 50, semester: SEMESTER, open: true },
        action: '/admin/courses',
        heading: '新增課程',
        submitLabel: '建立課程',
      }),
    );
  });

  router.post('/admin/courses', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const result = parseCourseInput(db, ctx.body);

    if (result.error) {
      return sendHtml(
        ctx.res,
        adminCourseForm({
          user: ctx.user,
          csrf: ctx.session.csrf,
          ok: '',
          err: result.error,
          teachers: teachers(db),
          values: result.values,
          action: '/admin/courses',
          heading: '新增課程',
          submitLabel: '建立課程',
        }),
        400,
      );
    }

    db.data.courses.push({
      id: crypto.randomUUID(),
      ...result.data,
      createdAt: new Date().toISOString(),
    });
    db.save();

    return redirectWith(ctx.res, '/admin/courses', {
      ok: `已建立課程「${result.data.name}」`,
    });
  });

  router.get('/admin/courses/:id', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const course = courseById(db, ctx.params.id);

    if (!course) {
      sendHtml(
        ctx.res,
        errorPage({
          status: 404,
          title: '找不到課程',
          message: '這門課程可能已被刪除。',
          user: ctx.user,
          csrf: ctx.session.csrf,
        }),
        404,
      );
      return;
    }

    sendHtml(
      ctx.res,
      adminCourseDetail({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        course,
        roster: enrollmentsForCourse(db, course.id),
        teacherName:
          db.data.users.find((user) => user.id === course.teacherId)?.name ?? '未指派',
      }),
    );
  });

  router.get('/admin/courses/:id/edit', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const course = courseById(db, ctx.params.id);

    if (!course) {
      return redirectWith(ctx.res, '/admin/courses', { err: '找不到課程' });
    }

    sendHtml(
      ctx.res,
      adminCourseForm({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        teachers: teachers(db),
        values: { ...course, scheduleText: scheduleText(course.schedule) },
        action: `/admin/courses/${course.id}`,
        heading: `編輯課程：${course.name}`,
        submitLabel: '儲存變更',
      }),
    );
  });

  router.post('/admin/courses/:id', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const course = courseById(db, ctx.params.id);

    if (!course) {
      return redirectWith(ctx.res, '/admin/courses', { err: '找不到課程' });
    }

    const result = parseCourseInput(db, ctx.body, course.id);
    if (result.error) {
      return sendHtml(
        ctx.res,
        adminCourseForm({
          user: ctx.user,
          csrf: ctx.session.csrf,
          ok: '',
          err: result.error,
          teachers: teachers(db),
          values: result.values,
          action: `/admin/courses/${course.id}`,
          heading: `編輯課程：${course.name}`,
          submitLabel: '儲存變更',
        }),
        400,
      );
    }

    Object.assign(course, result.data, { updatedAt: new Date().toISOString() });
    db.save();

    return redirectWith(ctx.res, '/admin/courses', {
      ok: `已更新課程「${course.name}」`,
    });
  });

  router.post('/admin/courses/:id/toggle', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const course = courseById(db, ctx.params.id);

    if (!course) {
      return redirectWith(ctx.res, '/admin/courses', { err: '找不到課程' });
    }

    course.open = !course.open;
    course.updatedAt = new Date().toISOString();
    db.save();

    return redirectWith(ctx.res, '/admin/courses', {
      ok: `已${course.open ? '開放' : '關閉'}課程「${course.name}」`,
    });
  });

  router.post('/admin/courses/:id/delete', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const course = courseById(db, ctx.params.id);

    if (!course) {
      return redirectWith(ctx.res, '/admin/courses', { err: '找不到課程' });
    }

    db.data.courses = db.data.courses.filter((item) => item.id !== course.id);
    db.data.enrollments = db.data.enrollments.filter(
      (enrollment) => enrollment.courseId !== course.id,
    );
    db.save();

    return redirectWith(ctx.res, '/admin/courses', {
      ok: `已刪除課程「${course.name}」`,
    });
  });

  router.get('/admin/announcements', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    sendHtml(
      ctx.res,
      adminAnnouncements({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        items: announcementsSorted(db),
      }),
    );
  });

  router.get('/admin/announcements/new', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    sendHtml(
      ctx.res,
      adminAnnouncementForm({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        values: {},
        action: '/admin/announcements',
        heading: '新增公告',
        submitLabel: '發布公告',
      }),
    );
  });

  router.post('/admin/announcements', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const title = (ctx.body.get('title') ?? '').trim();
    const content = (ctx.body.get('content') ?? '').trim();

    if (!title || title.length > 120) {
      return redirectWith(ctx.res, '/admin/announcements/new', {
        err: '公告標題不可空白，且長度需在 120 字以內',
      });
    }
    if (!content) {
      return redirectWith(ctx.res, '/admin/announcements/new', { err: '公告內容不可空白' });
    }

    db.data.announcements.push({
      id: crypto.randomUUID(),
      title,
      content,
      authorId: ctx.user.id,
      pinned: ctx.body.get('pinned') === '1',
      createdAt: new Date().toISOString(),
    });
    db.save();

    return redirectWith(ctx.res, '/admin/announcements', { ok: '公告已發布' });
  });

  router.get('/admin/announcements/:id/edit', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const item = findAnnouncement(db, ctx.params.id);

    if (!item) {
      return redirectWith(ctx.res, '/admin/announcements', { err: '找不到公告' });
    }

    sendHtml(
      ctx.res,
      adminAnnouncementForm({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        values: item,
        action: `/admin/announcements/${item.id}`,
        heading: '編輯公告',
        submitLabel: '儲存變更',
      }),
    );
  });

  router.post('/admin/announcements/:id', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const item = findAnnouncement(db, ctx.params.id);

    if (!item) {
      return redirectWith(ctx.res, '/admin/announcements', { err: '找不到公告' });
    }

    const title = (ctx.body.get('title') ?? '').trim();
    const content = (ctx.body.get('content') ?? '').trim();

    if (!title || title.length > 120) {
      return redirectWith(ctx.res, `/admin/announcements/${item.id}/edit`, {
        err: '公告標題不可空白，且長度需在 120 字以內',
      });
    }
    if (!content) {
      return redirectWith(ctx.res, `/admin/announcements/${item.id}/edit`, {
        err: '公告內容不可空白',
      });
    }

    item.title = title;
    item.content = content;
    item.pinned = ctx.body.get('pinned') === '1';
    item.updatedAt = new Date().toISOString();
    db.save();

    return redirectWith(ctx.res, '/admin/announcements', { ok: '公告已更新' });
  });

  router.post('/admin/announcements/:id/delete', (ctx) => {
    if (!requireLogin(ctx, 'admin')) return;
    const item = findAnnouncement(db, ctx.params.id);

    if (!item) {
      return redirectWith(ctx.res, '/admin/announcements', { err: '找不到公告' });
    }

    db.data.announcements = db.data.announcements.filter(
      (announcement) => announcement.id !== item.id,
    );
    db.save();

    return redirectWith(ctx.res, '/admin/announcements', { ok: '公告已刪除' });
  });
}
