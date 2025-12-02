/**
 * @openapi
 * tags:
 *   - name: Centers
 *     description: Center management endpoints
 */

/**
 * @openapi
 * /ngos/{ngoId}/centers:
 *   post:
 *     summary: Create center under NGO
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ngoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCenter'
 *     responses:
 *       200:
 *         description: Center created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Center'
 *     x-role-rules: |
 *       Allowed roles: ngo_admin, ngo_manager, super_admin
 */



const express = require('express');
const router = express.Router();
const { createCenter, getCentersByNGO } = require('../controllers/centerController');
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// Only super_admin or ngo_manager can create a center
router.post('/:ngo_id/centers', auth, roles("super_admin", "ngo_admin", "ngo_manager"), createCenter);

// Any authenticated user can view centers of an NGO
router.get('/:ngo_id/centers', auth, getCentersByNGO);

module.exports = router;
