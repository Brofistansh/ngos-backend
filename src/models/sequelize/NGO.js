const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');

const NGO = sequelize.define('NGO', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: true }
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },

  zone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }

}, {
  tableName: 'ngos',
  timestamps: true
});

module.exports = NGO;
