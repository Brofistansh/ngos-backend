const sequelize = require("../../db/postgres");

/**
 * MODELS
 */
const User = require("./User");
const NGO = require("./NGO");
const Center = require("./Center");
const Teacher = require("./Teacher");
const Student = require("./Student");
const ManagerDetails = require("./ManagerDetails");
const ManagerCenter = require("./ManagerCenter");
const TeacherTimesheet = require("./TeacherTimesheet"); // ✅ ADD THIS

/**
 * ============================
 * CORE ASSOCIATIONS
 * ============================
 */

// NGO → Centers
NGO.hasMany(Center, { foreignKey: "ngo_id" });
Center.belongsTo(NGO, { foreignKey: "ngo_id" });

// NGO → Users
NGO.hasMany(User, { foreignKey: "ngo_id" });
User.belongsTo(NGO, { foreignKey: "ngo_id" });

// Center → Users
Center.hasMany(User, { foreignKey: "center_id" });
User.belongsTo(Center, { foreignKey: "center_id" });

/**
 * ============================
 * USER → MANAGER DETAILS (ONLY ONCE)
 * ============================
 */
User.hasOne(ManagerDetails, {
  foreignKey: "user_id",
  as: "manager_details",
});
ManagerDetails.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

/**
 * ============================
 * MANAGER ↔ CENTER (MANY TO MANY)
 * ============================
 */

// Manager (User) → ManagerCenter
User.hasMany(ManagerCenter, {
  foreignKey: "manager_id",
  as: "managed_centers",
});

// ManagerCenter → User
ManagerCenter.belongsTo(User, {
  foreignKey: "manager_id",
  as: "manager",
});

// Center → ManagerCenter
Center.hasMany(ManagerCenter, {
  foreignKey: "center_id",
  as: "center_managers",
});

// ManagerCenter → Center
ManagerCenter.belongsTo(Center, {
  foreignKey: "center_id",
  as: "center",
});

/**
 * ============================
 * TEACHER ↔ TEACHER TIMESHEET ✅ (FIX)
 * ============================
 */

// Teacher → TeacherTimesheet
Teacher.hasMany(TeacherTimesheet, {
  foreignKey: "teacher_id",
  as: "timesheets",
});

// TeacherTimesheet → Teacher
TeacherTimesheet.belongsTo(Teacher, {
  foreignKey: "teacher_id",
  as: "teacher",
});

module.exports = {
  sequelize,
  User,
  NGO,
  Center,
  Teacher,
  Student,
  ManagerDetails,
  ManagerCenter,
  TeacherTimesheet, // ✅ EXPORT THIS
};

const StockHeader = require("./StockHeader");
const StockEntry = require("./StockEntry");

// Stock Header → Entries
StockHeader.hasMany(StockEntry, {
  foreignKey: "stock_id",
  as: "entries",
});

StockEntry.belongsTo(StockHeader, {
  foreignKey: "stock_id",
  as: "stock",
});

// ============================
// USER ↔ TEACHER (ADD THIS)
// ============================
User.hasOne(Teacher, {
  foreignKey: "user_id",
  as: "teacher_profile",
});

Teacher.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});


const DailyCenterReport = require("./DailyCenterReport");

Center.hasMany(DailyCenterReport, {
  foreignKey: "center_id"
});

DailyCenterReport.belongsTo(Center, {
  foreignKey: "center_id",
  as: "report_center"
});

