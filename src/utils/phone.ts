/**
 * Phone number formatting utilities for Vietnamese phone numbers
 * 
 * Zalo API returns phone numbers in international format: 849123456789
 * This utility formats them for display in Vietnamese format: 0912 345 6789
 */

/**
 * Format Vietnamese phone number for display
 * 
 * Input formats supported:
 * - International: 849123456789, +849123456789
 * - Local: 09123456789, 0123456789
 * 
 * Output format: 0912 345 6789 (with spaces for readability)
 * 
 * @param phoneNumber - Phone number in any format
 * @returns Formatted phone number string, or original if invalid
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) {
    return "";
  }

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // Handle empty or too short numbers
  if (digits.length < 9 || digits.length > 11) {
    return phoneNumber; // Return original if invalid
  }

  let normalized = digits;

  // Handle international format (84...)
  if (digits.startsWith("84") && digits.length === 11) {
    // Remove country code 84, add leading 0
    normalized = "0" + digits.substring(2);
  }
  // Handle +84 format
  else if (digits.startsWith("84") && digits.length === 12) {
    normalized = "0" + digits.substring(2);
  }
  // Handle local format (already starts with 0)
  else if (digits.startsWith("0")) {
    normalized = digits;
  }
  // Handle 9-digit numbers (add leading 0)
  else if (digits.length === 9) {
    normalized = "0" + digits;
  }
  // Handle 10-digit numbers without leading 0 (add it)
  else if (digits.length === 10 && !digits.startsWith("0")) {
    normalized = "0" + digits;
  }

  // Format: 0912 345 6789
  // Group: 0xxx xxx xxxx
  if (normalized.length === 10) {
    return `${normalized.substring(0, 4)} ${normalized.substring(4, 7)} ${normalized.substring(7)}`;
  }

  // Fallback: return normalized if formatting fails
  return normalized;
}

/**
 * Validate Vietnamese phone number format
 * 
 * @param phoneNumber - Phone number to validate
 * @returns true if valid Vietnamese phone number format
 */
export function isValidVietnamesePhone(phoneNumber: string | null | undefined): boolean {
  if (!phoneNumber) {
    return false;
  }

  const digits = phoneNumber.replace(/\D/g, "");
  
  // Vietnamese mobile numbers: 10 digits starting with 0, or 11 digits starting with 84
  // Common prefixes: 03, 05, 07, 08, 09
  if (digits.length === 10 && digits.startsWith("0")) {
    const prefix = digits.substring(0, 2);
    return ["03", "05", "07", "08", "09"].includes(prefix);
  }
  
  if (digits.length === 11 && digits.startsWith("84")) {
    const prefix = digits.substring(2, 4);
    return ["03", "05", "07", "08", "09"].includes(prefix);
  }

  return false;
}

/**
 * Get phone number display text with fallback
 * 
 * @param phoneNumber - Phone number to display
 * @param fallback - Fallback text if phone number is not available
 * @returns Formatted phone number or fallback text
 */
export function getPhoneDisplayText(
  phoneNumber: string | boolean | null | undefined,
  fallback: string = "Chưa có số điện thoại"
): string {
  // Handle null or undefined
  if (phoneNumber == null) {
    return fallback;
  }

  // Handle false boolean
  if (phoneNumber === false) {
    return fallback;
  }

  // Handle string type
  if (typeof phoneNumber === "string") {
    return formatPhoneNumber(phoneNumber);
  }

  // Handle true (shouldn't happen, but TypeScript needs this)
  return fallback;
}

