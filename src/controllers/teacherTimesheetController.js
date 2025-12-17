const TeacherTimesheet = require("../models/sequelize/TeacherTimesheet");
const Teacher = require("../models/sequelize/Teacher");

// CREATE
exports.createTeacherTimesheet = async (req, res) => {
  try {
    const {
      teacher_id,
      date,
      attendance,
      in_time,
      out_time,
      total_home_visit,
      level,
    } = req.body;

    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const timesheet = await TeacherTimesheet.create({
      teacher_id,
      ngo_id: teacher.ngo_id,
      center_id: teacher.center_id,
      date,
      attendance,
      in_time,
      out_time,
      total_home_visit,
      level: level || null,
    });

    res.status(201).json({
      message: "Teacher timesheet created",
      data: timesheet,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET (filters)
exports.getTeacherTimesheets = async (req, res) => {
  try {
    const { teacher_id, from_date, to_date } = req.query;
    const where = {};

    if (teacher_id) where.teacher_id = teacher_id;
    if (from_date && to_date) {
      where.date = { $between: [from_date, to_date] };
    }

    const data = await TeacherTimesheet.findAll({
      where,
      order: [["date", "DESC"]],
    });

    res.json({ count: data.length, data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateTeacherTimesheet = async (req, res) => {
  try {
    const timesheet = await TeacherTimesheet.findByPk(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.update(req.body);

    res.json({
      message: "Teacher timesheet updated",
      data: timesheet,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteTeacherTimesheet = async (req, res) => {
  try {
    const timesheet = await TeacherTimesheet.findByPk(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    await timesheet.destroy();
    res.json({ message: "Teacher timesheet deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
