const { Op } = require("sequelize");
const StudentAttendance = require("../models/sequelize/StudentAttendance");
const Student = require("../models/sequelize/Student");

const createAttendance = async (req, res, next) => {
  try {
    const { student_id, center_id, date, status, remarks } = req.body;

    if (!student_id || !center_id || !date || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const attendance = await StudentAttendance.create({
      student_id,
      center_id,
      ngo_id: student.ngo_id,
      date,
      status,
      remarks,
      marked_by: req.user.id
    });

    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
};

const getAttendance = async (req, res, next) => {
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

    const records = await StudentAttendance.findAll({
      where,
      order: [["date", "DESC"]]
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
};

const updateAttendance = async (req, res, next) => {
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

const deleteAttendance = async (req, res, next) => {
  try {
    await StudentAttendance.destroy({ where: { id: req.params.id } });
    res.json({ message: "Attendance deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance
};
