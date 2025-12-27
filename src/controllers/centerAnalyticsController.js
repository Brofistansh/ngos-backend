const { Op } = require("sequelize");
const Student = require("../models/sequelize/Student");
const StudentPerformanceReport = require("../models/sequelize/StudentPerformanceReport");
const StudentAttendanceBulk = require("../models/sequelize/StudentAttendanceBulk");

exports.getCenterAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { class: classFilter, month, year } = req.query;

    /* ---------------- STUDENTS ---------------- */
    const studentWhere = { center_id: centerId };
    if (classFilter) studentWhere.current_class = classFilter;

    const students = await Student.findAll({ where: studentWhere });

    if (students.length === 0) {
      return res.json({ message: "No students found for center" });
    }

    const studentIds = students.map(s => s.id);
    const studentMap = {};
    students.forEach(s => {
      studentMap[s.id] = s;
    });

    /* ---------------- DATE FILTER ---------------- */
    let dateWhere = {};
    let monthLabel = null;

    if (month && year) {
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-31`;
      dateWhere = {
        test_date: { [Op.between]: [start, end] }
      };
      monthLabel = new Date(start).toLocaleString("default", {
        month: "short",
        year: "numeric"
      });
    }

    /* ---------------- PERFORMANCE ---------------- */
    const reports = await StudentPerformanceReport.findAll({
      where: {
        student_id: studentIds,
        ...dateWhere
      },
      order: [["test_date", "ASC"]]
    });

    if (reports.length === 0) {
      return res.json({ message: "No performance data found" });
    }

    /* -------- CENTER AVERAGE & TREND -------- */
    const monthBuckets = {};
    const subjectTotals = {};
    const subjectCounts = {};
    const studentLatest = {};

    reports.forEach(r => {
      const monthKey = new Date(r.test_date).toLocaleString("default", {
        month: "short"
      });

      monthBuckets[monthKey] = monthBuckets[monthKey] || [];
      monthBuckets[monthKey].push(r.percentage);

      Object.entries(r.parameters).forEach(([sub, obj]) => {
        subjectTotals[sub] = (subjectTotals[sub] || 0) + obj.scored;
        subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
      });

      studentLatest[r.student_id] = r;
    });

    const trendLabels = Object.keys(monthBuckets);
    const trendValues = trendLabels.map(m =>
      Number(
        (
          monthBuckets[m].reduce((a, b) => a + b, 0) /
          monthBuckets[m].length
        ).toFixed(1)
      )
    );

    const subjectLabels = Object.keys(subjectTotals);
    const subjectAverages = subjectLabels.map(
      s => Number((subjectTotals[s] / subjectCounts[s]).toFixed(1))
    );

    const minAvg = Math.min(...subjectAverages);
    const weakSubjects = subjectLabels.filter(
      (_, i) => subjectAverages[i] === minAvg
    );

    /* ---------------- STUDENT RANKING ---------------- */
    const ranked = Object.values(studentLatest)
      .map(r => {
        const s = studentMap[r.student_id];
        return {
          roll_no: s.roll_no,
          name: [s.first_name, s.last_name].filter(Boolean).join(" "),
          percentage: r.percentage
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    /* ---------------- ATTENDANCE ---------------- */
    const attendanceDays = await StudentAttendanceBulk.findAll({
      where: { center_id: centerId }
    });

    let present = 0;
    let total = 0;

    attendanceDays.forEach(d => {
      d.records.forEach(r => {
        if (students.find(s => s.roll_no === r.roll_no)) {
          total++;
          if (r.status === "present") present++;
        }
      });
    });

    /* ---------------- RESPONSE ---------------- */
    res.json({
      center: {
        center_id: centerId,
        class: classFilter || null,
        month: monthLabel
      },

      summary: {
        total_students: students.length,
        average_percentage:
          trendValues.length > 0
            ? trendValues[trendValues.length - 1]
            : null,
        attendance_average:
          total > 0 ? Number(((present / total) * 100).toFixed(1)) : null
      },

      performance: {
        trend: {
          labels: trendLabels,
          values: trendValues
        },
        subjects: {
          labels: subjectLabels,
          averages: subjectAverages,
          weak_subjects: weakSubjects
        }
      },

      students: {
        top: ranked.slice(0, 5),
        bottom: ranked.slice(-5)
      }
    });

  } catch (err) {
    console.error("Center Analytics Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
