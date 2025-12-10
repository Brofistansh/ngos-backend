// src/controllers/zoneController.js

// You can change names later if NGO wants different labels
const ZONES = [
  'North Zone',
  'South Zone',
  'East Zone',
  'West Zone',
  'Central Zone',
  'North-East Zone',
];

exports.getZones = (req, res) => {
  return res.json({
    success: true,
    count: ZONES.length,
    data: ZONES,
  });
};
