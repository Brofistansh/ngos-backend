const { Op } = require("sequelize");
const StudentAttendance = require("../models/sequelize/StudentAttendance");
const Student = require("../models/sequelize/Student");
const Teacher = require("../models/sequelize/Teacher");

/**
 * CREATE STUDENT ATTENDANCE
 * Allowed:
 * - super_admin
 * - ngo_admin
 * - center_admin
 * - teacher
 */
exports.createAttendance = async (req, res, next) => {
  try {
    const { student_id, date, status, remarks } = req.body;

    // 1️⃣ Fetch student (SOURCE OF TRUTH)
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    let ngo_id = student.ngo_id;
    let center_id = student.center_id;

    // 2️⃣ Teacher validation (scope check)
    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({
        where: { user_id: req.user.id }
      });

      if (!teacher) {
        return res.status(403).json({
          message: "Teacher profile not found"
        });
      }

      if (teacher.center_id !== center_id) {
        return res.status(403).json({
          message: "Teacher cannot mark attendance for this student"
        });
      }
    }

    // 3️⃣ Create attendance (ALL REQUIRED FIELDS)
    const attendance = await StudentAttendance.create({
      student_id,
      ngo_id,
      center_id,
      date,
      status,
      remarks: remarks || null,
      marked_by: req.user.id
    });

    res.status(201).json(attendance);
  } catch (err) {
    console.error("❌ Student Attendance Create Error:", err);
    next(err);
  }
};

/**
 * GET STUDENT ATTENDANCE
 */
exports.getAttendance = async (req, res, next) => {
  try {
    const { student_id, center_id, date, from_date, to_date } = req.query;
    const where = {};

    if (student_id) where.student_id = student_id;
    if (center_id) where.center_id = center_id;

    if (date) {
      where.date = date;
    }

    if (from_date && to_date) {
      where.date = { [Op.between]: [from_date, to_date] };
    }

    res.json(
      await StudentAttendance.findAll({
        where,
        order: [["date", "DESC"]]
      })
    );
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE ATTENDANCE
 */
exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await StudentAttendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    await record.update({
      status: req.body.status,
      remarks: req.body.remarks
    });

    res.json(record);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE ATTENDANCE
 */
exports.deleteAttendance = async (req, res, next) => {
  try {
    const deleted = await StudentAttendance.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json({ message: "Attendance deleted successfully" });
  } catch (err) {
    next(err);
  }
};
