const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

const studentAttendanceController = require('../controllers/studentAttendanceController');

/**
 * ===============================
 * STUDENT ATTENDANCE ROUTES
 * ===============================
 */

/**
 * CREATE student attendance
 * Roles: teacher, center_admin, ngo_admin, super_admin
 */
router.post(
  '/',
  auth,
  requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
  studentAttendanceController.createAttendance
);

/**
 * GET student attendance
 * Filters:
 *  - student_id
 *  - date
 *  - start_date & end_date
 */
router.get(
  '/',
  auth,
  requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
  studentAttendanceController.getAttendance
);

/**
 * UPDATE student attendance
 */
router.put(
  '/:id',
  auth,
  requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
  studentAttendanceController.updateAttendance
);

/**
 * DELETE student attendance
 */
router.delete(
  '/:id',
  auth,
  requireRole('center_admin', 'ngo_admin', 'super_admin'),
  studentAttendanceController.deleteAttendance
);

module.exports = router;
