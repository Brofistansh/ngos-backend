const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const ManagerCenter = sequelize.define(
  "ManagerCenter",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    manager_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    center_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "manager_centers",
    timestamps: true,
  }
);

module.exports = ManagerCenter;
