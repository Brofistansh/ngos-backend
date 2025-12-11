// src/controllers/managerController.js
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const User = require('../models/sequelize/User');
const NGO = require('../models/sequelize/NGO');
const Center = require('../models/sequelize/Center');

/**
 * POST /api/managers
 * Create a manager (ngo_admin or center_admin)
 */
exports.createManager = async (req, res) => {
  try {
    const actor = req.user; // logged-in user performing the action

    const {
      name,
      email,
      password,
      role,
      phone,
      ngo_id,
      center_id
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !ngo_id) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, role, ngo_id are required"
      });
    }

    // ROLE must be either ngo_admin or center_admin
    if (!['ngo_admin', 'center_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be either ngo_admin or center_admin"
      });
    }

    // If role is center_admin => center_id required
    if (role === 'center_admin' && !center_id) {
      return res.status(400).json({
        success: false,
        message: "center_id is required when role = center_admin"
      });
    }

    // Validate NGO exists
    const ngo = await NGO.findByPk(ngo_id);
    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }

    // Validate center exists & belongs to NGO (when role is center_admin)
    if (role === 'center_admin') {
      const center = await Center.findOne({ where: { id: center_id, ngo_id } });
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found or does not belong to the provided NGO"
        });
      }
    }

    // PERMISSION CHECKS:
    // super_admin → can create all
    // ngo_admin → can create only within their NGO
    if (actor.role === 'ngo_admin' && actor.ngo_id !== ngo_id) {
      return res.status(403).json({
        success: false,
        message: "NGO Admins can only create managers inside their own NGO"
      });
    }

    if (!['super_admin', 'ngo_admin'].includes(actor.role)) {
      return res.status(403).json({
        success: false,
        message: "Only super_admin or ngo_admin may create managers"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create manager (User record)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      ngo_id,
      center_id: role === 'center_admin' ? center_id : null,
      status: "active"
    });

    // Exclude password in response
    return res.status(201).json({
      success: true,
      message: "Manager created successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        ngo_id: newUser.ngo_id,
        center_id: newUser.center_id
      }
    });

  } catch (err) {
    console.error("Error in createManager:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating manager"
    });
  }
};


/**
 * GET /api/managers?ngo_id=<uuid>&center_id=<uuid>
 * Returns NGO admins + center admins
 */
exports.listManagers = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.query;

    const where = {
      role: {
        [Op.in]: ['ngo_admin', 'center_admin'],
      },
      status: 'active'
    };

    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;

    const managers = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'ngo_id', 'center_id', 'phone', 'status'],
      order: [['name', 'ASC']]
    });

    return res.json({
      success: true,
      count: managers.length,
      data: managers,
    });

  } catch (err) {
    console.error('Error in listManagers:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching managers',
    });
  }
};
