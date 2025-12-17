module.exports = (sequelize, DataTypes) => {
  const StudentTimesheet = sequelize.define(
    "StudentTimesheet",
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

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      attendance: {
        type: DataTypes.ENUM("present", "absent"),
        allowNull: false,
      },

      class: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      subjects: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      topics_covered: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      quiz_percentage: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      level: {
        type: DataTypes.STRING,
        allowNull: true, // ✅ optional as you wanted
      },
    },
    {
      tableName: "student_timesheets",
      timestamps: true,
    }
  );

  return StudentTimesheet;
};
