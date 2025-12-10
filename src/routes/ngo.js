const express = require('express');
const router = express.Router();

const {
  createNGO,
  getNGOs,
  updateNgo,
  deleteNgo
} = require('../controllers/ngoController');

const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// Only super admin can create NGO
router.post('/', auth, roles("super_admin"), createNGO);

// Any authenticated user can view NGOs
router.get('/', auth, getNGOs);

// Update NGO
router.put('/:id', auth, roles("super_admin"), updateNgo);

// Soft delete NGO
router.delete('/:id', auth, roles("super_admin"), deleteNgo);

module.exports = router;
