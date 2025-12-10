function requireFields(...fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({ message: "Missing fields", missing });
    }
    next();
  };
}

function validateUUID(...fields) {
  const uuidRegex = /^[0-9a-fA-F-]{36}$/;
  return (req, res, next) => {
    for (const field of fields) {
      const value = req.body[field] || req.params[field];
      if (value && !uuidRegex.test(value)) {
        return res.status(400).json({ message: `Invalid UUID: ${field}` });
      }
    }
    next();
  };
}

function validateNumber(field, opts = {}) {
  return (req, res, next) => {
    if (req.body[field] === undefined) return next();
    const n = Number(req.body[field]);
    if (isNaN(n)) return res.status(400).json({ message: `${field} must be number` });
    if (opts.min !== undefined && n < opts.min) {
      return res.status(400).json({ message: `${field} must be >= ${opts.min}` });
    }
    next();
  };
}

function validateEnum(field, allowed) {
  return (req, res, next) => {
    if (!req.body[field]) return next();
    if (!allowed.includes(req.body[field])) {
      return res.status(400).json({
        message: `${field} must be one of: ${allowed.join(', ')}`
      });
    }
    next();
  };
}

function validateDate(field) {
  return (req, res, next) => {
    const v = req.body[field] || req.query[field];
    if (!v) return next();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return res.status(400).json({ message: `${field} must be YYYY-MM-DD` });
    }
    next();
  };
}

function sanitizeStrings(...fields) {
  return (req, res, next) => {
    for (const f of fields) {
      if (typeof req.body[f] === "string") {
        req.body[f] = req.body[f].trim().replace(/[\x00-\x1F]/g, "");
      }
    }
    next();
  };
}

module.exports = {
  requireFields,
  validateUUID,
  validateNumber,
  validateEnum,
  validateDate,
  sanitizeStrings
};
