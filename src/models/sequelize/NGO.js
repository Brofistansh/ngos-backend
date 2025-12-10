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
    allowNull: false
  },

  registration_number: {
    type: DataTypes.STRING,
    allowNull: true
  },

  contact_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true }
  },

  // 🔄 TEMP FIX: allowNull set to true
  phone: {
    type: DataTypes.STRING,
    allowNull: true   // will make required later
  },

  // 🔄 TEMP FIX: allowNull set to true
  zone: {
    type: DataTypes.STRING,
    allowNull: true   // will make required later
  }

}, {
  tableName: 'ngos',
  timestamps: true
});

module.exports = NGO;
