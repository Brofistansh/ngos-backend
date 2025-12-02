const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const User = require('./User');
const Center = require('./Center');
const NGO = require('./NGO');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  center_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("present", "absent", "late"),
    defaultValue: "present"
  },
  marked_by: {
    type: DataTypes.UUID,  // Who marked attendance
    allowNull: false
  }
}, {
  tableName: "attendance",
  timestamps: true
});

// Relations
User.hasMany(Attendance, { foreignKey: "user_id" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

Center.hasMany(Attendance, { foreignKey: "center_id" });
Attendance.belongsTo(Center, { foreignKey: "center_id" });

NGO.hasMany(Attendance, { foreignKey: "ngo_id" });
Attendance.belongsTo(NGO, { foreignKey: "ngo_id" });

module.exports = Attendance;
