const bcrypt = require('bcryptjs');
const User = require('../models/sequelize/User');
const ManagerDetails = require('../models/sequelize/ManagerDetails');
const { Op } = require("sequelize");

/**
 * CREATE CENTER MANAGER
 * - Prevents duplicate email
 * - Creates User + ManagerDetails safely
 */
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

    // 🔒 1. Check duplicate email
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Manager with this email already exists"
      });
    }

    // 🔐 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 3. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "center_admin",
      ngo_id,
      center_id,
      status: "active"
    });

    // 📄 4. Create ManagerDetails
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

  } catch (error) {
    console.error("Create Manager Error:", error);
    return res.status(500).json({
      message: "Failed to create center manager"
    });
  }
};


/**
 * GET ALL MANAGERS
 */
exports.getManagers = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.query;

    const where = {
      role: "center_admin",
      status: "active"
    };

    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;

    const managers = await User.findAll({
      where,
      include: [{ model: ManagerDetails, as: "manager_details" }],
      order: [["createdAt", "DESC"]]
    });

    return res.json({
      count: managers.length,
      data: managers
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch managers" });
  }
};


/**
 * GET MANAGER BY ID
 */
exports.getManagerById = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      where: { id, role: "center_admin" },
      include: [{ model: ManagerDetails, as: "manager_details" }]
    });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    return res.json(manager);

  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch manager" });
  }
};


/**
 * UPDATE MANAGER
 */
exports.updateManager = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      where: { id, role: "center_admin" },
      include: [{ model: ManagerDetails, as: "manager_details" }]
    });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    await manager.update(req.body);

    if (manager.manager_details) {
      await manager.manager_details.update(req.body);
    }

    return res.json({
      message: "Manager updated successfully",
      manager
    });

  } catch (error) {
    return res.status(500).json({ message: "Failed to update manager" });
  }
};


/**
 * SOFT DELETE MANAGER
 */
exports.deleteManager = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      where: { id, role: "center_admin" }
    });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    await manager.update({ status: "inactive" });

    return res.json({ message: "Manager deactivated successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Failed to delete manager" });
  }
};
