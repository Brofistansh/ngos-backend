// src/models/sequelize/Donor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const NGO = require('./NGO');

const Donor = sequelize.define('Donor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'donors',
  timestamps: true
});

// association (optional): donors can be associated to NGO (not required, but helpful)
NGO.hasMany(Donor, { foreignKey: 'ngo_id', sourceKey: 'id' });
Donor.belongsTo(NGO, { foreignKey: 'ngo_id', targetKey: 'id' });

module.exports = Donor;
