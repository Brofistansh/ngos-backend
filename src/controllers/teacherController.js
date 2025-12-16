// src/controllers/teacherController.js

const fs = require('fs');
const bcrypt = require('bcryptjs');
const { uploadImage } = require('../utils/cloudinary');

const User = require('../models/sequelize/User');
const Teacher = require('../models/sequelize/Teacher');

const SALT = 10;

/**
 * CREATE TEACHER
 * - create User (role: teacher)
 * - create Teacher profile
 * - handle image upload
 */
exports.createTeacher = async (req, res) => {
  const t = await User.sequelize.transaction();

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
      phone
    } = req.body;

    if (!email || !password || !teacher_name || !ngo_id || !center_id) {
      await t.rollback();
      return res.status(400).json({
        message: "email, password, teacher_name, ngo_id, center_id are required"
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, SALT);

    // Create user
    const user = await User.create({
      name: teacher_name,
      email,
      password: hashed,
      role: "teacher",
      ngo_id,
      center_id,
      phone: phone || null
    }, { transaction: t });


    // Upload teacher photo if provided
    let photoUrl = null;
    if (req.file) {
      const upload = await uploadImage(req.file.path, "teachers");
      photoUrl = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Create teacher profile
    const teacher = await Teacher.create({
      user_id: user.id,
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
      teacher_photo: photoUrl,
      ngo_id,
      center_id,
      status: "active"
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      user,
      teacher
    });

  } catch (err) {
    await t.rollback();
    console.error("CREATE TEACHER ERROR:", err);
    res.status(500).json({ message: "Failed to create teacher", error: err.message });
  }
};



/**
 * GET ALL TEACHERS
 */
exports.listTeachers = async (req, res) => {
  try {
    const { ngo_id, center_id, status } = req.query;

    const where = {};
    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;
    if (status) where.status = status;

    const teachers = await Teacher.findAll({
      where,
      order: [["teacher_name", "ASC"]]
    });

    res.json({
      success: true,
      count: teachers.length,
      data: teachers
    });

  } catch (err) {
    console.error("LIST TEACHERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/**
 * GET TEACHER BY ID
 */
exports.getTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const user = await User.findByPk(teacher.user_id, {
      attributes: ["id", "email", "name", "role", "status"]
    });

    res.json({
      success: true,
      data: { teacher, user }
    });

  } catch (err) {
    console.error("GET TEACHER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/**
 * UPDATE TEACHER
 */
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Upload new photo
    if (req.file) {
      const upload = await uploadImage(req.file.path, "teachers");
      teacher.teacher_photo = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Updatable teacher fields
    const fields = [
      "teacher_name", "date_of_joining", "father_name", "mother_name",
      "qualification", "address", "date_of_leaving", "honorarium",
      "account_no", "bank_name", "ifsc_code", "aadhar_card_no",
      "ngo_id", "center_id", "status"
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) teacher[f] = req.body[f];
    });

    await teacher.save();


    // Update linked user for email/password
    if (req.body.email || req.body.password) {
      const user = await User.findByPk(teacher.user_id);

      if (req.body.email) user.email = req.body.email;
      if (req.body.password)
        user.password = await bcrypt.hash(req.body.password, SALT);

      await user.save();
    }

    res.json({
      success: true,
      message: "Teacher updated successfully",
      teacher
    });

  } catch (err) {
    console.error("UPDATE TEACHER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/**
 * DELETE TEACHER (Soft delete)
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    teacher.status = "inactive";
    await teacher.save();

    const user = await User.findByPk(teacher.user_id);
    if (user) {
      user.status = "inactive";
      await user.save();
    }

    res.json({
      success: true,
      message: "Teacher deleted (soft)"
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
