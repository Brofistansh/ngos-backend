// src/routes/managerRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');
const managerController = require('../controllers/managerController');

// --------------------------------------------
// CREATE MANAGER (role: ngo_admin or center_admin)
// Only super_admin or ngo_admin can create managers
// --------------------------------------------
router.post(
  '/',
  auth,
  roles('super_admin', 'ngo_admin'),
  managerController.createManager
);

// --------------------------------------------
// LIST MANAGERS
// super_admin → sees all
// ngo_admin → only their NGO
// center_admin → only their center
// --------------------------------------------
// (role filtering handled INSIDE controller)
router.get(
  '/',
  auth,
  managerController.listManagers
);

module.exports = router;
