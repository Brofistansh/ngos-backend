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
const TeacherTimesheet = require("./TeacherTimesheet");
const StockHeader = require("./StockHeader");
const StockEntry = require("./StockEntry");
const DailyCenterReport = require("./DailyCenterReport");

/**
 * ============================
 * CORE
 * ============================
 */
NGO.hasMany(Center, { foreignKey: "ngo_id" });
Center.belongsTo(NGO, { foreignKey: "ngo_id" });

NGO.hasMany(User, { foreignKey: "ngo_id" });
User.belongsTo(NGO, { foreignKey: "ngo_id" });

Center.hasMany(User, { foreignKey: "center_id" });
User.belongsTo(Center, { foreignKey: "center_id" });

/**
 * ============================
 * USER ↔ MANAGER DETAILS
 * ============================
 */
User.hasOne(ManagerDetails, {
  foreignKey: "user_id",
  as: "manager_details"
});

ManagerDetails.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

/**
 * ============================
 * MANAGER ↔ CENTER
 * ============================
 */
User.hasMany(ManagerCenter, {
  foreignKey: "manager_id",
  as: "managed_centers"
});

ManagerCenter.belongsTo(User, {
  foreignKey: "manager_id",
  as: "manager"
});

Center.hasMany(ManagerCenter, {
  foreignKey: "center_id",
  as: "center_managers"
});

ManagerCenter.belongsTo(Center, {
  foreignKey: "center_id",
  as: "center"
});

/**
 * ============================
 * USER ↔ TEACHER
 * ============================
 */
User.hasOne(Teacher, {
  foreignKey: "user_id",
  as: "teacher_profile"
});

Teacher.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

/**
 * ============================
 * TEACHER ↔ TIMESHEET
 * ============================
 */
Teacher.hasMany(TeacherTimesheet, {
  foreignKey: "teacher_id",
  as: "timesheets"
});

TeacherTimesheet.belongsTo(Teacher, {
  foreignKey: "teacher_id",
  as: "teacher"
});

/**
 * ============================
 * STOCK
 * ============================
 */
StockHeader.hasMany(StockEntry, {
  foreignKey: "stock_id",
  as: "entries"
});

StockEntry.belongsTo(StockHeader, {
  foreignKey: "stock_id",
  as: "stock"
});

/**
 * ============================
 * DAILY CENTER REPORT ✅ (FIXED)
 * ============================
 */
Center.hasMany(DailyCenterReport, {
  foreignKey: "center_id",
  as: "daily_reports"
});

DailyCenterReport.belongsTo(Center, {
  foreignKey: "center_id",
  as: "report_center"
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
  TeacherTimesheet,
  StockHeader,
  StockEntry,
  DailyCenterReport
};
