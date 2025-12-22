const StudentTimesheet = require("../models/sequelize/StudentTimesheet");
const Student = require("../models/sequelize/Student");

// ============================
// CREATE
// ============================
exports.createStudentTimesheet = async (req, res) => {
  try {
    const {
      student_id,
      date,
      attendance,
      class: className,
      subjects,
      topics_covered,
      quiz_percentage,
      level
    } = req.body;

    // Validate student
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔥 SAFE NAME SNAPSHOT
    const actorName =
      req.user.name ||
      req.user.teacher_name ||
      req.user.email ||
      "System User";

    const timesheet = await StudentTimesheet.create({
      student_id,
      ngo_id: student.ngo_id,
      center_id: student.center_id,
      date,
      attendance,
      class: className,
      subjects,
      topics_covered,
      quiz_percentage,
      level: level || null,

      // 🔥 AUDIT (ID + NAME)
      created_by: req.user.id,
      created_by_name: actorName,
      updated_by: req.user.id,
      updated_by_name: actorName,
    });

    res.status(201).json({
      message: "Student timesheet created",
      data: timesheet,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE
// ============================
exports.updateStudentTimesheet = async (req, res) => {
  try {
    const timesheet = await StudentTimesheet.findByPk(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    const actorName =
      req.user.name ||
      req.user.email ||
      "System User";

    await timesheet.update({
      ...req.body,

      // 🔥 AUDIT UPDATE
      updated_by: req.user.id,
      updated_by_name: actorName,
    });

    res.json({
      message: "Student timesheet updated",
      data: timesheet,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET ALL
// ============================
exports.getStudentTimesheets = async (req, res) => {
  try {
    const data = await StudentTimesheet.findAll();
    res.json({ count: data.length, data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// DELETE
// ============================
exports.deleteStudentTimesheet = async (req, res) => {
  try {
    const timesheet = await StudentTimesheet.findByPk(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.destroy();
    res.json({ message: "Timesheet deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
