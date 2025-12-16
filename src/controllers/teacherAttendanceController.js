const { Op } = require("sequelize");
const TeacherAttendance = require("../models/sequelize/TeacherAttendance");

// ===============================
// CREATE or UPDATE Attendance
// ===============================
exports.createAttendance = async (req, res, next) => {
  try {
    const { teacher_id, date } = req.body;

    const [attendance, created] = await TeacherAttendance.findOrCreate({
      where: { teacher_id, date },
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
    const { teacher_id, center_id, date, from, to } = req.query;

    const where = {};

    if (teacher_id) where.teacher_id = teacher_id;
    if (center_id) where.center_id = center_id;

    // Date range
    if (from && to) {
      where.date = { [Op.between]: [from, to] };
    }
    // Single date
    else if (date) {
      where.date = date;
    }

    const data = await TeacherAttendance.findAll({
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
// UPDATE Attendance
// ===============================
exports.updateAttendance = async (req, res, next) => {
  try {
    const attendance = await TeacherAttendance.findByPk(req.params.id);

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
    await TeacherAttendance.destroy({
      where: { id: req.params.id }
    });

    res.json({ message: "Attendance deleted" });
  } catch (err) {
    next(err);
  }
};
