import { authenticator } from 'otplib';

// Keep in sync with backend totp.service.js settings
authenticator.options = { window: 1, step: 30 };

export function generateToken(seed: string): string {
  return authenticator.generate(seed);
}

export function remainingSeconds(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}
