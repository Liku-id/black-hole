/**
 * Validates a redirect URL to prevent Open Redirect and XSS vulnerabilities.
 * @param url The URL to validate.
 * @param allowedDomains List of allowed domains (e.g., ['example.com', 'sub.example.com']).
 * @returns The validated URL if safe, or the default path ('/') if unsafe.
 */
export const validateRedirectUrl = (
  url: string | undefined | null,
  allowedDomains: string[] = []
): string => {
  if (!url || typeof url !== 'string') {
    return '/';
  }

  // Deny dangerous protocols
  // This regex checks for strings that look like "protocol:" at the start
  // It specifically targets known dangerous schemas
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(url)) {
    return '/';
  }

  // Allow relative URLs starting with /
  // But ensure it's not a protocol-relative URL (starting with //) unless it's strictly allowed below
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  try {
    const urlObj = new URL(url);

    // Check if protocol is http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '/';
    }

    // Check if hostname is in allowed domains
    // valid if exact match or subdomain if specifically allowed by logic (here we sticking to exact match or listed domains)
    // For this specific request, we will check if the hostname is included in allowedDomains
    const isAllowedDomain = allowedDomains.some(domain => {
      // Handle cases where domain in list might include protocol
      const allowedDomain = domain.replace(/^https?:\/\//, '');
      return urlObj.hostname === allowedDomain;
    });

    if (isAllowedDomain) {
      return url;
    }
  } catch (error) {
    // If URL parsing fails, it might be a relative URL that didn't start with /
    // For strict security, we default to root
    return '/';
  }

  return '/';
};
