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
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },

  father_name: {
    type: DataTypes.STRING,
    allowNull: true
  },

  mother_name: {
    type: DataTypes.STRING,
    allowNull: true
  },

  qualification: {
    type: DataTypes.STRING,
    allowNull: true
  },

  address: {
    type: DataTypes.STRING,
    allowNull: true
  },

  date_of_joining: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  date_of_leaving: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  honorarium: {
    type: DataTypes.STRING,
    allowNull: true
  },

  account_no: {
    type: DataTypes.STRING,
    allowNull: true
  },

  bank_name: {
    type: DataTypes.STRING,
    allowNull: true
  },

  ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true
  },

  aadhar_card_no: {
    type: DataTypes.STRING,
    allowNull: true
  },

  manager_photo: {
    type: DataTypes.STRING, // Cloudinary URL
    allowNull: true
  }

}, {
  tableName: 'manager_details',
  timestamps: true
});


/* ---------------------------------------------------
   ASSOCIATIONS
------------------------------------------------------ */

User.hasOne(ManagerDetails, {
  foreignKey: 'user_id',
  as: 'manager_details',
  onDelete: 'CASCADE'
});

ManagerDetails.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = ManagerDetails;
