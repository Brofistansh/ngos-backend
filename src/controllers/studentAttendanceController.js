const StudentAttendance = require('../models/sequelize/StudentAttendance');
const Student = require('../models/sequelize/Student');

/**
 * CREATE Student Attendance
 * Teacher / Center Admin can mark attendance
 */
exports.createAttendance = async (req, res) => {
  try {
    const { student_id, center_id, date, status, remarks } = req.body;

    const user = req.user; // from auth middleware

    // ✅ Allow these roles
    if (!['teacher', 'center_admin', 'ngo_admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // ✅ Validate required fields
    if (!student_id || !center_id || !date || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Fetch student & validate NGO + Center
    const student = await Student.findOne({
      where: {
        id: student_id,
        ngo_id: user.ngo_id,
        center_id: center_id
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found in your NGO' });
    }

    // ✅ Prevent duplicate attendance for same day
    const alreadyMarked = await StudentAttendance.findOne({
      where: { student_id, date }
    });

    if (alreadyMarked) {
      return res.status(409).json({ message: 'Attendance already marked for this date' });
    }

    // ✅ CREATE attendance (FIX: ngo_id added)
    const attendance = await StudentAttendance.create({
      student_id,
      center_id,
      ngo_id: user.ngo_id,        // 🔥 FIX
      date,
      status,
      remarks: remarks || null,
      marked_by: user.id
    });

    return res.status(201).json({
      message: 'Student attendance marked successfully',
      attendance
    });

  } catch (error) {
    console.error('❌ Student Attendance Create Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
