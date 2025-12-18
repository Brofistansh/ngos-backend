const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");

const StudentPerformanceReport = sequelize.define(
  "StudentPerformanceReport",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    student_id: {
      type: DataTypes.UUID,
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

    class: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    test_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    /**
     * Example:
     * [
     *  { "name": "Maths", "score": 9, "out_of": 10 },
     *  { "name": "English", "score": 8, "out_of": 10 }
     * ]
     */
    parameters: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    total_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    max_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "student_performance_reports",
    timestamps: true,
  }
);

module.exports = StudentPerformanceReport;
