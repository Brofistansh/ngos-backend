const StudentTimesheet = require("../models/sequelize/StudentTimeSheet");
const Student = require("../models/sequelize/Student");

exports.createStudentTimesheet = async (req, res) => {
  try {
    const {
      student_id,
      date,
      attendance,
      class: className,
      subjects,
      topics_covered,
      quiz_percentage,
      level,
    } = req.body;

    const teacher = req.user;

    // 1. Validate student exists
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Create timesheet
    const timesheet = await StudentTimesheet.create({
      student_id,
      teacher_id: teacher.id,
      center_id: teacher.center_id,
      ngo_id: teacher.ngo_id,
      date,
      attendance,
      class: className,
      subjects,
      topics_covered,
      quiz_percentage,
      level, // optional
    });

    res.status(201).json({
      message: "Student timesheet created successfully",
      data: timesheet,
    });
  } catch (err) {
    console.error("Create Student Timesheet Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
