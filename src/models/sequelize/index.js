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

/**
 * ============================
 * EXISTING ASSOCIATIONS
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

// User → ManagerDetails
User.hasOne(ManagerDetails, {
  foreignKey: "user_id",
  as: "manager_details",
});
ManagerDetails.belongsTo(User, {
  foreignKey: "user_id",
});

/**
 * ============================
 * ✅ NEW: MANAGER ↔ CENTER (MANY TO MANY)
 * ============================
 */

// Manager (User) → ManagerCenter
User.hasMany(ManagerCenter, {
  foreignKey: "manager_id",
});

// ManagerCenter → User
ManagerCenter.belongsTo(User, {
  foreignKey: "manager_id",
});

// Center → ManagerCenter
Center.hasMany(ManagerCenter, {
  foreignKey: "center_id",
});

// ManagerCenter → Center
ManagerCenter.belongsTo(Center, {
  foreignKey: "center_id",
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
};
