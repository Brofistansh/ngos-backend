// src/controllers/teacherController.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { uploadImage } = require('../utils/cloudinary');
const { sequelize } = require('../db/postgres') || require('../db/postgres'); // keep compatibility
const User = require('../models/sequelize/User');
const Teacher = require('../models/sequelize/Teacher');

const SALT_ROUNDS = 10;

/**
 * Create teacher:
 * - create user with role 'teacher'
 * - create teacher profile linking to user.id
 * - supports file upload 'teacher_photo' (form-data)
 */
exports.createTeacher = async (req, res) => {
  const t = await (User.sequelize || require('../db/postgres')).transaction();
  try {
    const {
      teacher_name,
      date_of_joining,
      father_name,
      mother_name,
      qualification,
      address,
      date_of_leaving,
      honorarium,
      account_no,
      bank_name,
      ifsc_code,
      aadhar_card_no,
      ngo_id,
      center_id,
      email,
      password,
    } = req.body;

    if (!email || !password || !teacher_name || !ngo_id || !center_id) {
      await t.rollback();
      return res.status(400).json({ message: 'Missing required fields: email, password, teacher_name, ngo_id, center_id' });
    }

    // create user
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: teacher_name,
      email,
      password: hashed,
      role: 'teacher',
      ngo_id,
      center_id,
      phone: req.body.phone || null
    }, { transaction: t });

    // upload photo to cloudinary if file present
    let photoUrl = null;
    if (req.file) {
      const uploadRes = await uploadImage(req.file.path, 'ngos/teachers');
      photoUrl = uploadRes.secure_url;
      // delete temp file
      try { fs.unlinkSync(req.file.path); } catch(e){/* ignore */ }
    }

    const teacher = await Teacher.create({
      user_id: user.id,
      teacher_name,
      date_of_joining: date_of_joining || null,
      father_name,
      mother_name,
      qualification,
      address,
      date_of_leaving: date_of_leaving || null,
      honorarium,
      account_no,
      bank_name,
      ifsc_code,
      teacher_photo: photoUrl,
      aadhar_card_no,
      ngo_id,
      center_id,
      status: 'active'
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: 'Teacher created',
      data: { userId: user.id, teacher }
    });

  } catch (err) {
    await t.rollback();
    console.error('createTeacher error', err);
    // If email duplicate, User model unique constraint will throw
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Failed to create teacher', error: err.message });
  }
};


exports.listTeachers = async (req, res) => {
  try {
    const { ngo_id, center_id, status } = req.query;
    const where = {};
    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;
    if (status) where.status = status;

    const teachers = await Teacher.findAll({
      where,
      order: [['teacher_name', 'ASC']]
    });

    return res.json({ success: true, count: teachers.length, data: teachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // optionally include user record
    const user = await User.findByPk(teacher.user_id, { attributes: ['id','email','name','role','status'] });

    return res.json({ success: true, data: { teacher, user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params; // teacher id
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // if file uploaded, upload to cloudinary
    if (req.file) {
      try {
        const uploadRes = await uploadImage(req.file.path, 'ngos/teachers');
        teacher.teacher_photo = uploadRes.secure_url;
        try { fs.unlinkSync(req.file.path); } catch(e){/* ignore */ }
      } catch (e) {
        console.error('Failed to upload photo', e);
      }
    }

    // update profile fields
    const updatableFields = [
      'teacher_name','date_of_joining','father_name','mother_name','qualification','address',
      'date_of_leaving','honorarium','account_no','bank_name','ifsc_code','aadhar_card_no',
      'ngo_id','center_id','status'
    ];

    updatableFields.forEach(f => {
      if (req.body[f] !== undefined) teacher[f] = req.body[f];
    });

    await teacher.save();

    // if email/password update required, update user too
    if (req.body.email || req.body.password) {
      const user = await User.findByPk(teacher.user_id);
      if (req.body.email) user.email = req.body.email;
      if (req.body.password) {
        const hashed = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        user.password = hashed;
      }
      await user.save();
    }

    return res.json({ success: true, message: 'Teacher updated', data: teacher });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // soft delete
    teacher.status = 'inactive';
    await teacher.save();

    // also update user status optionally
    const user = await User.findByPk(teacher.user_id);
    if (user) {
      user.status = 'inactive';
      await user.save();
    }

    return res.json({ success: true, message: 'Teacher deactivated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
