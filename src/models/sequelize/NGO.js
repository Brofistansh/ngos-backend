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
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true     // TEMP FIX
  },

  zone: {
    type: DataTypes.STRING,
    allowNull: true     // TEMP FIX
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }

}, {
  tableName: 'ngos',
  timestamps: true
});

module.exports = NGO;
