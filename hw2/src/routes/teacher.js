import crypto from 'node:crypto';
import { redirect, redirectWith, sendHtml } from '../http.js';
import {
  announcementsSorted,
  courseById,
  coursesForTeacher,
  enrollmentCount,
  enrollmentsForCourse,
} from '../repo.js';
import {
  teacherAnnouncementForm,
  teacherAnnouncements,
  teacherCourseDetail,
  teacherCourses,
  teacherDashboard,
} from '../views/teacher.js';
import { errorPage } from '../views/errors.js';
import { requireLogin } from './guards.js';

function ownedCourse(db, courseId, teacherId) {
  const course = courseById(db, courseId);
  if (!course || course.teacherId !== teacherId) return null;
  return course;
}

export function registerTeacherRoutes(router, { db }) {
  router.get('/teacher', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    const courses = coursesForTeacher(db, ctx.user.id).map((course) => ({
      course,
      count: enrollmentCount(db, course.id),
    }));
    const totalStudents = courses.reduce((sum, item) => sum + item.count, 0);
    const myAnnouncements = announcementsSorted(db, { authorId: ctx.user.id });

    sendHtml(
      ctx.res,
      teacherDashboard({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        courses,
        totalStudents,
        announcementCount: myAnnouncements.length,
        announcements: myAnnouncements.slice(0, 4),
      }),
    );
  });

  router.get('/teacher/courses', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    const courses = coursesForTeacher(db, ctx.user.id).map((course) => ({
      course,
      count: enrollmentCount(db, course.id),
    }));

    sendHtml(
      ctx.res,
      teacherCourses({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        courses,
      }),
    );
  });

  router.get('/teacher/courses/:id', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    const course = ownedCourse(db, ctx.params.id, ctx.user.id);

    if (!course) {
      sendHtml(
        ctx.res,
        errorPage({
          status: 404,
          title: '找不到課程',
          message: '這門課程不存在，或不屬於您的授課課程。',
          user: ctx.user,
          csrf: ctx.session.csrf,
        }),
        404,
      );
      return;
    }

    sendHtml(
      ctx.res,
      teacherCourseDetail({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        course,
        roster: enrollmentsForCourse(db, course.id),
      }),
    );
  });

  router.post('/teacher/courses/:id/grades', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    const course = ownedCourse(db, ctx.params.id, ctx.user.id);

    if (!course) {
      return redirectWith(ctx.res, '/teacher/courses', { err: '找不到課程' });
    }

    const roster = enrollmentsForCourse(db, course.id);
    const updates = [];
    let error = null;

    for (const { enrollment, student } of roster) {
      const raw = ctx.body.get(`score:${enrollment.id}`);
      if (raw === null || raw === undefined) continue;
      const trimmed = raw.trim();

      if (trimmed === '') {
        updates.push({ enrollment, score: null });
        continue;
      }

      const score = Number(trimmed);
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        error = `「${student.name}」的分數必須介於 0 到 100`;
        break;
      }
      updates.push({ enrollment, score });
    }

    if (error) {
      return redirectWith(ctx.res, `/teacher/courses/${course.id}`, { err: error });
    }

    const now = new Date().toISOString();
    for (const update of updates) {
      update.enrollment.score = update.score;
      update.enrollment.updatedAt = now;
    }
    db.save();

    return redirectWith(ctx.res, `/teacher/courses/${course.id}`, {
      ok: `已儲存 ${updates.length} 筆成績`,
    });
  });

  router.get('/teacher/announcements', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    sendHtml(
      ctx.res,
      teacherAnnouncements({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        items: announcementsSorted(db, { authorId: ctx.user.id }),
      }),
    );
  });

  router.get('/teacher/announcements/new', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    sendHtml(
      ctx.res,
      teacherAnnouncementForm({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
      }),
    );
  });

  router.post('/teacher/announcements', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    const title = (ctx.body.get('title') ?? '').trim();
    const content = (ctx.body.get('content') ?? '').trim();

    if (!title || title.length > 120) {
      return redirectWith(ctx.res, '/teacher/announcements/new', {
        err: '公告標題不可空白，且長度需在 120 字以內',
      });
    }
    if (!content) {
      return redirectWith(ctx.res, '/teacher/announcements/new', { err: '公告內容不可空白' });
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

    return redirectWith(ctx.res, '/teacher/announcements', { ok: '公告已發布' });
  });

  router.post('/teacher/announcements/:id/delete', (ctx) => {
    if (!requireLogin(ctx, 'teacher')) return;
    const item = db.data.announcements.find(
      (announcement) =>
        announcement.id === ctx.params.id && announcement.authorId === ctx.user.id,
    );

    if (!item) {
      return redirectWith(ctx.res, '/teacher/announcements', {
        err: '找不到公告，或您無權刪除',
      });
    }

    const index = db.data.announcements.findIndex((announcement) => announcement.id === item.id);
    db.data.announcements.splice(index, 1);
    db.save();

    return redirect(ctx.res, '/teacher/announcements');
  });
}
