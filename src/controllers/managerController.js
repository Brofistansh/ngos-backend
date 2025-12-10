// src/controllers/managerController.js
const { Op } = require('sequelize');
const User = require('../models/sequelize/User');

/**
 * GET /api/managers?ngo_id=<uuid>&center_id=<uuid>
 * Returns NGO admins + center admins filtered by ngo_id / center_id (optional).
 */
exports.listManagers = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.query;

    const where = {
      role: {
        [Op.in]: ['ngo_admin', 'center_admin'],
      },
      status: 'active', // only active managers
    };

    if (ngo_id) {
      where.ngo_id = ngo_id;
    }

    if (center_id) {
      where.center_id = center_id;
    }

    const managers = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'ngo_id', 'center_id', 'phone', 'status'],
      order: [['name', 'ASC']],
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
