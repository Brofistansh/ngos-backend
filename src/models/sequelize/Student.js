// src/models/sequelize/Student.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const Center = require('./Center');
const NGO = require('./NGO');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: true },
  gender: { type: DataTypes.ENUM('male','female','other'), allowNull: true },
  ngo_id: { type: DataTypes.UUID, allowNull: false },
  center_id: { type: DataTypes.UUID, allowNull: false },
  assigned_teacher_id: { type: DataTypes.UUID, allowNull: true },
  enrollment_status: { type: DataTypes.ENUM('active','inactive','graduated'), defaultValue: 'active' }
}, {
  tableName: 'students',
  timestamps: true
});

// associations
Center.hasMany(Student, { foreignKey: 'center_id' });
Student.belongsTo(Center, { foreignKey: 'center_id' });

NGO.hasMany(Student, { foreignKey: 'ngo_id' });
Student.belongsTo(NGO, { foreignKey: 'ngo_id' });

module.exports = Student;
