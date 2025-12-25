const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const Visit = sequelize.define("Visit", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  visit_date: { type: DataTypes.DATEONLY, allowNull: false },
  from_time: { type: DataTypes.STRING, allowNull: true },
  to_time: { type: DataTypes.STRING, allowNull: true },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: true },

  purpose: { type: DataTypes.STRING, allowNull: true },
  number_of_visitors: { type: DataTypes.INTEGER, allowNull: true },

  visitors: { type: DataTypes.JSONB, allowNull: false },
  feedback: { type: DataTypes.STRING, allowNull: true },
  assisted_by: { type: DataTypes.JSONB, allowNull: true },
  attachments: { type: DataTypes.JSONB, allowNull: true },

  center_id: { type: DataTypes.UUID, allowNull: false },
  ngo_id: { type: DataTypes.UUID, allowNull: false }
}, {
  tableName: "visits",
  timestamps: true
});

module.exports = Visit;
