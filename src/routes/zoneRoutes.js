// src/routes/zoneRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const zoneController = require('../controllers/zoneController');

// If zones should be public, you can remove `auth` from below.
router.get('/', auth, zoneController.getZones);

module.exports = router;
