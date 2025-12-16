const { Op } = require("sequelize");
const StudentAttendance = require("../models/sequelize/StudentAttendance");

// ===============================
// CREATE or UPDATE Attendance
// ===============================
exports.createAttendance = async (req, res, next) => {
  try {
    const { student_id, date } = req.body;

    const [attendance, created] = await StudentAttendance.findOrCreate({
      where: { student_id, date },
      defaults: {
        ...req.body,
        marked_by: req.user.id
      }
    });

    if (!created) {
      await attendance.update({
        ...req.body,
        marked_by: req.user.id
      });
    }

    res.status(created ? 201 : 200).json(attendance);
  } catch (err) {
    next(err);
  }
};

// ===============================
// GET Attendance (ALL + Filters)
// ===============================
exports.getAttendance = async (req, res, next) => {
  try {
    const { student_id, center_id, date, from, to } = req.query;

    const where = {};

    if (student_id) where.student_id = student_id;
    if (center_id) where.center_id = center_id;

    // Date range
    if (from && to) {
      where.date = { [Op.between]: [from, to] };
    }
    // Single date
    else if (date) {
      where.date = date;
    }

    const data = await StudentAttendance.findAll({
      where,
      order: [["date", "DESC"]]
    });

    res.json({
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

// ===============================
// UPDATE Attendance by ID
// ===============================
exports.updateAttendance = async (req, res, next) => {
  try {
    const attendance = await StudentAttendance.findByPk(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    await attendance.update(req.body);
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

// ===============================
// DELETE Attendance
// ===============================
exports.deleteAttendance = async (req, res, next) => {
  try {
    await StudentAttendance.destroy({
      where: { id: req.params.id }
    });

    res.json({ message: "Attendance deleted" });
  } catch (err) {
    next(err);
  }
};
