const Student = require("../models/sequelize/Student");
const StudentPerformanceReport = require("../models/sequelize/StudentPerformanceReport");
const { calculateGrade } = require("../utils/gradeUtils");

/* =========================================================
   BULK UPLOAD (SINGLE + MULTIPLE)
   POST /api/student-performance/bulk
========================================================= */
exports.bulkUploadStudentPerformance = async (req, res) => {
  try {
    const { dateOfTest, assessmentConfig, students } = req.body;

    if (
      !dateOfTest ||
      !assessmentConfig ||
      !assessmentConfig.maxMarks ||
      !Array.isArray(students)
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const rollNos = students.map(s => s.student_roll_no);

    const studentList = await Student.findAll({
      where: { roll_no: rollNos }
    });

    const studentMap = {};
    studentList.forEach(s => (studentMap[s.roll_no] = s));

    const responseData = [];

    for (const s of students) {
      const student = studentMap[s.student_roll_no];
      if (!student) continue;

      let total = 0;
      let max = 0;

      const parameters = {};

      for (const subject in assessmentConfig.maxMarks) {
        const scored = Number(s.marks?.[subject] || 0);
        const subjectMax = Number(assessmentConfig.maxMarks[subject]);

        parameters[subject] = {
          scored,
          max: subjectMax
        };

        total += scored;
        max += subjectMax;
      }

      const percentage = Number(((total / max) * 100).toFixed(1));
      const grade = calculateGrade(percentage);

      await StudentPerformanceReport.create({
        student_id: student.id,
        ngo_id: student.ngo_id,
        center_id: student.center_id,
        class: student.current_class,
        test_date: dateOfTest,
        parameters,
        total_score: total,
        max_score: max,
        percentage,
        grade,
        remarks: s.remarks || null
      });

      responseData.push({
        student_roll_no: student.roll_no,
        student_name: [student.first_name, student.last_name]
          .filter(Boolean)
          .join(" "),
        total_scored: total,
        percentage
      });
    }

    res.status(201).json({
      success: true,
      message: "Student performance uploaded successfully",
      summary: {
        total_students: responseData.length,
        assessment_type: assessmentConfig.type || "N/A",
        date: dateOfTest
      },
      data: responseData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET BY ROLL NUMBER
   GET /api/student-performance?rollNo=XXXX
========================================================= */
exports.getByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.query;
    if (!rollNo) {
      return res.status(400).json({ message: "rollNo is required" });
    }

    const student = await Student.findOne({
      where: { roll_no: rollNo }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const reports = await StudentPerformanceReport.findAll({
      where: { student_id: student.id },
      order: [["test_date", "DESC"]]
    });

    res.json({
      count: reports.length,
      data: reports.map(r => ({
        ...r.toJSON(),
        student_roll_no: student.roll_no,
        student_name: [student.first_name, student.last_name]
          .filter(Boolean)
          .join(" ")
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET CENTER MONTHLY REPORT
   GET /api/student-performance/monthly?centerId=..&month=..&year=..
========================================================= */
exports.getCenterMonthly = async (req, res) => {
  try {
    const { centerId, month, year } = req.query;

    if (!centerId || !month || !year) {
      return res.status(400).json({
        message: "centerId, month and year are required"
      });
    }

    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    const reports = await StudentPerformanceReport.findAll({
      where: {
        center_id: centerId,
        test_date: { $between: [startDate, endDate] }
      }
    });

    res.json({
      count: reports.length,
      data: reports
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET SINGLE PERFORMANCE RECORD
   GET /api/student-performance/:id
========================================================= */
exports.getPerformanceById = async (req, res) => {
  try {
    const report = await StudentPerformanceReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Performance record not found" });
    }

    const student = await Student.findByPk(report.student_id);

    res.json({
      ...report.toJSON(),
      student_roll_no: student?.roll_no || null,
      student_name: student
        ? [student.first_name, student.last_name].filter(Boolean).join(" ")
        : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   DELETE PERFORMANCE (ADMIN ONLY)
   DELETE /api/student-performance/:id
========================================================= */
exports.deletePerformance = async (req, res) => {
  try {
    const report = await StudentPerformanceReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Performance record not found" });
    }

    await report.destroy();
    res.json({ message: "Performance record deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
