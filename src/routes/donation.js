/**
 * @openapi
 * /donations:
 *   post:
 *     summary: Record a donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDonation'
 *     responses:
 *       200:
 *         description: Donation recorded
 *
 * /donations/{donationId}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: donationId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Donation object
 */


// src/routes/donation.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/donationController');

// create donation - center_manager, ngo_manager, ngo_admin, super_admin, center_manager
router.post('/', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.createDonation);

// list donations - allow analysts / admins / managers
router.get('/', auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager','donor_analyst'), ctrl.listDonations);

// get donation by id
router.get('/:id', auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager','donor_analyst'), ctrl.getDonation);

// update donation
router.put('/:id', auth, requireRole('ngo_admin','ngo_manager','super_admin'), ctrl.updateDonation);

// delete donation
router.delete('/:id', auth, requireRole('super_admin','ngo_admin'), ctrl.deleteDonation);

module.exports = router;
