const StudentAttendance = require('../models/sequelize/StudentAttendance');
const Student = require('../models/sequelize/Student');
const Center = require('../models/sequelize/Center');

/**
 * CREATE Student Attendance
 * Teacher / Center Admin / Manager can mark attendance
 */
exports.createAttendance = async (req, res) => {
  try {
    const { student_id, center_id, date, status, remarks } = req.body;

    // 🔒 Auth payload from JWT
    const { id: user_id, role, ngo_id } = req.user;

    // ---- VALIDATIONS ----
    if (!student_id || !center_id || !date || !status) {
      return res.status(400).json({
        message: 'student_id, center_id, date and status are required'
      });
    }

    if (!ngo_id) {
      return res.status(400).json({
        message: 'Invalid user: NGO not found in token'
      });
    }

    // ---- ROLE CHECK ----
    const allowedRoles = ['teacher', 'center_admin', 'ngo_admin', 'super_admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: 'Forbidden: You cannot mark student attendance'
      });
    }

    // ---- VERIFY STUDENT ----
    const student = await Student.findOne({
      where: { id: student_id, ngo_id }
    });

    if (!student) {
      return res.status(404).json({
        message: 'Student not found in your NGO'
      });
    }

    // ---- VERIFY CENTER ----
    const center = await Center.findOne({
      where: { id: center_id, ngo_id }
    });

    if (!center) {
      return res.status(404).json({
        message: 'Center not found in your NGO'
      });
    }

    // ---- CREATE ATTENDANCE ----
    const attendance = await StudentAttendance.create({
      student_id,
      center_id,
      ngo_id,              // ✅ FIXED: this was missing
      date,
      status,
      remarks,
      marked_by: user_id   // teacher / admin who marked
    });

    return res.status(201).json({
      message: 'Student attendance marked successfully',
      attendance
    });

  } catch (error) {
    console.error('❌ Student Attendance Create Error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * GET Student Attendance (filters supported)
 * ?student_id
 * ?date
 * ?start_date & end_date
 */
exports.getAttendance = async (req, res) => {
  try {
    const { student_id, date, start_date, end_date } = req.query;
    const { ngo_id } = req.user;

    const where = { ngo_id };

    if (student_id) where.student_id = student_id;
    if (date) where.date = date;
    if (start_date && end_date) {
      where.date = {
        $between: [start_date, end_date]
      };
    }

    const records = await StudentAttendance.findAll({
      where,
      order: [['date', 'DESC']]
    });

    return res.json({ records });

  } catch (error) {
    console.error('❌ Get Student Attendance Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * UPDATE Student Attendance
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const { ngo_id } = req.user;

    const attendance = await StudentAttendance.findOne({
      where: { id, ngo_id }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.status = status ?? attendance.status;
    attendance.remarks = remarks ?? attendance.remarks;
    await attendance.save();

    return res.json({
      message: 'Attendance updated successfully',
      attendance
    });

  } catch (error) {
    console.error('❌ Update Student Attendance Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * DELETE Student Attendance
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { ngo_id } = req.user;

    const attendance = await StudentAttendance.findOne({
      where: { id, ngo_id }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.destroy();

    return res.json({ message: 'Attendance deleted successfully' });

  } catch (error) {
    console.error('❌ Delete Student Attendance Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
