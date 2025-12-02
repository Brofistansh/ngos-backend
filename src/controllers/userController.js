// src/controllers/userController.js
const bcrypt = require('bcryptjs');
const User = require('../models/sequelize/User');
const NGO = require('../models/sequelize/NGO');
const Center = require('../models/sequelize/Center');

/**
 * Simple role-creation matrix:
 * - super_admin: can create any role anywhere (can set ngo_id/center_id)
 * - ngo_admin: can create ngo_manager, center_manager, teacher, volunteer, donor for their NGO
 * - ngo_manager: can create center_manager, teacher, volunteer for their NGO
 * - center_manager: can create teacher, volunteer for their center
 */
const ROLE_MATRIX = {
  super_admin: ['super_admin','ngo_admin','ngo_manager','center_manager','teacher','volunteer','analyst','donor'],
  ngo_admin: ['ngo_manager','center_manager','teacher','volunteer','donor'],
  ngo_manager: ['center_manager','teacher','volunteer'],
  center_manager: ['teacher','volunteer']
};

function canCreateRole(creatorRole, targetRole) {
  const allowed = ROLE_MATRIX[creatorRole] || [];
  return allowed.includes(targetRole);
}

exports.createUser = async (req, res) => {
  try {
    const creator = req.user; // from auth middleware: { id, role, ... }
    const { name, email, password, role, ngo_id, center_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    // Check if target role is valid
    const validRoles = ['super_admin','ngo_admin','ngo_manager','center_manager','teacher','volunteer','analyst','donor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check authorization: who can create which role
    if (!canCreateRole(creator.role, role)) {
      return res.status(403).json({ message: 'Forbidden: you cannot create this role' });
    }

    // If creator is not super_admin, enforce ngo_id matches creator (unless super_admin allowed)
    if (creator.role !== 'super_admin') {
      // creator must have ngo_id for NGO-related roles
      if (!creator.ngo_id) {
        return res.status(403).json({ message: 'Creator is not attached to any NGO' });
      }
      // If target user requires NGO linkage, set ngo_id from creator if not provided
      if (['ngo_admin','ngo_manager','center_manager','teacher','volunteer','donor','analyst'].includes(role)) {
        // ensure ngo exists & matches creator's NGO
        if (ngo_id && ngo_id !== creator.ngo_id) {
          return res.status(403).json({ message: 'Cannot create user for a different NGO' });
        }
      }
    }

    // If center-level role (center_manager, teacher, volunteer), ensure center exists and belongs to the NGO
    if (['center_manager','teacher','volunteer'].includes(role)) {
      const centerToCheck = center_id || null;
      // If no center_id provided and creator is center_manager, assign creator's center
      if (!centerToCheck && creator.role === 'center_manager') {
        req.body.center_id = creator.center_id;
      }
      if (!req.body.center_id) {
        return res.status(400).json({ message: 'center_id is required for center-level roles' });
      }
      const center = await Center.findByPk(req.body.center_id);
      if (!center) return res.status(404).json({ message: 'Center not found' });

      // if creator is not super_admin, ensure center.ngo_id matches creator.ngo_id
      if (creator.role !== 'super_admin' && center.ngo_id !== creator.ngo_id) {
        return res.status(403).json({ message: 'Center does not belong to your NGO' });
      }
    }

    // If creating NGO-level roles (ngo_admin, ngo_manager), ensure NGO exists (unless super_admin)
    if (['ngo_admin','ngo_manager'].includes(role)) {
      const ngoToCheck = ngo_id || creator.ngo_id;
      if (!ngoToCheck) return res.status(400).json({ message: 'ngo_id is required for NGO-level roles' });
      const ngo = await NGO.findByPk(ngoToCheck);
      if (!ngo) return res.status(404).json({ message: 'NGO not found' });

      // set ngo_id in body to canonical value
      req.body.ngo_id = ngoToCheck;
    }

    // Prevent duplicate email
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already exists' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create final user object using sanitized fields
    const createPayload = {
      name,
      email,
      password: hashed,
      role,
      ngo_id: req.body.ngo_id || creator.ngo_id || null,
      center_id: req.body.center_id || null
    };

    const user = await User.create(createPayload);

    return res.status(201).json({
      message: 'User created',
      data: { id: user.id, name: user.name, email: user.email, role: user.role, ngo_id: user.ngo_id, center_id: user.center_id }
    });

  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ message: 'Server error creating user' });
  }
};
