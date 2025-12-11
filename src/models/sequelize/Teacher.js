// src/models/sequelize/Teacher.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  user_id: {                 // FK -> users.id
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },

  teacher_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  date_of_joining: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  father_name: { type: DataTypes.STRING, allowNull: true },
  mother_name: { type: DataTypes.STRING, allowNull: true },
  qualification: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  date_of_leaving: { type: DataTypes.DATEONLY, allowNull: true },
  honorarium: { type: DataTypes.STRING, allowNull: true }, // or BOOLEAN if needed
  account_no: { type: DataTypes.STRING, allowNull: true },
  bank_name: { type: DataTypes.STRING, allowNull: true },
  ifsc_code: { type: DataTypes.STRING, allowNull: true },

  teacher_photo: { type: DataTypes.STRING, allowNull: true }, // cloudinary url
  aadhar_card_no: { type: DataTypes.STRING, allowNull: true },

  center_id: {
    type: DataTypes.UUID,
    allowNull: false
  },

  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }

}, {
  tableName: 'teachers',
  timestamps: true
});

module.exports = Teacher;
