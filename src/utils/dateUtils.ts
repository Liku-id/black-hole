import moment from 'moment';

// Set Indonesian locale for moment
moment.locale('id');

/**
 * Date formatting utilities
 */
export const dateUtils = {
  /**
   * Format date to readable format (MMM dd, yyyy)
   * @param dateString - Date string to format
   * @returns Formatted date string
   */
  formatDate: (dateString: string): string => {
    try {
      const date = moment(dateString);
      if (!date.isValid()) return dateString;
      return date.format('MMM DD, YYYY');
    } catch {
      return dateString;
    }
  },

  /**
   * Format time to readable format (HH:mm)
   * @param dateString - Date string to format
   * @returns Formatted time string
   */
  formatTime: (dateString: string): string => {
    try {
      const date = moment(dateString);
      if (!date.isValid()) return '';
      return date.format('HH:mm');
    } catch {
      return '';
    }
  },

  /**
   * Format date and time into separate components
   * @param dateString - Date string to format
   * @returns Object with formatted date and time
   */
  formatDateTime: (dateString: string): { date: string; time: string } => {
    try {
      const date = moment(dateString);
      if (!date.isValid()) {
        return { date: dateString, time: '' };
      }
      return {
        date: date.format('MMM DD, YYYY'),
        time: date.format('HH:mm')
      };
    } catch {
      return { date: dateString, time: '' };
    }
  },

  /**
   * Format date to full format (MMMM dd, yyyy 'at' HH:mm)
   * @param dateString - Date string to format
   * @returns Formatted date string
   */
  formatFullDateTime: (dateString: string): string => {
    try {
      const date = moment(dateString);
      if (!date.isValid()) return dateString;
      return date.format('MMMM DD, YYYY [at] HH:mm');
    } catch {
      return dateString;
    }
  },

  /**
   * Format date to relative time (e.g., "2 hours ago")
   * @param dateString - Date string to format
   * @returns Relative time string
   */
  formatRelativeTime: (dateString: string): string => {
    try {
      const date = moment(dateString);
      if (!date.isValid()) return dateString;
      return date.fromNow();
    } catch {
      return dateString;
    }
  },

  /**
   * Format date for API requests (ISO format)
   * @param date - Date object or string
   * @returns ISO formatted date string
   */
  formatForAPI: (date: Date | string): string => {
    try {
      const momentDate = moment(date);
      if (!momentDate.isValid()) return '';
      return momentDate.toISOString();
    } catch {
      return '';
    }
  },

  /**
   * Format date to Indonesian format using moment.js (e.g., "26 Januari 2000 17:00 WIB")
   * Handles timestamp format like "2025-06-23 23:12:22.552203 +0700 WIB"
   * @param dateString - Date string to format
   * @returns Indonesian formatted date string
   */
  formatIndonesianDateTime: (dateString: string): string => {
    try {
      let momentDate;
      
      // Handle the specific timestamp format with timezone
      if (dateString.includes('.') && dateString.includes('+') && dateString.includes('WIB')) {
        // Parse format like "2025-06-23 23:12:22.552203 +0700 WIB"
        // Remove the "WIB" text and milliseconds, then parse
        const cleanedString = dateString.replace(/\.\d+/, '').replace(' WIB', '');
        momentDate = moment(cleanedString, 'YYYY-MM-DD HH:mm:ss ZZ');
      } else {
        // Handle standard ISO format or other formats
        momentDate = moment(dateString);
      }
      
      if (!momentDate.isValid()) return dateString;
      
      // Format date in Indonesian: "26 Januari 2000 17:00 WIB"
      return momentDate.format('DD MMMM YYYY HH:mm [WIB]');
    } catch {
      return dateString;
    }
  }
};
