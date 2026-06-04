const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');

// Simple admin key guard
router.use((req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_KEY && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

router.get('/stage1/pending',          ctrl.stage1Pending);
router.post('/stage1/:userId/approve', ctrl.approveStage1);
router.post('/stage1/:userId/reject',  ctrl.rejectStage1);

router.get('/stage2/pending',          ctrl.stage2Pending);
router.post('/stage2/:userId/approve', ctrl.approveStage2);
router.post('/stage2/:userId/reject',  ctrl.rejectStage2);

router.get('/users',                   ctrl.allUsers);
router.get('/audit',                   ctrl.auditLog);

module.exports = router;
