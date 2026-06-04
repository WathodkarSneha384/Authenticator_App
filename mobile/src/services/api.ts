import axios from 'axios';

const BASE_URL = __DEV__ ? 'http://10.0.2.2:4000/api' : 'https://your-production-server/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// Step 1: Validate User ID — CBS check + send OTP
export async function validateUser(userId: string) {
  const res = await api.post('/auth/validate-user', { userId });
  return res.data as { status: string; message: string; mobile?: string; devOtp?: string };
}

// Resend OTP
export async function resendOtp(userId: string) {
  const res = await api.post('/auth/resend-otp', { userId });
  return res.data as { status: string; message: string; devOtp?: string };
}

// Step 2: Validate OTP
export async function validateOtp(userId: string, otp: string) {
  const res = await api.post('/auth/validate-otp', { userId, otp });
  return res.data as { status: string; message: string };
}

// Step 3: Submit Registration Key
export async function submitRegistrationKey(userId: string, key: string) {
  const res = await api.post('/auth/submit-registration-key', { userId, key });
  return res.data as { status: string; seed: string; userId: string };
}

// Check registration status
export async function checkStatus(userId: string) {
  const res = await api.get(`/auth/status/${userId}`);
  return res.data as { user_id: string; status: string; rejection_reason?: string };
}
