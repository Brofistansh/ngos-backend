/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User creation and management
 */

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       200:
 *         description: user created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *     x-role-rules: |
 *       Role creation rules:
 *         - super_admin: full permissions
 *         - ngo_admin: create roles within their NGO (ngo_manager, center_manager, teacher)
 *         - center_manager: teacher, teacher_assistant within their center
 */



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
