import { dateUtils } from './dateUtils';

describe('dateUtils', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('normTz', () => {
    it('returns +07:00 when tz is omitted or empty', () => {
      expect(dateUtils.normTz()).toBe('+07:00');
      expect(dateUtils.normTz('')).toBe('+07:00');
    });

    it('normalizes valid timezone strings with or without colon', () => {
      expect(dateUtils.normTz('+07:00')).toBe('+07:00');
      expect(dateUtils.normTz('+0700')).toBe('+07:00');
      expect(dateUtils.normTz('-0500')).toBe('-05:00');
      expect(dateUtils.normTz('-04:30')).toBe('-04:30');
      expect(dateUtils.normTz('UTC+08:00')).toBe('+08:00');
    });

    it('falls back to +07:00 for unrecognized timezone strings', () => {
      expect(dateUtils.normTz('WIB')).toBe('+07:00');
      expect(dateUtils.normTz('UTC')).toBe('+07:00');
      expect(dateUtils.normTz('invalid')).toBe('+07:00');
    });
  });

  describe('convertToWIB', () => {
    it('converts ISO string with Z by shifting +7 hours', () => {
      const result = dateUtils.convertToWIB('2025-05-03T10:00:00Z');
      expect(result.toISOString()).toBe('2025-05-03T17:00:00.000Z');
    });

    it('converts date string containing UTC by shifting +7 hours', () => {
      const input = '2025-05-03 10:00:00 UTC';
      const expected = new Date(new Date(input).getTime() + 7 * 60 * 60 * 1000);
      const result = dateUtils.convertToWIB(input);
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('parses strings with +07:00 or +0700 directly', () => {
      const withColon = dateUtils.convertToWIB('2025-05-03T10:00:00+07:00');
      expect(withColon.toISOString()).toBe('2025-05-03T03:00:00.000Z');

      const withoutColon = dateUtils.convertToWIB('2025-05-03T10:00:00+0700');
      expect(withoutColon.toISOString()).toBe('2025-05-03T03:00:00.000Z');
    });

    it('parses strings with other timezone offsets (+ or -) directly', () => {
      const plusOffset = dateUtils.convertToWIB('2025-05-03T10:00:00+08:00');
      expect(plusOffset.toISOString()).toBe('2025-05-03T02:00:00.000Z');

      const minusOffset = dateUtils.convertToWIB('2025-05-03T10:00:00-05:00');
      expect(minusOffset.toISOString()).toBe('2025-05-03T15:00:00.000Z');
    });

    it('parses plain date string without Z, UTC, +, or -', () => {
      const input = '2025/05/03 10:00:00';
      const result = dateUtils.convertToWIB(input);
      expect(result.getTime()).toBe(new Date(input).getTime());
    });

    it('clones Date object input', () => {
      const input = new Date('2025-05-03T10:00:00Z');
      const result = dateUtils.convertToWIB(input);
      expect(result).not.toBe(input);
      expect(result.getTime()).toBe(input.getTime());
    });
  });

  describe('getTodayWIB and getTodayWIBString', () => {
    it('returns current Date via convertToWIB and YYYY-MM-DD string', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-05-03T20:00:00Z'));

      const spy = jest.spyOn(dateUtils, 'convertToWIB');
      const today = dateUtils.getTodayWIB();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(today.getTime()).toBe(new Date('2025-05-03T20:00:00Z').getTime());
      expect(dateUtils.getTodayWIBString()).toBe('2025-05-03');
    });
  });

  describe('formatDate', () => {
    const sampleISO = '2025-05-03T20:30:00Z'; // 2025-05-04 03:30 WIB (Sunday)

    it('returns "-" for invalid date string or invalid Date object', () => {
      expect(dateUtils.formatDate('invalid-date')).toBe('-');
      expect(dateUtils.formatDate(new Date('invalid'))).toBe('-');
    });

    it('formats with default variant (full)', () => {
      expect(dateUtils.formatDate(sampleISO)).toBe('Sunday, May 4, 2025');
      expect(dateUtils.formatDate(new Date(sampleISO), 'full')).toBe(
        'Sunday, May 4, 2025'
      );
    });

    it('formats with day variant', () => {
      expect(dateUtils.formatDate(sampleISO, 'day')).toBe('Sunday');
    });

    it('formats with date variant', () => {
      expect(dateUtils.formatDate(sampleISO, 'date')).toBe('May 4, 2025');
    });

    it('formats with datetime variant', () => {
      const result = dateUtils.formatDate(sampleISO, 'datetime');
      expect(result).toContain('May 4, 2025');
      expect(result).toMatch(/3:30\s*AM/i);
    });

    it('falls back to full format for unknown variant', () => {
      expect(
        dateUtils.formatDate(
          sampleISO,
          'unknown' as unknown as 'day' | 'date' | 'full' | 'datetime'
        )
      ).toBe('Sunday, May 4, 2025');
    });
  });

  describe('toIsoFromParts', () => {
    it('builds UTC ISO string using default +07:00 timezone when omitted', () => {
      expect(
        dateUtils.toIsoFromParts({ date: '2025-05-03', time: '14:30' })
      ).toBe('2025-05-03T07:30:00.000Z');
    });

    it('builds UTC ISO string with explicit timezone formats', () => {
      expect(
        dateUtils.toIsoFromParts({
          date: '2025-05-03',
          time: '14:30',
          timeZone: '+0800'
        })
      ).toBe('2025-05-03T06:30:00.000Z');

      expect(
        dateUtils.toIsoFromParts({
          date: '2025-05-03',
          time: '14:30',
          timeZone: '-05:00'
        })
      ).toBe('2025-05-03T19:30:00.000Z');
    });
  });

  describe('toIsoStartOfDay', () => {
    it('builds start-of-day UTC ISO string with default +07:00 timezone', () => {
      expect(dateUtils.toIsoStartOfDay('2025-05-03')).toBe(
        '2025-05-02T17:00:00.000Z'
      );
    });

    it('builds start-of-day UTC ISO string with custom timezone', () => {
      expect(dateUtils.toIsoStartOfDay('2025-05-03', '+08:00')).toBe(
        '2025-05-02T16:00:00.000Z'
      );
      expect(dateUtils.toIsoStartOfDay('2025-05-03', '-0500')).toBe(
        '2025-05-03T05:00:00.000Z'
      );
    });
  });

  describe('toIso', () => {
    it('returns empty string for empty or invalid input', () => {
      expect(dateUtils.toIso('')).toBe('');
      expect(dateUtils.toIso(undefined as unknown as string)).toBe('');
      expect(dateUtils.toIso('not-a-date')).toBe('');
    });

    it('converts valid date strings to UTC ISO string', () => {
      expect(dateUtils.toIso('2025-05-03T10:00:00+07:00')).toBe(
        '2025-05-03T03:00:00.000Z'
      );
      expect(dateUtils.toIso('2025-05-03T10:00:00Z')).toBe(
        '2025-05-03T10:00:00.000Z'
      );
    });
  });

  describe('formatDateISO', () => {
    it('returns empty string when date is missing or invalid', () => {
      expect(dateUtils.formatDateISO({ date: '' })).toBe('');
      expect(dateUtils.formatDateISO({ date: '2025-99-99' })).toBe('');
      expect(
        dateUtils.formatDateISO({ date: 'invalid-date', time: '10:00' })
      ).toBe('');
    });

    it('uses 00:00 when time is omitted or not in HH:mm format', () => {
      expect(dateUtils.formatDateISO({ date: '2025-05-03' })).toBe(
        '2025-05-02T17:00:00.000Z'
      );
      expect(
        dateUtils.formatDateISO({ date: '2025-05-03', time: '9:00' })
      ).toBe('2025-05-02T17:00:00.000Z');
      expect(
        dateUtils.formatDateISO({
          date: '2025-05-03',
          time: undefined
        })
      ).toBe('2025-05-02T17:00:00.000Z');
    });

    it('formats valid date, HH:mm time, and optional timezone', () => {
      expect(
        dateUtils.formatDateISO({
          date: '2025-05-03',
          time: '15:45',
          timeZone: '+0800'
        })
      ).toBe('2025-05-03T07:45:00.000Z');
    });
  });

  describe('formatDateDDMMYYYY', () => {
    it('returns original input for invalid date', () => {
      expect(dateUtils.formatDateDDMMYYYY('invalid')).toBe('invalid');
      expect(dateUtils.formatDateDDMMYYYY('')).toBe('');
    });

    it('formats valid date in dd/mm/yyyy WIB timezone', () => {
      expect(dateUtils.formatDateDDMMYYYY('2025-05-03T20:00:00Z')).toBe(
        '04/05/2025'
      );
    });
  });

  describe('formatDateDDMMYYYYHHMM', () => {
    it('returns original input for invalid date', () => {
      expect(dateUtils.formatDateDDMMYYYYHHMM('invalid')).toBe('invalid');
    });

    it('formats valid date in dd/mm/yyyy HH:mm WIB timezone', () => {
      expect(dateUtils.formatDateDDMMYYYYHHMM('2025-05-03T20:05:00Z')).toBe(
        '04/05/2025 03:05'
      );
    });

    it('handles missing formatToParts entries gracefully', () => {
      const originalDateTimeFormat = Intl.DateTimeFormat;
      jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
        () =>
          ({
            formatToParts: () => []
          }) as unknown as Intl.DateTimeFormat
      );

      expect(dateUtils.formatDateDDMMYYYYHHMM('2025-05-03T20:05:00Z')).toBe(
        '// :'
      );
      expect(Intl.DateTimeFormat).toBeDefined();
      jest.restoreAllMocks();
      expect(Intl.DateTimeFormat).toBe(originalDateTimeFormat);
    });
  });

  describe('formatDateMMMDYYYY', () => {
    it('returns original input for invalid date', () => {
      expect(dateUtils.formatDateMMMDYYYY('not-valid')).toBe('not-valid');
    });

    it('formats valid date in MMM d, yyyy WIB timezone', () => {
      expect(dateUtils.formatDateMMMDYYYY('2026-05-02T20:00:00Z')).toBe(
        'May 3, 2026'
      );
    });
  });

  describe('formatTime', () => {
    it('returns original input for invalid date', () => {
      expect(dateUtils.formatTime('bad-time')).toBe('bad-time');
    });

    it('formats valid date to HH:mm in WIB timezone', () => {
      const formatted = dateUtils.formatTime('2025-05-03T08:30:00Z');
      expect(formatted).toMatch(/^15[:.]30$/);
    });
  });

  describe('formatDateTimeWIB', () => {
    it('returns original input for invalid date', () => {
      expect(dateUtils.formatDateTimeWIB('bad-date')).toBe('bad-date');
    });

    it('formats valid date with WIB suffix', () => {
      const formatted = dateUtils.formatDateTimeWIB('2025-09-25T23:00:00Z');
      expect(formatted).toContain('Sep 26, 2025');
      expect(formatted).toContain('06:00');
      expect(formatted.endsWith(' WIB')).toBe(true);
    });
  });

  describe('extractTimezone', () => {
    it('returns +07:00 for empty string, Z suffix, or strings without offset', () => {
      expect(dateUtils.extractTimezone('')).toBe('+07:00');
      expect(dateUtils.extractTimezone('2025-05-03T10:00:00Z')).toBe('+07:00');
      expect(dateUtils.extractTimezone('2025-05-03 10:00:00')).toBe('+07:00');
    });

    it('extracts and normalizes explicit offsets', () => {
      expect(dateUtils.extractTimezone('2025-05-03T10:00:00+08:00')).toBe(
        '+08:00'
      );
      expect(dateUtils.extractTimezone('2025-05-03T10:00:00+0900')).toBe(
        '+09:00'
      );
      expect(dateUtils.extractTimezone('2025-05-03T10:00:00-05:30')).toBe(
        '-05:30'
      );
    });
  });

  describe('formatDateRange', () => {
    it('returns fallback string when either start or end date is invalid', () => {
      expect(
        dateUtils.formatDateRange('invalid-start', '2025-05-03T10:00:00Z')
      ).toBe('invalid-start - 2025-05-03T10:00:00Z');
      expect(
        dateUtils.formatDateRange('2025-05-03T10:00:00Z', 'invalid-end')
      ).toBe('2025-05-03T10:00:00Z - invalid-end');
    });

    it('formats range across different years', () => {
      const result = dateUtils.formatDateRange(
        '2025-12-31T10:00:00+07:00',
        '2026-01-02T14:30:00+07:00'
      );
      expect(result).toMatch(
        /^Dec 31, 2025 – Jan 2, 2026 10[:.]00–14[:.]30 WIB$/
      );
    });

    it('formats range within same year but different months', () => {
      const result = dateUtils.formatDateRange(
        '2025-05-30T09:00:00+07:00',
        '2025-06-02T17:15:00+07:00'
      );
      expect(result).toMatch(/^May 30 – Jun 2, 2025 09[:.]00–17[:.]15 WIB$/);
    });

    it('formats range within same month and year but different days', () => {
      const result = dateUtils.formatDateRange(
        '2025-05-03T08:00:00+07:00',
        '2025-05-05T18:00:00+07:00'
      );
      expect(result).toMatch(/^May 3–5, 2025 08[:.]00–18[:.]00 WIB$/);
    });

    it('formats range on the same day in WIB', () => {
      const result = dateUtils.formatDateRange(
        '2025-05-03T09:00:00+07:00',
        '2025-05-03T17:30:00+07:00'
      );
      expect(result).toMatch(/^May 3, 2025 09[:.]00–17[:.]30 WIB$/);
    });
  });

  describe('formatRupiah', () => {
    it('formats numeric and string amounts in IDR', () => {
      expect(dateUtils.formatRupiah(10000)).toMatch(/^Rp\s*10\.000$/);
      expect(dateUtils.formatRupiah('250000')).toMatch(/^Rp\s*250\.000$/);
      expect(dateUtils.formatRupiah(0)).toMatch(/^Rp\s*0$/);
    });
  });

  describe('formatCountdownTime', () => {
    it('formats seconds into MM:SS with zero padding', () => {
      expect(dateUtils.formatCountdownTime(0)).toBe('00:00');
      expect(dateUtils.formatCountdownTime(5)).toBe('00:05');
      expect(dateUtils.formatCountdownTime(65)).toBe('01:05');
      expect(dateUtils.formatCountdownTime(3600)).toBe('60:00');
    });
  });

  describe('formatDateFullIndo', () => {
    it('returns "-" for invalid dates', () => {
      expect(dateUtils.formatDateFullIndo('invalid-date')).toBe('-');
      expect(dateUtils.formatDateFullIndo(new Date('invalid'))).toBe('-');
    });

    it('formats valid date string and Date object in Indonesian long format', () => {
      expect(dateUtils.formatDateFullIndo('2025-12-10T10:00:00+07:00')).toBe(
        '10 Desember 2025'
      );
      expect(
        dateUtils.formatDateFullIndo(new Date('2025-01-05T20:00:00Z'))
      ).toBe('6 Januari 2025');
    });
  });
});
