const { Op } = require("sequelize");
const StudentAttendance = require("../models/sequelize/StudentAttendance");
const Student = require("../models/sequelize/Student");

/**
 * ============================
 * BULK CREATE ATTENDANCE
 * ============================
 */
exports.createBulkAttendance = async (req, res) => {
  try {
    const { date, center_id, students } = req.body;
    const user = req.user;

    if (!date || !center_id || !Array.isArray(students)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const records = [];

    for (const s of students) {
      if (!s.roll_no || !s.status) {
        return res.status(400).json({
          message: "roll_no and status are required for each student"
        });
      }

      const student = await Student.findOne({
        where: {
          roll_no: s.roll_no,
          center_id,
          ngo_id: user.ngo_id
        }
      });

      if (!student) {
        return res.status(404).json({
          message: `Student not found for roll_no ${s.roll_no}`
        });
      }

      records.push({
        student_id: student.id,
        roll_no: student.roll_no,
        center_id,
        ngo_id: user.ngo_id,
        date,
        status: s.status,
        remarks: s.remarks || null,
        marked_by: user.id
      });
    }

    await StudentAttendance.bulkCreate(records, {
      updateOnDuplicate: ["status", "remarks", "marked_by"]
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      count: records.length
    });

  } catch (err) {
    console.error("Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ============================
 * GET ATTENDANCE (ALL FILTERS)
 * ============================
 */
exports.getAttendance = async (req, res) => {
  try {
    const { date, start_date, end_date, roll_no, center_id } = req.query;

    const where = {
      ngo_id: req.user.ngo_id
    };

    if (center_id) where.center_id = center_id;
    if (roll_no) where.roll_no = roll_no;
    if (date) where.date = date;

    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
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
    console.error("Get Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ============================
 * UPDATE ATTENDANCE
 * ============================
 */
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await StudentAttendance.findByPk(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    await attendance.update(req.body);

    res.json({
      message: "Attendance updated",
      data: attendance
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ============================
 * DELETE ATTENDANCE
 * ============================
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await StudentAttendance.findByPk(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    await attendance.destroy();
    res.json({ message: "Attendance deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// const StudentAttendance = require('../models/sequelize/StudentAttendanceLegacy');
// const Student = require('../models/sequelize/Student');

// /**
//  * CREATE student attendance
//  */
// exports.createAttendance = async (req, res) => {
//   try {
//     const { student_id, center_id, date, status, remarks } = req.body;
//     const user = req.user;

//     const student = await Student.findOne({
//       where: {
//         id: student_id,
//         ngo_id: user.ngo_id,
//       },
//     });

//     if (!student) {
//       return res.status(404).json({ message: 'Student not found in your NGO' });
//     }

//     const attendance = await StudentAttendance.create({
//       student_id,
//       center_id,
//       ngo_id: user.ngo_id,
//       date,
//       status,
//       remarks,
//       marked_by: user.id,
//     });

//     res.status(201).json(attendance);
//   } catch (err) {
//     console.error('❌ Student Attendance Create Error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// /**
//  * GET student attendance
//  */
// exports.getAttendance = async (req, res) => {
//   try {
//     const { student_id, date, start_date, end_date } = req.query;

//     const where = {
//       ngo_id: req.user.ngo_id,
//     };

//     if (student_id) where.student_id = student_id;
//     if (date) where.date = date;
//     if (start_date && end_date) {
//       where.date = { $between: [start_date, end_date] };
//     }

//     const records = await StudentAttendance.findAll({ where });
//     res.json(records);
//   } catch (err) {
//     console.error('❌ Get Attendance Error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// /**
//  * UPDATE attendance
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const attendance = await StudentAttendance.findOne({
//       where: {
//         id: req.params.id,
//         ngo_id: req.user.ngo_id,
//       },
//     });

//     if (!attendance) {
//       return res.status(404).json({ message: 'Attendance not found' });
//     }

//     await attendance.update(req.body);
//     res.json(attendance);
//   } catch (err) {
//     console.error('❌ Update Attendance Error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// /**
//  * DELETE attendance
//  */
// exports.deleteAttendance = async (req, res) => {
//   try {
//     const attendance = await StudentAttendance.findOne({
//       where: {
//         id: req.params.id,
//         ngo_id: req.user.ngo_id,
//       },
//     });

//     if (!attendance) {
//       return res.status(404).json({ message: 'Attendance not found' });
//     }

//     await attendance.destroy();
//     res.json({ message: 'Attendance deleted successfully' });
//   } catch (err) {
//     console.error('❌ Delete Attendance Error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
