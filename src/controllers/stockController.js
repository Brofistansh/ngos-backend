const { Op } = require("sequelize");
const StockHeader = require("../models/sequelize/StockHeader");
const StockEntry = require("../models/sequelize/StockEntry");
const Teacher = require("../models/sequelize/Teacher");
const User = require("../models/sequelize/User");

/**
 * ============================
 * CREATE STOCK (ONLY TEACHER)
 * ============================
 */
exports.createStock = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "Stock entries are required" });
    }

    // 🔐 Teacher only
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ["name"] }],
    });

    if (!teacher) {
      return res.status(403).json({ message: "Only teacher can create stock" });
    }

    const teacherName = teacher.User?.name || "Unknown Teacher";

    const header = await StockHeader.create({
      teacher_id: teacher.id,
      teacher_name: teacherName,
      ngo_id: req.user.ngo_id,
      center_id: req.user.center_id,
      created_by: req.user.id,
    });

    const stockEntries = entries.map((e) => ({
      stock_header_id: header.id,
      date: e.date,
      particulars: e.particulars,
      bill_no: e.billNo,
      receipt_qty: e.receiptQty || 0,
      issue_qty: e.issueQty || 0,
      balance_qty: e.balanceQty || 0,
      remarks: e.remarks || null,
    }));

    await StockEntry.bulkCreate(stockEntries);

    return res.status(201).json({
      message: "Stock created successfully",
      data: {
        postedBy: {
          teacherId: teacher.id,
          teacherName,
        },
        entries: stockEntries,
      },
    });

  } catch (err) {
    console.error("Create Stock Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ============================
 * GET STOCK (VIEW ONLY)
 * teacher → own
 * manager / admin → by center
 * ============================
 */
exports.getStock = async (req, res) => {
  try {
    const { role, id, center_id } = req.user;
    const { centerId } = req.query;

    const where = {};

    if (role === "teacher") {
      const teacher = await Teacher.findOne({ where: { user_id: id } });
      if (!teacher) return res.status(404).json({ message: "Teacher not found" });
      where.teacher_id = teacher.id;
    }

    if (role === "center_admin" || role === "ngo_admin") {
      where.center_id = centerId || center_id;
    }

    const data = await StockHeader.findAll({
      where,
      include: [
        {
          model: StockEntry,
          as: "entries",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ count: data.length, data });

  } catch (err) {
    console.error("Get Stock Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
