// src/models/sequelize/Donation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const Donor = require('./Donor');
const NGO = require('./NGO');
const Center = require('./Center');
const User = require('./User');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  donor_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  center_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12,2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(8),
    allowNull: false,
    defaultValue: 'INR'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  method: {
    type: DataTypes.ENUM('cash','bank','upi','online','cheque','other'),
    defaultValue: 'online'
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receipt_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('completed','pending','failed'),
    defaultValue: 'completed'
  },
  recorded_by: { // user who recorded the donation
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'donations',
  timestamps: true,
  indexes: [{ fields: ['ngo_id'] }, { fields: ['center_id'] }, { fields: ['donor_id'] }]
});

// Relations
Donor.hasMany(Donation, { foreignKey: 'donor_id' });
Donation.belongsTo(Donor, { foreignKey: 'donor_id' });

NGO.hasMany(Donation, { foreignKey: 'ngo_id' });
Donation.belongsTo(NGO, { foreignKey: 'ngo_id' });

Center.hasMany(Donation, { foreignKey: 'center_id' });
Donation.belongsTo(Center, { foreignKey: 'center_id' });

User.hasMany(Donation, { foreignKey: 'recorded_by' });
Donation.belongsTo(User, { foreignKey: 'recorded_by' });

module.exports = Donation;
src/routes/donation.js
