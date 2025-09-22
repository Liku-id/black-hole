import { apiUtils } from './apiUtils';
import { dateUtils } from './dateUtils';
import { useDebouncedCallback } from './debounceUtils';
import { fileUtils } from './fileUtils';
import { formatUtils } from './formatUtils';
import { stringUtils } from './stringUtils';
import { validationUtils } from './validationUtils';

export type { ValidationErrors } from './validationUtils';
export {
  apiUtils,
  dateUtils,
  fileUtils,
  formatUtils,
  stringUtils,
  useDebouncedCallback,
  validationUtils
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
  clearExpiredSession,
  createConfig,
  handleAxiosError,
  makeRequest,
  get,
  post,
  put,
  delete: deleteRequest
} = apiUtils;

export const {
  convertFileToBase64,
  convertFileToDataURL,
  getFileExtension,
  getFileSize,
  isValidFileType,
  isValidFileSize,
  downloadFile
} = fileUtils;

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
  file: fileUtils,
  string: stringUtils,
  format: formatUtils,
  validation: validationUtils,
  api: apiUtils
};
