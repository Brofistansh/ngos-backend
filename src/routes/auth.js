/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */


// src/routes/auth.js

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// ⭐ PUBLIC ROUTES -------------------------------------------------

// Register Super Admin (FIRST account only, or protected manually)
router.post('/register-super-admin', authController.registerSuperAdmin);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 */

// Login — returns access + refresh token
router.post('/login', authController.login);

// Refresh access token using refresh token
router.post('/refresh', authController.refreshToken);

// Request password reset (email link)
router.post('/request-password-reset', authController.requestPasswordReset);

// Complete password reset (new password)
router.post('/reset-password', authController.resetPassword);


// EXPORT ROUTER ---------------------------------------------------
module.exports = router;
