import axios from 'axios';

const BASE_URL = __DEV__ ? 'http://10.0.2.2:4000/api' : 'https://your-production-server/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use((config) => {
  // token is set per-call via config.headers when needed
  return config;
});

export async function registerUser(data: {
  userId: string;
  mobile: string;
  fullName: string;
  password: string;
}) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function loginStep1(userId: string, password: string) {
  const res = await api.post('/auth/login', { userId, password });
  return res.data as { preAuthToken: string; message: string };
}

export async function loginStep2(preAuthToken: string, token: string) {
  const res = await api.post(
    '/auth/verify-otp',
    { token },
    { headers: { Authorization: `Bearer ${preAuthToken}` } }
  );
  return res.data as { sessionToken: string; message: string };
}

export async function verifyTransaction(sessionToken: string, token: string, transactionRef: string) {
  const res = await api.post(
    '/auth/verify-transaction',
    { token, transactionRef },
    { headers: { Authorization: `Bearer ${sessionToken}` } }
  );
  return res.data;
}

export async function fetchSeed(sessionToken: string) {
  const res = await api.get('/auth/seed', {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return res.data as { seed: string; userId: string };
}
