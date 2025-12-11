const bcrypt = require('bcryptjs');
const User = require('../models/sequelize/User');
const ManagerDetails = require('../models/sequelize/ManagerDetails');

exports.createCenterManager = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      ngo_id,
      center_id,
      father_name,
      mother_name,
      qualification,
      address,
      date_of_joining,
      date_of_leaving,
      honorarium,
      account_no,
      bank_name,
      ifsc_code,
      aadhar_card_no,
      manager_photo
    } = req.body;

    // 1️⃣ Create User account for login
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "center_admin",   // IMPORTANT
      ngo_id,
      center_id
    });

    // 2️⃣ Create ManagerDetails
    const details = await ManagerDetails.create({
      user_id: user.id,
      father_name,
      mother_name,
      qualification,
      address,
      date_of_joining,
      date_of_leaving,
      honorarium,
      account_no,
      bank_name,
      ifsc_code,
      aadhar_card_no,
      manager_photo
    });

    return res.status(201).json({
      message: "Center Manager created successfully",
      user,
      details
    });

  } catch (err) {
    console.error("Create Manager Error:", err);
    res.status(500).json({ message: "Failed to create center manager" });
  }
};
