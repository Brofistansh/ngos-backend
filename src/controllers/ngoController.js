const NGO = require('../models/sequelize/NGO');

// UPDATE NGO
exports.updateNgo = async (req, res) => {
  try {
    const ngo = await NGO.findByPk(req.params.id);

    if (!ngo || ngo.status === 'inactive') {
      return res.status(404).json({ message: 'NGO not found or inactive' });
    }

    await ngo.update(req.body);
    res.json({
      message: 'NGO updated successfully',
      ngo
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update NGO' });
  }
};

// SOFT DELETE NGO
exports.deleteNgo = async (req, res) => {
  try {
    const ngo = await NGO.findByPk(req.params.id);

    if (!ngo || ngo.status === 'inactive') {
      return res.status(404).json({ message: 'NGO not found or already inactive' });
    }

    await ngo.update({ status: 'inactive' });
    res.json({
      message: 'NGO deactivated successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete NGO' });
  }
};
