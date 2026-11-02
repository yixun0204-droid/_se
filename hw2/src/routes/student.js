import crypto from 'node:crypto';
import { SEMESTER } from '../config.js';
import { redirectWith, sendHtml } from '../http.js';
import {
  announcementsSorted,
  computeStudentStats,
  courseById,
  enrolledCourses,
  enrollmentCount,
  enrollmentFor,
  findScheduleConflict,
  openCourses,
  userById,
} from '../repo.js';
import {
  studentAnnouncementDetail,
  studentAnnouncements,
  studentCourses,
  studentDashboard,
  studentGrades,
  studentProfile,
  studentSchedule,
} from '../views/student.js';
import { errorPage } from '../views/errors.js';
import { requireLogin } from './guards.js';

function taiwanWeekday() {
  const shifted = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return shifted.getUTCDay();
}

function teacherName(db, course) {
  return userById(db, course.teacherId)?.name ?? '未指派';
}

export function registerStudentRoutes(router, { db }) {
  router.get('/student', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const stats = computeStudentStats(db, ctx.user.id);
    const todayDay = taiwanWeekday();
    const todayItems = stats.records
      .filter(({ course }) => course.schedule.some((slot) => slot.day === todayDay))
      .map((item) => ({ ...item, teacherName: teacherName(db, item.course) }));
    const announcements = announcementsSorted(db, { limit: 3 });

    sendHtml(
      ctx.res,
      studentDashboard({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        stats,
        todayItems,
        todayDay,
        announcements,
      }),
    );
  });

  router.get('/student/courses', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const query = (ctx.url.searchParams.get('q') ?? '').trim();
    const lowered = query.toLowerCase();
    const enrolledIds = new Set(
      enrolledCourses(db, ctx.user.id).map(({ course }) => course.id),
    );

    let courses = openCourses(db).map((course) => {
      const count = enrollmentCount(db, course.id);
      const enrolled = enrolledIds.has(course.id);
      const conflict = enrolled ? null : findScheduleConflict(db, ctx.user.id, course);
      return {
        course,
        teacherName: teacherName(db, course),
        count,
        enrolled,
        full: count >= course.capacity,
        conflictName: conflict?.name ?? null,
      };
    });

    if (lowered) {
      courses = courses.filter(({ course, teacherName: name }) =>
        [course.code, course.name, name].some((text) =>
          text.toLowerCase().includes(lowered),
        ),
      );
    }

    sendHtml(
      ctx.res,
      studentCourses({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        courses,
        query,
        enrolledCount: enrolledIds.size,
      }),
    );
  });

  router.post('/student/courses/:id/enroll', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const course = courseById(db, ctx.params.id);

    if (!course || course.semester !== SEMESTER) {
      return redirectWith(ctx.res, '/student/courses', { err: '找不到這門課程' });
    }
    if (!course.open) {
      return redirectWith(ctx.res, '/student/courses', { err: '這門課程目前未開放選課' });
    }
    if (enrollmentFor(db, ctx.user.id, course.id)) {
      return redirectWith(ctx.res, '/student/courses', { err: '您已經選過這門課程' });
    }

    const count = enrollmentCount(db, course.id);
    if (count >= course.capacity) {
      return redirectWith(ctx.res, '/student/courses', { err: '這門課程已經額滿' });
    }

    const conflict = findScheduleConflict(db, ctx.user.id, course);
    if (conflict) {
      return redirectWith(ctx.res, '/student/courses', {
        err: `與「${conflict.name}」上課時間衝堂，無法選課`,
      });
    }

    db.data.enrollments.push({
      id: crypto.randomUUID(),
      courseId: course.id,
      studentId: ctx.user.id,
      semester: course.semester,
      score: null,
      createdAt: new Date().toISOString(),
    });
    db.save();

    return redirectWith(ctx.res, '/student/courses', { ok: `已成功選上「${course.name}」` });
  });

  router.post('/student/courses/:id/drop', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const enrollment = enrollmentFor(db, ctx.user.id, ctx.params.id);

    if (!enrollment) {
      return redirectWith(ctx.res, '/student/courses', { err: '您沒有選這門課程' });
    }
    if (enrollment.score !== null && enrollment.score !== undefined) {
      return redirectWith(ctx.res, '/student/courses', {
        err: '這門課程已有成績，無法退選',
      });
    }

    const index = db.data.enrollments.findIndex((item) => item.id === enrollment.id);
    db.data.enrollments.splice(index, 1);
    db.save();

    return redirectWith(ctx.res, '/student/courses', { ok: '已退選課程' });
  });

  router.get('/student/schedule', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const items = enrolledCourses(db, ctx.user.id).map((item) => ({
      ...item,
      teacherName: teacherName(db, item.course),
    }));

    sendHtml(
      ctx.res,
      studentSchedule({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        items,
        todayDay: taiwanWeekday(),
      }),
    );
  });

  router.get('/student/grades', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const stats = computeStudentStats(db, ctx.user.id);
    sendHtml(
      ctx.res,
      studentGrades({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        stats,
      }),
    );
  });

  router.get('/student/profile', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const stats = computeStudentStats(db, ctx.user.id);
    sendHtml(
      ctx.res,
      studentProfile({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        stats,
      }),
    );
  });

  router.get('/student/announcements', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    sendHtml(
      ctx.res,
      studentAnnouncements({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        items: announcementsSorted(db),
      }),
    );
  });

  router.get('/student/announcements/:id', (ctx) => {
    if (!requireLogin(ctx, 'student')) return;
    const item = announcementsSorted(db).find(
      (announcement) => announcement.id === ctx.params.id,
    );

    if (!item) {
      sendHtml(
        ctx.res,
        errorPage({
          status: 404,
          title: '找不到公告',
          message: '這則公告可能已被刪除。',
          user: ctx.user,
          csrf: ctx.session.csrf,
        }),
        404,
      );
      return;
    }

    sendHtml(
      ctx.res,
      studentAnnouncementDetail({
        user: ctx.user,
        csrf: ctx.session.csrf,
        ok: ctx.ok,
        err: ctx.err,
        item,
      }),
    );
  });
}
