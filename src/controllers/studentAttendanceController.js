// src/controllers/studentAttendanceController.js
const StudentAttendance = require('../models/sequelize/StudentAttendance');
const Student = require('../models/sequelize/Student');

exports.markStudentAttendance = async (req, res) => {
  try {
    const marker = req.user;
    const { student_id, status } = req.body;
    if (!student_id) return res.status(400).json({ message: 'student_id required' });

    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // permission checks
    if (marker.role !== 'super_admin') {
      if (marker.role === 'center_manager' || marker.role === 'teacher' || marker.role === 'volunteer') {
        if (marker.center_id !== student.center_id) return res.status(403).json({ message: 'Cannot mark for student of another center' });
      } else if (marker.role === 'ngo_admin' || marker.role === 'ngo_manager') {
        if (marker.ngo_id !== student.ngo_id) return res.status(403).json({ message: 'Cannot mark for student of another NGO' });
      } else {
        return res.status(403).json({ message: 'Role not allowed to mark student attendance' });
      }
    }

    const today = new Date().toISOString().split('T')[0];

    const existing = await StudentAttendance.findOne({ where: { student_id, date: today } });

    if (existing) {
      existing.status = status || 'present';
      existing.marked_by = marker.id;
      await existing.save();
      return res.json({ message: 'Student attendance updated', data: existing });
    }

    const rec = await StudentAttendance.create({
      student_id,
      center_id: student.center_id,
      ngo_id: student.ngo_id,
      date: today,
      status: status || 'present',
      marked_by: marker.id
    });

    return res.json({ message: 'Student attendance marked', data: rec });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error marking student attendance' });
  }
};

exports.getAttendanceByCenter = async (req, res) => {
  try {
    const { center_id } = req.params;
    const records = await StudentAttendance.findAll({ where: { center_id }, order: [['date','DESC']] });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching attendance' });
  }
};

exports.getAttendanceByNGO = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const records = await StudentAttendance.findAll({ where: { ngo_id }, order: [['date','DESC']] });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching attendance' });
  }
};

exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const records = await StudentAttendance.findAll({ where: { student_id }, order: [['date','DESC']] });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching attendance' });
  }
};
