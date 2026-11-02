import { SEMESTER } from './config.js';

export function userById(db, id) {
  return db.data.users.find((user) => user.id === id) ?? null;
}

export function userByUsername(db, username) {
  return db.data.users.find((user) => user.username === username) ?? null;
}

export function teachers(db) {
  return db.data.users
    .filter((user) => user.role === 'teacher')
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
}

export function courseById(db, id) {
  return db.data.courses.find((course) => course.id === id) ?? null;
}

export function courseByCode(db, code) {
  return db.data.courses.find((course) => course.code === code) ?? null;
}

export function coursesForTeacher(db, teacherId) {
  return db.data.courses
    .filter((course) => course.teacherId === teacherId)
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function openCourses(db) {
  return db.data.courses
    .filter((course) => course.open && course.semester === SEMESTER)
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function allCourses(db) {
  return [...db.data.courses].sort((a, b) => a.code.localeCompare(b.code));
}

export function enrollmentFor(db, studentId, courseId) {
  return (
    db.data.enrollments.find(
      (enrollment) =>
        enrollment.studentId === studentId && enrollment.courseId === courseId,
    ) ?? null
  );
}

export function enrollmentsForStudent(db, studentId) {
  return db.data.enrollments.filter((enrollment) => enrollment.studentId === studentId);
}

export function enrolledCourses(db, studentId) {
  return enrollmentsForStudent(db, studentId)
    .map((enrollment) => {
      const course = courseById(db, enrollment.courseId);
      return course ? { enrollment, course } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.course.code.localeCompare(b.course.code));
}

export function enrollmentsForCourse(db, courseId) {
  return db.data.enrollments
    .filter((enrollment) => enrollment.courseId === courseId)
    .map((enrollment) => {
      const student = userById(db, enrollment.studentId);
      return student ? { enrollment, student } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.student.studentId ?? '').localeCompare(b.student.studentId ?? ''));
}

export function enrollmentCount(db, courseId) {
  return db.data.enrollments.filter((enrollment) => enrollment.courseId === courseId).length;
}

export function announcementsSorted(db, { authorId = null, limit = null } = {}) {
  let items = [...db.data.announcements];
  if (authorId) {
    items = items.filter((item) => item.authorId === authorId);
  }
  items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  if (limit) items = items.slice(0, limit);
  return items.map((item) => ({
    ...item,
    authorName: userById(db, item.authorId)?.name ?? '已刪除的使用者',
  }));
}

export function gradePoint(score) {
  if (score >= 90) return 4.0;
  if (score >= 85) return 3.7;
  if (score >= 80) return 3.3;
  if (score >= 75) return 3.0;
  if (score >= 70) return 2.7;
  if (score >= 65) return 2.3;
  if (score >= 60) return 2.0;
  if (score >= 50) return 1.0;
  return 0;
}

export function letterGrade(score) {
  if (score === null || score === undefined) return '未評分';
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export function computeStudentStats(db, studentId) {
  const records = enrolledCourses(db, studentId);
  let credits = 0;
  let gradedCredits = 0;
  let weightedScore = 0;
  let weightedPoints = 0;
  let gradedCount = 0;
  let passedCredits = 0;

  for (const { course, enrollment } of records) {
    credits += course.credits;
    if (enrollment.score !== null && enrollment.score !== undefined) {
      gradedCredits += course.credits;
      weightedScore += enrollment.score * course.credits;
      weightedPoints += gradePoint(enrollment.score) * course.credits;
      gradedCount += 1;
      if (enrollment.score >= 60) {
        passedCredits += course.credits;
      }
    }
  }

  return {
    records,
    credits,
    gradedCredits,
    gradedCount,
    passedCredits,
    average: gradedCredits ? weightedScore / gradedCredits : null,
    gpa: gradedCredits ? weightedPoints / gradedCredits : null,
    enrollmentCount: records.length,
  };
}

export function findScheduleConflict(db, studentId, course) {
  const current = enrolledCourses(db, studentId);
  for (const item of current) {
    if (item.course.id === course.id) continue;
    if (item.course.semester !== course.semester) continue;
    for (const slot of course.schedule) {
      for (const other of item.course.schedule) {
        if (
          slot.day === other.day &&
          slot.start <= other.end &&
          slot.end >= other.start
        ) {
          return item.course;
        }
      }
    }
  }
  return null;
}

export function canDeleteUser(db, user) {
  if (user.role === 'teacher') {
    const courses = coursesForTeacher(db, user.id);
    if (courses.length > 0) {
      return { ok: false, message: `教師 ${user.name} 仍有 ${courses.length} 門課程，請先刪除或轉移課程` };
    }
  }
  return { ok: true };
}
