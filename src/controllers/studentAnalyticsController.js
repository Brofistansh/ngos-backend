const { Op } = require("sequelize");
const Student = require("../models/sequelize/Student");
const StudentPerformanceReport = require("../models/sequelize/StudentPerformanceReport");

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({
      where: { roll_no: rollNo }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const reports = await StudentPerformanceReport.findAll({
      where: { student_id: student.id },
      order: [["test_date", "ASC"]]
    });

    if (reports.length === 0) {
      return res.json({
        student: {
          roll_no: student.roll_no,
          name: [student.first_name, student.last_name].filter(Boolean).join(" "),
          class: student.current_class,
          center_id: student.center_id
        },
        performance: null,
        attendance: null
      });
    }

    /* ---------------- CURRENT PERFORMANCE ---------------- */
    const latest = reports[reports.length - 1];

    /* ---------------- TREND DATA ---------------- */
    const labels = reports.map(r =>
      new Date(r.test_date).toLocaleString("default", { month: "short" })
    );
    const values = reports.map(r => r.percentage);

    /* ---------------- SUBJECT AVERAGES ---------------- */
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

    /* ---------------- RESPONSE ---------------- */
    res.json({
      student: {
        roll_no: student.roll_no,
        name: [student.first_name, student.last_name].filter(Boolean).join(" "),
        class: student.current_class,
        center_id: student.center_id
      },

      performance: {
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
      },

      attendance: {
        present_days: null,
        total_days: null,
        percentage: null
      }
    });

  } catch (err) {
    console.error("Student Analytics Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
