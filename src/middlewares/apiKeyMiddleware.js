// src/middleware/apiKeyMiddleware.js

module.exports = function apiKeyMiddleware(req, res, next) {
  const clientKey = req.headers['x-api-key'];

  if (!clientKey) {
    return res.status(401).json({ 
      success: false,
      message: "x-api-key header missing"
    });
  }

  if (clientKey !== process.env.API_KEY) {
    return res.status(403).json({ 
      success: false,
      message: "Invalid API key"
    });
  }

  next();
};
