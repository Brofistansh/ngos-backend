// src/models/sequelize/PasswordResetToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const User = require('./User');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  token_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  used: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'password_reset_tokens',
  timestamps: true
});

User.hasMany(PasswordResetToken, { foreignKey: 'user_id' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = PasswordResetToken;
