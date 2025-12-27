const StudentAttendanceBulk = require("../models/sequelize/StudentAttendanceBulk");
const Center = require("../models/sequelize/Center");
const Student = require("../models/sequelize/Student");

/* ================= CREATE BULK ATTENDANCE ================= */

exports.createBulkAttendance = async (req, res) => {
  try {
    const { date, center_id, students } = req.body;

    if (!date || !center_id || !Array.isArray(students)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

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

    /* ===== ENRICH RESPONSE ===== */

    const rollNos = students.map(s => s.roll_no);

    const studentList = await Student.findAll({
      where: { roll_no: rollNos },
      attributes: [
        "roll_no",
        "first_name",
        "middle_name",
        "last_name",
        "current_class"
      ]
    });

    const studentMap = {};
    studentList.forEach(s => {
      studentMap[s.roll_no] = s;
    });

    const enrichedRecords = record.records.map(r => {
      const student = studentMap[r.roll_no];

      return {
        ...r,
        name: student
          ? [student.first_name, student.middle_name, student.last_name]
              .filter(Boolean)
              .join(" ")
          : null,
        class: student?.current_class || null,
        level: null
      };
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      data: {
        ...record.toJSON(),
        records: enrichedRecords
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ATTENDANCE ================= */

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

    if (roll_no) {
      data = data.filter(r =>
        r.records.some(s => s.roll_no === roll_no)
      );
    }

    /* ===== ENRICH RESPONSE ===== */

    const rollNos = new Set();
    data.forEach(d => {
      d.records.forEach(r => rollNos.add(r.roll_no));
    });

    const students = await Student.findAll({
      where: { roll_no: [...rollNos] },
      attributes: [
        "roll_no",
        "first_name",
        "middle_name",
        "last_name",
        "current_class"
      ]
    });

    const studentMap = {};
    students.forEach(s => {
      studentMap[s.roll_no] = s;
    });

    const enrichedData = data.map(d => {
      const enrichedRecords = d.records.map(r => {
        const student = studentMap[r.roll_no];

        return {
          ...r,
          name: student
            ? [student.first_name, student.middle_name, student.last_name]
                .filter(Boolean)
                .join(" ")
            : null,
          class: student?.current_class || null,
          level: null
        };
      });

      return {
        ...d.toJSON(),
        records: enrichedRecords
      };
    });

    res.json({
      count: enrichedData.length,
      data: enrichedData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE ATTENDANCE ================= */

exports.updateAttendance = async (req, res) => {
  try {
    const record = await StudentAttendanceBulk.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Not found" });
    }

    await record.update(req.body);

    res.json({
      message: "Updated",
      data: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE ATTENDANCE ================= */

exports.deleteAttendance = async (req, res) => {
  try {
    const record = await StudentAttendanceBulk.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Not found" });
    }

    await record.destroy();

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
