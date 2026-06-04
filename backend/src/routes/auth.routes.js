const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/auth.controller');

// Step 1: Validate User ID → send SMS OTP
router.post('/validate-user',
  body('userId').trim().notEmpty().isLength({ max: 10 }).isAlphanumeric(),
  validate,
  ctrl.validateUserCtrl
);

// Resend OTP
router.post('/resend-otp',
  body('userId').trim().notEmpty(),
  validate,
  ctrl.resendOtpCtrl
);

// Step 2: Validate OTP → submit for approval
router.post('/validate-otp',
  body('userId').trim().notEmpty(),
  body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric(),
  validate,
  ctrl.validateOtpCtrl
);

// Step 3: Submit Registration Key → complete registration
router.post('/submit-registration-key',
  body('userId').trim().notEmpty(),
  body('key').trim().notEmpty(),
  validate,
  ctrl.submitRegKeyCtrl
);

// Check registration status
router.get('/status/:userId', ctrl.statusCtrl);

module.exports = router;
