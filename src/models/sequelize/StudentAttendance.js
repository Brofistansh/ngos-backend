// const { DataTypes } = require("sequelize");
// const sequelize = require("../../db/postgres");

// const StudentAttendance = sequelize.define(
//   "StudentAttendance",
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true
//     },

//     student_id: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },

//     roll_no: {
//       type: DataTypes.STRING(20),
//       allowNull: false
//     },

//     center_id: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },

//     ngo_id: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },

//     date: {
//       type: DataTypes.DATEONLY,
//       allowNull: false
//     },

//     status: {
//       type: DataTypes.ENUM("present", "absent", "leave"),
//       allowNull: false
//     },

//     remarks: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },

//     marked_by: {
//       type: DataTypes.UUID,
//       allowNull: false
//     }
//   },
//   {
//     tableName: "student_attendance",
//     timestamps: true,
//     indexes: [
//       { unique: true, fields: ["student_id", "date"] },
//       { fields: ["roll_no"] },
//       { fields: ["date"] }
//     ]
//   }
// );

// module.exports = StudentAttendance;


// const { DataTypes } = require("sequelize");
// const sequelize = require("../../db/postgres");

// const StudentAttendance = sequelize.define(
//   "StudentAttendance",
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true
//     },

//     student_id: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },

//     center_id: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },

//     date: {
//       type: DataTypes.DATEONLY,
//       allowNull: false
//     },

//     status: {
//       type: DataTypes.ENUM("present", "absent", "leave"),
//       allowNull: false
//     },

//     marked_by: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },

//     remarks: {
//       type: DataTypes.STRING,
//       allowNull: true
//     }
//   },
//   {
//     tableName: "student_attendance",
//     timestamps: true,
//     indexes: [{ unique: true, fields: ["student_id", "date"] }]
//   }
// );

// module.exports = StudentAttendance;
