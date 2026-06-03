const { totp, authenticator } = require('otplib');

const WINDOW = parseInt(process.env.TOTP_WINDOW || '1', 10);
const ISSUER = process.env.TOTP_ISSUER || 'ProctoAuthCBS';
const STEP = 30; // seconds per token

authenticator.options = { window: WINDOW, step: STEP };

function generateSecret() {
  return authenticator.generateSecret(20);
}

function generateToken(secret) {
  return authenticator.generate(secret);
}

function verifyToken(secret, token) {
  return authenticator.verify({ secret, token });
}

function otpauthUrl(secret, userId) {
  return authenticator.keyuri(userId, ISSUER, secret);
}

function remainingSeconds() {
  return STEP - (Math.floor(Date.now() / 1000) % STEP);
}

module.exports = { generateSecret, generateToken, verifyToken, otpauthUrl, remainingSeconds };
