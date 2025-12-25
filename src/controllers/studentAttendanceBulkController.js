const StudentAttendanceBulk = require("../models/sequelize/StudentAttendanceBulk");
const Center = require("../models/sequelize/Center");

exports.createBulkAttendance = async (req, res) => {
  try {
    const { date, center_id, students } = req.body;

    if (!date || !center_id || !Array.isArray(students)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // roll_no is mandatory
    for (const s of students) {
      if (!s.roll_no || !s.status) {
        return res.status(400).json({
          message: "roll_no and status are required for every student"
        });
      }
    }

    const record = await StudentAttendanceBulk.create({
      date,
      center_id,
      ngo_id: req.user.ngo_id,
      uploaded_by: req.user.id,
      records: students
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      data: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { date, start_date, end_date, center_id, roll_no } = req.query;

    const where = { ngo_id: req.user.ngo_id };

    if (center_id) where.center_id = center_id;
    if (date) where.date = date;
    if (start_date && end_date) {
      where.date = { $between: [start_date, end_date] };
    }

    let data = await StudentAttendanceBulk.findAll({ where });

    // filter by roll_no (inside JSON)
    if (roll_no) {
      data = data.filter(r =>
        r.records.some(s => s.roll_no === roll_no)
      );
    }

    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const record = await StudentAttendanceBulk.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });

    await record.update(req.body);
    res.json({ message: "Updated", data: record });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const record = await StudentAttendanceBulk.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });

    await record.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
