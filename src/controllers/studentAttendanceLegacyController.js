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
