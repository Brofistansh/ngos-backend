// src/controllers/activityTypeController.js

const ACTIVITY_TYPES = [
  "Arts and Crafts",
  "Balsabha",
  "Baseline Assessment",
  "Center Assets",
  "Center Opening Time",
  "Center Closing Time",
  "Community Survey",
  "Educational Visit",
  "Life Skills",
  "Mitti Sanskar",
  "Sanitary Pad Distribution",
  "Sports Day",
  "Parents Teacher Meeting",
  "Seva Day",
  "Volunteer Meeting",
  "Yoga",
  "Health Awareness Session",
  "Career Guidance",
  "Digital Literacy",
  "Environment Awareness",
  "Festival Celebration",
  "Library Reading Session"
];

exports.getActivityTypes = async (req, res) => {
  return res.json({
    success: true,
    count: ACTIVITY_TYPES.length,
    data: ACTIVITY_TYPES
  });
};
