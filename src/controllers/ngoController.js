const NGO = require('../models/sequelize/NGO');

// -------------------------------------------------
// CREATE NGO
// -------------------------------------------------
exports.createNgo = async (req, res) => {
  try {
    const { name, phone, zone } = req.body;

    if (!name || !phone || !zone) {
      return res.status(400).json({
        message: 'Name, phone & zone are required'
      });
    }

    const ngo = await NGO.create({
      name,
      phone,
      zone
    });

    res.status(201).json({
      message: 'NGO created successfully',
      ngo
    });

  } catch (err) {
    console.error('Error creating NGO:', err);
    res.status(500).json({
      message: 'Failed to create NGO'
    });
  }
};

// -------------------------------------------------
// GET ALL NGOs
// -------------------------------------------------
exports.getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.findAll({
      where: { status: 'active' }, // only show active NGOs
      order: [['createdAt', 'DESC']]
    });

    res.json(ngos);

  } catch (err) {
    console.error('Error getting NGOs:', err);
    res.status(500).json({
      message: 'Failed to fetch NGOs'
    });
  }
};

// -------------------------------------------------
// UPDATE NGO
// -------------------------------------------------
exports.updateNgo = async (req, res) => {
  try {
    const ngo = await NGO.findByPk(req.params.id);

    if (!ngo || ngo.status === 'inactive') {
      return res.status(404).json({
        message: 'NGO not found or inactive'
      });
    }

    await ngo.update(req.body);

    res.json({
      message: 'NGO updated successfully',
      ngo
    });

  } catch (err) {
    console.error('Error updating NGO:', err);
    res.status(500).json({
      message: 'Failed to update NGO'
    });
  }
};

// -------------------------------------------------
// SOFT DELETE NGO
// -------------------------------------------------
exports.deleteNgo = async (req, res) => {
  try {
    const ngo = await NGO.findByPk(req.params.id);

    if (!ngo || ngo.status === 'inactive') {
      return res.status(404).json({
        message: 'NGO not found or already inactive'
      });
    }

    await ngo.update({ status: 'inactive' });

    res.json({
      message: 'NGO deactivated successfully'
    });

  } catch (err) {
    console.error('Error deleting NGO:', err);
    res.status(500).json({
      message: 'Failed to delete NGO'
    });
  }
};
