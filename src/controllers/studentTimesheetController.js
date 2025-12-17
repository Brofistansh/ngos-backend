// src/controllers/studentTimesheetController.js

const StudentTimesheet = require("../models/sequelize/StudentTimesheet");
const Student = require("../models/sequelize/Student");

// ===============================
// CREATE Student Timesheet
// ===============================
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
      level: level || null // optional
    });

    return res.status(201).json({
      message: "Student timesheet created successfully",
      data: timesheet
    });

  } catch (error) {
    console.error("Create Timesheet Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL Timesheets (filters)
// ===============================
exports.getStudentTimesheets = async (req, res) => {
  try {
    const { student_id, ngo_id, center_id, date } = req.query;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;
    if (date) where.date = date;

    const timesheets = await StudentTimesheet.findAll({
      where,
      order: [["date", "DESC"]],
    });

    return res.json({
      count: timesheets.length,
      data: timesheets
    });

  } catch (error) {
    console.error("Get Timesheets Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET Timesheet By ID
// ===============================
exports.getStudentTimesheetById = async (req, res) => {
  try {
    const timesheet = await StudentTimesheet.findByPk(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    return res.json({ data: timesheet });

  } catch (error) {
    console.error("Get Timesheet By ID Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE Timesheet
// ===============================
exports.updateStudentTimesheet = async (req, res) => {
  try {
    const timesheet = await StudentTimesheet.findByPk(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.update({
      ...req.body,
      level: req.body.level || timesheet.level
    });

    return res.json({
      message: "Student timesheet updated successfully",
      data: timesheet
    });

  } catch (error) {
    console.error("Update Timesheet Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE Timesheet
// ===============================
exports.deleteStudentTimesheet = async (req, res) => {
  try {
    const timesheet = await StudentTimesheet.findByPk(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.destroy();

    return res.json({ message: "Student timesheet deleted successfully" });

  } catch (error) {
    console.error("Delete Timesheet Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
