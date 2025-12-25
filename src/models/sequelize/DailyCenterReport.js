const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");
const Center = require("./Center");

const DailyCenterReport = sequelize.define("DailyCenterReport", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  day: {
    type: DataTypes.STRING,
    allowNull: false
  },

  thought_of_the_day: {
    type: DataTypes.STRING,
    allowNull: true
  },

  total_students_present: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  daily_checklist: {
    type: DataTypes.JSONB,
    allowNull: false
  },

  class_details: {
    type: DataTypes.JSONB,
    allowNull: false
  },

  extra_activities: {
    type: DataTypes.STRING,
    allowNull: true
  },

  visitors_info: {
    type: DataTypes.STRING,
    allowNull: true
  },

  suggestions_or_challenges: {
    type: DataTypes.STRING,
    allowNull: true
  },

  posted_by: {
    type: DataTypes.JSONB,
    allowNull: false
  },

  // RELATIONS
  center_id: {
    type: DataTypes.UUID,
    allowNull: false
  },

  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false
  }

}, {
  tableName: "daily_center_reports",
  timestamps: true
});

DailyCenterReport.belongsTo(Center, {
  foreignKey: "center_id",
  as: "center"
});

module.exports = DailyCenterReport;
