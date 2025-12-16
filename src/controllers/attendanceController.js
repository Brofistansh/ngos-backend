// const Attendance = require('../models/sequelize/Attendance');
// const User = require('../models/sequelize/User');

// exports.markAttendance = async (req, res) => {
//   try {
//     const marker = req.user; // who is marking
//     const { user_id, status } = req.body;

//     // Validate user exists
//     const targetUser = await User.findByPk(user_id);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Ensure marker and target belong to same center or NGO
//     if (marker.role !== "super_admin") {
//       if (marker.role === "center_manager" || marker.role === "teacher") {
//         if (marker.center_id !== targetUser.center_id) {
//           return res.status(403).json({ message: "You cannot mark attendance for this user" });
//         }
//       } else if (marker.role === "ngo_admin" || marker.role === "ngo_manager") {
//         if (marker.ngo_id !== targetUser.ngo_id) {
//           return res.status(403).json({ message: "You cannot mark attendance for this user" });
//         }
//       }
//     }

//     // Check if today's record exists
//     const today = new Date().toISOString().split("T")[0];

//     const existing = await Attendance.findOne({
//       where: { user_id, date: today }
//     });

//     if (existing) {
//       // Update existing record
//       existing.status = status || "present";
//       existing.marked_by = marker.id;
//       await existing.save();

//       return res.json({ message: "Attendance updated", data: existing });
//     }

//     // Create new attendance record
//     const attendance = await Attendance.create({
//       user_id,
//       center_id: targetUser.center_id,
//       ngo_id: targetUser.ngo_id,
//       date: today,
//       status: status || "present",
//       marked_by: marker.id
//     });

//     return res.json({ message: "Attendance marked", data: attendance });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error marking attendance" });
//   }
// };


// // FETCH ATTENDANCE FOR A CENTER
// exports.getCenterAttendance = async (req, res) => {
//   try {
//     const { center_id } = req.params;

//     const records = await Attendance.findAll({
//       where: { center_id },
//       order: [["date", "DESC"]]
//     });

//     return res.json(records);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching center attendance" });
//   }
// };


// // FETCH ATTENDANCE FOR NGO
// exports.getNGOAttendance = async (req, res) => {
//   try {
//     const { ngo_id } = req.params;

//     const records = await Attendance.findAll({
//       where: { ngo_id },
//       order: [["date", "DESC"]]
//     });

//     return res.json(records);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching NGO attendance" });
//   }
// };


// // FETCH ATTENDANCE OF A USER
// exports.getUserAttendance = async (req, res) => {
//   try {
//     const { user_id } = req.params;

//     const records = await Attendance.findAll({
//       where: { user_id },
//       order: [["date", "DESC"]]
//     });

//     return res.json(records);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching user attendance" });
//   }
// };
