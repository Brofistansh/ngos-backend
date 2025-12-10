// src/models/sequelize/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM(
      'super_admin',
      'ngo_admin',
      'center_admin',
      'staff',
      'donor',
      'teacher',
      'volunteer'
    ),
    allowNull: false,
    defaultValue: 'staff'
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true  // phone is not required for all roles
  },

  ngo_id: {
    type: DataTypes.UUID,
    allowNull: true
  },

  center_id: {
    type: DataTypes.UUID,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }

}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
