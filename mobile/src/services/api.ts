import axios from 'axios';
// import CryptoJS from 'crypto-js';
import jsSHA from 'jssha';


// ─────────────────────────────────────────────────────────────
//  Credentials for the remote dmCmsService API.
// ─────────────────────────────────────────────────────────────
const SECRET_KEY = '35fc015d9308f316bd524c824cce9cd56ea7e455c6fe5b37bf';
const VENDOR = 'DMAuthenticator';
const USERNAME = 'DMAuthenticator';
const PASSWORD = '95700e3a92830ae20ce0bddb23a2c1178f96017d70362572be90e293598c6126';
// Demo-only constants still used by the legacy registration-key stub below.
const DEMO_REG_KEY   = 'DEMO1234';
export const DEMO_SEED = 'JBSWY3DPEHPK3PXP'; // fixed seed for demo TOTP

function delay(ms = 800) { return new Promise(r => setTimeout(r, ms)); }

// ── real axios instance for the remote dmCmsService API ──
const BASE_URL = 'http://223.30.224.244:8182/dmCmsService/rest/endpoints';
const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });


// ─────────────────────────────────────────────────────────────
//  Step 1 — Generate Checksum (for API auth)
// ─────────────────────────────────────────────────────────────
export const generateChecksum = (
  secretKey: string,
  vendor: string,
  actionName: string,
  userName: string,
  password: string,
  userId: string
): string => {
  const input =
    `${secretKey}#${vendor}#${actionName}#${userName}#${password}#${userId}`;

  const shaObj = new jsSHA('SHA-256', 'TEXT');
  shaObj.update(input);

  return shaObj.getHash('HEX');
};



export const generateTimestamp = () => {
  const now = new Date();

  const pad = (num: number, len = 2) => String(num).padStart(len, '0');

  return (
    pad(now.getDate()) +
    pad(now.getMonth() + 1) +
    now.getFullYear() +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds()) +
    pad(now.getMilliseconds(), 3)
  );
};



// ─────────────────────────────────────────────────────────────
//  Step 1 — Validate User ID
// ─────────────────────────────────────────────────────────────
export async function validateUser(userId: string) {
  const timeStamp = generateTimestamp();
  console.log('Generated Timestamp:', timeStamp);

  const checksum = generateChecksum(
    SECRET_KEY,
    VENDOR,
    'doUserRegistration',
    USERNAME,
    PASSWORD,
    userId
  );
  console.log('Generated Checksum:', checksum);
  console.log('API Request Payload:', {  
    vendor:VENDOR,
    actionName: 'doUserRegistration',
    uname:USERNAME,
    passwd: PASSWORD,
    userId:userId,
    timeStamp:timeStamp,
    checkSum:checksum, });
  const res = await api.post('/doUserRegistration', {
    vendor:VENDOR,
    action: 'doUserRegistration',
    uname:USERNAME,
    passwd: PASSWORD,
    userId:userId,
    timeStamp:timeStamp,
    checkSum:checksum,
  });

  console.log('API Response:', res.data);

  return res.data;
}





// ─────────────────────────────────────────────────────────────
//  Resend OTP
// ─────────────────────────────────────────────────────────────
export async function resendOtp(userId: string) {
  // The real dmCmsService API has no dedicated resend endpoint — resending an
  // OTP is done by re-triggering user registration, which re-sends the OTP to
  // the registered mobile number. Delegate to validateUser so there is a single
  // source of truth for the doUserRegistration call.
  return validateUser(userId);
}

// ─────────────────────────────────────────────────────────────
//  Step 2 — Validate OTP
// ─────────────────────────────────────────────────────────────
export async function validateOtp(userId: string, otp: string) {
  const timeStamp = generateTimestamp();

  const checksum = generateChecksum(
    SECRET_KEY,
    'DMAuthenticator',
    'validateAuthenticatorOTP',
    'DMAuthenticator',
    PASSWORD,
    userId
  );

  const payload = {
    action: 'validateAuthenticatorOTP',
    checkSum: checksum,
    passwd: PASSWORD,
    timeStamp,
    uname: 'DMAuthenticator',
    vendor: 'DMAuthenticator',
    userId,
    otp,
    otpValidateFor: 'DMAuthenticator',
  };
console.log('Generated Timestamp:', timeStamp);
console.log('Generated Checksum:', checksum);
console.log('API Request Payload:', payload);
  const res = await api.post('/validateAuthenticatorOTP', payload);

  const data = res.data;
  console.log('API Response:', data);

  if (data.errorCode) {
    return {
      status: data.errorCode,
      message: data.errorMsg,
      mobile: data.mobileNo,
    };
  }

  throw {
    response: {
      data: {
        error: data.errorMsg || 'OTP validation failed',
      },
    },
  };
}







// ─────────────────────────────────────────────────────────────
//  Step 3 — Submit Registration Key
// ─────────────────────────────────────────────────────────────
export async function submitRegistrationKey(userId: string, key: string) {
  // NOTE: The real dmCmsService API has no registration-key step. This remains
  // a local demo-only stub used by the legacy RegistrationKey screen.
  await delay();
  if (key.toUpperCase() !== DEMO_REG_KEY)
    throw { response: { data: { error: 'Invalid Registration Key.' } } };
  return { status: 'registered', seed: DEMO_SEED, userId };
}

// ─────────────────────────────────────────────────────────────
//  Status check
// ─────────────────────────────────────────────────────────────
export async function checkStatus(userId: string) {
  // NOTE: The real dmCmsService API has no status endpoint; status is derived
  // from doUserRegistration error codes. This remains a local demo-only stub.
  await delay();
  return { user_id: userId, status: 'registered' };
}
