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
