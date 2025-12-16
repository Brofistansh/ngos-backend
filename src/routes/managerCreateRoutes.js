// src/routes/managerCreateRoutes.js

const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

const managerController = require('../controllers/managerCreateController');

// Only super_admin + ngo_admin allowed for managers
router.post('/', auth, roles("super_admin", "ngo_admin"), managerController.createCenterManager);

router.get('/', auth, roles("super_admin", "ngo_admin"), managerController.getManagers);

router.get('/:id', auth, roles("super_admin", "ngo_admin"), managerController.getManagerById);

router.put('/:id', auth, roles("super_admin", "ngo_admin"), managerController.updateManager);

router.delete('/:id', auth, roles("super_admin", "ngo_admin"), managerController.deleteManager);

module.exports = router;
