// src/utils/tokenUtils.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/sequelize/RefreshToken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ACCESS_TTL = parseInt(process.env.ACCESS_TOKEN_EXPIRES || '1800', 10); // seconds
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10);

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${ACCESS_TTL}s` });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) { return null; }
}

function generateRefreshTokenPlain() {
  return crypto.randomBytes(48).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function saveRefreshToken(userId, plainToken) {
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  const rt = await RefreshToken.create({ token_hash: tokenHash, user_id: userId, expires_at: expiresAt });
  return rt;
}

async function revokeRefreshTokenByHash(tokenHash) {
  await RefreshToken.update({ revoked: true }, { where: { token_hash: tokenHash }});
}

async function findValidRefreshToken(plainToken) {
  const tokenHash = hashToken(plainToken);
  const rt = await RefreshToken.findOne({ where: { token_hash: tokenHash }});
  if (!rt) return null;
  if (rt.revoked) return null;
  if (new Date(rt.expires_at) < new Date()) return null;
  return rt;
}

module.exports = {
  signAccessToken, verifyAccessToken,
  generateRefreshTokenPlain, hashToken,
  saveRefreshToken, findValidRefreshToken, revokeRefreshTokenByHash
};
