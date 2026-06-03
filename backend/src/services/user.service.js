const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateSecret } = require('./totp.service');

function registerUser({ userId, mobile, fullName, password }) {
  const existing = db.prepare('SELECT id FROM users WHERE user_id = ?').get(userId);
  if (existing) throw Object.assign(new Error('User ID already registered'), { status: 409 });

  const passwordHash = bcrypt.hashSync(password, 12);
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, user_id, mobile, full_name, password_hash, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(id, userId, mobile, fullName, passwordHash);

  audit(userId, 'register');
  return { id, userId, status: 'pending' };
}

function approveUser(userId, adminNote) {
  const user = getByUserId(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  if (user.status === 'approved') throw Object.assign(new Error('Already approved'), { status: 409 });

  const seed = generateSecret();
  db.prepare(`
    UPDATE users SET status = 'approved', seed = ?, approved_at = unixepoch() WHERE user_id = ?
  `).run(seed, userId);

  audit(userId, 'approve', adminNote);
  return { userId, seed };
}

function rejectUser(userId, reason) {
  const user = getByUserId(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  db.prepare(`UPDATE users SET status = 'rejected' WHERE user_id = ?`).run(userId);
  audit(userId, 'reject', reason);
  return { userId, status: 'rejected' };
}

function getByUserId(userId) {
  return db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
}

function getSeed(userId) {
  const user = getByUserId(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  if (user.status !== 'approved') throw Object.assign(new Error('User not approved'), { status: 403 });
  return user.seed;
}

function verifyPassword(userId, password) {
  const user = getByUserId(userId);
  if (!user) return false;
  return bcrypt.compareSync(password, user.password_hash);
}

function audit(userId, action, detail, ip) {
  db.prepare(`
    INSERT INTO audit_log (user_id, action, detail, ip) VALUES (?, ?, ?, ?)
  `).run(userId, action, detail || null, ip || null);
}

module.exports = { registerUser, approveUser, rejectUser, getByUserId, getSeed, verifyPassword, audit };
