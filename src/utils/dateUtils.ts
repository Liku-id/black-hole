import { isValid } from 'date-fns';

/**
 * Date formatting utilities using date-fns
 */
export const dateUtils = {
  /**
   * Normalize timezone string to "+HH:MM" format
   */
  normTz: (tz?: string): string => {
    if (!tz) return '+07:00';
    const m = tz.match(/([+-]\d{2}):?(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
    return '+07:00';
  },

  /**
   * Parse date string and convert to WIB timezone
   * @param dateString - Date string to parse
   * @returns Date object in WIB timezone
   */
  parseToWIB: (dateString: string): Date | null => {
    try {
      if (!dateString) return null;

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
      } else if (dateString.includes('Z')) {
        // Handle UTC/Z format - parse as UTC, display as-is (no timezone conversion)
        date = new Date(dateString);
      } else if (
        dateString.includes('+07:00') ||
        dateString.includes('+0700')
      ) {
        // Handle WIB timezone format - parse as-is, display as-is
        date = new Date(dateString);
      } else {
        // Handle standard ISO format or other formats - parse as-is
        date = new Date(dateString);
      }

      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  },

  /**
   * Build UTC ISO string (YYYY-MM-DDTHH:mm:ss.sssZ) from local parts
   * Expects: date "YYYY-MM-DD", time "HH:mm", tz like "+07:00" or "+0700"
   */
  toIsoFromParts: (params: {
    date: string;
    time: string;
    timeZone?: string;
  }): string => {
    const { date, time, timeZone } = params;
    const tz = dateUtils.normTz(timeZone);
    return new Date(`${date}T${time}:00${tz}`).toISOString();
  },

  /**
   * Build UTC ISO string at start of day from a date-only string and tz
   * Expects date "YYYY-MM-DD" and optional tz (default +07:00)
   */
  toIsoStartOfDay: (date: string, timeZone = '+07:00'): string => {
    const tz = dateUtils.normTz(timeZone);
    return new Date(`${date}T00:00:00${tz}`).toISOString();
  },

  /**
   * Ensure a given date-like string is converted to UTC ISO string
   */
  toIso: (value: string): string => {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  },

  /**
   * Unified formatter: returns UTC ISO string from date with optional time and timezone
   * - date: YYYY-MM-DD (required)
   * - time: HH:mm (optional)
   * - timeZone: +HH:MM or +HHMM (optional, defaults +07:00)
   * If time is omitted, 00:00:00 at the provided timezone is used.
   */
  formatDateISO: (params: {
    date: string;
    time?: string;
    timeZone?: string;
  }): string => {
    const { date, time, timeZone } = params;
    if (!date) return '';
    const tz = dateUtils.normTz(timeZone);
    const safeTime =
      typeof time === 'string' && /^\d{2}:\d{2}$/.test(time) ? time : '00:00';
    const timePart = `${safeTime}:00`;
    const dt = new Date(`${date}T${timePart}${tz}`);
    if (isNaN(dt.getTime())) return '';
    return dt.toISOString();
  },

  /**
   * Format date to dd/mm/yyyy format
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted date string in dd/mm/yyyy format
   */
  formatDateDDMMYYYY: (dateString: string): string => {
    const date = dateUtils.parseToWIB(dateString);
    if (!date) return dateString;

    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  },

  /**
   * Format date to MMM d, yyyy format (e.g., May 3, 2026)
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted date string in MMM d, yyyy format
   */
  formatDateMMMDYYYY: (dateString: string): string => {
    const date = dateUtils.parseToWIB(dateString);
    if (!date) return dateString;

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    const month = monthNames[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${month} ${day}, ${year}`;
  },


  /**
   * Format date to "MMM d, yyyy HH:mm WIB" format (e.g., Sep 26, 2025 06:00 WIB)
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted date string with time and WIB timezone
   */
  formatDateTimeWIB: (dateString: string): string => {
    const date = dateUtils.parseToWIB(dateString);
    if (!date) return dateString;

    const year = date.getUTCFullYear();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    const month = monthNames[date.getUTCMonth()];
    const day = date.getUTCDate();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${month} ${day}, ${year} ${hours}:${minutes} WIB`;
  },

  /**
   * Extract timezone from date string
   * @param dateString - Date string to extract timezone from
   * @returns Timezone string in format "+HH:MM"
   */
  extractTimezone: (dateString: string): string => {
    if (!dateString) return '+07:00';

    if (dateString.includes('Z')) {
      return '+07:00';
    }

    const timezoneMatch = dateString.match(/([+-]\d{2}):?(\d{2})/);
    if (timezoneMatch) {
      const [, hours, minutes] = timezoneMatch;
      return `${hours}:${minutes}`;
    }

    return '+07:00';
  },

  formatDateRange: (startISO: string, endISO: string): string => {
    const s = dateUtils.parseToWIB(startISO);
    const e = dateUtils.parseToWIB(endISO);
    if (!s || !e) return `${startISO} - ${endISO}`;

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];

    const sY = s.getUTCFullYear();
    const eY = e.getUTCFullYear();
    const sM = monthNames[s.getUTCMonth()];
    const eM = monthNames[e.getUTCMonth()];
    const sD = s.getUTCDate();
    const eD = e.getUTCDate();
    const sHM =
      s.getUTCHours().toString().padStart(2, '0') +
      ':' +
      s.getUTCMinutes().toString().padStart(2, '0');
    const eHM =
      e.getUTCHours().toString().padStart(2, '0') +
      ':' +
      e.getUTCMinutes().toString().padStart(2, '0');

    let datePart = '';

    if (sY !== eY) {
      // beda tahun → tampilkan lengkap keduanya
      datePart = `${sM} ${sD}, ${sY} – ${eM} ${eD}, ${eY}`;
    } else if (sM !== eM) {
      // sama tahun, beda bulan → tampilkan bulan & hari masing2, tahun sekali
      datePart = `${sM} ${sD} – ${eM} ${eD}, ${sY}`;
    } else if (sD !== eD) {
      // sama bulan & tahun, beda hari → tampilkan rentang hari, bulan & tahun sekali
      datePart = `${sM} ${sD}–${eD}, ${sY}`;
    } else {
      // sama hari, bulan, tahun
      datePart = `${sM} ${sD}, ${sY}`;
    }

    // waktu selalu ditampilkan sebagai rentang
    return `${datePart} ${sHM}–${eHM} WIB`;
  },

  /**
   * Format time to HH:mm format (e.g., 15:30)
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted time string in HH:mm format
   */
  formatTime: (dateString: string): string => {
    const date = dateUtils.parseToWIB(dateString);
    if (!date) return dateString;

    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  },

};
