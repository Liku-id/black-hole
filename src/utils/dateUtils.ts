import { format, formatDistanceToNow, isValid } from 'date-fns';

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
      const date = new Date(dateString);
      if (!isValid(date)) return dateString;
      return format(date, 'MMM dd, yyyy');
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
      const date = new Date(dateString);
      if (!isValid(date)) return '';
      return format(date, 'HH:mm');
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
      const date = new Date(dateString);
      if (!isValid(date)) {
        return { date: dateString, time: '' };
      }
      return {
        date: format(date, 'MMM dd, yyyy'),
        time: format(date, 'HH:mm')
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
      const date = new Date(dateString);
      if (!isValid(date)) return dateString;
      return format(date, 'MMMM dd, yyyy \'at\' HH:mm');
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
      const date = new Date(dateString);
      if (!isValid(date)) return dateString;
      return formatDistanceToNow(date, { addSuffix: true });
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
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(dateObj)) return '';
      return dateObj.toISOString();
    } catch {
      return '';
    }
  }
};
