// src/routes/donationReports.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/donationReportController');

// Monthly
router.get('/ngo/:ngo_id/monthly',
  auth, requireRole('ngo_admin','ngo_manager','super_admin','donor_analyst'),
  ctrl.ngoMonthly);

router.get('/center/:center_id/monthly',
  auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager','donor_analyst'),
  ctrl.centerMonthly);

router.get('/donor/:donor_id/monthly',
  auth, requireRole('ngo_admin','ngo_manager','super_admin','donor_analyst','center_manager'),
  ctrl.donorMonthly);

// Yearly
router.get('/ngo/:ngo_id/yearly',
  auth, requireRole('ngo_admin','ngo_manager','super_admin','donor_analyst'),
  ctrl.ngoYearly);

router.get('/center/:center_id/yearly',
  auth, requireRole('ngo_admin','ngo_manager','super_admin','center_manager','donor_analyst'),
  ctrl.centerYearly);

router.get('/donor/:donor_id/yearly',
  auth, requireRole('ngo_admin','ngo_manager','super_admin','donor_analyst','center_manager'),
  ctrl.donorYearly);

module.exports = router;
