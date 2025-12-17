const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db/postgres");

const StudentTimesheet = sequelize.define(
  "StudentTimesheet",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    center_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    ngo_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    attendance: {
      type: DataTypes.ENUM("present", "absent"),
      allowNull: false,
    },

    class: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subjects: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    topics_covered: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    quiz_percentage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    level: {
      type: DataTypes.STRING,
      allowNull: true, // 🔥 OPTIONAL (as you asked)
    },
  },
  {
    tableName: "student_timesheets",
    timestamps: true,
  }
);

module.exports = StudentTimesheet;
