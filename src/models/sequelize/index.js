// src/models/sequelize/index.js

const Student = require("./Student");
const Teacher = require("./Teacher");
const TeacherTimesheet = require("./TeacherTimesheet");
const StudentTimesheet = require("./StudentTimesheet");

// --------------------
// ASSOCIATIONS
// --------------------

// Teacher ↔ TeacherTimesheet
Teacher.hasMany(TeacherTimesheet, {
  foreignKey: "teacher_id",
});

TeacherTimesheet.belongsTo(Teacher, {
  foreignKey: "teacher_id",
});

// Student ↔ StudentTimesheet
Student.hasMany(StudentTimesheet, {
  foreignKey: "student_id",
});

StudentTimesheet.belongsTo(Student, {
  foreignKey: "student_id",
});

module.exports = {
  Student,
  Teacher,
  TeacherTimesheet,
  StudentTimesheet,
};
