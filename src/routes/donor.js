/**
 * @openapi
 * tags:
 *   - name: Donations
 *     description: Donors and donations
 */

/**
 * @openapi
 * /donors:
 *   post:
 *     summary: Create donor
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDonor'
 *     responses:
 *       200:
 *         description: Donor created
 */



// src/routes/donor.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/donorController');

// create donor - allow admin/manager and super_admin (or allow open for ticket)
router.post('/', auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager'), ctrl.createDonor);

// list donors (search)
router.get('/', auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager','donor_analyst'), ctrl.listDonors);

// get donor
router.get('/:id', auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager','donor_analyst'), ctrl.getDonor);

// update donor
router.put('/:id', auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager'), ctrl.updateDonor);

// delete donor
router.delete('/:id', auth, requireRole('super_admin','ngo_admin'), ctrl.deleteDonor);

module.exports = router;
