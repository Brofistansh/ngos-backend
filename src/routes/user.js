
// src/routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const { createUser } = require('../controllers/userController');

/**
 * POST /users
 * - Protected: must be authenticated
 * - Role checks inside controller; but we allow only certain creators to access this endpoint.
 * - We add router-level guard so at least user must be in one of the creator roles
 */
router.post('/', auth, requireRole('super_admin','ngo_admin','ngo_manager','center_manager'), createUser);

module.exports = router;
