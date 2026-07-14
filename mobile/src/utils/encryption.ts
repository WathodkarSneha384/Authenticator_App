import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

/** AES key used for CBS user-password encryption. */
export const PASSWORD_ENCRYPTION_KEY =
  '9F3A8C7D4E5B2A1C8D7E6F5A4B3C2D1E';

/** RN-safe typing — avoids lib.dom ArrayBufferView mismatch with Uint8Array. */
type GetRandomValues = (array: Uint8Array) => Uint8Array;

function fillRandomBytes(bytes: Uint8Array): void {
  const getRandomValues = globalThis.crypto?.getRandomValues as GetRandomValues | undefined;
  if (getRandomValues) {
    getRandomValues(bytes);
    return;
  }
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
}

function parseKey(key: string): CryptoJS.lib.WordArray {
  if (/^[0-9A-Fa-f]+$/.test(key)) {
    return CryptoJS.enc.Hex.parse(key);
  }
  return CryptoJS.enc.Base64.parse(key);
}

function randomIv(): CryptoJS.lib.WordArray {
  const bytes = new Uint8Array(16);
  fillRandomBytes(bytes);
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i += 4) {
    words.push(
      (bytes[i] << 24) |
      (bytes[i + 1] << 16) |
      (bytes[i + 2] << 8) |
      bytes[i + 3],
    );
  }
  return CryptoJS.lib.WordArray.create(words, 16);
}

/**
 * Mirrors Java encryptWithKey: AES/CBC/PKCS5Padding, random 16-byte IV
 * prepended to ciphertext, result Base64-encoded.
 */
export function encryptWithKey(
  plainText: string,
  key: string = PASSWORD_ENCRYPTION_KEY,
): string {
  const keyWordArray = parseKey(key);
  const iv = randomIv();

  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plainText), keyWordArray, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ivAndCipher = iv.clone().concat(encrypted.ciphertext);
  console.log('Encrypted password (Base64):', CryptoJS.enc.Base64.stringify(ivAndCipher));
  return CryptoJS.enc.Base64.stringify(ivAndCipher);
}
