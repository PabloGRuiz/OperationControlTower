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

// Hash precalculado para la contraseña inicial 'admin' con el salt actual
export const INITIAL_ADMIN_PASSWORD_HASH = '1f98d4d80a13349635eefae6a45700871d34c67ba59b1399710f60fa08ba74f7';
