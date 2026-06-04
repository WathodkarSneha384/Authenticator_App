const OTP_TTL = 180; // seconds

function generateSmsOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRegistrationKey() {
  // 8-char alphanumeric key sent via SMS after Stage II approval
  return Math.random().toString(36).substring(2, 6).toUpperCase() +
         Math.floor(1000 + Math.random() * 9000).toString();
}

function isExpired(expiresAt) {
  return Math.floor(Date.now() / 1000) > expiresAt;
}

function expiresAt(ttl = OTP_TTL) {
  return Math.floor(Date.now() / 1000) + ttl;
}

// In production replace this with real SMS gateway (Twilio, AWS SNS, etc.)
function sendSms(mobile, message) {
  console.log(`[SMS] To: ${mobile} | Message: ${message}`);
  // TODO: integrate SMS gateway here
}

module.exports = { generateSmsOtp, generateRegistrationKey, isExpired, expiresAt, sendSms, OTP_TTL };
