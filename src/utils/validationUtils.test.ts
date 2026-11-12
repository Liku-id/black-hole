import { validationUtils, ValidationErrors } from './validationUtils';

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(validationUtils.isValidEmail('user@example.com')).toBe(true);
      expect(
        validationUtils.isValidEmail('first.last+tag@sub.domain.co.id')
      ).toBe(true);
    });

    it('returns false for invalid email addresses', () => {
      expect(validationUtils.isValidEmail('')).toBe(false);
      expect(validationUtils.isValidEmail('plainaddress')).toBe(false);
      expect(validationUtils.isValidEmail('@example.com')).toBe(false);
      expect(validationUtils.isValidEmail('user@')).toBe(false);
      expect(validationUtils.isValidEmail('user@domain')).toBe(false);
      expect(validationUtils.isValidEmail('user name@example.com')).toBe(false);
      expect(validationUtils.isValidEmail('user@exa mple.com')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('returns true for valid Indonesian phone numbers with 0, 62, or +62', () => {
      expect(validationUtils.isValidPhoneNumber('08123456789')).toBe(true);
      expect(validationUtils.isValidPhoneNumber('628123456789')).toBe(true);
      expect(validationUtils.isValidPhoneNumber('+628123456789')).toBe(true);
      expect(validationUtils.isValidPhoneNumber('+62 812 3456 7890')).toBe(
        true
      );
      expect(validationUtils.isValidPhoneNumber('081234567')).toBe(true);
      expect(validationUtils.isValidPhoneNumber('08123456789012')).toBe(true);
    });

    it('returns false for invalid Indonesian phone numbers', () => {
      expect(validationUtils.isValidPhoneNumber('')).toBe(false);
      expect(validationUtils.isValidPhoneNumber('0801234567')).toBe(false);
      expect(validationUtils.isValidPhoneNumber('08123456')).toBe(false);
      expect(validationUtils.isValidPhoneNumber('081234567890123')).toBe(false);
      expect(validationUtils.isValidPhoneNumber('07123456789')).toBe(false);
      expect(validationUtils.isValidPhoneNumber('0812-3456-7890')).toBe(false);
      expect(validationUtils.isValidPhoneNumber('abc')).toBe(false);
    });
  });

  describe('isValidNIK', () => {
    it('returns true for 16-digit NIK', () => {
      expect(validationUtils.isValidNIK('3201012345678901')).toBe(true);
    });

    it('returns false for non-16-digit or non-numeric NIK', () => {
      expect(validationUtils.isValidNIK('')).toBe(false);
      expect(validationUtils.isValidNIK('123456789012345')).toBe(false);
      expect(validationUtils.isValidNIK('12345678901234567')).toBe(false);
      expect(validationUtils.isValidNIK('123456789012345a')).toBe(false);
    });
  });

  describe('isValidNPWP', () => {
    it('returns true for 15-digit NPWP with or without dots and hyphens', () => {
      expect(validationUtils.isValidNPWP('123456789012345')).toBe(true);
      expect(validationUtils.isValidNPWP('12.345.678.9-012.345')).toBe(true);
    });

    it('returns false for invalid NPWP', () => {
      expect(validationUtils.isValidNPWP('')).toBe(false);
      expect(validationUtils.isValidNPWP('12345678901234')).toBe(false);
      expect(validationUtils.isValidNPWP('1234567890123456')).toBe(false);
      expect(validationUtils.isValidNPWP('12.345.678.9-012.34a')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('returns true for valid URLs', () => {
      expect(validationUtils.isValidURL('https://example.com')).toBe(true);
      expect(
        validationUtils.isValidURL('http://localhost:3000/events?page=1')
      ).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(validationUtils.isValidURL('')).toBe(false);
      expect(validationUtils.isValidURL('not-a-url')).toBe(false);
      expect(validationUtils.isValidURL('example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns strong and valid when all criteria are satisfied', () => {
      const result = validationUtils.validatePassword('Str0ng!Pass');
      expect(result).toEqual({
        isValid: true,
        errors: [],
        strength: 'strong'
      });
    });

    it('returns medium strength when 1 or 2 criteria are missing', () => {
      const missingSpecial = validationUtils.validatePassword('Strong12');
      expect(missingSpecial).toEqual({
        isValid: false,
        errors: ['Password must contain at least one special character'],
        strength: 'medium'
      });

      const missingNumberAndSpecial =
        validationUtils.validatePassword('StrongPass');
      expect(missingNumberAndSpecial).toEqual({
        isValid: false,
        errors: [
          'Password must contain at least one number',
          'Password must contain at least one special character'
        ],
        strength: 'medium'
      });
    });

    it('returns weak strength and collects all applicable errors', () => {
      expect(validationUtils.validatePassword('')).toEqual({
        isValid: false,
        errors: [
          'Password must be at least 8 characters long',
          'Password must contain at least one lowercase letter',
          'Password must contain at least one uppercase letter',
          'Password must contain at least one number',
          'Password must contain at least one special character'
        ],
        strength: 'weak'
      });

      expect(validationUtils.validatePassword('12345678')).toEqual({
        isValid: false,
        errors: [
          'Password must contain at least one lowercase letter',
          'Password must contain at least one uppercase letter',
          'Password must contain at least one special character'
        ],
        strength: 'weak'
      });
    });
  });

  describe('validateRequired', () => {
    it('returns invalid for null, undefined, empty string, and whitespace-only string', () => {
      expect(validationUtils.validateRequired(null, 'Email')).toEqual({
        isValid: false,
        error: 'Email is required'
      });
      expect(validationUtils.validateRequired(undefined, 'Email')).toEqual({
        isValid: false,
        error: 'Email is required'
      });
      expect(validationUtils.validateRequired('', 'Email')).toEqual({
        isValid: false,
        error: 'Email is required'
      });
      expect(validationUtils.validateRequired('   ', 'Email')).toEqual({
        isValid: false,
        error: 'Email is required'
      });
    });

    it('returns valid for non-empty strings and non-string values', () => {
      expect(validationUtils.validateRequired('hello', 'Name')).toEqual({
        isValid: true,
        error: undefined
      });
      expect(validationUtils.validateRequired(0, 'Count')).toEqual({
        isValid: true,
        error: undefined
      });
      expect(validationUtils.validateRequired(false, 'Flag')).toEqual({
        isValid: true,
        error: undefined
      });
    });
  });

  describe('validateMinLength', () => {
    it('returns error when value is empty or shorter than minLength', () => {
      const emptyResult = validationUtils.validateMinLength('', 5, 'Username');
      expect(emptyResult.isValid).toBeFalsy();
      expect(emptyResult.error).toBe(
        'Username must be at least 5 characters long'
      );

      expect(validationUtils.validateMinLength('abc', 5, 'Username')).toEqual({
        isValid: false,
        error: 'Username must be at least 5 characters long'
      });
    });

    it('returns valid when value meets or exceeds minLength', () => {
      expect(validationUtils.validateMinLength('abcde', 5, 'Username')).toEqual(
        {
          isValid: true,
          error: undefined
        }
      );
      expect(
        validationUtils.validateMinLength('abcdef', 5, 'Username')
      ).toEqual({
        isValid: true,
        error: undefined
      });
    });
  });

  describe('validateMaxLength', () => {
    it('returns valid when value is empty or within maxLength', () => {
      expect(validationUtils.validateMaxLength('', 5, 'Bio')).toEqual({
        isValid: true,
        error: undefined
      });
      expect(
        validationUtils.validateMaxLength(null as unknown as string, 5, 'Bio')
      ).toEqual({
        isValid: true,
        error: undefined
      });
      expect(validationUtils.validateMaxLength('abcde', 5, 'Bio')).toEqual({
        isValid: true,
        error: undefined
      });
    });

    it('returns error when value exceeds maxLength', () => {
      expect(validationUtils.validateMaxLength('abcdef', 5, 'Bio')).toEqual({
        isValid: false,
        error: 'Bio must be no more than 5 characters long'
      });
    });
  });

  describe('validateLoginForm', () => {
    it('returns required errors when email and password are empty', () => {
      expect(validationUtils.validateLoginForm('', '')).toEqual({
        email: 'Email is required',
        password: 'Password is required'
      });
    });

    it('returns format and length errors for invalid email and short password', () => {
      expect(
        validationUtils.validateLoginForm('invalid-email', '12345')
      ).toEqual({
        email: 'Please enter a valid email address',
        password: 'Password must be at least 6 characters long'
      });
    });

    it('returns empty errors object when email and password are valid', () => {
      expect(
        validationUtils.validateLoginForm('user@example.com', '123456')
      ).toEqual({});
    });
  });

  describe('isValidForm', () => {
    it('returns true when errors object is empty and false otherwise', () => {
      const emptyErrors: ValidationErrors = {};
      expect(validationUtils.isValidForm(emptyErrors)).toBe(true);
      expect(validationUtils.isValidForm({ email: 'Email is required' })).toBe(
        false
      );
    });
  });

  describe('emailValidator', () => {
    it('returns undefined when empty or valid email', () => {
      expect(validationUtils.emailValidator('')).toBeUndefined();
      expect(
        validationUtils.emailValidator('user@example.com')
      ).toBeUndefined();
    });

    it('returns error message for invalid email', () => {
      expect(validationUtils.emailValidator('bad-email')).toBe(
        'Invalid email format'
      );
    });
  });

  describe('passwordValidator', () => {
    it('returns undefined when empty', () => {
      expect(validationUtils.passwordValidator('')).toBeUndefined();
    });

    it('validates length between 8 and 20 characters', () => {
      expect(validationUtils.passwordValidator('Ab!1234')).toBe(
        'Password must be 8-20 characters'
      );
      expect(validationUtils.passwordValidator(`Ab!${'a'.repeat(18)}`)).toBe(
        'Password must be 8-20 characters'
      );
    });

    it('requires uppercase, lowercase, and symbol characters', () => {
      expect(validationUtils.passwordValidator('abcdefgh!')).toBe(
        'Password must contain at least 1 uppercase letter'
      );
      expect(validationUtils.passwordValidator('ABCDEFGH!')).toBe(
        'Password must contain at least 1 lowercase letter'
      );
      expect(validationUtils.passwordValidator('Abcdefgh1')).toBe(
        'Password must contain at least 1 symbol'
      );
    });

    it('returns undefined for valid password', () => {
      expect(validationUtils.passwordValidator('Abcdefg!')).toBeUndefined();
      expect(
        validationUtils.passwordValidator('ValidPass123@')
      ).toBeUndefined();
    });
  });

  describe('organizerNameValidator', () => {
    it('returns undefined when empty or contains only letters and spaces', () => {
      expect(validationUtils.organizerNameValidator('')).toBeUndefined();
      expect(
        validationUtils.organizerNameValidator('Liku Event Organizer')
      ).toBeUndefined();
    });

    it('returns error when containing digits or special characters', () => {
      expect(validationUtils.organizerNameValidator('Event 123')).toBe(
        'Organizer name can only contain letters and spaces'
      );
      expect(validationUtils.organizerNameValidator('Event@Org')).toBe(
        'Organizer name can only contain letters and spaces'
      );
    });
  });

  describe('phoneNumberValidator', () => {
    it('returns undefined when empty', () => {
      expect(validationUtils.phoneNumberValidator('')).toBeUndefined();
    });

    it('validates 10-14 digits requirement', () => {
      expect(validationUtils.phoneNumberValidator('812345678')).toBe(
        'Phone number must be 10-14 digits'
      );
      expect(validationUtils.phoneNumberValidator('812345678901234')).toBe(
        'Phone number must be 10-14 digits'
      );
    });

    it('rejects numbers starting with 0', () => {
      expect(validationUtils.phoneNumberValidator('08123456789')).toBe(
        'Phone number cannot start with 0'
      );
    });

    it('returns undefined for valid 10-14 digit numbers not starting with 0', () => {
      expect(
        validationUtils.phoneNumberValidator('+62 812-3456-7890')
      ).toBeUndefined();
      expect(
        validationUtils.phoneNumberValidator('8123456789')
      ).toBeUndefined();
    });
  });

  describe('confirmPasswordValidator', () => {
    it('returns undefined when empty or matching password', () => {
      expect(
        validationUtils.confirmPasswordValidator('', 'Secret123!')
      ).toBeUndefined();
      expect(
        validationUtils.confirmPasswordValidator('Secret123!', 'Secret123!')
      ).toBeUndefined();
    });

    it('returns error message when passwords do not match', () => {
      expect(
        validationUtils.confirmPasswordValidator('Different1!', 'Secret123!')
      ).toBe('Password do not match');
    });
  });
});
