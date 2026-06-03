const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');

// In production, protect these with an admin JWT middleware.
// For now a simple API key check is included.
router.use((req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_KEY && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

router.get('/users/pending', ctrl.listPending);
router.post('/users/:userId/approve', ctrl.approve);
router.post('/users/:userId/reject', ctrl.reject);
router.get('/audit', ctrl.auditLog);

module.exports = router;
