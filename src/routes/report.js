/**
 * @openapi
 * tags:
 *   - name: Reports
 *     description: Reports (attendance, donations)
 */

/**
 * @openapi
 * /reports/center/{centerId}/daily-summary:
 *   get:
 *     summary: Daily summary for center
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centerId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Daily summary
 */

/**
 * @openapi
 * /reports/center/{centerId}/monthly/teachers:
 *   get:
 *     summary: Monthly teacher attendance (center)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centerId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Monthly breakdown
 */

/**
 * @openapi
 * /reports/ngo/{ngoId}/monthly/teachers:
 *   get:
 *     summary: Monthly teacher attendance (ngo-wide)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ngoId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: NGO monthly breakdown
 */


// src/routes/report.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/reportController');

// daily summaries (existing)
router.get('/center/:center_id/daily-summary',
  auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'),
  ctrl.centerDailySummary);

router.get('/ngo/:ngo_id/daily-summary',
  auth, requireRole('ngo_manager','ngo_admin','super_admin'),
  ctrl.ngoDailySummary);

// monthly - center (teachers & students separate)
router.get('/center/:center_id/monthly/teachers',
  auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'),
  ctrl.centerMonthlyTeachers);

router.get('/center/:center_id/monthly/students',
  auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'),
  ctrl.centerMonthlyStudents);

// monthly - ngo
router.get('/ngo/:ngo_id/monthly/teachers',
  auth, requireRole('ngo_manager','ngo_admin','super_admin'),
  ctrl.ngoMonthlyTeachers);

router.get('/ngo/:ngo_id/monthly/students',
  auth, requireRole('ngo_manager','ngo_admin','super_admin'),
  ctrl.ngoMonthlyStudents);

// user/student monthly
router.get('/user/:user_id/monthly',
  auth, requireRole('teacher','center_manager','ngo_manager','ngo_admin','super_admin'),
  ctrl.userMonthly);

router.get('/student/:student_id/monthly',
  auth, requireRole('teacher','center_manager','ngo_manager','ngo_admin','super_admin'),
  ctrl.studentMonthly);

module.exports = router;
