const fs = require('fs');
const cloudinary = require("cloudinary").v2;
const { Op } = require("sequelize");

const Student = require("../models/sequelize/Student");
const NGO = require("../models/sequelize/NGO");
const Center = require("../models/sequelize/Center");

/**
 * 🔢 ROLL NUMBER GENERATOR
 * FORMAT: YY + ZONE(3) + CENTER(3) + SEQ(001)
 * Example: 25DELNAN001
 */
async function generateRollNo(center) {
  const year = new Date().getFullYear().toString().slice(-2);

  const zoneCode = (center.zone || "ZZZ")
    .replace(/[^A-Za-z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  const centerCode = (center.name || "CCC")
    .replace(/[^A-Za-z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  const prefix = `${year}${zoneCode}${centerCode}`;

  const lastStudent = await Student.findOne({
    where: {
      roll_no: { [Op.like]: `${prefix}%` }
    },
    order: [["createdAt", "DESC"]],
  });

  let seq = "001";
  if (lastStudent) {
    const lastSeq = parseInt(lastStudent.roll_no.slice(-3));
    seq = String(lastSeq + 1).padStart(3, "0");
  }

  return `${prefix}${seq}`;
}

// ============================
// CREATE STUDENT
// ============================
exports.createStudent = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.body;

    const ngo = await NGO.findByPk(ngo_id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    const center = await Center.findByPk(center_id);
    if (!center) return res.status(404).json({ message: "Center not found" });

    let student_photo = null;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "ngos/students"
      });
      student_photo = upload.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (req.body.student_photo && req.body.student_photo.trim() !== "") {
      student_photo = req.body.student_photo.trim();
    }

    // 🔥 ONLY NEW LINE
    const roll_no = await generateRollNo(center);

    const student = await Student.create({
      ...req.body,
      roll_no,
      student_photo
    });

    res.status(201).json({
      message: "Student created successfully",
      data: student
    });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ message: "Error creating student", error: err.message });
  }
};

// ============================
// GET STUDENTS
// ============================
exports.getStudents = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.query;
    const where = {};
    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;

    const students = await Student.findAll({ where });
    res.json({ count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

// ============================
// GET STUDENT BY ID
// ============================
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE STUDENT
// ============================
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let student_photo = student.student_photo;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "ngos/students"
      });
      student_photo = upload.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (req.body.student_photo && req.body.student_photo.trim() !== "") {
      student_photo = req.body.student_photo.trim();
    }

    await student.update({
      ...req.body,
      student_photo
    });

    res.json({ message: "Student updated", data: student });
  } catch (err) {
    res.status(500).json({ message: "Error updating student" });
  }
};

// ============================
// DELETE (SOFT)
// ============================
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.update({ student_status: "inactive" });
    res.json({ message: "Student deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting student" });
  }
};
