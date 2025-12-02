/**
 * @openapi
 * tags:
 *   - name: Students
 *     description: Student management
 */

/**
 * @openapi
 * /students:
 *   post:
 *     summary: Create a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudent'
 *     responses:
 *       200:
 *         description: Student created
 */

/**
 * @openapi
 * /students/center/{centerId}:
 *   get:
 *     summary: List students by center
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: centerId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: student array
 */


// src/routes/student.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/studentController');

// create student - permitted roles: center_manager, teacher, ngo_manager, ngo_admin, super_admin
router.post('/', auth, requireRole('center_manager','teacher','ngo_manager','ngo_admin','super_admin'), ctrl.createStudent);

// list students by center
router.get('/center/:center_id', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.getStudentsByCenter);

// list students by teacher
router.get('/teacher/:teacher_id', auth, requireRole('teacher','center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.getStudentsByTeacher);

// update student
router.put('/:id', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.updateStudent);

// delete student
router.delete('/:id', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.deleteStudent);

module.exports = router;
