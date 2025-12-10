const express = require('express');
const router = express.Router({ mergeParams: true });

const centerController = require('../controllers/centerController');
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// Create Center under NGO
router.post(
  '/:ngo_id/centers',
  auth,
  roles("ngo_admin"),
  centerController.createCenter
);

// Get all centers of an NGO
router.get(
  '/:ngo_id/centers',
  auth,
  centerController.getCenters
);

// Update Center
router.put(
  '/centers/:id',
  auth,
  roles("center_admin"),
  centerController.updateCenter
);

// Soft Delete Center
router.delete(
  '/centers/:id',
  auth,
  roles("center_admin"),
  centerController.deleteCenter
);

module.exports = router;
