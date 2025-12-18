const Student = require("../models/sequelize/Student");
const StudentPerformanceReport = require("../models/sequelize/StudentPerformanceReport");
const { calculateGrade } = require("../utils/gradeUtils");

/* ---------------- CREATE ---------------- */
exports.createStudentPerformanceReport = async (req, res) => {
  try {
    const { student_id, class: className, test_date, parameters } = req.body;

    if (!Array.isArray(parameters) || parameters.length === 0) {
      return res.status(400).json({ message: "Parameters are required" });
    }

    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let total = 0, max = 0;
    parameters.forEach(p => {
      total += Number(p.score);
      max += Number(p.out_of);
    });

    const percentage = Number(((total / max) * 100).toFixed(2));
    const grade = calculateGrade(percentage);

    const report = await StudentPerformanceReport.create({
      student_id,
      ngo_id: student.ngo_id,
      center_id: student.center_id,
      class: className,
      test_date,
      parameters,
      total_score: total,
      max_score: max,
      percentage,
      grade
    });

    res.status(201).json({ message: "Report created", data: report });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- GET BY STUDENT ---------------- */
exports.getReportsByStudent = async (req, res) => {
  const { student_id } = req.query;

  const reports = await StudentPerformanceReport.findAll({
    where: { student_id },
    order: [["test_date", "DESC"]],
  });

  res.json({ count: reports.length, data: reports });
};

/* ---------------- GET SINGLE ---------------- */
exports.getReportById = async (req, res) => {
  const report = await StudentPerformanceReport.findByPk(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  res.json(report);
};

/* ---------------- UPDATE ---------------- */
exports.updateReport = async (req, res) => {
  const report = await StudentPerformanceReport.findByPk(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  const { parameters } = req.body;

  let total = 0, max = 0;
  parameters.forEach(p => {
    total += Number(p.score);
    max += Number(p.out_of);
  });

  const percentage = Number(((total / max) * 100).toFixed(2));
  const grade = calculateGrade(percentage);

  await report.update({
    parameters,
    total_score: total,
    max_score: max,
    percentage,
    grade,
  });

  res.json({ message: "Report updated", data: report });
};

/* ---------------- DELETE ---------------- */
exports.deleteReport = async (req, res) => {
  const report = await StudentPerformanceReport.findByPk(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  await report.destroy();
  res.json({ message: "Report deleted" });
};
