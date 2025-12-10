const express = require('express');
const router = express.Router();

const ngoController = require('../controllers/ngoController');
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// Only super admin can create NGO
router.post('/', auth, roles("super_admin"), ngoController.createNgo);

// Any authenticated user can view NGOs
router.get('/', auth, ngoController.getNGOs);

// Update NGO
router.put('/:id', auth, roles("super_admin"), ngoController.updateNgo);

// Soft delete NGO
router.delete('/:id', auth, roles("super_admin"), ngoController.deleteNgo);

module.exports = router;
