const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const NGO = require('./NGO');

const Center = sequelize.define('Center', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: { type: DataTypes.STRING, allowNull: false },
  contact_phone: { type: DataTypes.STRING },
  timezone: { type: DataTypes.STRING, defaultValue: "Asia/Kolkata" }
}, {
  tableName: 'centers',
  timestamps: true
});

// Relationship
NGO.hasMany(Center, { foreignKey: 'ngo_id' });
Center.belongsTo(NGO, { foreignKey: 'ngo_id' });

module.exports = Center;
