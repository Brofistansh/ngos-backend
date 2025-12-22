const StudentTimesheet = require("../models/sequelize/StudentTimesheet");
const Student = require("../models/sequelize/Student");
const User = require("../models/sequelize/User");

// ============================
// CREATE STUDENT TIMESHEET
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

    // 1️⃣ Validate student
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Fetch logged-in user for name snapshot
    const actor = await User.findByPk(req.user.id);
    const actorName = actor?.name || actor?.email || "System User";

    // 3️⃣ Create timesheet
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

      // 🔥 AUDIT FIELDS
      created_by: req.user.id,
      created_by_name: actorName,
      updated_by: req.user.id,
      updated_by_name: actorName,
    });

    return res.status(201).json({
      message: "Student timesheet created successfully",
      data: timesheet,
    });

  } catch (err) {
    console.error("Create Student Timesheet Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE STUDENT TIMESHEET
// ============================
exports.updateStudentTimesheet = async (req, res) => {
  try {
    const timesheet = await StudentTimesheet.findByPk(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    // Fetch user for updated_by_name
    const actor = await User.findByPk(req.user.id);
    const actorName = actor?.name || actor?.email || "System User";

    await timesheet.update({
      ...req.body,
      updated_by: req.user.id,
      updated_by_name: actorName,
    });

    return res.json({
      message: "Student timesheet updated successfully",
      data: timesheet,
    });

  } catch (err) {
    console.error("Update Student Timesheet Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET ALL STUDENT TIMESHEETS
// ============================
exports.getStudentTimesheets = async (req, res) => {
  try {
    const data = await StudentTimesheet.findAll({
      order: [["date", "DESC"]],
    });

    return res.json({
      count: data.length,
      data,
    });

  } catch (err) {
    console.error("Get Student Timesheets Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================
// DELETE STUDENT TIMESHEET
// ============================
exports.deleteStudentTimesheet = async (req, res) => {
  try {
    const timesheet = await StudentTimesheet.findByPk(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.destroy();

    return res.json({
      message: "Student timesheet deleted successfully",
    });

  } catch (err) {
    console.error("Delete Student Timesheet Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
