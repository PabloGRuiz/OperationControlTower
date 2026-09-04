/**
 * Utilidades criptográficas seguras para el cliente utilizando Web Crypto API nativo (SHA-256 + Salt)
 */

const SALT = 'OCT_OPERATIONS_TOWER_SALT_v1_2026';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Hashes precalculados con SALT = 'OCT_OPERATIONS_TOWER_SALT_v1_2026'
export const INITIAL_ADMIN_PASSWORD_HASH = '35f2b6ef1233a6875ba8a050167a8c5b1ab1ffc7c9ea3d7232cc48a2cff515b2'; // 'admin'
export const INITIAL_ADMIN123_PASSWORD_HASH = '5c24d70e8cdf8ac40b551fe212b9ed680c94c4cea4b0272c6462b3f6e3a8adf8'; // 'admin123'
