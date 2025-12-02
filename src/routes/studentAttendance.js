/**
 * @openapi
 * tags:
 *   - name: Student Attendance
 *     description: Student attendance
 */

/**
 * @openapi
 * /student-attendance/mark:
 *   post:
 *     summary: Mark student attendance
 *     tags: [Student Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentAttendanceMark'
 *     responses:
 *       200:
 *         description: Student attendance marked
 *     x-role-rules: |
 *       Allowed roles: center_manager, teacher, ngo_manager
 */


// src/routes/studentAttendance.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/studentAttendanceController');

// mark attendance (teacher, volunteer, center_manager)
router.post('/mark', auth, requireRole('teacher','volunteer','center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.markStudentAttendance);

// attendance by center
router.get('/center/:center_id', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.getAttendanceByCenter);

// attendance by NGO
router.get('/ngo/:ngo_id', auth, requireRole('ngo_manager','ngo_admin','super_admin'), ctrl.getAttendanceByNGO);

// attendance by student
router.get('/student/:student_id', auth, requireRole('teacher','center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.getAttendanceByStudent);

module.exports = router;
