/**
 * File utilities for handling file operations
 */

/**
 * Convert a File object to base64 string
 * @param file - File object to convert
 * @returns Promise that resolves to base64 string
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert a File object to base64 string with data URL prefix
 * @param file - File object to convert
 * @returns Promise that resolves to base64 data URL string
 */
export const convertFileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get file extension from filename
 * @param filename - Name of the file
 * @returns File extension (without dot)
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get file size in human readable format
 * @param bytes - File size in bytes
 * @returns Human readable file size
 */
export const getFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type
 * @param file - File object to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is allowed
 */
export const isValidFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param file - File object to validate
 * @param maxSizeInMB - Maximum file size in MB
 * @returns True if file size is within limit
 */
export const isValidFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Create a download link for a file
 * @param data - File data (base64 or blob)
 * @param filename - Name for the downloaded file
 * @param mimeType - MIME type of the file
 */
export const downloadFile = (
  data: string | Blob,
  filename: string,
  mimeType: string = 'application/octet-stream'
): void => {
  const blob =
    typeof data === 'string' ? new Blob([data], { type: mimeType }) : data;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * File utilities object
 */
export const fileUtils = {
  convertFileToBase64,
  convertFileToDataURL,
  getFileExtension,
  getFileSize,
  isValidFileType,
  isValidFileSize,
  downloadFile
};
