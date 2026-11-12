import { formatUtils } from './formatUtils';

describe('formatUtils', () => {
  describe('formatPrice', () => {
    it('formats numeric and string prices with default IDR currency', () => {
      expect(formatUtils.formatPrice(10000)).toMatch(/^Rp\s*10\.000$/);
      expect(formatUtils.formatPrice('250000')).toMatch(/^Rp\s*250\.000$/);
      expect(formatUtils.formatPrice(0)).toMatch(/^Rp\s*0$/);
    });

    it('formats prices with custom currency', () => {
      expect(formatUtils.formatPrice(1500, 'USD')).toMatch(/US\$\s*1\.500/);
    });

    it('returns empty string for invalid or non-finite values', () => {
      expect(formatUtils.formatPrice('invalid')).toBe('');
      expect(formatUtils.formatPrice('')).toBe('');
      expect(formatUtils.formatPrice(NaN)).toBe('');
      expect(formatUtils.formatPrice(Infinity)).toBe('');
      expect(formatUtils.formatPrice(-Infinity)).toBe('');
      expect(formatUtils.formatPrice(null as unknown as number)).toBe('');
      expect(formatUtils.formatPrice(undefined as unknown as number)).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('formats valid amounts in default IDR and custom currency', () => {
      expect(formatUtils.formatCurrency(50000)).toMatch(/^Rp\s*50\.000$/);
      expect(formatUtils.formatCurrency(0)).toMatch(/^Rp\s*0$/);
      expect(formatUtils.formatCurrency(2000, 'USD')).toMatch(/US\$\s*2\.000/);
    });

    it('returns empty string for non-number or non-finite inputs', () => {
      expect(formatUtils.formatCurrency(NaN)).toBe('');
      expect(formatUtils.formatCurrency(Infinity)).toBe('');
      expect(formatUtils.formatCurrency('1000' as unknown as number)).toBe('');
      expect(formatUtils.formatCurrency(null as unknown as number)).toBe('');
      expect(formatUtils.formatCurrency(undefined as unknown as number)).toBe(
        ''
      );
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with Indonesian thousand separators', () => {
      expect(formatUtils.formatNumber(0)).toBe('0');
      expect(formatUtils.formatNumber(1000)).toBe('1.000');
      expect(formatUtils.formatNumber(1234567)).toBe('1.234.567');
    });

    it('returns empty string for non-number or non-finite values', () => {
      expect(formatUtils.formatNumber(NaN)).toBe('');
      expect(formatUtils.formatNumber(Infinity)).toBe('');
      expect(formatUtils.formatNumber('1000' as unknown as number)).toBe('');
      expect(formatUtils.formatNumber(undefined as unknown as number)).toBe('');
    });
  });

  describe('formatPercentage', () => {
    it('formats decimal value to percentage with default and custom decimals', () => {
      expect(formatUtils.formatPercentage(0.256)).toBe('25.6%');
      expect(formatUtils.formatPercentage(0.256, 2)).toBe('25.60%');
      expect(formatUtils.formatPercentage(0.5, 0)).toBe('50%');
      expect(formatUtils.formatPercentage(0)).toBe('0.0%');
    });

    it('returns empty string for invalid values', () => {
      expect(formatUtils.formatPercentage(NaN)).toBe('');
      expect(formatUtils.formatPercentage(Infinity)).toBe('');
      expect(formatUtils.formatPercentage('0.5' as unknown as number)).toBe('');
      expect(formatUtils.formatPercentage(null as unknown as number)).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('formats byte sizes across B, KB, MB, GB, and TB', () => {
      expect(formatUtils.formatFileSize(0)).toBe('0.0 B');
      expect(formatUtils.formatFileSize(512)).toBe('512.0 B');
      expect(formatUtils.formatFileSize(1024)).toBe('1.0 KB');
      expect(formatUtils.formatFileSize(1536)).toBe('1.5 KB');
      expect(formatUtils.formatFileSize(1024 ** 2)).toBe('1.0 MB');
      expect(formatUtils.formatFileSize(1024 ** 3)).toBe('1.0 GB');
      expect(formatUtils.formatFileSize(1024 ** 4)).toBe('1.0 TB');
      expect(formatUtils.formatFileSize(1024 ** 5)).toBe('1024.0 TB');
    });

    it('returns empty string for invalid values', () => {
      expect(formatUtils.formatFileSize(NaN)).toBe('');
      expect(formatUtils.formatFileSize(Infinity)).toBe('');
      expect(formatUtils.formatFileSize('1024' as unknown as number)).toBe('');
      expect(formatUtils.formatFileSize(undefined as unknown as number)).toBe(
        ''
      );
    });
  });

  describe('formatBankAccount', () => {
    it('returns empty string when input is empty or falsy', () => {
      expect(formatUtils.formatBankAccount('')).toBe('');
      expect(formatUtils.formatBankAccount(null as unknown as string)).toBe('');
      expect(
        formatUtils.formatBankAccount(undefined as unknown as string)
      ).toBe('');
    });

    it('returns account number unchanged when length is 4 or less', () => {
      expect(formatUtils.formatBankAccount('123')).toBe('123');
      expect(formatUtils.formatBankAccount('1234')).toBe('1234');
    });

    it('masks middle digits keeping first 2 and last 2 characters', () => {
      expect(formatUtils.formatBankAccount('1234567890')).toBe('12******90');
      expect(formatUtils.formatBankAccount('12345')).toBe('12*45');
    });
  });

  describe('formatIDNumber', () => {
    it('returns empty string when input is empty or falsy', () => {
      expect(formatUtils.formatIDNumber('')).toBe('');
      expect(formatUtils.formatIDNumber(null as unknown as string)).toBe('');
      expect(formatUtils.formatIDNumber(undefined as unknown as string)).toBe(
        ''
      );
    });

    it('returns ID number unchanged when length is 6 or less', () => {
      expect(formatUtils.formatIDNumber('12345')).toBe('12345');
      expect(formatUtils.formatIDNumber('123456')).toBe('123456');
    });

    it('masks middle digits keeping first 3 and last 3 characters', () => {
      expect(formatUtils.formatIDNumber('1234567890123456')).toBe(
        '123**********456'
      );
      expect(formatUtils.formatIDNumber('1234567')).toBe('123*567');
    });
  });

  describe('formatStatus', () => {
    it('returns empty string for falsy status', () => {
      expect(formatUtils.formatStatus('')).toBe('');
      expect(formatUtils.formatStatus(null as unknown as string)).toBe('');
    });

    it('maps known statuses case-insensitively', () => {
      expect(formatUtils.formatStatus('active')).toBe('Active');
      expect(formatUtils.formatStatus('ACTIVE')).toBe('Active');
      expect(formatUtils.formatStatus('inactive')).toBe('Inactive');
      expect(formatUtils.formatStatus('pending')).toBe('Pending');
      expect(formatUtils.formatStatus('approved')).toBe('Approved');
      expect(formatUtils.formatStatus('rejected')).toBe('Rejected');
      expect(formatUtils.formatStatus('completed')).toBe('Completed');
      expect(formatUtils.formatStatus('cancelled')).toBe('Cancelled');
      expect(formatUtils.formatStatus('draft')).toBe('Draft');
    });

    it('returns original status when unmapped', () => {
      expect(formatUtils.formatStatus('custom_status')).toBe('custom_status');
    });
  });

  describe('formatRoleName', () => {
    it('returns empty string for falsy role', () => {
      expect(formatUtils.formatRoleName('')).toBe('');
      expect(formatUtils.formatRoleName(undefined as unknown as string)).toBe(
        ''
      );
    });

    it('replaces underscores and capitalizes each word', () => {
      expect(formatUtils.formatRoleName('event_organizer')).toBe(
        'Event Organizer'
      );
      expect(formatUtils.formatRoleName('super_admin')).toBe('Super Admin');
      expect(formatUtils.formatRoleName('staff')).toBe('Staff');
    });
  });

  describe('formatLargeNumber', () => {
    it('returns "0" for non-number or non-finite inputs', () => {
      expect(formatUtils.formatLargeNumber(NaN)).toBe('0');
      expect(formatUtils.formatLargeNumber(Infinity)).toBe('0');
      expect(formatUtils.formatLargeNumber('1000' as unknown as number)).toBe(
        '0'
      );
      expect(formatUtils.formatLargeNumber(null as unknown as number)).toBe(
        '0'
      );
    });

    it('formats numbers with B, M, K suffixes or plain string', () => {
      expect(formatUtils.formatLargeNumber(1500000000)).toBe('1.5B');
      expect(formatUtils.formatLargeNumber(1000000000)).toBe('1.0B');
      expect(formatUtils.formatLargeNumber(2500000)).toBe('2.5M');
      expect(formatUtils.formatLargeNumber(1000000)).toBe('1.0M');
      expect(formatUtils.formatLargeNumber(1500)).toBe('1.5K');
      expect(formatUtils.formatLargeNumber(1000)).toBe('1.0K');
      expect(formatUtils.formatLargeNumber(999)).toBe('999');
      expect(formatUtils.formatLargeNumber(0)).toBe('0');
    });
  });

  describe('formatAbbreviatedCurrency', () => {
    it('returns "Rp 0" for invalid inputs', () => {
      expect(formatUtils.formatAbbreviatedCurrency(NaN)).toBe('Rp 0');
      expect(formatUtils.formatAbbreviatedCurrency(Infinity)).toBe('Rp 0');
      expect(
        formatUtils.formatAbbreviatedCurrency('1000' as unknown as number)
      ).toBe('Rp 0');
      expect(
        formatUtils.formatAbbreviatedCurrency(undefined as unknown as number)
      ).toBe('Rp 0');
    });

    it('formats amounts with Rp prefix and B, M, K or formatted number', () => {
      expect(formatUtils.formatAbbreviatedCurrency(1500000000)).toBe('Rp 1.5B');
      expect(formatUtils.formatAbbreviatedCurrency(2500000)).toBe('Rp 2.5M');
      expect(formatUtils.formatAbbreviatedCurrency(1500)).toBe('Rp 1.5K');
      expect(formatUtils.formatAbbreviatedCurrency(500)).toBe('Rp 500');
      expect(formatUtils.formatAbbreviatedCurrency(0)).toBe('Rp 0');
    });
  });

  describe('formatEventRevenue', () => {
    it('returns "Rp 0" for invalid inputs', () => {
      expect(formatUtils.formatEventRevenue(NaN)).toBe('Rp 0');
      expect(formatUtils.formatEventRevenue(Infinity)).toBe('Rp 0');
      expect(formatUtils.formatEventRevenue('500' as unknown as number)).toBe(
        'Rp 0'
      );
      expect(formatUtils.formatEventRevenue(null as unknown as number)).toBe(
        'Rp 0'
      );
    });

    it('formats billions with 0 decimals when >= 10B and 1 decimal when < 10B', () => {
      expect(formatUtils.formatEventRevenue(15000000000)).toBe('Rp 15B');
      expect(formatUtils.formatEventRevenue(10000000000)).toBe('Rp 10B');
      expect(formatUtils.formatEventRevenue(2500000000)).toBe('Rp 2.5B');
    });

    it('formats millions with 0 decimals when >= 10M and 1 decimal when < 10M', () => {
      expect(formatUtils.formatEventRevenue(15000000)).toBe('Rp 15M');
      expect(formatUtils.formatEventRevenue(10000000)).toBe('Rp 10M');
      expect(formatUtils.formatEventRevenue(2500000)).toBe('Rp 2.5M');
    });

    it('formats amounts under 1M using regular thousand formatting', () => {
      expect(formatUtils.formatEventRevenue(500000)).toBe('Rp 500.000');
      expect(formatUtils.formatEventRevenue(750)).toBe('Rp 750');
      expect(formatUtils.formatEventRevenue(0)).toBe('Rp 0');
    });
  });

  describe('getFullRevenueAmount', () => {
    it('returns "Rp 0" for invalid inputs', () => {
      expect(formatUtils.getFullRevenueAmount(NaN)).toBe('Rp 0');
      expect(formatUtils.getFullRevenueAmount(Infinity)).toBe('Rp 0');
      expect(
        formatUtils.getFullRevenueAmount('1000' as unknown as number)
      ).toBe('Rp 0');
      expect(
        formatUtils.getFullRevenueAmount(undefined as unknown as number)
      ).toBe('Rp 0');
    });

    it('returns full formatted IDR string without abbreviation', () => {
      expect(formatUtils.getFullRevenueAmount(1500000)).toBe('Rp 1.500.000');
      expect(formatUtils.getFullRevenueAmount(0)).toBe('Rp 0');
    });
  });
});
