const jwt = require('jsonwebtoken');
const { registerUser, getByUserId, getSeed, verifyPassword, audit } = require('../services/user.service');
const { verifyToken } = require('../services/totp.service');

async function register(req, res) {
  try {
    const { userId, mobile, fullName, password } = req.body;
    const result = registerUser({ userId, mobile, fullName, password });
    res.status(201).json({ message: 'Registration submitted. Awaiting admin approval.', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { userId, password } = req.body;
    const valid = verifyPassword(userId, password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const user = getByUserId(userId);
    if (user.status !== 'approved') return res.status(403).json({ error: 'Account not approved yet' });

    // Step 1 passed — issue a short-lived pre-auth token; client must then verify TOTP
    const preAuth = jwt.sign(
      { userId, stage: 'pre_auth' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    audit(userId, 'login', 'step1_passed', req.ip);
    res.json({ message: 'Password verified. Enter your mobile token.', preAuthToken: preAuth });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function verifyOtp(req, res) {
  try {
    const { token } = req.body;
    const { userId } = req.user; // from requireAuth with pre_auth token

    const seed = getSeed(userId);
    const ok = verifyToken(seed, token);
    if (!ok) {
      audit(userId, 'login', 'otp_failed', req.ip);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const session = jwt.sign(
      { userId, stage: 'authenticated' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    audit(userId, 'login', 'otp_success', req.ip);
    res.json({ message: 'Login successful', sessionToken: session });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function verifyTransaction(req, res) {
  try {
    const { token, transactionRef } = req.body;
    const { userId } = req.user;

    const seed = getSeed(userId);
    const ok = verifyToken(seed, token);
    if (!ok) {
      audit(userId, 'tx_verify', `failed:${transactionRef}`, req.ip);
      return res.status(401).json({ error: 'Invalid token. Transaction denied.' });
    }

    audit(userId, 'tx_verify', `success:${transactionRef}`, req.ip);
    res.json({ message: 'Transaction authorised', transactionRef, authorised: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function getSeedForDevice(req, res) {
  try {
    const { userId } = req.user;
    const seed = getSeed(userId);
    res.json({ seed, userId });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { register, login, verifyOtp, verifyTransaction, getSeedForDevice };
