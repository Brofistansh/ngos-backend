const { Op } = require("sequelize");
const StudentAttendance = require("../models/sequelize/StudentAttendance");
const Teacher = require("../models/sequelize/Teacher");

/**
 * CREATE STUDENT ATTENDANCE
 * Roles allowed:
 * - super_admin
 * - ngo_admin
 * - center_admin
 * - teacher
 */
exports.createAttendance = async (req, res, next) => {
  try {
    let ngo_id = req.user.ngo_id;
    let center_id = req.user.center_id;

    // 👨‍🏫 Teacher context resolution
    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({
        where: { user_id: req.user.id }
      });

      if (!teacher) {
        return res.status(403).json({
          message: "Teacher is not linked to any center"
        });
      }

      ngo_id = teacher.ngo_id;
      center_id = teacher.center_id;
    }

    if (!ngo_id || !center_id) {
      return res.status(400).json({
        message: "NGO or Center context missing"
      });
    }

    const attendance = await StudentAttendance.create({
      student_id: req.body.student_id,
      ngo_id,
      center_id,
      date: req.body.date,
      status: req.body.status,
      remarks: req.body.remarks || null,
      marked_by: req.user.id
    });

    return res.status(201).json(attendance);
  } catch (err) {
    console.error("❌ Student Attendance Create Error:", err);
    next(err);
  }
};

/**
 * GET STUDENT ATTENDANCE
 * Filters:
 * - student_id
 * - center_id
 * - date
 * - from_date + to_date
 */
exports.getAttendance = async (req, res, next) => {
  try {
    const {
      student_id,
      center_id,
      date,
      from_date,
      to_date
    } = req.query;

    const where = {};

    // 🔐 Scope control
    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({
        where: { user_id: req.user.id }
      });

      if (!teacher) {
        return res.status(403).json({
          message: "Teacher is not linked to any center"
        });
      }

      where.center_id = teacher.center_id;
    } else if (req.user.center_id) {
      where.center_id = req.user.center_id;
    }

    if (student_id) where.student_id = student_id;
    if (center_id) where.center_id = center_id;

    if (date) {
      where.date = date;
    }

    if (from_date && to_date) {
      where.date = {
        [Op.between]: [from_date, to_date]
      };
    }

    const records = await StudentAttendance.findAll({
      where,
      order: [["date", "DESC"]]
    });

    res.json(records);
  } catch (err) {
    console.error("❌ Student Attendance Fetch Error:", err);
    next(err);
  }
};

/**
 * UPDATE STUDENT ATTENDANCE
 */
exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await StudentAttendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Attendance record not found"
      });
    }

    await record.update({
      status: req.body.status,
      remarks: req.body.remarks
    });

    res.json(record);
  } catch (err) {
    console.error("❌ Student Attendance Update Error:", err);
    next(err);
  }
};

/**
 * DELETE STUDENT ATTENDANCE
 */
exports.deleteAttendance = async (req, res, next) => {
  try {
    const deleted = await StudentAttendance.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Attendance record not found"
      });
    }

    res.json({ message: "Attendance deleted successfully" });
  } catch (err) {
    console.error("❌ Student Attendance Delete Error:", err);
    next(err);
  }
};
