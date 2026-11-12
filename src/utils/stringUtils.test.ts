import { stringUtils } from './stringUtils';

describe('stringUtils', () => {
  describe('truncate', () => {
    it('returns empty string for empty or falsy input', () => {
      expect(stringUtils.truncate('')).toBe('');
      expect(stringUtils.truncate(null as unknown as string)).toBe('');
      expect(stringUtils.truncate(undefined as unknown as string)).toBe('');
    });

    it('returns text unchanged when length is less than or equal to maxLength', () => {
      expect(stringUtils.truncate('Hello World')).toBe('Hello World');
      expect(stringUtils.truncate('Hello', 5)).toBe('Hello');
      expect(stringUtils.truncate('a'.repeat(50))).toBe('a'.repeat(50));
    });

    it('truncates text and appends ellipsis when length exceeds maxLength', () => {
      expect(stringUtils.truncate('a'.repeat(55))).toBe(`${'a'.repeat(50)}...`);
      expect(stringUtils.truncate('Hello World!', 5)).toBe('Hello...');
    });
  });

  describe('capitalizeWords', () => {
    it('returns empty string for empty or falsy input', () => {
      expect(stringUtils.capitalizeWords('')).toBe('');
      expect(stringUtils.capitalizeWords(null as unknown as string)).toBe('');
    });

    it('capitalizes first letter of each word', () => {
      expect(stringUtils.capitalizeWords('hello world')).toBe('Hello World');
      expect(stringUtils.capitalizeWords('hello-world test')).toBe(
        'Hello-World Test'
      );
    });
  });

  describe('toTitleCase', () => {
    it('returns empty string for empty or falsy input', () => {
      expect(stringUtils.toTitleCase('')).toBe('');
      expect(stringUtils.toTitleCase(undefined as unknown as string)).toBe('');
    });

    it('lowercases all letters then capitalizes each word', () => {
      expect(stringUtils.toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(stringUtils.toTitleCase('jAvAsCrIpT uTiLs')).toBe(
        'Javascript Utils'
      );
    });
  });

  describe('camelToHuman', () => {
    it('returns empty string for empty or falsy input', () => {
      expect(stringUtils.camelToHuman('')).toBe('');
      expect(stringUtils.camelToHuman(null as unknown as string)).toBe('');
    });

    it('converts camelCase and PascalCase strings to spaced capitalized text', () => {
      expect(stringUtils.camelToHuman('camelCaseText')).toBe('Camel Case Text');
      expect(stringUtils.camelToHuman('PascalCaseText')).toBe(
        'Pascal Case Text'
      );
      expect(stringUtils.camelToHuman('simple')).toBe('Simple');
    });
  });

  describe('getInitials', () => {
    it('returns empty string for empty, falsy, or whitespace-only input', () => {
      expect(stringUtils.getInitials('')).toBe('');
      expect(stringUtils.getInitials(null as unknown as string)).toBe('');
      expect(stringUtils.getInitials('   ')).toBe('');
    });

    it('returns single uppercase initial for single-word names', () => {
      expect(stringUtils.getInitials('john')).toBe('J');
      expect(stringUtils.getInitials('  alice  ')).toBe('A');
    });

    it('returns first and last initials for multi-word names', () => {
      expect(stringUtils.getInitials('john doe')).toBe('JD');
      expect(stringUtils.getInitials('  john middle doe  ')).toBe('JD');
    });
  });

  describe('formatPhoneNumber', () => {
    it('returns empty string for empty or falsy input', () => {
      expect(stringUtils.formatPhoneNumber('')).toBe('');
      expect(
        stringUtils.formatPhoneNumber(undefined as unknown as string)
      ).toBe('');
    });

    it('formats Indonesian numbers starting with 62', () => {
      expect(stringUtils.formatPhoneNumber('628123456789')).toBe(
        '+62 812 3456 789'
      );
      expect(stringUtils.formatPhoneNumber('+62 812-3456-7890')).toBe(
        '+62 812 3456 7890'
      );
    });

    it('formats 10-digit numbers not starting with 62', () => {
      expect(stringUtils.formatPhoneNumber('0812345678')).toBe('081-234-5678');
      expect(stringUtils.formatPhoneNumber('(021) 555-1234')).toBe(
        '021-555-1234'
      );
    });

    it('returns original input when no formatting pattern matches', () => {
      expect(stringUtils.formatPhoneNumber('081234567890')).toBe(
        '081234567890'
      );
      expect(stringUtils.formatPhoneNumber('12345')).toBe('12345');
    });
  });

  describe('formatNpwpNumber', () => {
    it('returns empty string for empty or non-digit-only input', () => {
      expect(stringUtils.formatNpwpNumber('')).toBe('');
      expect(stringUtils.formatNpwpNumber(null as unknown as string)).toBe('');
      expect(stringUtils.formatNpwpNumber('---...')).toBe('');
    });

    it('progressively masks NPWP digits up to 15 digits', () => {
      expect(stringUtils.formatNpwpNumber('12')).toBe('12');
      expect(stringUtils.formatNpwpNumber('12345')).toBe('12.345');
      expect(stringUtils.formatNpwpNumber('12345678')).toBe('12.345.678');
      expect(stringUtils.formatNpwpNumber('123456789')).toBe('12.345.678.9');
      expect(stringUtils.formatNpwpNumber('123456789012')).toBe(
        '12.345.678.9-012'
      );
      expect(stringUtils.formatNpwpNumber('123456789012345')).toBe(
        '12.345.678.9-012.345'
      );
      expect(stringUtils.formatNpwpNumber('12.345.678.9-012.34567')).toBe(
        '12.345.678.9-012.345'
      );
    });
  });

  describe('cleanNpwpNumber', () => {
    it('returns empty string for falsy input and strips non-digits otherwise', () => {
      expect(stringUtils.cleanNpwpNumber('')).toBe('');
      expect(stringUtils.cleanNpwpNumber(undefined as unknown as string)).toBe(
        ''
      );
      expect(stringUtils.cleanNpwpNumber('12.345.678.9-012.345')).toBe(
        '123456789012345'
      );
    });
  });

  describe('isEmpty', () => {
    it('returns true for null, undefined, empty, and whitespace-only strings', () => {
      expect(stringUtils.isEmpty('')).toBe(true);
      expect(stringUtils.isEmpty('   \t\n  ')).toBe(true);
      expect(stringUtils.isEmpty(null as unknown as string)).toBe(true);
      expect(stringUtils.isEmpty(undefined as unknown as string)).toBe(true);
    });

    it('returns false for non-empty text', () => {
      expect(stringUtils.isEmpty('hello')).toBe(false);
      expect(stringUtils.isEmpty('  a  ')).toBe(false);
    });
  });

  describe('toSlug', () => {
    it('returns empty string for empty or falsy input', () => {
      expect(stringUtils.toSlug('')).toBe('');
      expect(stringUtils.toSlug(null as unknown as string)).toBe('');
    });

    it('generates URL-friendly slug', () => {
      expect(stringUtils.toSlug('Hello World!')).toBe('hello-world');
      expect(stringUtils.toSlug('Event   Name --- 2025 @ Jakarta')).toBe(
        'event-name-2025-jakarta'
      );
    });
  });

  describe('mask', () => {
    it('returns null for null, undefined, empty, whitespace, or non-string input', () => {
      expect(stringUtils.mask(null)).toBeNull();
      expect(stringUtils.mask(undefined)).toBeNull();
      expect(stringUtils.mask('')).toBeNull();
      expect(stringUtils.mask('   ')).toBeNull();
      expect(stringUtils.mask(12345 as unknown as string)).toBeNull();
    });

    it('returns original value when length is less than or equal to minLength', () => {
      expect(stringUtils.mask('abcd')).toBe('abcd');
      expect(stringUtils.mask('abcdef', { minLength: 6 })).toBe('abcdef');
    });

    it('masks all except last N characters when visibleLastChars is provided', () => {
      expect(stringUtils.mask('1234567890', { visibleLastChars: 4 })).toBe(
        '****7890'
      );
      expect(
        stringUtils.mask('1234567890', { visibleLastChars: 3, maskChar: '#' })
      ).toBe('####890');
    });

    it('masks characters after visibleFirstChars by default', () => {
      expect(stringUtils.mask('12345')).toBe('12345***');
      expect(stringUtils.mask('123456789012')).toBe('12345678****');
      expect(
        stringUtils.mask('abcdefgh', { visibleFirstChars: 3, maskChar: '#' })
      ).toBe('abc#####');
    });
  });

  describe('unmask', () => {
    it('returns originalValue when provided', () => {
      expect(stringUtils.unmask('****7890', '1234567890')).toBe('1234567890');
      expect(stringUtils.unmask(null, 'original')).toBe('original');
    });

    it('returns null when originalValue is absent and maskedValue is invalid', () => {
      expect(stringUtils.unmask(null)).toBeNull();
      expect(stringUtils.unmask(undefined, null)).toBeNull();
      expect(stringUtils.unmask('', '')).toBeNull();
      expect(stringUtils.unmask(123 as unknown as string)).toBeNull();
    });

    it('returns maskedValue when originalValue is absent and maskedValue is valid string', () => {
      expect(stringUtils.unmask('****7890')).toBe('****7890');
      expect(stringUtils.unmask('****7890', null)).toBe('****7890');
    });
  });
});
