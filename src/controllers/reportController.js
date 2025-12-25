// src/controllers/reportController.js
const { Op } = require('sequelize');
const Attendance = require('../models/sequelize/Attendance');
const StudentAttendance = require('../models/sequelize/StudentAttendance');

/* ---------- helper utils ---------- */

function yyyyMmToRange(year, month) {
  // month is 1-12
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const start = new Date(Date.UTC(y, m - 1, 1));
  // next month start, then subtract one day for end
  const next = new Date(Date.UTC(y, m % 12, 1));
  if (m === 12) next.setUTCFullYear(y + 1, 0, 1);
  // end is last day of month in UTC
  const end = new Date(next.getTime() - 1); // last millisecond of previous month
  // convert to YYYY-MM-DD strings (server uses DATEONLY)
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const startStr = `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}`;
  const endStr = `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`;
  return { startStr, endStr, startDate: start, endDate: end };
}

function listDatesInRange(startDate, endDate) {
  const list = [];
  const cur = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  while (cur <= end) {
    const y = cur.getUTCFullYear(), m = cur.getUTCMonth() + 1, d = cur.getUTCDate();
    const pad = n => (n < 10 ? '0' + n : '' + n);
    list.push(`${y}-${pad(m)}-${pad(d)}`);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return list;
}

async function groupedCountsByDate(model, where, dateField = 'date') {
  // returns map date -> { present, absent, late, excused? }
  const sequelize = model.sequelize;
  const rows = await model.findAll({
    where,
    attributes: [
      dateField,
      'status',
      [sequelize.fn('count', sequelize.col('id')), 'count']
    ],
    group: [dateField, 'status'],
    raw: true
  });

  const map = {}; // date -> { present: n, absent: n, late: n, excused: n }
  rows.forEach(r => {
    const d = r[dateField];
    const s = r.status;
    const c = parseInt(r.count, 10) || 0;
    if (!map[d]) map[d] = { present: 0, absent: 0, late: 0, excused: 0 };
    map[d][s] = (map[d][s] || 0) + c;
  });
  return map;
}

/* ---------- previous daily summary functions (kept for compatibility) ---------- */

async function groupedCounts(model, where) {
  const rows = await model.findAll({
    where,
    attributes: ['status', [model.sequelize.fn('count', model.sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true
  });

  const out = { present: 0, absent: 0, late: 0, excused: 0 };
  rows.forEach(r => {
    const s = r.status;
    const c = parseInt(r.count, 10) || 0;
    out[s] = (out[s] || 0) + c;
  });
  return out;
}

exports.centerDailySummary = async (req, res) => {
  try {
    const { center_id } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const userWhere = { center_id, date };
    const teacherCounts = await groupedCounts(Attendance, userWhere);

    const studentWhere = { center_id, date };
    const studentCounts = await groupedCounts(StudentAttendance, studentWhere);

    const userTotal = (teacherCounts.present || 0) + (teacherCounts.absent || 0) + (teacherCounts.late || 0);
    const studentTotal = (studentCounts.present || 0) + (studentCounts.absent || 0) + (studentCounts.late || 0) + (studentCounts.excused || 0);

    const safePercent = (counts, total) => total ? {
      present: Math.round((counts.present / total) * 10000) / 100,
      absent: Math.round((counts.absent / total) * 10000) / 100,
      late: Math.round((counts.late / total) * 10000) / 100,
      excused: Math.round((counts.excused / total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0, excused: 0 };

    return res.json({
      center_id,
      date,
      teachers: {
        counts: teacherCounts,
        total: userTotal,
        percent: safePercent(teacherCounts, userTotal)
      },
      students: {
        counts: studentCounts,
        total: studentTotal,
        percent: safePercent(studentCounts, studentTotal)
      }
    });

  } catch (err) {
    console.error('centerDailySummary error', err);
    return res.status(500).json({ message: 'Error generating center daily summary' });
  }
};


exports.ngoDailySummary = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const userWhere = { ngo_id, date };
    const teacherCounts = await groupedCounts(Attendance, userWhere);

    const studentWhere = { ngo_id, date };
    const studentCounts = await groupedCounts(StudentAttendance, studentWhere);

    const userTotal = (teacherCounts.present || 0) + (teacherCounts.absent || 0) + (teacherCounts.late || 0);
    const studentTotal = (studentCounts.present || 0) + (studentCounts.absent || 0) + (studentCounts.late || 0) + (studentCounts.excused || 0);

    const safePercent = (counts, total) => total ? {
      present: Math.round((counts.present / total) * 10000) / 100,
      absent: Math.round((counts.absent / total) * 10000) / 100,
      late: Math.round((counts.late / total) * 10000) / 100,
      excused: Math.round((counts.excused / total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0, excused: 0 };

    return res.json({
      ngo_id,
      date,
      teachers: {
        counts: teacherCounts,
        total: userTotal,
        percent: safePercent(teacherCounts, userTotal)
      },
      students: {
        counts: studentCounts,
        total: studentTotal,
        percent: safePercent(studentCounts, studentTotal)
      }
    });

  } catch (err) {
    console.error('ngoDailySummary error', err);
    return res.status(500).json({ message: 'Error generating NGO daily summary' });
  }
};


/* ---------- NEW: Monthly reports (separate teacher/student flows) ---------- */

/**
 * GET /reports/center/:center_id/monthly/teachers?year=YYYY&month=MM
 */
exports.centerMonthlyTeachers = async (req, res) => {
  try {
    const { center_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);

    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    // get daily grouped counts for the range
    const where = { center_id, date: { [Op.between]: [startStr, endStr] } };
    const map = await groupedCountsByDate(Attendance, where, 'date');

    // build daily_breakdown with zeros if missing
    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { present: 0, absent: 0, late: 0, excused: 0 };
      const total = entry.present + entry.absent + entry.late;
      return { date: d, present: entry.present, absent: entry.absent, late: entry.late, total };
    });

    // totals
    const totals = daily_breakdown.reduce((acc, cur) => {
      acc.present += cur.present;
      acc.absent += cur.absent;
      acc.late += cur.late;
      acc.total += cur.total;
      return acc;
    }, { present: 0, absent: 0, late: 0, total: 0 });

    const percentages = totals.total ? {
      present: Math.round((totals.present / totals.total) * 10000) / 100,
      absent: Math.round((totals.absent / totals.total) * 10000) / 100,
      late: Math.round((totals.late / totals.total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0 };

    return res.json({
      center_id,
      period: `${year}-${String(month).padStart(2, '0')}`,
      present: totals.present,
      absent: totals.absent,
      late: totals.late,
      total_days: dates.length,
      daily_breakdown,
      percentages
    });

  } catch (err) {
    console.error('centerMonthlyTeachers error', err);
    return res.status(500).json({ message: 'Error generating center monthly teacher report' });
  }
};


/**
 * GET /reports/center/:center_id/monthly/students?year=YYYY&month=MM
 */
exports.centerMonthlyStudents = async (req, res) => {
  try {
    const { center_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);

    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { center_id, date: { [Op.between]: [startStr, endStr] } };
    const map = await groupedCountsByDate(StudentAttendance, where, 'date');

    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { present: 0, absent: 0, late: 0, excused: 0 };
      const total = entry.present + entry.absent + entry.late + entry.excused;
      return { date: d, present: entry.present, absent: entry.absent, late: entry.late, excused: entry.excused, total };
    });

    const totals = daily_breakdown.reduce((acc, cur) => {
      acc.present += cur.present;
      acc.absent += cur.absent;
      acc.late += cur.late;
      acc.excused += cur.excused;
      acc.total += cur.total;
      return acc;
    }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });

    const percentages = totals.total ? {
      present: Math.round((totals.present / totals.total) * 10000) / 100,
      absent: Math.round((totals.absent / totals.total) * 10000) / 100,
      late: Math.round((totals.late / totals.total) * 10000) / 100,
      excused: Math.round((totals.excused / totals.total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0, excused: 0 };

    return res.json({
      center_id,
      period: `${year}-${String(month).padStart(2, '0')}`,
      present: totals.present,
      absent: totals.absent,
      late: totals.late,
      excused: totals.excused,
      total_days: dates.length,
      daily_breakdown,
      percentages
    });

  } catch (err) {
    console.error('centerMonthlyStudents error', err);
    return res.status(500).json({ message: 'Error generating center monthly student report' });
  }
};


/* ---------- NGO monthly (teachers & students) ---------- */

exports.ngoMonthlyTeachers = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);
    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { ngo_id, date: { [Op.between]: [startStr, endStr] } };
    const map = await groupedCountsByDate(Attendance, where, 'date');

    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { present: 0, absent: 0, late: 0, excused: 0 };
      const total = entry.present + entry.absent + entry.late;
      return { date: d, present: entry.present, absent: entry.absent, late: entry.late, total };
    });

    const totals = daily_breakdown.reduce((acc, cur) => {
      acc.present += cur.present;
      acc.absent += cur.absent;
      acc.late += cur.late;
      acc.total += cur.total;
      return acc;
    }, { present: 0, absent: 0, late: 0, total: 0 });

    const percentages = totals.total ? {
      present: Math.round((totals.present / totals.total) * 10000) / 100,
      absent: Math.round((totals.absent / totals.total) * 10000) / 100,
      late: Math.round((totals.late / totals.total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0 };

    return res.json({
      ngo_id,
      period: `${year}-${String(month).padStart(2, '0')}`,
      present: totals.present,
      absent: totals.absent,
      late: totals.late,
      total_days: dates.length,
      daily_breakdown,
      percentages
    });

  } catch (err) {
    console.error('ngoMonthlyTeachers error', err);
    return res.status(500).json({ message: 'Error generating NGO monthly teacher report' });
  }
};


exports.ngoMonthlyStudents = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);
    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { ngo_id, date: { [Op.between]: [startStr, endStr] } };
    const map = await groupedCountsByDate(StudentAttendance, where, 'date');

    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { present: 0, absent: 0, late: 0, excused: 0 };
      const total = entry.present + entry.absent + entry.late + entry.excused;
      return { date: d, present: entry.present, absent: entry.absent, late: entry.late, excused: entry.excused, total };
    });

    const totals = daily_breakdown.reduce((acc, cur) => {
      acc.present += cur.present;
      acc.absent += cur.absent;
      acc.late += cur.late;
      acc.excused += cur.excused;
      acc.total += cur.total;
      return acc;
    }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });

    const percentages = totals.total ? {
      present: Math.round((totals.present / totals.total) * 10000) / 100,
      absent: Math.round((totals.absent / totals.total) * 10000) / 100,
      late: Math.round((totals.late / totals.total) * 10000) / 100,
      excused: Math.round((totals.excused / totals.total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0, excused: 0 };

    return res.json({
      ngo_id,
      period: `${year}-${String(month).padStart(2, '0')}`,
      present: totals.present,
      absent: totals.absent,
      late: totals.late,
      excused: totals.excused,
      total_days: dates.length,
      daily_breakdown,
      percentages
    });

  } catch (err) {
    console.error('ngoMonthlyStudents error', err);
    return res.status(500).json({ message: 'Error generating NGO monthly student report' });
  }
};


/* ---------- Optional: user/student monthly endpoints ---------- */

exports.userMonthly = async (req, res) => {
  try {
    const { user_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);
    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { user_id, date: { [Op.between]: [startStr, endStr] } };
    const map = await groupedCountsByDate(Attendance, where, 'date');

    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { present: 0, absent: 0, late: 0 };
      const total = entry.present + entry.absent + entry.late;
      return { date: d, present: entry.present, absent: entry.absent, late: entry.late, total };
    });

    const totals = daily_breakdown.reduce((acc, cur) => {
      acc.present += cur.present;
      acc.absent += cur.absent;
      acc.late += cur.late;
      acc.total += cur.total;
      return acc;
    }, { present: 0, absent: 0, late: 0, total: 0 });

    const percentages = totals.total ? {
      present: Math.round((totals.present / totals.total) * 10000) / 100,
      absent: Math.round((totals.absent / totals.total) * 10000) / 100,
      late: Math.round((totals.late / totals.total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0 };

    return res.json({
      user_id,
      period: `${year}-${String(month).padStart(2, '0')}`,
      present: totals.present,
      absent: totals.absent,
      late: totals.late,
      total_days: dates.length,
      daily_breakdown,
      percentages
    });
  } catch (err) {
    console.error('userMonthly error', err);
    return res.status(500).json({ message: 'Error generating user monthly report' });
  }
};

exports.studentMonthly = async (req, res) => {
  try {
    const { student_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);
    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { student_id, date: { [Op.between]: [startStr, endStr] } };
    const map = await groupedCountsByDate(StudentAttendance, where, 'date');

    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { present: 0, absent: 0, late: 0, excused: 0 };
      const total = entry.present + entry.absent + entry.late + entry.excused;
      return { date: d, present: entry.present, absent: entry.absent, late: entry.late, excused: entry.excused, total };
    });

    const totals = daily_breakdown.reduce((acc, cur) => {
      acc.present += cur.present;
      acc.absent += cur.absent;
      acc.late += cur.late;
      acc.excused += cur.excused;
      acc.total += cur.total;
      return acc;
    }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });

    const percentages = totals.total ? {
      present: Math.round((totals.present / totals.total) * 10000) / 100,
      absent: Math.round((totals.absent / totals.total) * 10000) / 100,
      late: Math.round((totals.late / totals.total) * 10000) / 100,
      excused: Math.round((totals.excused / totals.total) * 10000) / 100
    } : { present: 0, absent: 0, late: 0, excused: 0 };

    return res.json({
      student_id,
      period: `${year}-${String(month).padStart(2, '0')}`,
      present: totals.present,
      absent: totals.absent,
      late: totals.late,
      excused: totals.excused,
      total_days: dates.length,
      daily_breakdown,
      percentages
    });

  } catch (err) {
    console.error('studentMonthly error', err);
    return res.status(500).json({ message: 'Error generating student monthly report' });
  }
};
