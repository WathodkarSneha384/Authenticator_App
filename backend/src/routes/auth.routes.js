const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/auth.controller');

router.post('/register',
  body('userId').trim().notEmpty(),
  body('mobile').isMobilePhone(),
  body('fullName').trim().notEmpty(),
  body('password').isLength({ min: 8 }),
  validate,
  ctrl.register
);

router.post('/login',
  body('userId').trim().notEmpty(),
  body('password').notEmpty(),
  validate,
  ctrl.login
);

// requires pre_auth JWT
router.post('/verify-otp',
  requireAuth,
  body('token').trim().isLength({ min: 6, max: 8 }),
  validate,
  ctrl.verifyOtp
);

// requires full session JWT
router.post('/verify-transaction',
  requireAuth,
  body('token').trim().isLength({ min: 6, max: 8 }),
  body('transactionRef').notEmpty(),
  validate,
  ctrl.verifyTransaction
);

// mobile app calls this once after approval to download seed
router.get('/seed', requireAuth, ctrl.getSeedForDevice);

module.exports = router;
