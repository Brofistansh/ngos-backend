const { Op } = require("sequelize");
const StudentAttendance = require("../models/sequelize/StudentAttendance");
const Student = require("../models/sequelize/Student");

exports.createAttendance = async (req, res, next) => {
  try {
    const { student_id, center_id, date, status, remarks } = req.body;

    // 🚨 VALIDATION (VERY IMPORTANT)
    if (!student_id || !center_id || !date || !status) {
      return res.status(400).json({
        message: "student_id, center_id, date, status are required"
      });
    }

    // 🔎 Fetch student to get ngo_id safely
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const ngo_id = student.ngo_id;

    // 🧠 UPSERT LOGIC
    const [attendance, created] = await StudentAttendance.findOrCreate({
      where: {
        student_id,
        center_id,
        date
      },
      defaults: {
        student_id,
        center_id,
        ngo_id,
        date,
        status,
        remarks,
        marked_by: req.user.id
      }
    });

    if (!created) {
      await attendance.update({
        status,
        remarks,
        marked_by: req.user.id
      });
    }

    res.status(created ? 201 : 200).json(attendance);

  } catch (err) {
    console.error("🔥 Student Attendance Error:", err);
    next(err);
  }
};

// ===============================
// GET ATTENDANCE WITH FILTERS
// ===============================
exports.getAttendance = async (req, res, next) => {
  try {
    const { student_id, center_id, date, from, to } = req.query;

    const where = {};

    if (student_id) where.student_id = student_id;
    if (center_id) where.center_id = center_id;

    if (from && to) {
      where.date = { [Op.between]: [from, to] };
    } else if (date) {
      where.date = date;
    }

    const data = await StudentAttendance.findAll({
      where,
      order: [["date", "DESC"]]
    });

    res.json({ count: data.length, data });
  } catch (err) {
    next(err);
  }
};
