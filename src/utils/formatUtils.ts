/**
 * General formatting utilities
 */
export const formatUtils = {
  /**
   * Format price for display (accepts both string and number)
   * @param price - Price to format (string or number)
   * @param currency - Currency code (default: IDR)
   * @returns Formatted price string
   */
  formatPrice: (price: string | number, currency: string = 'IDR'): string => {
    const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;

    if (isNaN(numPrice)) return '';

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    });

    return formatter.format(numPrice);
  },

  /**
   * Format currency for display
   * @param amount - Amount to format
   * @param currency - Currency code (default: IDR)
   * @returns Formatted currency string
   */
  formatCurrency: (amount: number, currency: string = 'IDR'): string => {
    if (typeof amount !== 'number') return '';

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    });

    return formatter.format(amount);
  },

  /**
   * Format number with thousand separators
   * @param number - Number to format
   * @returns Formatted number string
   */
  formatNumber: (number: number): string => {
    if (typeof number !== 'number') return '';
    return new Intl.NumberFormat('id-ID').format(number);
  },

  /**
   * Format percentage
   * @param value - Value to format as percentage
   * @param decimals - Number of decimal places
   * @returns Formatted percentage string
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    if (typeof value !== 'number') return '';
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Format file size
   * @param bytes - Size in bytes
   * @returns Formatted file size string
   */
  formatFileSize: (bytes: number): string => {
    if (typeof bytes !== 'number') return '';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  /**
   * Format bank account number (mask middle digits)
   * @param accountNumber - Account number to format
   * @returns Masked account number
   */
  formatBankAccount: (accountNumber: string): string => {
    if (!accountNumber) return '';

    if (accountNumber.length <= 4) return accountNumber;

    const first = accountNumber.slice(0, 2);
    const last = accountNumber.slice(-2);
    const middle = '*'.repeat(accountNumber.length - 4);

    return `${first}${middle}${last}`;
  },

  /**
   * Format ID numbers (NIK, NPWP) with masking
   * @param idNumber - ID number to format
   * @returns Masked ID number
   */
  formatIDNumber: (idNumber: string): string => {
    if (!idNumber) return '';

    if (idNumber.length <= 6) return idNumber;

    const first = idNumber.slice(0, 3);
    const last = idNumber.slice(-3);
    const middle = '*'.repeat(idNumber.length - 6);

    return `${first}${middle}${last}`;
  },

  /**
   * Format status text with proper casing
   * @param status - Status string
   * @returns Formatted status
   */
  formatStatus: (status: string): string => {
    if (!status) return '';

    const statusMap: { [key: string]: string } = {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      draft: 'Draft'
    };

    return statusMap[status.toLowerCase()] || status;
  },

  /**
   * Format role name with proper casing
   * @param role - Role string
   * @returns Formatted role name
   */
  formatRoleName: (role: string): string => {
    if (!role) return '';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
};
