const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const controller = require('../controllers/studentAttendanceController');

router.post(
  '/',
  auth,
  requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
  controller.createAttendance
);

router.get(
  '/',
  auth,
  requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
  controller.getAttendance
);

router.put(
  '/:id',
  auth,
  requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
  controller.updateAttendance
);

router.delete(
  '/:id',
  auth,
  requireRole('center_admin', 'ngo_admin', 'super_admin'),
  controller.deleteAttendance
);

module.exports = router;
