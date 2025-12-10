const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');

const User = sequelize.define('User', {
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

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true, notEmpty: true }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM(
      'super_admin',
      'ngo_admin',
      'center_admin',
      'staff',
      'donor',
      'teacher',
      'volunteer'
    ),
    allowNull: false,
    defaultValue: 'teacher'
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,  // prevent duplicate registrations
    validate: {
      isNumeric: {
        msg: 'Phone number must contain only digits'
      },
      len: {
        args: [10, 15],
        msg: 'Phone number must be between 10-15 digits'
      }
    }
  },

  ngo_id: {
    type: DataTypes.UUID,
    allowNull: true
  },

  center_id: {
    type: DataTypes.UUID,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }

}, {
  tableName: 'users',
  timestamps: true,

  validate: {
    // Phone must be required only if teacher or volunteer
    phoneRequiredForRoles() {
      if (['teacher', 'volunteer'].includes(this.role) && !this.phone) {
        throw new Error('Phone number is required for teachers & volunteers');
      }
    },

    // Manager/Admin must have NGO/Center assigned
    validateAdminAssignments() {
      if (this.role === 'ngo_admin' && !this.ngo_id) {
        throw new Error('NGO Admin must be linked with an NGO');
      }

      if (this.role === 'center_admin') {
        if (!this.center_id) {
          throw new Error('Center Admin must be linked with a Center');
        }
        if (!this.ngo_id) {
          throw new Error('Center Admin must belong to an NGO');
        }
      }
    }
  }
});

module.exports = User;
