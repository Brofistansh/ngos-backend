const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const TeacherAttendance = sequelize.define(
  "TeacherAttendance",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    center_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM("present", "absent", "leave"),
      allowNull: false
    },

    marked_by: {
      type: DataTypes.UUID,
      allowNull: false
    },

    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: "teacher_attendance",
    timestamps: true,
    indexes: [{ unique: true, fields: ["teacher_id", "date"] }]
  }
);

module.exports = TeacherAttendance;
