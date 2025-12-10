const express = require('express');
const router = express.Router();

const centerController = require('../controllers/centerController');
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// CREATE Center under NGO
router.post(
  '/:ngo_id/centers',
  auth,
  roles("ngo_admin"),
  centerController.createCenter
);

// GET all centers of an NGO
router.get(
  '/:ngo_id/centers',
  auth,
  centerController.getCentersByNGO   // ← FIXED
);

// UPDATE Center
router.put(
  '/:ngo_id/centers/:id',
  auth,
  roles("center_admin"),
  centerController.updateCenter
);

// SOFT DELETE Center
router.delete(
  '/:ngo_id/centers/:id',
  auth,
  roles("center_admin"),
  centerController.deleteCenter
);

module.exports = router;
