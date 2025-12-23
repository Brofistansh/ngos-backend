const { Op } = require("sequelize");
const TeacherTimesheet = require("../models/sequelize/TeacherTimesheet");
const Teacher = require("../models/sequelize/Teacher");

// ============================
// CREATE TEACHER TIMESHEET
// ============================
exports.createTeacherTimesheet = async (req, res) => {
  try {
    const {
      date,
      attendance,
      in_time,
      out_time,
      total_home_visit,
      level,
    } = req.body;

    if (!date || !attendance) {
      return res.status(400).json({
        message: "date and attendance are required",
      });
    }

    // Only teacher can create his own timesheet
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const timesheet = await TeacherTimesheet.create({
      teacher_id: teacher.id,
      ngo_id: req.user.ngo_id,
      center_id: req.user.center_id,
      date,
      attendance,
      in_time,
      out_time,
      total_home_visit,
      level: level || null,

      created_by: req.user.id,
      updated_by: req.user.id,
    });

    return res.status(201).json({
      message: "Teacher timesheet created successfully",
      data: timesheet,
    });

  } catch (err) {
    console.error("Teacher Timesheet Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ============================
// GET TEACHER TIMESHEETS (ROLE BASED)
// ============================
exports.getTeacherTimesheets = async (req, res) => {
  try {
    const { role, id, ngo_id, center_id } = req.user;
    const { teacher_id, from_date, to_date } = req.query;

    const where = {};

    // ----------------------------
    // ROLE LOGIC
    // ----------------------------

    if (role === "teacher") {
      const teacher = await Teacher.findOne({
        where: { user_id: id },
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      where.teacher_id = teacher.id;
    }

    if (role === "center_admin") {
      where.center_id = center_id;
    }

    if (role === "ngo_admin") {
      where.ngo_id = ngo_id;
    }

    // super_admin → no restriction

    // ----------------------------
    // OPTIONAL FILTERS
    // ----------------------------
    if (teacher_id) {
      where.teacher_id = teacher_id;
    }

    if (from_date && to_date) {
      where.date = { [Op.between]: [from_date, to_date] };
    }

    const data = await TeacherTimesheet.findAll({
      where,
      order: [["date", "DESC"]],
    });

    res.json({
      count: data.length,
      data,
    });

  } catch (err) {
    console.error("Get Teacher Timesheet Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ============================
// UPDATE
// ============================
exports.updateTeacherTimesheet = async (req, res) => {
  try {
    const timesheet = await TeacherTimesheet.findByPk(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.update({
      ...req.body,
      updated_by: req.user.id,
    });

    res.json({
      message: "Teacher timesheet updated successfully",
      data: timesheet,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ============================
// DELETE
// ============================
exports.deleteTeacherTimesheet = async (req, res) => {
  try {
    const timesheet = await TeacherTimesheet.findByPk(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.destroy();

    res.json({ message: "Teacher timesheet deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
