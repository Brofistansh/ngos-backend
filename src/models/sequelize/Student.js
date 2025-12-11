const { DataTypes } = require("sequelize");
const sequelize = require("../../db/postgres");
const NGO = require("./NGO");
const Center = require("./Center");

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // -------------------------
  // 🔹 PERSONAL DETAILS
  // -------------------------
  first_name: { type: DataTypes.STRING, allowNull: false },
  middle_name: { type: DataTypes.STRING, allowNull: true },
  last_name: { type: DataTypes.STRING, allowNull: true },

  gender: { type: DataTypes.STRING, allowNull: true },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
  blood_group: { type: DataTypes.STRING, allowNull: true },

  student_status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active"
  },

  address: { type: DataTypes.TEXT, allowNull: true },

  student_photo: { type: DataTypes.STRING, allowNull: true }, // Cloudinary URL

  // -------------------------
  // 🔹 EDUCATION DETAILS
  // -------------------------
  school_name: { type: DataTypes.STRING, allowNull: true },
  school_board: { type: DataTypes.STRING, allowNull: true },

  current_class: { type: DataTypes.STRING, allowNull: true },     // e.g., Class 5, Class 6
  class_entering_upay: { type: DataTypes.STRING, allowNull: true },

  date_of_joining_upay: { type: DataTypes.DATEONLY, allowNull: true },
  date_of_leaving_upay: { type: DataTypes.DATEONLY, allowNull: true },

  // -------------------------
  // 🔹 FAMILY DETAILS
  // -------------------------
  father_name: { type: DataTypes.STRING, allowNull: true },
  mother_name: { type: DataTypes.STRING, allowNull: true },

  father_occupation: { type: DataTypes.STRING, allowNull: true },
  mother_occupation: { type: DataTypes.STRING, allowNull: true },

  total_family_members: { type: DataTypes.INTEGER, allowNull: true },

  contact_number: { type: DataTypes.STRING, allowNull: true },

  aadhaar_card: { type: DataTypes.STRING, allowNull: true },

  availing_scholarship: { type: DataTypes.BOOLEAN, defaultValue: false },

  // -------------------------
  // 🔹 EXTRA ATTRIBUTES FROM UI
  // -------------------------
  hobby: { type: DataTypes.STRING, allowNull: true },
  insurance: { type: DataTypes.BOOLEAN, defaultValue: false },
  bank_account: { type: DataTypes.BOOLEAN, defaultValue: false },
  smartphone: { type: DataTypes.BOOLEAN, defaultValue: false },

  // -------------------------
  // 🔹 RELATIONS
  // -------------------------
  ngo_id: { type: DataTypes.UUID, allowNull: false },
  center_id: { type: DataTypes.UUID, allowNull: false }
});

// RELATIONS
Student.belongsTo(NGO, { foreignKey: "ngo_id" });
Student.belongsTo(Center, { foreignKey: "center_id" });

module.exports = Student;
