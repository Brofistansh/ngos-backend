const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const StudentAttendanceEntry = sequelize.define(
  "StudentAttendanceEntry",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    attendance_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    student_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    roll_no: {
      type: DataTypes.STRING(11),
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM("present", "absent", "leave"),
      allowNull: false
    },

    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: "student_attendance_entries",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["attendance_id", "roll_no"]
      }
    ]
  }
);

module.exports = StudentAttendanceEntry;
