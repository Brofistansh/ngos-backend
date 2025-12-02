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
