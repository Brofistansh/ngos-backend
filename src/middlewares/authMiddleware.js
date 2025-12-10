// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function (req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded; // user data now available everywhere
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
