// src/routes/managerRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const managerController = require('../controllers/managerController');

// Only super_admin and ngo_admin should see managers
const allowedRoles = ['super_admin', 'ngo_admin'];

const roleGuard = (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not allowed to view managers' });
  }
  next();
};

router.get('/', auth, roleGuard, managerController.listManagers);

module.exports = router;
