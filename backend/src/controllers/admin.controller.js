const { approveUser, rejectUser } = require('../services/user.service');
const db = require('../db');

async function listPending(req, res) {
  const users = db.prepare(`
    SELECT id, user_id, mobile, full_name, status, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC
  `).all();
  res.json({ users });
}

async function approve(req, res) {
  try {
    const result = approveUser(req.params.userId, req.body.note);
    res.json({ message: 'User approved', ...result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function reject(req, res) {
  try {
    const result = rejectUser(req.params.userId, req.body.reason);
    res.json({ message: 'User rejected', ...result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function auditLog(req, res) {
  const logs = db.prepare(`
    SELECT * FROM audit_log ORDER BY ts DESC LIMIT 200
  `).all();
  res.json({ logs });
}

module.exports = { listPending, approve, reject, auditLog };
