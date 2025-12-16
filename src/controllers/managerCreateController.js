const bcrypt = require('bcryptjs');
const User = require('../models/sequelize/User');
const ManagerDetails = require('../models/sequelize/ManagerDetails');
const { Op } = require("sequelize");

/**
 * CREATE CENTER MANAGER
 * Creates User (center_admin) + ManagerDetails
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

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user login
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "center_admin",
      ngo_id,
      center_id,
      status: "active"
    });

    // Create ManagerDetails entry
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
    return res.status(500).json({ message: "Failed to create center manager" });
  }
};


/**
 * GET ALL MANAGERS (with optional filters)
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

  } catch (err) {
    console.error("Error fetching managers:", err);
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

    if (!manager)
      return res.status(404).json({ message: "Manager not found" });

    return res.json(manager);

  } catch (err) {
    console.error("Error fetching manager:", err);
    return res.status(500).json({ message: "Failed to fetch manager" });
  }
};


/**
 * UPDATE MANAGER (updates both User + ManagerDetails)
 */
exports.updateManager = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      where: { id, role: "center_admin" },
      include: [{ model: ManagerDetails, as: "manager_details" }]
    });

    if (!manager)
      return res.status(404).json({ message: "Manager not found" });

    // Update User table
    await manager.update(req.body);

    // Update ManagerDetails table
    await manager.manager_details.update(req.body);

    return res.json({
      message: "Manager updated successfully",
      manager
    });

  } catch (err) {
    console.error("Update manager error:", err);
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

    if (!manager)
      return res.status(404).json({ message: "Manager not found" });

    await manager.update({ status: "inactive" });

    return res.json({ message: "Manager deactivated successfully" });

  } catch (err) {
    console.error("Delete manager error:", err);
    return res.status(500).json({ message: "Failed to delete manager" });
  }
};
