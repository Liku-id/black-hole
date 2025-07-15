/**
 * Validation utilities
 */

// Interface for validation errors
export interface ValidationErrors {
  [key: string]: string;
  email?: string;
  password?: string;
}

export const validationUtils = {
  /**
   * Validate email format
   * @param email - Email to validate
   * @returns True if valid email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate Indonesian phone number
   * @param phone - Phone number to validate
   * @returns True if valid phone format
   */
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  /**
   * Validate Indonesian NIK (16 digits)
   * @param nik - NIK to validate
   * @returns True if valid NIK format
   */
  isValidNIK: (nik: string): boolean => {
    const nikRegex = /^[0-9]{16}$/;
    return nikRegex.test(nik);
  },

  /**
   * Validate Indonesian NPWP (15 digits)
   * @param npwp - NPWP to validate
   * @returns True if valid NPWP format
   */
  isValidNPWP: (npwp: string): boolean => {
    const npwpRegex = /^[0-9]{15}$/;
    return npwpRegex.test(npwp.replace(/[.-]/g, ''));
  },

  /**
   * Validate URL format
   * @param url - URL to validate
   * @returns True if valid URL format
   */
  isValidURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Object with validation results
   */
  validatePassword: (password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } => {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Calculate strength
    if (errors.length === 0) {
      strength = 'strong';
    } else if (errors.length <= 2) {
      strength = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  },

  /**
   * Validate required field
   * @param value - Value to validate
   * @param fieldName - Name of the field for error message
   * @returns Validation result
   */
  validateRequired: (value: any, fieldName: string): {
    isValid: boolean;
    error?: string;
  } => {
    const isEmpty = value === null || value === undefined || value === '' || 
                   (typeof value === 'string' && value.trim() === '');
    
    return {
      isValid: !isEmpty,
      error: isEmpty ? `${fieldName} is required` : undefined
    };
  },

  /**
   * Validate minimum length
   * @param value - Value to validate
   * @param minLength - Minimum length required
   * @param fieldName - Name of the field for error message
   * @returns Validation result
   */
  validateMinLength: (value: string, minLength: number, fieldName: string): {
    isValid: boolean;
    error?: string;
  } => {
    const isValid = value && value.length >= minLength;
    
    return {
      isValid,
      error: !isValid ? `${fieldName} must be at least ${minLength} characters long` : undefined
    };
  },

  /**
   * Validate maximum length
   * @param value - Value to validate
   * @param maxLength - Maximum length allowed
   * @param fieldName - Name of the field for error message
   * @returns Validation result
   */
  validateMaxLength: (value: string, maxLength: number, fieldName: string): {
    isValid: boolean;
    error?: string;
  } => {
    const isValid = !value || value.length <= maxLength;
    
    return {
      isValid,
      error: !isValid ? `${fieldName} must be no more than ${maxLength} characters long` : undefined
    };
  },

  /**
   * Validate login form
   * @param email - Email to validate
   * @param password - Password to validate
   * @returns Validation errors object
   */
  validateLoginForm: (email: string, password: string): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validationUtils.isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    return errors;
  },

  /**
   * Check if form is valid (no errors)
   * @param errors - ValidationErrors object
   * @returns True if form is valid
   */
  isValidForm: (errors: ValidationErrors): boolean => {
    return Object.keys(errors).length === 0;
  }
};
