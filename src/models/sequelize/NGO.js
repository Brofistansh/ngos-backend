const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');

const NGO = sequelize.define('NGO', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  registration_number: { type: DataTypes.STRING },
  contact_email: { type: DataTypes.STRING },
}, {
  tableName: 'ngos',
  timestamps: true
});

module.exports = NGO;
