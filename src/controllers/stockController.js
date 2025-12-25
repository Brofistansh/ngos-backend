const StockHeader = require("../models/sequelize/StockHeader");
const StockEntry = require("../models/sequelize/StockEntry");
const Teacher = require("../models/sequelize/Teacher");
const User = require("../models/sequelize/User");

exports.createStock = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "Stock entries are required" });
    }

    // 🔐 Logged-in teacher
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ["name"] }],
    });

    if (!teacher) {
      return res.status(403).json({ message: "Only teacher can create stock" });
    }

    // 🔥 SAFE TEACHER NAME
    const teacherName = teacher.User?.name || "Unknown Teacher";

    // ============================
    // CREATE STOCK HEADER
    // ============================
    const stockHeader = await StockHeader.create({
      teacher_id: teacher.id,
      teacher_name: teacherName,        // ✅ FIXED
      ngo_id: req.user.ngo_id,
      center_id: req.user.center_id,
      created_by: req.user.id,
    });

    // ============================
    // CREATE STOCK ENTRIES
    // ============================
    const stockEntries = entries.map((e) => ({
      stock_header_id: stockHeader.id,
      date: e.date,
      particulars: e.particulars,
      bill_no: e.bill_no,
      receipt_qty: e.receipt_qty || 0,
      issue_qty: e.issue_qty || 0,
      balance_qty: e.balance_qty || 0,
      remarks: e.remarks || null,
    }));

    await StockEntry.bulkCreate(stockEntries);

    return res.status(201).json({
      message: "Stock created successfully",
      data: {
        postedBy: {
          teacherId: teacher.id,
          teacherName: teacherName,
        },
        entries: stockEntries,
      },
    });

  } catch (err) {
    console.error("Create Stock Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
