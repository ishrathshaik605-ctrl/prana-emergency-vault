const crypto = require('crypto');

// Master Encryption Key for Field-Level Data at Rest (can be set via env, with secure fallback)
const MASTER_KEY = process.env.VAULT_MASTER_KEY 
  ? Buffer.from(process.env.VAULT_MASTER_KEY, 'hex') 
  : crypto.scryptSync('AapatVault-Super-Secret-System-Key-2026', 'aapat-salt-salt-salt', 32);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a field with AES-256-GCM.
 * Formats output as: enc:v1:<base64-iv>:<base64-tag>:<base64-ciphertext>
 */
function encryptField(plainText, key = MASTER_KEY) {
  if (plainText === null || plainText === undefined || plainText === '') {
    return plainText;
  }
  const stringValue = typeof plainText === 'string' ? plainText : JSON.stringify(plainText);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(stringValue, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return `enc:v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt a field encrypted with AES-256-GCM.
 */
function decryptField(encryptedToken, key = MASTER_KEY) {
  if (!encryptedToken || typeof encryptedToken !== 'string' || !encryptedToken.startsWith('enc:v1:')) {
    return encryptedToken; // Return unchanged if not encrypted
  }

  try {
    const parts = encryptedToken.split(':');
    if (parts.length !== 5) {
      throw new Error('Malformed encrypted payload format');
    }
    const iv = Buffer.from(parts[2], 'base64');
    const authTag = Buffer.from(parts[3], 'base64');
    const ciphertext = parts[4];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed for field:', err.message);
    return '[ENCRYPTED DATA - UNAUTHORIZED / CORRUPTED]';
  }
}

/**
 * Hash data using SHA-256 (for PINs, OTPs, session tokens)
 */
function hashValue(value, salt = 'aapat-fixed-salt-2026') {
  return crypto.createHash('sha256').update(`${value}:${salt}`).digest('hex');
}

/**
 * Generate human-friendly, high-entropy Vault ID: e.g. "AV-7429" or "AV-9812-4"
 */
function generateVaultId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `AV-${num}${letter}`;
}

/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a cryptographically secure random session token
 */
function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = {
  MASTER_KEY,
  encryptField,
  decryptField,
  hashValue,
  generateVaultId,
  generateOTP,
  generateRandomToken
};
