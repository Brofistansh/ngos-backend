// src/models/sequelize/StudentAttendance.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const Student = require('./Student');
const Center = require('./Center');
const NGO = require('./NGO');
const User = require('./User');

const StudentAttendance = sequelize.define('StudentAttendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present','absent','late','excused'),
    defaultValue: 'present'
  },
  marked_by: {
    type: DataTypes.UUID, // user who marked (teacher/center_manager)
    allowNull: false
  }
}, {
  tableName: 'student_attendance',
  timestamps: true,
  indexes: [{ unique: true, fields: ['student_id','date'] }] // ensure one per day
});

// relations
Student.hasMany(StudentAttendance, { foreignKey: 'student_id' });
StudentAttendance.belongsTo(Student, { foreignKey: 'student_id' });

Center.hasMany(StudentAttendance, { foreignKey: 'center_id' });
StudentAttendance.belongsTo(Center, { foreignKey: 'center_id' });

NGO.hasMany(StudentAttendance, { foreignKey: 'ngo_id' });
StudentAttendance.belongsTo(NGO, { foreignKey: 'ngo_id' });

User.hasMany(StudentAttendance, { foreignKey: 'marked_by' });
StudentAttendance.belongsTo(User, { foreignKey: 'marked_by' });

module.exports = StudentAttendance;
