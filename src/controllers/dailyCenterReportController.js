const DailyCenterReport = require("../models/sequelize/DailyCenterReport");
const Center = require("../models/sequelize/Center");

exports.createDailyCenterReport = async (req, res) => {
  try {
    const { center_id, date } = req.body;

    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({ message: "Center not found" });
    }

    const report = await DailyCenterReport.create({
      ...req.body,
      ngo_id: req.user.ngo_id
    });

    res.status(201).json({
      message: "Daily center report created",
      data: report
    });

  } catch (err) {
    console.error("Create Daily Center Report Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getDailyCenterReports = async (req, res) => {
  try {
    const { center_id, date } = req.query;

    const where = {};
    if (center_id) where.center_id = center_id;
    if (date) where.date = date;

    const reports = await DailyCenterReport.findAll({
      where,
      include: [
        {
          model: Center,
          as: "center",
          attributes: ["id", "name"]
        }
      ],
      order: [["date", "DESC"]]
    });

    res.json({
      count: reports.length,
      data: reports
    });

  } catch (err) {
    console.error("Get Daily Center Reports Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
