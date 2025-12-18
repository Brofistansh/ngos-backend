const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');

const Center = sequelize.define('Center', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  contact_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },

  timezone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Asia/Kolkata"
  },

  zone: {
    type: DataTypes.STRING,
    allowNull: false
  },

  address: {
    type: DataTypes.STRING,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },

  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },

  // ✅ NEW: manager can manage multiple centers
  manager_id: {
    type: DataTypes.UUID,
    allowNull: true
  }

}, {
  tableName: 'centers',
  timestamps: true
});

module.exports = Center;
