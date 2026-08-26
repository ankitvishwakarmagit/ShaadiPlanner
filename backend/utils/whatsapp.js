import { formatWhatsAppPhone } from "./phoneValidator.js";

/**
 * Utility function to generate WhatsApp links with proper Indian formatting (+91)
 * 
 * @param {string} phone - Phone number to send WhatsApp message to
 * @param {string} message - Message to pre-populate in WhatsApp
 * @returns {string} Properly formatted WhatsApp link
 */
export const generateWhatsAppLink = (phone, message) => {
  const formattedPhone = formatWhatsAppPhone(phone) || (phone ? String(phone).replace(/\D/g, "") : "");
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message || '');
  
  // Generate the WhatsApp link
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

export default { generateWhatsAppLink };


