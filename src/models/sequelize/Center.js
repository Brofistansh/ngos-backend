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

  address: {
    type: DataTypes.STRING,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },

  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false
  }

}, {
  tableName: 'centers',
  timestamps: true
});

module.exports = Center;
