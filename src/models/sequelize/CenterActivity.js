const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");
const Center = require("./Center");

const CenterActivity = sequelize.define(
  "CenterActivity",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    activity_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    participants: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    metrics: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    conducted_by: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    center_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    ngo_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "center_activities",
    timestamps: true,
  }
);

// 🔗 ASSOCIATION
CenterActivity.belongsTo(Center, {
  foreignKey: "center_id",
  as: "activity_center",
});

module.exports = CenterActivity;
