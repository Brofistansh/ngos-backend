const { Op } = require("sequelize");
const sequelize = require("../db/postgres");

const StockHeader = require("../models/sequelize/StockHeader");
const StockEntry = require("../models/sequelize/StockEntry");
const Teacher = require("../models/sequelize/Teacher");
const User = require("../models/sequelize/User");

/**
 * ======================================================
 * CREATE STOCK
 * ======================================================
 * ROLE: teacher only
 * Teacher creates stock + multiple entries
 */
exports.createStock = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Only teacher can create stock" });
    }

    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "Entries are required" });
    }

    // 🔐 get teacher + user (CORRECT alias usage)
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: "user", // 👈 VERY IMPORTANT (alias)
          attributes: ["id", "name"],
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // ============================
    // CREATE STOCK HEADER
    // ============================
    const stockHeader = await StockHeader.create(
      {
        teacher_id: teacher.id,
        teacher_name: teacher.user.name,
        ngo_id: req.user.ngo_id,
        center_id: req.user.center_id,
        created_by: req.user.id,
      },
      { transaction: t }
    );

    // ============================
    // CREATE STOCK ENTRIES
    // ============================
    const stockEntries = entries.map((e) => ({
      stock_id: stockHeader.id, // 🔥 THIS FIXES YOUR ERROR
      date: e.date,
      particulars: e.particulars,
      bill_no: e.bill_no,
      receipt_qty: e.receipt_qty || 0,
      issue_qty: e.issue_qty || 0,
      balance_qty: e.balance_qty || 0,
      remarks: e.remarks || null,
    }));

    await StockEntry.bulkCreate(stockEntries, { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: "Stock created successfully",
      stock_id: stockHeader.id,
    });

  } catch (err) {
    await t.rollback();
    console.error("Create Stock Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ======================================================
 * GET STOCK
 * ======================================================
 * ROLE:
 * teacher        → own stock
 * manager/admin  → view only (by center)
 */
exports.getStock = async (req, res) => {
  try {
    const { role, center_id } = req.user;
    const { from_date, to_date } = req.query;

    const where = {};

    if (role === "teacher") {
      const teacher = await Teacher.findOne({
        where: { user_id: req.user.id },
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      where.teacher_id = teacher.id;
    } else {
      // manager / admin → center based
      where.center_id = center_id;
    }

    if (from_date && to_date) {
      where.createdAt = {
        [Op.between]: [from_date, to_date],
      };
    }

    const data = await StockHeader.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: StockEntry,
          as: "entries",
        },
      ],
    });

    return res.json({
      count: data.length,
      data,
    });

  } catch (err) {
    console.error("Get Stock Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
