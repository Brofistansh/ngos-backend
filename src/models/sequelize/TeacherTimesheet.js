const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const TeacherTimesheet = sequelize.define(
  "TeacherTimesheet",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    ngo_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    center_id: {
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

    in_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    out_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    total_home_visit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    level: {
      type: DataTypes.STRING,
      allowNull: true, // OPTIONAL
    },
  },
  {
    tableName: "teacher_timesheets",
    timestamps: true,
  }
);

module.exports = TeacherTimesheet;
