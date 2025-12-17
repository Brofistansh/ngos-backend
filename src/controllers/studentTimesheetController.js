const { StudentTimesheet, Student } = require("../models/sequelize");

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

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const timesheet = await StudentTimesheet.create({
      student_id,
      ngo_id: student.ngo_id,
      center_id: student.center_id,
      date,
      attendance,
      class: className,
      subjects,
      topics_covered,
      quiz_percentage,
      level,
    });

    res.status(201).json({
      message: "Student timesheet created successfully",
      data: timesheet,
    });
  } catch (err) {
    console.error("Student Timesheet Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
