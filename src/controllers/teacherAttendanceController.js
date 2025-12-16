const TeacherAttendance = require("../models/sequelize/TeacherAttendance");

exports.createAttendance = async (req, res, next) => {
  try {
    const attendance = await TeacherAttendance.create({
      ...req.body,
      marked_by: req.user.id
    });
    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
};

exports.getAttendance = async (req, res) => {
  const { teacher_id, center_id, date } = req.query;

  const where = {};
  if (teacher_id) where.teacher_id = teacher_id;
  if (center_id) where.center_id = center_id;
  if (date) where.date = date;

  const data = await TeacherAttendance.findAll({ where });
  res.json(data);
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await TeacherAttendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Attendance not found" });
    }
    await record.update(req.body);
    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    await TeacherAttendance.destroy({ where: { id: req.params.id } });
    res.json({ message: "Attendance deleted" });
  } catch (err) {
    next(err);
  }
};
