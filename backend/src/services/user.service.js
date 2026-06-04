const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { generateSecret } = require('./totp.service');
const { generateSmsOtp, generateRegistrationKey, expiresAt, isExpired, sendSms } = require('./otp.service');

// ------------------------------------------------------------------
// CBS User Validation stub — replace with real CBS API call
// ------------------------------------------------------------------
function validateCbsUser(userId) {
  // TODO: Call real CBS API here
  // Return { valid: true, mobile: '+91XXXXXXXXXX' } or { valid: false }
  if (!/^[a-zA-Z0-9]{1,10}$/.test(userId)) return { valid: false };
  return { valid: true, mobile: '+919999900000' }; // stub
}

// ------------------------------------------------------------------
// Step 1: Validate User ID — check CBS, send OTP
// ------------------------------------------------------------------
function validateUser(userId) {
  const existing = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

  if (existing) {
    if (existing.status === 'otp_pending')     return _resendOtp(existing);
    if (existing.status === 'submitted')        return { status: 'submitted',        message: 'User ID Pending for Approval.' };
    if (existing.status === 'stage1_approved')  return { status: 'stage1_approved',  message: 'User ID Pending for Approval.' };
    if (existing.status === 'stage2_approved')  return { status: 'stage2_approved',  message: 'Enter the Registration Key sent to your mobile.' };
    if (existing.status === 'registered')       return { status: 'registered',       message: 'User already registered. Please proceed to login.' };
    if (existing.status === 'rejected')         return { status: 'rejected',         message: `Registration rejected. Reason: ${existing.rejection_reason || 'Contact admin.'}` };
  }

  // New user — validate against CBS
  const cbs = validateCbsUser(userId);
  if (!cbs.valid) throw Object.assign(new Error('Entered User ID not an Active User.'), { status: 400 });

  const id  = uuidv4();
  const otp = generateSmsOtp();
  const exp = expiresAt(180);

  db.prepare(`INSERT INTO users (id, user_id, mobile, otp, otp_expires_at, status) VALUES (?, ?, ?, ?, ?, 'otp_pending')`)
    .run(id, userId, cbs.mobile, otp, exp);

  sendSms(cbs.mobile, `Your CBS Authenticator OTP is: ${otp}. Valid for 3 minutes.`);
  audit(userId, 'otp_sent');

  return {
    status: 'otp_sent',
    message: 'OTP sent to your registered mobile number.',
    mobile: _maskMobile(cbs.mobile),
    ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
  };
}

// ------------------------------------------------------------------
// Resend OTP
// ------------------------------------------------------------------
function resendOtp(userId) {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  if (user.status !== 'otp_pending') throw Object.assign(new Error('No OTP flow active for this user.'), { status: 400 });
  return _resendOtp(user);
}

function _resendOtp(user) {
  const otp = generateSmsOtp();
  const exp = expiresAt(180);
  db.prepare('UPDATE users SET otp=?, otp_expires_at=?, otp_attempts=0 WHERE user_id=?').run(otp, exp, user.user_id);
  sendSms(user.mobile, `Your CBS Authenticator OTP is: ${otp}. Valid for 3 minutes.`);
  audit(user.user_id, 'otp_resent');
  return {
    status: 'otp_sent',
    message: 'OTP resent to your registered mobile number.',
    mobile: _maskMobile(user.mobile),
    ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
  };
}

// ------------------------------------------------------------------
// Step 2: Validate OTP → submit for Stage I
// ------------------------------------------------------------------
function validateOtp(userId, otp) {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  if (user.status !== 'otp_pending') throw Object.assign(new Error('No OTP pending for this user.'), { status: 400 });

  if (isExpired(user.otp_expires_at)) throw Object.assign(new Error('OTP has expired. Please request a new OTP.'), { status: 400 });
  if (user.otp !== otp) {
    db.prepare('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE user_id = ?').run(userId);
    throw Object.assign(new Error('Invalid OTP entered.'), { status: 400 });
  }

  db.prepare(`UPDATE users SET status='submitted', otp=NULL, otp_expires_at=NULL WHERE user_id=?`).run(userId);
  audit(userId, 'registration_submitted');
  return { status: 'submitted', message: 'User Registration submitted successfully.' };
}

// ------------------------------------------------------------------
// Stage I Approval / Rejection
// ------------------------------------------------------------------
function stage1Approve(userId, approverName) {
  const user = _requireStatus(userId, 'submitted', 'User not in submitted state.');
  db.prepare(`UPDATE users SET stage1_status='approved', stage1_by=?, stage1_at=unixepoch(), status='stage1_approved' WHERE user_id=?`)
    .run(approverName || 'admin', userId);
  audit(userId, 'stage1_approved', approverName);
  return { userId, stage: 'stage1_approved' };
}

function stage1Reject(userId, reason, approverName) {
  const user = getByUserId(userId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  db.prepare(`UPDATE users SET stage1_status='rejected', stage1_by=?, stage1_at=unixepoch(), status='rejected', rejection_reason=? WHERE user_id=?`)
    .run(approverName || 'admin', reason, userId);
  sendSms(user.mobile, `Your CBS Authenticator registration was rejected. Reason: ${reason}`);
  audit(userId, 'stage1_rejected', reason);
  return { userId, status: 'rejected' };
}

// ------------------------------------------------------------------
// Stage II Approval / Rejection — sends Registration Key via SMS
// ------------------------------------------------------------------
function stage2Approve(userId, approverName) {
  const user = _requireStatus(userId, 'stage1_approved', 'User not in Stage I approved state.');
  const regKey = generateRegistrationKey();
  const keyExp = expiresAt(24 * 3600);

  db.prepare(`UPDATE users SET stage2_status='approved', stage2_by=?, stage2_at=unixepoch(), status='stage2_approved', registration_key=?, reg_key_expires_at=? WHERE user_id=?`)
    .run(approverName || 'admin', regKey, keyExp, userId);

  sendSms(user.mobile, `Your CBS Authenticator Registration Key is: ${regKey}. Enter it in the app to complete registration.`);
  audit(userId, 'stage2_approved', approverName);
  return {
    userId, stage: 'stage2_approved',
    ...(process.env.NODE_ENV === 'development' && { devRegKey: regKey }),
  };
}

function stage2Reject(userId, reason, approverName) {
  const user = getByUserId(userId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  db.prepare(`UPDATE users SET stage2_status='rejected', stage2_by=?, stage2_at=unixepoch(), status='rejected', rejection_reason=? WHERE user_id=?`)
    .run(approverName || 'admin', reason, userId);
  sendSms(user.mobile, `Your CBS Authenticator registration was rejected. Reason: ${reason}`);
  audit(userId, 'stage2_rejected', reason);
  return { userId, status: 'rejected' };
}

// ------------------------------------------------------------------
// Step 3: Submit Registration Key → complete registration
// ------------------------------------------------------------------
function submitRegistrationKey(userId, key) {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  if (user.status !== 'stage2_approved') throw Object.assign(new Error('No registration key pending for this user.'), { status: 400 });
  if (isExpired(user.reg_key_expires_at)) throw Object.assign(new Error('Registration Key has expired. Contact admin.'), { status: 400 });
  if (user.registration_key !== key.toUpperCase()) throw Object.assign(new Error('Invalid Registration Key.'), { status: 400 });

  const seed = generateSecret();
  db.prepare(`UPDATE users SET status='registered', seed=?, registration_key=NULL, registered_at=unixepoch() WHERE user_id=?`)
    .run(seed, userId);
  audit(userId, 'registered');
  return { status: 'registered', seed, userId };
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function getStatus(userId) {
  const user = db.prepare('SELECT user_id, status, rejection_reason, mobile FROM users WHERE user_id = ?').get(userId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  return user;
}

function getByUserId(userId) {
  return db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
}

function _requireStatus(userId, requiredStatus, errorMsg) {
  const user = getByUserId(userId);
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  if (user.status !== requiredStatus) throw Object.assign(new Error(errorMsg), { status: 400 });
  return user;
}

function audit(userId, action, detail, ip) {
  db.prepare('INSERT INTO audit_log (user_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(userId, action, detail || null, ip || null);
}

function _maskMobile(m) {
  return m ? m.slice(0, -4).replace(/\d/g, '*') + m.slice(-4) : '';
}

module.exports = {
  validateUser, resendOtp, validateOtp,
  stage1Approve, stage1Reject, stage2Approve, stage2Reject,
  submitRegistrationKey, getStatus, getByUserId, audit,
};
