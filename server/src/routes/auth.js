const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../db');
const { hashValue, generateOTP } = require('../crypto');
const { dispatchOTP } = require('../notifications');

const JWT_SECRET = process.env.JWT_SECRET || 'aapat-vault-jwt-token-secret-2026';

/**
 * POST /api/auth/send-otp
 * Body: { phone: string, action: 'login' | 'family_unlock' | 'assisted_setup' }
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, action = 'login', vaultId = null } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid phone number is required (min 10 digits)' });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const code = generateOTP();
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const otpId = uuidv4();
    await dbRun(
      `INSERT INTO otps (id, phone, code_hash, vault_id, action, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [otpId, cleanPhone, codeHash, vaultId, action, expiresAt]
    );

    await dispatchOTP(cleanPhone, code, action);

    // Return the generated code in dev simulation mode for seamless instant UX testing
    return res.json({
      success: true,
      message: `OTP sent to ${cleanPhone}. Valid for 5 minutes.`,
      debug_otp: code, // Simulated for developer / panic-test convenience
      expires_in_seconds: 300
    });
  } catch (err) {
    console.error('Error in send-otp:', err);
    return res.status(500).json({ error: 'Internal server error while generating OTP' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { phone: string, code: string, name?: string }
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone number and OTP code are required' });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const codeHash = hashValue(code);

    const otpRecord = await dbGet(
      `SELECT * FROM otps 
       WHERE phone = ? AND code_hash = ? AND verified = 0 AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
      [cleanPhone, codeHash]
    );

    if (!otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired OTP code' });
    }

    // Mark OTP as verified
    await dbRun('UPDATE otps SET verified = 1 WHERE id = ?', [otpRecord.id]);

    // Find or create user
    let user = await dbGet('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
    if (!user) {
      const userId = uuidv4();
      const userName = name || `User ${cleanPhone.slice(-4)}`;
      await dbRun(
        `INSERT INTO users (id, phone, name, role) VALUES (?, ?, ?, 'owner')`,
        [userId, cleanPhone, userName]
      );
      user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    }

    // Find associated vault
    const vault = await dbGet('SELECT id, owner_name, blood_group FROM vaults WHERE owner_id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role, vaultId: vault?.id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        vaultId: vault?.id || null
      }
    });
  } catch (err) {
    console.error('Error in verify-otp:', err);
    return res.status(500).json({ error: 'Authentication verification failed' });
  }
});

/**
 * POST /api/auth/set-pin
 */
router.post('/set-pin', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    if (!userId || !pin || pin.length !== 4) {
      return res.status(400).json({ error: '4-digit PIN is required' });
    }
    const pinHash = hashValue(pin);
    await dbRun('UPDATE users SET pin_hash = ? WHERE id = ?', [pinHash, userId]);
    return res.json({ success: true, message: 'Security PIN set successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to set PIN' });
  }
});

module.exports = router;
