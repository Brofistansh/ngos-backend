const Center = require('../models/sequelize/Center');
const NGO = require('../models/sequelize/NGO');

exports.createCenter = async (req, res) => {
  try {
    const { ngo_id } = req.params;  // NGO ID in URL
    const {
      name,
      contact_phone,
      timezone,
      zone,
      manager_id // ✅ NEW (optional)
    } = req.body;

    const ngo = await NGO.findByPk(ngo_id);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    const center = await Center.create({
      ngo_id,
      name,
      contact_phone,
      timezone,
      zone,
      manager_id: manager_id || null // ✅ safely assign
    });

    return res.status(201).json({
      message: "Center created successfully",
      data: center
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating center" });
  }
};

exports.getCentersByNGO = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const { zone } = req.query;

    let where = { ngo_id };

    if (zone) {
      where.zone = zone;
    }

    const centers = await Center.findAll({ where });

    return res.json(centers);

  } catch (err) {
    res.status(500).json({ message: "Error fetching centers" });
  }
};

// UPDATE CENTER
exports.updateCenter = async (req, res) => {
  try {
    const center = await Center.findByPk(req.params.id);

    if (!center || center.status === 'inactive') {
      return res.status(404).json({ message: 'Center not found or inactive' });
    }

    // ✅ manager_id can be updated here as well
    await center.update(req.body);

    res.json({
      message: 'Center updated successfully',
      center
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update center' });
  }
};

// SOFT DELETE CENTER
exports.deleteCenter = async (req, res) => {
  try {
    const center = await Center.findByPk(req.params.id);

    if (!center || center.status === 'inactive') {
      return res.status(404).json({ message: 'Center not found or already inactive' });
    }

    await center.update({ status: 'inactive' });

    res.json({
      message: 'Center deactivated successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete center' });
  }
};
