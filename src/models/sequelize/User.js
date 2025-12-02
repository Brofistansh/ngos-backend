// src/models/sequelize/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.UUID,  
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true 
  },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { 
    type: DataTypes.ENUM(
      'super_admin',
      'ngo_admin',
      'ngo_manager',
      'center_manager',
      'teacher',
      'volunteer',
      'analyst',
      'donor'
    ),
    allowNull: false,
    defaultValue: 'volunteer'
  },
  ngo_id: { type: DataTypes.UUID, allowNull: true },
  center_id: { type: DataTypes.UUID, allowNull: true },
  status: { 
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
