const CenterActivity = require("../models/sequelize/CenterActivity");
const Center = require("../models/sequelize/Center");

exports.createActivity = async (req, res) => {
  try {
    const { center_id } = req.body;

    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({ message: "Center not found" });
    }

    const activity = await CenterActivity.create({
      ...req.body,
      ngo_id: req.user.ngo_id,
      uploaded_by: req.user.id,
    });

    res.status(201).json({
      message: "Activity created",
      data: activity,
    });
  } catch (err) {
    console.error("Create Activity Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const { center_id, date, activity_type } = req.query;

    const where = {};
    if (center_id) where.center_id = center_id;
    if (date) where.date = date;
    if (activity_type) where.activity_type = activity_type;

    const data = await CenterActivity.findAll({
      where,
      include: [
        {
          model: Center,
          as: "activity_center",
          attributes: ["id", "name"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.json({ count: data.length, data });
  } catch (err) {
    console.error("Get Activities Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activity = await CenterActivity.findByPk(req.params.id, {
      include: [
        {
          model: Center,
          as: "activity_center",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json(activity);
  } catch (err) {
    console.error("Get Activity Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await CenterActivity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    await activity.update(req.body);

    res.json({
      message: "Activity updated",
      data: activity,
    });
  } catch (err) {
    console.error("Update Activity Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await CenterActivity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    await activity.destroy();
    res.json({ message: "Activity deleted" });
  } catch (err) {
    console.error("Delete Activity Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
