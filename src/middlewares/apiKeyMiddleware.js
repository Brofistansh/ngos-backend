// src/middlewares/apiKeyMiddleware.js

module.exports = function apiKeyMiddleware(req, res, next) {
  const headerKey = req.headers['x-api-key'];

  if (!headerKey) {
    return res.status(401).json({ message: 'x-api-key missing' });
  }

  if (headerKey !== process.env.API_KEY) {
    return res.status(403).json({ message: 'Invalid API Key' });
  }

  next();
};
