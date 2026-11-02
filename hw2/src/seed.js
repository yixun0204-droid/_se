import crypto from 'node:crypto';
import { hashPassword } from './auth.js';
import { SEMESTER, SEMESTER_LABEL } from './config.js';

const NOW = Date.now();

function daysAgo(days, hour = 9) {
  const date = new Date(NOW - days * 24 * 60 * 60 * 1000);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function makeUser(spec) {
  const { salt, passwordHash } = hashPassword(spec.password);
  const createdAt = daysAgo(spec.daysAgo ?? 120);
  return {
    id: crypto.randomUUID(),
    username: spec.username,
    passwordHash,
    salt,
    role: spec.role,
    name: spec.name,
    email: spec.email ?? '',
    department: spec.department ?? '',
    studentId: spec.studentId ?? null,
    employeeId: spec.employeeId ?? null,
    createdAt,
    updatedAt: createdAt,
  };
}

function schedule(...ranges) {
  return ranges.map(([day, start, end]) => ({ day, start, end }));
}

export function createSeedData() {
  const users = [
    makeUser({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: '陳系統',
      email: 'admin@nqu.edu.tw',
      department: '教務處',
      employeeId: 'A0001',
      daysAgo: 400,
    }),
    makeUser({
      username: 'teacher1',
      password: 'teacher123',
      role: 'teacher',
      name: '王大明',
      email: 'wang@nqu.edu.tw',
      department: '資訊工程學系',
      employeeId: 'T1001',
      daysAgo: 380,
    }),
    makeUser({
      username: 'teacher2',
      password: 'teacher123',
      role: 'teacher',
      name: '李美華',
      email: 'lee@nqu.edu.tw',
      department: '資訊工程學系',
      employeeId: 'T1002',
      daysAgo: 350,
    }),
    makeUser({
      username: 'student1',
      password: 'student123',
      role: 'student',
      name: '楊宜勛',
      email: 's111410553@nqu.edu.tw',
      department: '資訊工程學系',
      studentId: '111410553',
      daysAgo: 300,
    }),
    makeUser({
      username: 'student2',
      password: 'student123',
      role: 'student',
      name: '陳小華',
      email: 's111410001@nqu.edu.tw',
      department: '資訊工程學系',
      studentId: '111410001',
      daysAgo: 280,
    }),
    makeUser({
      username: 'student3',
      password: 'student123',
      role: 'student',
      name: '林怡君',
      email: 's111410002@nqu.edu.tw',
      department: '企業管理學系',
      studentId: '111410002',
      daysAgo: 260,
    }),
  ];

  const byUsername = Object.fromEntries(users.map((user) => [user.username, user]));

  const courseDefs = [
    {
      code: 'CS101',
      name: '程式設計(一)',
      teacher: 'teacher1',
      credits: 3,
      capacity: 50,
      room: 'E101',
      schedule: schedule([1, 1, 2], [3, 3, 4]),
      description: '以 Python 為主要語言，介紹變數、流程控制、函式、檔案處理與基礎資料結構。',
    },
    {
      code: 'CS102',
      name: '資料結構',
      teacher: 'teacher1',
      credits: 3,
      capacity: 45,
      room: 'E202',
      schedule: schedule([2, 3, 4], [4, 1, 2]),
      description: '介紹陣列、鏈結串列、堆疊、佇列、樹與圖等資料結構及其實作。',
    },
    {
      code: 'CS103',
      name: '計算機概論',
      teacher: 'teacher2',
      credits: 2,
      capacity: 60,
      room: 'E203',
      schedule: schedule([1, 1, 2]),
      description: '計算機組織、作業系統、網路與資訊倫理的基礎導論。',
    },
    {
      code: 'CS201',
      name: '資料庫系統',
      teacher: 'teacher2',
      credits: 3,
      capacity: 40,
      room: 'E303',
      schedule: schedule([3, 6, 7], [5, 2, 3]),
      description: '關聯式資料模型、SQL、正規化、交易處理與資料庫設計實務。',
    },
    {
      code: 'CS301',
      name: '網頁程式設計',
      teacher: 'teacher2',
      credits: 2,
      capacity: 35,
      room: 'E404',
      schedule: schedule([4, 6, 7]),
      description: 'HTML、CSS、JavaScript 與伺服器端渲染網頁應用開發。',
    },
    {
      code: 'GE101',
      name: '金門學概論',
      teacher: 'teacher1',
      credits: 2,
      capacity: 80,
      room: 'H101',
      schedule: schedule([1, 6, 7]),
      description: '從歷史、文化、生態與產業認識金門，培養在地關懷與跨域視野。',
    },
    {
      code: 'BA101',
      name: '管理學',
      teacher: 'teacher2',
      credits: 3,
      capacity: 70,
      room: 'B201',
      schedule: schedule([2, 6, 7], [4, 8, 9]),
      description: '管理功能、組織行為、策略管理與企業個案分析。',
    },
    {
      code: 'CS401',
      name: '人工智慧導論',
      teacher: 'teacher1',
      credits: 3,
      capacity: 30,
      room: 'E505',
      schedule: schedule([5, 6, 8]),
      description: '搜尋、機器學習、類神經網路與生成式 AI 的基本概念與應用。',
    },
    {
      code: 'PE101',
      name: '體育(一)',
      teacher: 'teacher2',
      credits: 1,
      capacity: 60,
      room: 'H201',
      schedule: schedule([1, 8, 8]),
      description: '體適能檢測、基本運動技能與運動安全教育。',
    },
    {
      code: 'CS302',
      name: '作業系統',
      teacher: 'teacher1',
      credits: 3,
      capacity: 40,
      room: 'E303',
      schedule: schedule([2, 1, 2], [4, 3, 4]),
      description: '行程管理、記憶體管理、檔案系統與同步機制。',
    },
  ];

  const courses = courseDefs.map((course, index) => ({
    id: crypto.randomUUID(),
    code: course.code,
    name: course.name,
    teacherId: byUsername[course.teacher].id,
    credits: course.credits,
    capacity: course.capacity,
    semester: SEMESTER,
    room: course.room,
    schedule: course.schedule,
    description: course.description,
    open: true,
    createdAt: daysAgo(200 - index),
  }));

  const byCode = Object.fromEntries(courses.map((course) => [course.code, course]));
  let enrollmentIndex = 0;

  function enrollment(username, code, score, days) {
    enrollmentIndex += 1;
    return {
      id: crypto.randomUUID(),
      courseId: byCode[code].id,
      studentId: byUsername[username].id,
      semester: SEMESTER,
      score,
      createdAt: daysAgo(days ?? 90 - enrollmentIndex),
    };
  }

  const enrollments = [
    enrollment('student1', 'CS101', 88, 60),
    enrollment('student1', 'CS301', null, 55),
    enrollment('student1', 'GE101', 92, 50),
    enrollment('student2', 'CS101', 75, 48),
    enrollment('student2', 'CS102', null, 47),
    enrollment('student3', 'BA101', 81, 40),
    enrollment('student3', 'GE101', null, 39),
  ];

  function announcement(title, content, author, { pinned = false, days = 1 } = {}) {
    return {
      id: crypto.randomUUID(),
      title,
      content,
      authorId: byUsername[author].id,
      pinned,
      createdAt: daysAgo(days, 10),
    };
  }

  const announcements = [
    announcement(
      '115 學年度第 1 學期加退選作業說明',
      '加退選期間自開學日起兩週內辦理，請同學於線上系統完成選課。欲退選已達人數上限之課程，請洽教務處課務組。',
      'admin',
      { pinned: true, days: 2 },
    ),
    announcement(
      '期中考試週日程公告',
      '本學期期中考試週為第 9 週，請同學留意各課程授課教師公告之考試時間與地點，並提早準備。',
      'admin',
      { days: 5 },
    ),
    announcement(
      '程式設計(一) 第一次作業',
      '請於下週三前繳交第一次程式作業，題目與繳交方式已公布於課程頁面。遲交將酌予扣分。',
      'teacher1',
      { days: 3 },
    ),
    announcement(
      '資料庫系統課程調整通知',
      '本週五第 2、3 節課程改至電腦教室 E303 上課，進行 SQL 實作練習，請同學準時出席。',
      'teacher2',
      { days: 1 },
    ),
  ];

  return {
    meta: {
      semester: SEMESTER,
      semesterLabel: SEMESTER_LABEL,
      seededAt: new Date(NOW).toISOString(),
    },
    users,
    courses,
    enrollments,
    announcements,
  };
}
