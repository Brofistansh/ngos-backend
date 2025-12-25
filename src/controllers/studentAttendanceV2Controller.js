const { Op } = require("sequelize");
const StudentAttendanceHeader = require("../models/sequelize/StudentAttendanceHeader");
const StudentAttendanceEntry = require("../models/sequelize/StudentAttendanceEntry");
const Student = require("../models/sequelize/Student");
const Center = require("../models/sequelize/Center");

/**
 * CREATE BULK ATTENDANCE
 */
exports.createBulkAttendance = async (req, res) => {
  try {
    const { date, center_id, students } = req.body;

    if (!date || !center_id || !Array.isArray(students)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const center = await Center.findByPk(center_id);
    if (!center) return res.status(404).json({ message: "Center not found" });

    const header = await StudentAttendanceHeader.create({
      date,
      center_id,
      ngo_id: req.user.ngo_id,
      uploaded_by: req.user.id
    });

    const entries = [];

    for (const s of students) {
      if (!s.roll_no || !s.status) {
        return res.status(400).json({ message: "roll_no and status required" });
      }

      const student = await Student.findOne({
        where: { roll_no: s.roll_no, center_id }
      });

      if (!student) {
        return res.status(404).json({
          message: `Student not found for roll no ${s.roll_no}`
        });
      }

      entries.push({
        attendance_id: header.id,
        student_id: student.id,
        roll_no: s.roll_no,
        status: s.status,
        remarks: s.remarks || null
      });
    }

    await StudentAttendanceEntry.bulkCreate(entries);

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance_id: header.id
    });
  } catch (err) {
    console.error("Create Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET ATTENDANCE (FILTERS)
 */
exports.getAttendance = async (req, res) => {
  try {
    const { date, start_date, end_date, roll_no, center_id } = req.query;

    const headerWhere = {};
    if (center_id) headerWhere.center_id = center_id;
    if (date) headerWhere.date = date;
    if (start_date && end_date) {
      headerWhere.date = { [Op.between]: [start_date, end_date] };
    }

    const entryWhere = {};
    if (roll_no) entryWhere.roll_no = roll_no;

    const data = await StudentAttendanceHeader.findAll({
      where: headerWhere,
      include: [
        {
          model: StudentAttendanceEntry,
          as: "entries",
          where: Object.keys(entryWhere).length ? entryWhere : undefined,
          required: false
        }
      ],
      order: [["date", "DESC"]]
    });

    res.json({ count: data.length, data });
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE ENTRY
 */
exports.updateAttendanceEntry = async (req, res) => {
  try {
    const entry = await StudentAttendanceEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    await entry.update(req.body);
    res.json({ message: "Attendance updated", data: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE ENTRY
 */
exports.deleteAttendanceEntry = async (req, res) => {
  try {
    const entry = await StudentAttendanceEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    await entry.destroy();
    res.json({ message: "Attendance entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
