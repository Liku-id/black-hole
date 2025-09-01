import { format, isValid, parseISO } from 'date-fns';

/**
 * Date formatting utilities using date-fns
 */
export const dateUtils = {
  /**
   * Format date to dd/mm/yyyy format
   * @param dateString - Date string to format
   * @returns Formatted date string in dd/mm/yyyy format
   */
  formatDateDDMMYYYY: (dateString: string): string => {
    try {
      let date: Date;

      // Handle the specific timestamp format with timezone
      if (
        dateString.includes('.') &&
        dateString.includes('+') &&
        dateString.includes('WIB')
      ) {
        // Parse format like "2025-06-23 23:12:22.552203 +0700 WIB"
        // Remove the "WIB" text and milliseconds, then parse
        const cleanedString = dateString
          .replace(/\.\d+/, '')
          .replace(' WIB', '');
        date = new Date(cleanedString);
      } else if (
        dateString.includes('.') &&
        dateString.includes('+') &&
        dateString.includes('UTC')
      ) {
        // Handle format like "2025-08-05 07:39:33.892619 +0000 UTC"
        // Remove the milliseconds and UTC text, then parse
        const cleanedString = dateString
          .replace(/\.\d+/, '')
          .replace(' UTC', '');
        date = new Date(cleanedString);
      } else {
        // Handle standard ISO format or other formats
        date = parseISO(dateString);
      }

      if (!isValid(date)) return dateString;

      // Format date in dd/mm/yyyy format
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  },

  /**
   * Format date to MMM d, yyyy format (e.g., May 3, 2026)
   * @param dateString - Date string to format
   * @returns Formatted date string in MMM d, yyyy format
   */
  formatDateMMMDYYYY: (dateString: string): string => {
    try {
      let date: Date;

      // Handle the specific timestamp format with timezone
      if (
        dateString.includes('.') &&
        dateString.includes('+') &&
        dateString.includes('WIB')
      ) {
        // Parse format like "2025-06-23 23:12:22.552203 +0700 WIB"
        // Remove the "WIB" text and milliseconds, then parse
        const cleanedString = dateString
          .replace(/\.\d+/, '')
          .replace(' WIB', '');
        date = new Date(cleanedString);
      } else if (
        dateString.includes('.') &&
        dateString.includes('+') &&
        dateString.includes('UTC')
      ) {
        // Handle format like "2025-08-05 07:39:33.892619 +0000 UTC"
        // Remove the milliseconds and UTC text, then parse
        const cleanedString = dateString
          .replace(/\.\d+/, '')
          .replace(' UTC', '');
        date = new Date(cleanedString);
      } else {
        // Handle standard ISO format or other formats
        date = parseISO(dateString);
      }

      if (!isValid(date)) return dateString;

      // Format date in MMM d, yyyy format
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  }
};
