/**
 * Frontend utility functions for Indian phone number (+91) validation and normalization.
 * 
 * Valid Indian mobile number rules:
 * - 10 digits starting with 6, 7, 8, or 9 ([6-9]\d{9})
 * - Normalizes inputs like:
 *   - "9876543210" -> "+919876543210"
 *   - "09876543210" -> "+919876543210"
 *   - "919876543210" -> "+919876543210"
 *   - "+91 98765-43210" -> "+919876543210"
 */

/**
 * Normalizes a phone number to standard Indian format (+91XXXXXXXXXX).
 * Returns null if the number is invalid.
 * 
 * @param {string|number} phone 
 * @returns {string|null}
 */
export const normalizeIndianPhone = (phone) => {
  if (!phone) return null;

  const cleaned = String(phone).trim().replace(/[\s\-\(\)\.]+/g, "");
  const digits = cleaned.replace(/[^\d]/g, "");

  if (!digits) return null;

  let core10Digits = null;

  if (digits.length === 10) {
    if (/^[6-9]\d{9}$/.test(digits)) {
      core10Digits = digits;
    }
  } else if (digits.length === 11 && digits.startsWith("0")) {
    const candidate = digits.slice(1);
    if (/^[6-9]\d{9}$/.test(candidate)) {
      core10Digits = candidate;
    }
  } else if (digits.length === 12 && digits.startsWith("91")) {
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
 * @returns {string|null}
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
