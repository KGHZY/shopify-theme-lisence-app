import crypto from 'crypto';

// Secret key for HMAC signature - should be stored in environment variables
const PULSE_SECRET_KEY = process.env.PULSE_SECRET_KEY || 'your-secret-key-here';

/**
 * Generate a PULSE license key with HMAC signature
 * Format: PULSE-XXXX-XXXX-SSSS
 * Where XXXX-XXXX is random and SSSS is HMAC signature
 */
export function generatePulseLicenseKey() {
  // Generate random part (8 characters: 4 + 4)
  const randomPart1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randomPart2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randomPart = `${randomPart1}-${randomPart2}`;
  
  // Create HMAC signature from random part
  const hmac = crypto.createHmac('sha256', PULSE_SECRET_KEY);
  hmac.update(randomPart);
  const signature = hmac.digest('hex').substring(0, 4).toUpperCase();
  
  // Combine to create final license key
  const licenseKey = `PULSE-${randomPart}-${signature}`;
  
  return licenseKey;
}

/**
 * Validate a PULSE license key format and signature
 * @param {string} licenseKey - The license key to validate
 * @returns {object} - { isValid: boolean, randomPart: string, signature: string }
 */
export function validatePulseLicenseKey(licenseKey) {
  try {
    // Check if it starts with PULSE-
    if (!licenseKey.startsWith('PULSE-')) {
      return { isValid: false, error: 'Invalid PULSE license format' };
    }
    
    // Extract parts: PULSE-XXXX-XXXX-SSSS
    const parts = licenseKey.split('-');
    if (parts.length !== 4 || parts[0] !== 'PULSE') {
      return { isValid: false, error: 'Invalid PULSE license format' };
    }
    
    const randomPart1 = parts[1];
    const randomPart2 = parts[2];
    const signature = parts[3];
    
    // Validate random parts (should be 4 characters each)
    if (randomPart1.length !== 4 || randomPart2.length !== 4) {
      return { isValid: false, error: 'Invalid random part format' };
    }
    
    // Validate signature (should be 4 characters)
    if (signature.length !== 4) {
      return { isValid: false, error: 'Invalid signature format' };
    }
    
    // Recreate HMAC signature and compare
    const randomPart = `${randomPart1}-${randomPart2}`;
    const hmac = crypto.createHmac('sha256', PULSE_SECRET_KEY);
    hmac.update(randomPart);
    const expectedSignature = hmac.digest('hex').substring(0, 4).toUpperCase();
    
    if (signature !== expectedSignature) {
      return { isValid: false, error: 'Invalid signature' };
    }
    
    return {
      isValid: true,
      randomPart,
      signature,
      fullRandomPart: `${randomPart1}-${randomPart2}`
    };
    
  } catch (error) {
    return { isValid: false, error: 'License validation error' };
  }
}

/**
 * Check if a license key is in PULSE format
 * @param {string} licenseKey - The license key to check
 * @returns {boolean} - True if it's a PULSE format key
 */
export function isPulseLicenseKey(licenseKey) {
  return licenseKey && licenseKey.startsWith('PULSE-');
}

/**
 * Generate multiple PULSE license keys
 * @param {number} count - Number of keys to generate
 * @returns {string[]} - Array of generated license keys
 */
export function generateMultiplePulseLicenseKeys(count = 1) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generatePulseLicenseKey());
  }
  return keys;
}
