/**
 * Date formatting utilities using Intl API for consistent WIB timezone handling
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
   * Convert date string or Date object to WIB timezone
   * @param date - Date string or Date object to convert
   * @returns Date object in WIB timezone
   */
  convertToWIB: (date: string | Date): Date => {
    let d: Date;

    if (typeof date === 'string') {
      // Handle various date formats
      if (date.includes('Z') || date.includes('UTC')) {
        // ISO string with Z or UTC - parse as UTC and convert to WIB
        d = new Date(date);
        // Add 7 hours to convert UTC to WIB
        d = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      } else if (date.includes('+07:00') || date.includes('+0700')) {
        // Already in WIB timezone - parse directly
        d = new Date(date);
      } else if (date.includes('+') || date.includes('-')) {
        // Date with timezone offset - parse as is
        d = new Date(date);
      } else {
        // Plain date string, assume it's already in local time
        d = new Date(date);
      }
    } else {
      d = new Date(date);
    }

    return d;
  },

  /**
   * Get today's date in WIB timezone
   * @returns Date object representing today in WIB
   */
  getTodayWIB: (): Date => {
    const now = new Date();
    return dateUtils.convertToWIB(now);
  },

  /**
   * Get today's date as string in YYYY-MM-DD format in WIB
   * @returns String in YYYY-MM-DD format
   */
  getTodayWIBString: (): string => {
    const today = dateUtils.getTodayWIB();
    return today.toISOString().split('T')[0];
  },

  /**
   * Format date with various options using Intl API
   * @param date - Date string or Date object to format
   * @param variant - Format variant: 'day', 'date', 'full', 'datetime'
   * @returns Formatted date string
   */
  formatDate: (
    date: string | Date,
    variant: 'day' | 'date' | 'full' | 'datetime' = 'full'
  ): string => {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) return '-';
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta'
    };

    switch (variant) {
      case 'day':
        options.weekday = 'long';
        break;
      case 'date':
        options.day = 'numeric';
        options.month = 'short';
        options.year = 'numeric';
        break;
      case 'datetime':
        options.day = 'numeric';
        options.month = 'short';
        options.year = 'numeric';
        options.hour = 'numeric';
        options.minute = '2-digit';
        options.hour12 = true;
        break;
      case 'full':
      default:
        options.weekday = 'long';
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
    }

    return new Intl.DateTimeFormat('en-US', options).format(d);
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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(date);
  },

  /**
   * Format date to dd/mm/yyyy HH:mm format
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted date string in dd/mm/yyyy HH:mm format
   */
  formatDateDDMMYYYYHHMM: (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Get date components in WIB timezone
    const dateInWIB = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(date);

    const day = dateInWIB.find(part => part.type === 'day')?.value || '';
    const month = dateInWIB.find(part => part.type === 'month')?.value || '';
    const year = dateInWIB.find(part => part.type === 'year')?.value || '';
    const hour = dateInWIB.find(part => part.type === 'hour')?.value?.padStart(2, '0') || '';
    const minute = dateInWIB.find(part => part.type === 'minute')?.value?.padStart(2, '0') || '';

    return `${day}/${month}/${year} ${hour}:${minute}`;
  },

  /**
   * Format date to MMM d, yyyy format (e.g., May 3, 2026)
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted date string in MMM d, yyyy format
   */
  formatDateMMMDYYYY: (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(date);
  },

  /**
   * Format time to HH:mm format (e.g., 15:30)
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted time string in HH:mm format
   */
  formatTime: (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }).format(date);
  },

  /**
   * Format date to "MMM d, yyyy HH:mm WIB" format (e.g., Sep 26, 2025 06:00 WIB)
   * Converts any timezone to WIB (UTC+7) for consistent display
   * @param dateString - Date string to format
   * @returns Formatted date string with time and WIB timezone
   */
  formatDateTimeWIB: (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }).format(date);

    return `${formatted} WIB`;
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
    const s = new Date(startISO);
    const e = new Date(endISO);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${startISO} - ${endISO}`;

    const sYear = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(s);

    const eYear = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(e);

    const sMonth = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      timeZone: 'Asia/Jakarta'
    }).format(s);

    const eMonth = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      timeZone: 'Asia/Jakarta'
    }).format(e);

    const sDay = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(s);

    const eDay = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(e);

    const sTime = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }).format(s);

    const eTime = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }).format(e);

    let datePart = '';

    if (sYear !== eYear) {
      // beda tahun → tampilkan lengkap keduanya
      datePart = `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
    } else if (sMonth !== eMonth) {
      // sama tahun, beda bulan → tampilkan bulan & hari masing2, tahun sekali
      datePart = `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
    } else if (sDay !== eDay) {
      // sama bulan & tahun, beda hari → tampilkan rentang hari, bulan & tahun sekali
      datePart = `${sMonth} ${sDay}–${eDay}, ${sYear}`;
    } else {
      // sama hari, bulan, tahun
      datePart = `${sMonth} ${sDay}, ${sYear}`;
    }

    // waktu selalu ditampilkan sebagai rentang
    return `${datePart} ${sTime}–${eTime} WIB`;
  },

  /**
   * Format number to Indonesian Rupiah currency
   * @param value - Number or string to format
   * @returns Formatted currency string
   */
  formatRupiah: (value: number | string): string => {
    const number = typeof value === 'string' ? Number(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  },

  /**
   * Format countdown time from seconds to MM:SS format
   * @param seconds - Number of seconds
   * @returns Formatted time string in MM:SS format
   */
  formatCountdownTime: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  }
};
