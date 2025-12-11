const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const User = require('./User');

const ManagerDetails = sequelize.define('ManagerDetails', {
  
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },

  father_name: DataTypes.STRING,
  mother_name: DataTypes.STRING,
  qualification: DataTypes.STRING,
  address: DataTypes.STRING,
  date_of_joining: DataTypes.DATEONLY,
  date_of_leaving: DataTypes.DATEONLY,
  honorarium: DataTypes.STRING,
  account_no: DataTypes.STRING,
  bank_name: DataTypes.STRING,
  ifsc_code: DataTypes.STRING,
  aadhar_card_no: DataTypes.STRING,
  manager_photo: DataTypes.STRING, // Cloudinary URL

}, {
  tableName: 'manager_details',
  timestamps: true
});

User.hasOne(ManagerDetails, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ManagerDetails.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ManagerDetails;
