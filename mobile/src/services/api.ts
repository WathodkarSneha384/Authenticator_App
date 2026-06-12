import axios from 'axios';
// import CryptoJS from 'crypto-js';
import jsSHA from 'jssha';


// ─────────────────────────────────────────────────────────────
//  DEMO MODE — all responses are local, no backend needed.
//  Set to false when real API is ready.
// ─────────────────────────────────────────────────────────────
const DEMO_MODE = true;
const SECRET_KEY = '35fc015d9308f316bd524c824cce9cd56ea7e455c6fe5b37bf';
const VENDOR = 'DMAuthenticator';
const USERNAME = 'DMAuthenticator';
const PASSWORD = '95700e3a92830ae20ce0bddb23a2c1178f96017d70362572be90e293598c6126';
const DEMO_OTP       = '123456';
const DEMO_REG_KEY   = 'DEMO1234';
export const DEMO_SEED = 'JBSWY3DPEHPK3PXP'; // fixed seed for demo TOTP

function delay(ms = 800) { return new Promise(r => setTimeout(r, ms)); }

// ── real axios instance (used when DEMO_MODE = false) ──
const BASE_URL = 'http://223.30.224.244:8182/dmCmsService/rest/endpoints';
const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });


// ─────────────────────────────────────────────────────────────
//  Step 1 — Generate Checksum (for API auth) — not needed in demo mode
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





// export async function validateUser(userId: string) {
//   if (DEMO_MODE) {
//     await delay();
//     if (!/^[A-Z0-9]{1,10}$/.test(userId))
//       throw { response: { data: { error: 'Entered User ID not an Active User.' } } };
//     return {
//       status:   'otp_sent',
//       message:  'OTP sent to your registered mobile number.',
//       mobile:   '+91*****0000',
//       devOtp:   DEMO_OTP,
//     };
//   }
//   const res = await api.post('/auth/validate-user', { userId });
//   return res.data as { status: string; message: string; mobile?: string; devOtp?: string };
// }

// ─────────────────────────────────────────────────────────────
//  Resend OTP
// ─────────────────────────────────────────────────────────────
export async function resendOtp(userId: string) {
  if (DEMO_MODE) {
    await delay();
    return { status: 'otp_sent', message: 'OTP resent.', devOtp: DEMO_OTP };
  }
  const res = await api.post('/auth/resend-otp', { userId });
  return res.data as { status: string; message: string; devOtp?: string };
}

// ─────────────────────────────────────────────────────────────
//  Step 2 — Validate OTP
//  Demo: skips approval entirely → returns reg key immediately
// ─────────────────────────────────────────────────────────────

export async function validateOtp(userId: string, otp: string) {
  // if (DEMO_MODE) {
  //   await delay();

  //   if (otp !== DEMO_OTP) {
  //     throw {
  //       response: {
  //         data: {
  //           error: 'Invalid OTP entered.',
  //         },
  //       },
  //     };
  //   }

  //   return {
  //     status: 'stage2_approved',
  //     message: 'User Registration submitted successfully.',
  //     devRegKey: DEMO_REG_KEY,
  //   };
  // }

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
  // if (data.errorCode === '310') {
  //   return {
  //     status: 'stage2_approved',
  //     message: data.errorMsg,
  //     mobile: data.mobileNo,
  //   };
  //}

  throw {
    response: {
      data: {
        error: data.errorMsg || 'OTP validation failed',
      },
    },
  };
}







// export async function validateOtp(userId: string, otp: string) {
//   if (DEMO_MODE) {
//     await delay();
//     if (otp !== DEMO_OTP)
//       throw { response: { data: { error: 'Invalid OTP entered.' } } };
//     // In demo we auto-approve and jump straight to Registration Key
//     return {
//       status:      'stage2_approved',
//       message:     'User Registration submitted successfully.',
//       devRegKey:   DEMO_REG_KEY,
//     };
//   }
//   const res = await api.post('/auth/validate-otp', { userId, otp });
//   return res.data as { status: string; message: string; devRegKey?: string };
// }

// ─────────────────────────────────────────────────────────────
//  Step 3 — Submit Registration Key
// ─────────────────────────────────────────────────────────────
export async function submitRegistrationKey(userId: string, key: string) {
  if (DEMO_MODE) {
    await delay();
    if (key.toUpperCase() !== DEMO_REG_KEY)
      throw { response: { data: { error: 'Invalid Registration Key.' } } };
    return { status: 'registered', seed: DEMO_SEED, userId };
  }
  const res = await api.post('/auth/submit-registration-key', { userId, key });
  return res.data as { status: string; seed: string; userId: string };
}

// ─────────────────────────────────────────────────────────────
//  Status check
// ─────────────────────────────────────────────────────────────
export async function checkStatus(userId: string) {
  if (DEMO_MODE) {
    await delay();
    return { user_id: userId, status: 'registered' };
  }
  const res = await api.get(`/auth/status/${userId}`);
  return res.data as { user_id: string; status: string; rejection_reason?: string };
}
