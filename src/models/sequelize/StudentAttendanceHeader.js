const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const StudentAttendanceHeader = sequelize.define(
  "StudentAttendanceHeader",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    center_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    ngo_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    tableName: "student_attendance_headers",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["date", "center_id"]
      }
    ]
  }
);

module.exports = StudentAttendanceHeader;
