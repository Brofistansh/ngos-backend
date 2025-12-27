const { Op } = require("sequelize");
const Student = require("../models/sequelize/Student");
const StudentPerformanceReport = require("../models/sequelize/StudentPerformanceReport");
const StudentAttendanceBulk = require("../models/sequelize/StudentAttendanceBulk");

/* ================= UTIL ================= */
const getTrendLabel = (diff) => {
  if (diff > 1) return "improving";
  if (diff < -1) return "declining";
  return "stable";
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { rollNo } = req.params;

    /* ---------------- STUDENT ---------------- */
    const student = await Student.findOne({
      where: { roll_no: rollNo }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    /* ---------------- PERFORMANCE ---------------- */
    const reports = await StudentPerformanceReport.findAll({
      where: { student_id: student.id },
      order: [["test_date", "ASC"]]
    });

    let performance = null;
    let performancePrediction = null;

    if (reports.length > 0) {
      const latest = reports[reports.length - 1];
      const secondLast = reports[reports.length - 2];

      const labels = reports.map(r =>
        new Date(r.test_date).toLocaleString("default", { month: "short" })
      );
      const values = reports.map(r => r.percentage);

      const subjectTotals = {};
      const subjectCounts = {};

      reports.forEach(r => {
        Object.entries(r.parameters).forEach(([subject, obj]) => {
          subjectTotals[subject] = (subjectTotals[subject] || 0) + obj.scored;
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });
      });

      const subjectLabels = Object.keys(subjectTotals);
      const subjectAverages = subjectLabels.map(
        s => Number((subjectTotals[s] / subjectCounts[s]).toFixed(1))
      );

      const minAvg = Math.min(...subjectAverages);
      const weakSubjects = subjectLabels.filter(
        (_, i) => subjectAverages[i] === minAvg
      );

      /* ---- PERFORMANCE PREDICTION ---- */
      if (secondLast) {
        const diff = latest.percentage - secondLast.percentage;
        const predicted = Math.min(
          100,
          Math.max(0, Number((latest.percentage + diff).toFixed(1)))
        );

        performancePrediction = {
          next_percentage: predicted,
          trend: getTrendLabel(diff)
        };
      }

      performance = {
        current: {
          percentage: latest.percentage,
          grade: latest.grade,
          test_date: latest.test_date
        },
        trend: {
          labels,
          values
        },
        subjects: {
          labels: subjectLabels,
          averages: subjectAverages,
          weak_subjects: weakSubjects
        }
      };
    }

    /* ---------------- ATTENDANCE ---------------- */
    const attendanceRecords = await StudentAttendanceBulk.findAll({
      where: { center_id: student.center_id },
      order: [["date", "ASC"]]
    });

    let present = 0;
    let total = 0;
    const monthMap = {};

    attendanceRecords.forEach(day => {
      const record = day.records.find(r => r.roll_no === rollNo);
      if (!record) return;

      total++;
      if (record.status === "present") present++;

      const month = new Date(day.date).toLocaleString("default", { month: "short" });
      monthMap[month] = monthMap[month] || { present: 0, total: 0 };
      monthMap[month].total++;
      if (record.status === "present") monthMap[month].present++;
    });

    const attendanceLabels = Object.keys(monthMap);
    const attendanceValues = attendanceLabels.map(m =>
      Number(((monthMap[m].present / monthMap[m].total) * 100).toFixed(1))
    );

    let attendancePrediction = null;
    if (attendanceValues.length >= 2) {
      const last = attendanceValues.at(-1);
      const secondLast = attendanceValues.at(-2);
      const diff = last - secondLast;

      attendancePrediction = {
        next_percentage: Math.min(
          100,
          Math.max(0, Number((last + diff).toFixed(1)))
        ),
        trend: getTrendLabel(diff)
      };
    }

    const attendance = {
      present_days: present,
      total_days: total,
      percentage: total > 0 ? Number(((present / total) * 100).toFixed(1)) : null,
      trend: {
        labels: attendanceLabels,
        values: attendanceValues
      }
    };

    /* ---------------- RESPONSE ---------------- */
    res.json({
      student: {
        roll_no: student.roll_no,
        name: [student.first_name, student.last_name].filter(Boolean).join(" "),
        class: student.current_class,
        center_id: student.center_id
      },

      performance,
      attendance,

      prediction: {
        performance: performancePrediction,
        attendance: attendancePrediction
      }
    });

  } catch (err) {
    console.error("Student Analytics Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
