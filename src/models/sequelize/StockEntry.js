const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const StockEntry = sequelize.define("StockEntry", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  stock_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  particulars: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  bill_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  receipt_qty: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  issue_qty: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  balance_qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "stock_entries",
  timestamps: true,
});

module.exports = StockEntry;
