// src/models/sequelize/RefreshToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db/postgres');
const User = require('./User');

const RefreshToken = sequelize.define('RefreshToken', {
  token_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  revoked: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'refresh_tokens',
  timestamps: true
});

if (User) {
  User.hasMany(RefreshToken, { foreignKey: 'user_id' });
  RefreshToken.belongsTo(User, { foreignKey: 'user_id' });
}

module.exports = RefreshToken;
