/**
 * String manipulation utilities
 */
export const stringUtils = {
  /**
   * Truncate text to specified length with ellipsis
   * @param text - Text to truncate
   * @param maxLength - Maximum length before truncation
   * @returns Truncated text with ellipsis if needed
   */
  truncate: (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  },

  /**
   * Capitalize first letter of each word
   * @param text - Text to capitalize
   * @returns Capitalized text
   */
  capitalizeWords: (text: string): string => {
    if (!text) return '';
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  /**
   * Convert text to title case
   * @param text - Text to convert
   * @returns Title case text
   */
  toTitleCase: (text: string): string => {
    if (!text) return '';
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  },

  /**
   * Convert camelCase or PascalCase to human readable text
   * @param text - Text to convert
   * @returns Human readable text
   */
  camelToHuman: (text: string): string => {
    if (!text) return '';
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  },

  /**
   * Generate initials from name
   * @param name - Full name
   * @returns Initials (max 2 characters)
   */
  getInitials: (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  },

  /**
   * Format phone number for display
   * @param phoneNumber - Phone number string
   * @returns Formatted phone number
   */
  formatPhoneNumber: (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format Indonesian phone numbers
    if (cleaned.startsWith('62')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`;
    }

    // Format other patterns
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phoneNumber; // Return original if no pattern matches
  },

  /**
   * Format NPWP number with automatic masking
   * @param value - Input value
   * @returns Formatted NPWP number (99.999.999.9-999.999)
   */
  formatNpwpNumber: (value: string): string => {
    if (!value) return '';

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Apply masking pattern: 99.999.999.9-999.999
    let formatted = cleaned;

    if (cleaned.length > 0) {
      formatted = cleaned.slice(0, 2);
    }
    if (cleaned.length > 2) {
      formatted += '.' + cleaned.slice(2, 5);
    }
    if (cleaned.length > 5) {
      formatted += '.' + cleaned.slice(5, 8);
    }
    if (cleaned.length > 8) {
      formatted += '.' + cleaned.slice(8, 9);
    }
    if (cleaned.length > 9) {
      formatted += '-' + cleaned.slice(9, 12);
    }
    if (cleaned.length > 12) {
      formatted += '.' + cleaned.slice(12, 15);
    }

    return formatted;
  },

  /**
   * Remove NPWP formatting to get clean number
   * @param npwpNumber - Formatted NPWP number
   * @returns Clean number without formatting
   */
  cleanNpwpNumber: (npwpNumber: string): string => {
    if (!npwpNumber) return '';
    return npwpNumber.replace(/\D/g, '');
  },

  /**
   * Check if string is empty or only whitespace
   * @param text - Text to check
   * @returns True if empty or whitespace
   */
  isEmpty: (text: string): boolean => {
    return !text || text.trim().length === 0;
  },

  /**
   * Generate slug from text
   * @param text - Text to convert to slug
   * @returns URL-friendly slug
   */
  toSlug: (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
};
