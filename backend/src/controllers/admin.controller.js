const { stage1Approve, stage1Reject, stage2Approve, stage2Reject } = require('../services/user.service');
const db = require('../db');

// GET /api/admin/stage1/pending
async function stage1Pending(req, res) {
  const users = db.prepare(`SELECT id, user_id, mobile, status, created_at FROM users WHERE status='submitted' ORDER BY created_at ASC`).all();
  res.json({ users });
}

// GET /api/admin/stage2/pending
async function stage2Pending(req, res) {
  const users = db.prepare(`SELECT id, user_id, mobile, status, stage1_by, stage1_at FROM users WHERE status='stage1_approved' ORDER BY stage1_at ASC`).all();
  res.json({ users });
}

// GET /api/admin/all-users
async function allUsers(req, res) {
  const users = db.prepare(`SELECT id, user_id, mobile, status, stage1_status, stage2_status, created_at, registered_at FROM users ORDER BY created_at DESC`).all();
  res.json({ users });
}

// POST /api/admin/stage1/:userId/approve
async function approveStage1(req, res) {
  try {
    const result = stage1Approve(req.params.userId.toUpperCase(), req.body.approverName);
    res.json({ message: 'Stage I approved', ...result });
  } catch (err) { res.status(err.status || 500).json({ error: err.message }); }
}

// POST /api/admin/stage1/:userId/reject
async function rejectStage1(req, res) {
  try {
    const result = stage1Reject(req.params.userId.toUpperCase(), req.body.reason, req.body.approverName);
    res.json({ message: 'Stage I rejected', ...result });
  } catch (err) { res.status(err.status || 500).json({ error: err.message }); }
}

// POST /api/admin/stage2/:userId/approve
async function approveStage2(req, res) {
  try {
    const result = stage2Approve(req.params.userId.toUpperCase(), req.body.approverName);
    res.json({ message: 'Stage II approved. Registration Key sent via SMS.', ...result });
  } catch (err) { res.status(err.status || 500).json({ error: err.message }); }
}

// POST /api/admin/stage2/:userId/reject
async function rejectStage2(req, res) {
  try {
    const result = stage2Reject(req.params.userId.toUpperCase(), req.body.reason, req.body.approverName);
    res.json({ message: 'Stage II rejected', ...result });
  } catch (err) { res.status(err.status || 500).json({ error: err.message }); }
}

// GET /api/admin/audit
async function auditLog(req, res) {
  const logs = db.prepare(`SELECT * FROM audit_log ORDER BY ts DESC LIMIT 200`).all();
  res.json({ logs });
}

module.exports = { stage1Pending, stage2Pending, allUsers, approveStage1, rejectStage1, approveStage2, rejectStage2, auditLog };
