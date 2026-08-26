/**
 * Utility functions for Indian phone number (+91) validation and normalization.
 * 
 * Rules for valid Indian mobile numbers:
 * - 10 digits starting with 6, 7, 8, or 9 (range: [6-9]\d{9}).
 * - Canonical E.164 database format: +91XXXXXXXXXX
 * - WhatsApp API format: 91XXXXXXXXXX
 */

/**
 * Normalizes an input phone number into canonical Indian format (+91XXXXXXXXXX).
 * 
 * @param {string|number} phone - Phone number input
 * @returns {string|null} - Normalized phone string (+91XXXXXXXXXX) or null if invalid
 */
export const normalizeIndianPhone = (phone) => {
  if (!phone) return null;

  // Convert to string and clean all whitespace, hyphens, brackets, dots
  const cleaned = String(phone).trim().replace(/[\s\-\(\)\.]+/g, "");

  // Extract all numeric digits
  const digits = cleaned.replace(/[^\d]/g, "");

  if (!digits) return null;

  let core10Digits = null;

  // Case 1: Exactly 10 digits -> check if starts with 6, 7, 8, or 9
  if (digits.length === 10) {
    if (/^[6-9]\d{9}$/.test(digits)) {
      core10Digits = digits;
    }
  } 
  // Case 2: 11 digits starting with '0' (trunk prefix) -> e.g. 09876543210
  else if (digits.length === 11 && digits.startsWith("0")) {
    const candidate = digits.slice(1);
    if (/^[6-9]\d{9}$/.test(candidate)) {
      core10Digits = candidate;
    }
  } 
  // Case 3: 12 digits starting with '91' (country code) -> e.g. 919876543210 or +919876543210
  else if (digits.length === 12 && digits.startsWith("91")) {
    const candidate = digits.slice(2);
    if (/^[6-9]\d{9}$/.test(candidate)) {
      core10Digits = candidate;
    }
  }

  if (!core10Digits) return null;

  return `+91${core10Digits}`;
};

/**
 * Checks whether a given phone number is a valid Indian mobile number.
 * 
 * @param {string|number} phone 
 * @returns {boolean}
 */
export const isValidIndianPhone = (phone) => {
  return normalizeIndianPhone(phone) !== null;
};

/**
 * Formats a phone number for WhatsApp wa.me links (91XXXXXXXXXX).
 * 
 * @param {string|number} phone 
 * @returns {string|null} - Digits only with country code 91, or null if invalid
 */
export const formatWhatsAppPhone = (phone) => {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) return null;
  return normalized.replace("+", "");
};

export default {
  normalizeIndianPhone,
  isValidIndianPhone,
  formatWhatsAppPhone,
};
