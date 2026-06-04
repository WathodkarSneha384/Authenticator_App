const {
  validateUser, resendOtp, validateOtp,
  submitRegistrationKey, getStatus,
} = require('../services/user.service');

// POST /api/auth/validate-user
// Body: { userId }
async function validateUserCtrl(req, res) {
  try {
    const { userId } = req.body;
    const result = validateUser(userId.trim().toUpperCase());
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/auth/resend-otp
// Body: { userId }
async function resendOtpCtrl(req, res) {
  try {
    const result = resendOtp(req.body.userId.trim().toUpperCase());
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/auth/validate-otp
// Body: { userId, otp }
async function validateOtpCtrl(req, res) {
  try {
    const { userId, otp } = req.body;
    const result = validateOtp(userId.trim().toUpperCase(), otp.trim());
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// POST /api/auth/submit-registration-key
// Body: { userId, key }
async function submitRegKeyCtrl(req, res) {
  try {
    const { userId, key } = req.body;
    const result = submitRegistrationKey(userId.trim().toUpperCase(), key.trim());
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/auth/status/:userId
async function statusCtrl(req, res) {
  try {
    const result = getStatus(req.params.userId.toUpperCase());
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { validateUserCtrl, resendOtpCtrl, validateOtpCtrl, submitRegKeyCtrl, statusCtrl };
