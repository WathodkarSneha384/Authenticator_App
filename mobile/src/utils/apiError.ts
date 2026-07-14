import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return (
      'Cannot reach the server. Make sure your phone is on the same Wi‑Fi/VPN as the API server, ' +
      `then verify this URL is reachable: ${API_BASE_URL}`
    );
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Check your network connection and try again.';
  }

  const data = error.response?.data as { error?: string; errorMsg?: string } | undefined;
  return data?.errorMsg || data?.error || error.message;
}
