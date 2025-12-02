// src/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');

const User = require('../models/sequelize/User');
const PasswordResetToken = require('../models/sequelize/PasswordResetToken');

// ------------------ TOKEN UTILS (ONE CLEAN IMPORT BLOCK) ------------------
const {
  signAccessToken,
  generateRefreshTokenPlain,
  saveRefreshToken,
  findValidRefreshToken,
  revokeRefreshTokenByHash
} = require('../utils/tokenUtils');

const crypto = require('crypto');
const { sendMail } = require('../utils/emailer');


// ------------------ REGISTER SUPER ADMIN ------------------
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "super_admin"
    });

    return res.json({
      message: "Super Admin created",
      user: { id: user.id, email: user.email }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating super admin" });
  }
};


// ------------------ LOGIN (ACCESS + REFRESH TOKEN) ------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid email or password" });

    // Access Token
    const accessPayload = {
      id: user.id,
      role: user.role,
      ngo_id: user.ngo_id || null,
      center_id: user.center_id || null
    };
    const accessToken = signAccessToken(accessPayload);

    // Refresh Token
    const plainRefresh = generateRefreshTokenPlain();
    await saveRefreshToken(user.id, plainRefresh);

    return res.json({
      message: "Login success",
      token: accessToken,          // backwards compatibility
      access_token: accessToken,
      refresh_token: plainRefresh
    });

  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: "Login failed" });
  }
};


// ------------------ REFRESH TOKEN ------------------
exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token)
      return res.status(400).json({ message: "refresh_token required" });

    const rt = await findValidRefreshToken(refresh_token);
    if (!rt)
      return res.status(401).json({ message: "Invalid or expired refresh token" });

    const user = await User.findByPk(rt.user_id);
    if (!user)
      return res.status(401).json({ message: "User not found" });

    const newAccessToken = signAccessToken({
      id: user.id,
      role: user.role,
      ngo_id: user.ngo_id,
      center_id: user.center_id
    });

    // Refresh Token Rotation
    await revokeRefreshTokenByHash(rt.token_hash);

    const newRefreshPlain = generateRefreshTokenPlain();
    await saveRefreshToken(user.id, newRefreshPlain);

    return res.json({
      access_token: newAccessToken,
      refresh_token: newRefreshPlain
    });

  } catch (err) {
    console.error("refreshToken error", err);
    return res.status(500).json({ message: "Error refreshing token" });
  }
};


// ------------------ REQUEST PASSWORD RESET ------------------
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "email required" });

    const user = await User.findOne({ where: { email } });

    // For privacy: always say OK
    if (!user) {
      return res.json({ message: "If an account exists, a reset link was sent" });
    }

    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(plainToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await PasswordResetToken.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false
    });

    const resetLink = `${process.env.FRONTEND_BASE_URL || "http://localhost:3000"
      }/reset-password?token=${plainToken}&uid=${user.id}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name || ""},</p>
        <p>You requested a password reset. Click below (valid 15 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
      text: `Reset your password: ${resetLink}`
    });

    return res.json({ message: "If an account exists, a reset link was sent" });

  } catch (err) {
    console.error("requestPasswordReset error", err);
    return res.status(500).json({ message: "Error requesting password reset" });
  }
};


// ------------------ RESET PASSWORD ------------------
exports.resetPassword = async (req, res) => {
  try {
    const { uid, token, new_password } = req.body;

    if (!uid || !token || !new_password)
      return res.status(400).json({ message: "uid, token, new_password required" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const prt = await PasswordResetToken.findOne({
      where: { token_hash: hashed, user_id: uid }
    });

    if (!prt) return res.status(400).json({ message: "Invalid or expired token" });
    if (prt.used) return res.status(400).json({ message: "Token already used" });
    if (new Date(prt.expires_at) < new Date())
      return res.status(400).json({ message: "Token expired" });

    const user = await User.findByPk(uid);
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(new_password, salt);

    await user.update({ password: hashedPwd });
    await prt.update({ used: true });

    return res.json({ message: "Password has been reset" });

  } catch (err) {
    console.error("resetPassword error", err);
    return res.status(500).json({ message: "Error resetting password" });
  }
};
