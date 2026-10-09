const test = require('node:test');
const assert = require('node:assert/strict');
const { encryptField, decryptField, hashValue, generateVaultId, generateOTP } = require('../src/crypto');

test('Crypto Subsystem Tests', async (t) => {
  await t.test('AES-256-GCM should encrypt and decrypt field-level data correctly', () => {
    const originalText = 'Patient has Severe Penicillin Anaphylaxis & Pacemaker';
    const encrypted = encryptField(originalText);

    assert.ok(encrypted.startsWith('enc:v1:'), 'Ciphertext must start with version prefix enc:v1:');
    assert.notEqual(encrypted, originalText, 'Encrypted output must not match plaintext');

    const decrypted = decryptField(encrypted);
    assert.equal(decrypted, originalText, 'Decrypted output must match original text');
  });

  await t.test('Decryption should gracefully handle corrupted or tampered ciphertext', () => {
    const tampered = 'enc:v1:YWJjZGVmZ2hpamts:YWJjZGVmZ2hpamtsbW5vcA==:invalidpayload';
    const result = decryptField(tampered);
    assert.match(result, /UNAUTHORIZED|CORRUPTED/, 'Must return secure error notice without throwing uncaught exception');
  });

  await t.test('SHA-256 hashing must be deterministic and salted', () => {
    const hash1 = hashValue('1234');
    const hash2 = hashValue('1234');
    const hash3 = hashValue('9999');

    assert.equal(hash1, hash2, 'Identical inputs with identical salt must produce matching hash');
    assert.notEqual(hash1, hash3, 'Different inputs must produce different hashes');
  });

  await t.test('Vault ID generator creates expected human-readable format', () => {
    const vid = generateVaultId();
    assert.match(vid, /^AV-\d{4}[A-Z]$/, 'Vault ID must conform to AV-XXXXL format');
  });

  await t.test('OTP generator generates 6-digit numeric string', () => {
    const otp = generateOTP();
    assert.match(otp, /^\d{6}$/, 'OTP must be exactly 6 digits');
  });
});
