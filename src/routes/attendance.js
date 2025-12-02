/**
 * @openapi
 * tags:
 *   - name: Attendance
 *     description: Staff attendance end-points
 */

/**
 * @openapi
 * /attendance/mark:
 *   post:
 *     summary: Mark staff attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceMark'
 *     responses:
 *       200:
 *         description: Attendance marked
 *     x-role-rules: |
 *       Allowed roles: center_manager, ngo_manager, ngo_admin, super_admin
 */

/**
 * @openapi
 * /attendance/center/{centerId}:
 *   get:
 *     summary: Get attendance for a center (daily)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: centerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: list of attendance objects
 */

/**
 * @openapi
 * /attendance/ngo/{ngoId}:
 *   get:
 *     summary: Get attendance across an NGO (daily)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ngoId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: date
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: aggregated attendance
 */


const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');
const {
  markAttendance,
  getCenterAttendance,
  getNGOAttendance,
  getUserAttendance
} = require('../controllers/attendanceController');

// Mark attendance (teacher, volunteer, center manager)
router.post('/mark',
  auth,
  roles("teacher", "volunteer", "center_manager", "ngo_manager", "ngo_admin", "super_admin"),
  markAttendance
);

// Center-wise attendance
router.get('/center/:center_id',
  auth,
  roles("center_manager", "ngo_manager", "ngo_admin", "super_admin"),
  getCenterAttendance
);

// NGO-wise attendance
router.get('/ngo/:ngo_id',
  auth,
  roles("ngo_manager", "ngo_admin", "super_admin"),
  getNGOAttendance
);

// User-wise attendance
router.get('/user/:user_id',
  auth,
  roles("teacher","center_manager","ngo_manager","ngo_admin","super_admin"),
  getUserAttendance
);

module.exports = router;
