const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');
const controller = require('../controllers/managerCreateController');

// Only super_admin or NGO admin can create a center admin
router.post(
  '/',
  auth,
  roles("super_admin", "ngo_admin"),
  controller.createCenterManager
);

module.exports = router;
