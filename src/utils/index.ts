import { apiUtils } from './apiUtils';
import { dateUtils } from './dateUtils';
import { formatUtils } from './formatUtils';
import { stringUtils } from './stringUtils';
import { validationUtils } from './validationUtils';

export type { ValidationErrors } from './validationUtils';
export { apiUtils, dateUtils, formatUtils, stringUtils, validationUtils };

// Re-export commonly used utilities for easier access
export const {
  formatDate,
  formatTime,
  formatDateTime,
  formatFullDateTime,
  formatRelativeTime,
  formatForAPI
} = dateUtils;

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
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatBankAccount,
  formatIDNumber,
  formatStatus
} = formatUtils;

export const {
  buildQueryString,
  handleResponse,
  makeRequest,
  get,
  post,
  put,
  delete: deleteRequest,
  uploadFile,
  downloadFile,
  retry
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
