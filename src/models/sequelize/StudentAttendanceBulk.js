const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const StudentAttendanceBulk = sequelize.define(
  "StudentAttendanceBulk",
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
    },

    records: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  },
  {
    tableName: "student_attendance_bulk",
    timestamps: false   // 🔥 THIS LINE FIXES EVERYTHING
  }
);

module.exports = StudentAttendanceBulk;
