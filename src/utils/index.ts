import { apiUtils } from './apiUtils';
import { dateUtils } from './dateUtils';
import { useDebouncedCallback } from './debounceUtils';
import { formatUtils } from './formatUtils';
import { stringUtils } from './stringUtils';
import { validationUtils } from './validationUtils';

export type { ValidationErrors } from './validationUtils';
export {
  apiUtils,
  dateUtils,
  formatUtils,
  stringUtils,
  validationUtils,
  useDebouncedCallback
};

// Re-export commonly used utilities for easier access
export const { formatDateDDMMYYYY } = dateUtils;

export const {
  truncate,
  capitalizeWords,
  toTitleCase,
  camelToHuman,
  getInitials,
  formatPhoneNumber,
  isEmpty,
  toSlug
} = stringUtils;

export const {
  formatPrice,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatBankAccount,
  formatIDNumber,
  formatStatus
} = formatUtils;

export const {
  getAuthToken,
  createConfig,
  handleAxiosError,
  makeRequest,
  get,
  post,
  put,
  delete: deleteRequest
} = apiUtils;

export const {
  isValidEmail,
  isValidPhoneNumber,
  isValidNIK,
  isValidNPWP,
  isValidURL,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateLoginForm,
  isValidForm
} = validationUtils;

// Common utility functions
export const utils = {
  date: dateUtils,
  string: stringUtils,
  format: formatUtils,
  validation: validationUtils,
  api: apiUtils
};
