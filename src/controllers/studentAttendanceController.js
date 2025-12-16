const { Op } = require("sequelize");
const StudentAttendance = require("../models/sequelize/StudentAttendance");

/**
 * CREATE / MARK STUDENT ATTENDANCE
 * Roles allowed: center_admin, teacher
 */
exports.createAttendance = async (req, res) => {
  try {
    const { student_id, center_id, date, status, remarks } = req.body;

    if (!student_id || !center_id || !date || !status) {
      return res.status(400).json({
        message: "student_id, center_id, date and status are required"
      });
    }

    // 🔥 CRITICAL FIX
    const ngo_id = req.user.ngo_id;
    const marked_by = req.user.id;

    if (!ngo_id) {
      return res.status(400).json({
        message: "Logged-in user is not linked to an NGO"
      });
    }

    // Prevent duplicate attendance for same day
    const existing = await StudentAttendance.findOne({
      where: {
        student_id,
        date
      }
    });

    if (existing) {
      return res.status(409).json({
        message: "Attendance already marked for this student on this date"
      });
    }

    const attendance = await StudentAttendance.create({
      student_id,
      center_id,
      ngo_id,        // ✅ MUST BE PASSED
      date,
      status,
      remarks,
      marked_by
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error("Student Attendance Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET STUDENT ATTENDANCE (filters + date range)
 */
exports.getAttendance = async (req, res) => {
  try {
    const { student_id, center_id, from_date, to_date, date } = req.query;

    const where = {
      ngo_id: req.user.ngo_id
    };

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

    const data = await StudentAttendance.findAll({
      where,
      order: [["date", "DESC"]]
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * UPDATE STUDENT ATTENDANCE
 */
exports.updateAttendance = async (req, res) => {
  try {
    const record = await StudentAttendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE STUDENT ATTENDANCE
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const deleted = await StudentAttendance.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ message: "Attendance deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
