import axios from 'axios';

// ─────────────────────────────────────────────────────────────
//  DEMO MODE — all responses are local, no backend needed.
//  Set to false when real API is ready.
// ─────────────────────────────────────────────────────────────
const DEMO_MODE = true;

const DEMO_OTP       = '123456';
const DEMO_REG_KEY   = 'DEMO1234';
export const DEMO_SEED = 'JBSWY3DPEHPK3PXP'; // fixed seed for demo TOTP

function delay(ms = 800) { return new Promise(r => setTimeout(r, ms)); }

// ── real axios instance (used when DEMO_MODE = false) ──
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:4000/api'
  : 'https://your-production-server/api';
const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// ─────────────────────────────────────────────────────────────
//  Step 1 — Validate User ID
// ─────────────────────────────────────────────────────────────
export async function validateUser(userId: string) {
  if (DEMO_MODE) {
    await delay();
    if (!/^[A-Z0-9]{1,10}$/.test(userId))
      throw { response: { data: { error: 'Entered User ID not an Active User.' } } };
    return {
      status:   'otp_sent',
      message:  'OTP sent to your registered mobile number.',
      mobile:   '+91*****0000',
      devOtp:   DEMO_OTP,
    };
  }
  const res = await api.post('/auth/validate-user', { userId });
  return res.data as { status: string; message: string; mobile?: string; devOtp?: string };
}

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
  if (DEMO_MODE) {
    await delay();
    if (otp !== DEMO_OTP)
      throw { response: { data: { error: 'Invalid OTP entered.' } } };
    // In demo we auto-approve and jump straight to Registration Key
    return {
      status:      'stage2_approved',
      message:     'User Registration submitted successfully.',
      devRegKey:   DEMO_REG_KEY,
    };
  }
  const res = await api.post('/auth/validate-otp', { userId, otp });
  return res.data as { status: string; message: string; devRegKey?: string };
}

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
