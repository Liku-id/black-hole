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
  },

  /**
   * Unified masking function for strings
   * Masks all characters except first N chars (or last N chars for data masking)
   * @param value - Value to mask
   * @param options - Optional configuration
   * @returns Masked value or null if invalid
   */
  mask: (
    value: string | null | undefined,
    options?: {
      visibleFirstChars?: number; // Number of first chars to show (default: 1)
      visibleLastChars?: number; // Number of last chars to show for data masking (if set, uses data masking instead)
      maskChar?: string; // Character to use for masking (default: '*')
      minLength?: number; // Minimum length to apply masking
    }
  ): string | null => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const {
      visibleFirstChars = 8,
      visibleLastChars,
      maskChar = '*',
      minLength = 4
    } = options || {};

    if (value.length <= minLength) {
      return value;
    }

    if (visibleLastChars !== undefined) {
      const lastChars = value.slice(-visibleLastChars);
      const masked = maskChar.repeat(4);
      return `${masked}${lastChars}`;
    }

    const firstChars = value.substring(0, visibleFirstChars);
    const masked = maskChar.repeat(Math.max(3, value.length - visibleFirstChars));
    return `${firstChars}${masked}`;
  },

  /**
   * Unmask data (only works if original value is provided)
   * Note: This cannot restore original value if it was fully masked
   * Use this only if you have stored the original value separately
   * @param maskedValue - Masked value to unmask
   * @param originalValue - Original value (required for actual unmasking)
   * @returns Unmasked value (original) or masked value if original not provided
   */
  unmask: (
    maskedValue: string | null | undefined,
    originalValue?: string | null
  ): string | null => {
    if (originalValue) {
      return originalValue;
    }

    if (!maskedValue || typeof maskedValue !== 'string') {
      return null;
    }

    return maskedValue;
  }
};
