/**
 * @openapi
 * tags:
 *   - name: NGOs
 *     description: NGO management
 */

/**
 * @openapi
 * /ngos:
 *   post:
 *     summary: Create NGO
 *     tags: [NGOs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNGO'
 *     responses:
 *       200:
 *         description: Created NGO
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NGO'
 *     x-role-rules: |
 *       Allowed roles: super_admin, ngo_admin (within their own NGO)
 */


const express = require('express');
const router = express.Router();
const { createNGO, getNGOs } = require('../controllers/ngoController');
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// Only super admin can create NGO
router.post('/', auth, roles("super_admin"), createNGO);

// Any authenticated user can view NGOs
router.get('/', auth, getNGOs);

router.put('/:id', authMiddleware, ngoController.updateNgo);
router.delete('/:id', authMiddleware, ngoController.deleteNgo);


module.exports = router;
