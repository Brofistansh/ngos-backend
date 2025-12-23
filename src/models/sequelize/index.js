const User = require("./User");
const Teacher = require("./Teacher");
const TeacherTimesheet = require("./TeacherTimesheet");

// --------------------
// ASSOCIATIONS
// --------------------

// Teacher ↔ User
Teacher.belongsTo(User, {
  foreignKey: "user_id",
});
User.hasOne(Teacher, {
  foreignKey: "user_id",
});

// Teacher ↔ TeacherTimesheet
Teacher.hasMany(TeacherTimesheet, {
  foreignKey: "teacher_id",
});
TeacherTimesheet.belongsTo(Teacher, {
  foreignKey: "teacher_id",
});

module.exports = {
  User,
  Teacher,
  TeacherTimesheet,
};
