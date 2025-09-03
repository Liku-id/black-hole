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
      } else if (dateString.includes('+') && dateString.includes('UTC')) {
        // Handle format like "2025-08-05 07:39:33.892619 +0000 UTC" or "2025-08-11 20:45:14 +0000 UTC"
        // Remove the milliseconds (if any) and UTC text, then parse
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
      } else if (dateString.includes('+') && dateString.includes('UTC')) {
        // Handle format like "2025-08-05 07:39:33.892619 +0000 UTC" or "2025-08-11 20:45:14 +0000 UTC"
        // Remove the milliseconds (if any) and UTC text, then parse
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
  },

  /**
   * Format time to HH:mm format (e.g., 15:30)
   * @param dateString - Date string to format
   * @returns Formatted time string in HH:mm format
   */
  formatTime: (dateString: string): string => {
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
      } else if (dateString.includes('+') && dateString.includes('UTC')) {
        // Handle format like "2025-08-05 07:39:33.892619 +0000 UTC" or "2025-08-11 20:45:14 +0000 UTC"
        // Remove the milliseconds (if any) and UTC text, then parse
        const cleanedString = dateString
          .replace(/\.\d+/, '')
          .replace(' UTC', '');
        date = new Date(cleanedString);
      } else {
        // Handle standard ISO format or other formats
        date = parseISO(dateString);
      }

      if (!isValid(date)) return dateString;

      // Format time in HH:mm format
      return format(date, 'HH:mm');
    } catch {
      return dateString;
    }
  },

  /**
   * Format date to "MMM d, yyyy HH:mm WIB" format (e.g., May 3, 2026 15:30 WIB)
   * @param dateString - Date string to format
   * @returns Formatted date string with time and WIB timezone
   */
  formatDateTimeWIB: (dateString: string): string => {
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
      } else if (dateString.includes('+') && dateString.includes('UTC')) {
        // Handle format like "2025-08-05 07:39:33.892619 +0000 UTC" or "2025-08-11 20:45:14 +0000 UTC"
        // Remove the milliseconds (if any) and UTC text, then parse
        const cleanedString = dateString
          .replace(/\.\d+/, '')
          .replace(' UTC', '');
        date = new Date(cleanedString);
      } else {
        // Handle standard ISO format or other formats
        date = parseISO(dateString);
      }

      if (!isValid(date)) return dateString;

      // Format date with time and WIB timezone
      return format(date, 'MMM d, yyyy HH:mm') + ' WIB';
    } catch {
      return dateString;
    }
  },

  /**
   * Extract timezone from date string
   * @param dateString - Date string to extract timezone from
   * @returns Timezone string in format "+HH:MM"
   */
  extractTimezone: (dateString: string): string => {
    if (!dateString) return '+07:00';
    
    if (dateString.includes('Z')) {
      return '+00:00';
    }
    
    const timezoneMatch = dateString.match(/([+-]\d{2}):?(\d{2})/);
    if (timezoneMatch) {
      const [, hours, minutes] = timezoneMatch;
      return `${hours}:${minutes}`;
    }
    
    return '+07:00';
  }
};
