/**
 * Pure-JS TOTP — no Node.js crypto dependency.
 * Uses jsSHA for HMAC-SHA1 (works in React Native / Hermes).
 * RFC 6238 compliant, 6-digit, 30-second window.
 */
import jsSHA from 'jssha';
import CryptoJS from 'crypto-js';

// ── Base32 decode ──────────────────────────────────────────────────────────
const B32_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): Uint8Array {
  const str = input.toUpperCase().replace(/=+$/, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of str) {
    const idx = B32_ALPHA.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

// ── HMAC-SHA1 via jsSHA ────────────────────────────────────────────────────
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const shaObj = new jsSHA('SHA-1', 'UINT8ARRAY', { hmacKey: { value: key, format: 'UINT8ARRAY' } });
  shaObj.update(message);
  return shaObj.getHMAC('UINT8ARRAY');
}

// ── TOTP ───────────────────────────────────────────────────────────────────
const STEP    = 60;   // seconds
const DIGITS  = 6;

function counterBytes(counter: number): Uint8Array {
  const buf = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  return buf;
}

export function generateToken(seed: string): string {
  // const key     = base32Decode(seed);
  // const counter = Math.floor(Date.now() / 1000 / STEP);
  // const hmac    = hmacSha1(key, counterBytes(counter));
  // const offset  = hmac[hmac.length - 1] & 0x0f;
  // const code    =
  //   ((hmac[offset]     & 0x7f) << 24) |
  //   ((hmac[offset + 1] & 0xff) << 16) |
  //   ((hmac[offset + 2] & 0xff) <<  8) |
  //    (hmac[offset + 3] & 0xff);
  // return (code % Math.pow(10, DIGITS)).toString().padStart(DIGITS, '0');





//    const hashHex = CryptoJS.SHA256(seed).toString();

//   const first4Bytes = hashHex.substring(0, 8);

//   let hash = parseInt(first4Bytes, 16);
// console.log('Hash (before mod):', hash);
//   // Convert to signed 32-bit like Java
//   if (hash > 0x7fffffff) {
//     hash -= 0x100000000;
//   }

//   hash = Math.abs(hash);
//   console.log('Hash (after abs):', hash);
//   console.log('Hash Value:', String(100000 + (hash % 900000)));
//   return String(100000 + (hash % 900000));





const hashHex = CryptoJS.SHA256(seed).toString();

  // First 4 bytes (8 hex chars)
  let hash = 0;

  for (let i = 0; i < 4; i++) {
    const byteHex = hashHex.substring(i * 2, i * 2 + 2);
    const byteVal = parseInt(byteHex, 16);

    hash = (hash << 8) | (byteVal & 0xff);
  }

  // Convert to signed 32-bit integer (same as Java int)
  hash = hash | 0;

  hash = Math.abs(hash);

  // Generate 6-digit token
  const token = 100000 + (hash % 900000);

  return token.toString();
}

export function remainingSeconds(): number {
  return STEP - (Math.floor(Date.now() / 1000) % STEP);
}
