const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const StockHeader = sequelize.define("StockHeader", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  teacher_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  ngo_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  center_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: "stock_headers",
  timestamps: true,
});

module.exports = StockHeader;
