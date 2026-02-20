/**
 * Error Message Mapping
 *
 * Maps backend error responses to user-friendly error messages based on:
 * - Error code documentation: https://docs.google.com/spreadsheets/d/1cvZRtGWyFSZsBvBzY1f2OBc27EiTfgAvlkRi5GusLwY
 * - Backend error response shape: { statusCode, message, body? }
 *
 * The mapping works by matching the API endpoint (url) and the raw backend
 * error message to determine the correct user-facing message.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ErrorContext {
  /** HTTP status code from the response */
  status?: number;
  /** Raw error message returned by the backend */
  backendMessage?: string;
  /** The request URL (used to determine which "function" the error belongs to) */
  url?: string;
  /** The raw response data object */
  responseData?: any;
}

interface ErrorMapping {
  /** Patterns to match against the raw backend message (case-insensitive) */
  patterns: (string | RegExp)[];
  /** The user-friendly message to display */
  userMessage: string;
}

// ---------------------------------------------------------------------------
// URL matchers (helpers to identify which "function" an API call belongs to)
// ---------------------------------------------------------------------------

const urlMatchers = {
  login: (url: string) =>
    /\/api\/auth\/login/i.test(url),

  forgotPassword: (url: string) =>
    /\/api\/auth\/password\/(request|change)/i.test(url),

  register: (url: string) =>
    /\/api\/(event-organizers|users\/check-availability)/i.test(url) ||
    /\/api\/auth\/register/i.test(url),

  otpRequest: (url: string) =>
    /\/api\/auth\/otp\/request/i.test(url),

  otpVerification: (url: string) =>
    /\/api\/auth\/otp\/verification/i.test(url),

  createOrder: (url: string) =>
    /\/api\/.*order/i.test(url),

  checkout: (url: string) =>
    /\/api\/.*checkout/i.test(url),

  payment: (url: string) =>
    /\/api\/.*payment/i.test(url),

  eventsSubmission: (url: string) =>
    /\/api\/(events|event).*submit/i.test(url),

  createTicket: (url: string) =>
    /\/api\/.*ticket/i.test(url),

  createAdditionalForm: (url: string) =>
    /\/api\/.*additional-form/i.test(url),

  uploadAsset: (url: string) =>
    /\/api\/(upload-asset|assets)/i.test(url),
};

// ---------------------------------------------------------------------------
// Error mappings per function / domain
// ---------------------------------------------------------------------------

/**
 * Mappings for bo.wukong.co.id (backoffice) — from the error code documentation table.
 *
 * Each key corresponds to a "function" from the docs.
 * Within each function, the mappings are checked in order;
 * the first matching pattern wins.
 */
const errorMappings: Record<string, ErrorMapping[]> = {
  login: [
    {
      patterns: [
        'wrong password',
        'password',
        'invalid credentials',
        'invalid email or password',
        'email & password',
        'unauthorized',
        'credential',
      ],
      userMessage: "Email & password doesn't match",
    },
    {
      patterns: [
        'wrong email',
        'email not found',
        'user not found',
        'account not found',
      ],
      userMessage: "Email & password doesn't match",
    },
    {
      patterns: [
        'too many',
        'rate limit',
        'failed 3',
        'locked',
        'temporarily blocked',
      ],
      userMessage:
        'Too many requests. Please wait for 3 minutes to try again.',
    },
  ],

  forgotPassword: [
    {
      patterns: [
        'too many',
        'rate limit',
        'request more than',
        'cooldown',
      ],
      userMessage:
        'Too many requests. Please wait before requesting another link.',
    },
    {
      patterns: [
        'email not found',
        'user not found',
        'not registered',
        'no account',
      ],
      userMessage: 'Email not found',
    },
  ],

  register: [
    {
      patterns: [
        'already registered',
        'already exists',
        'email is already',
        'duplicate email',
        'email already',
      ],
      userMessage: 'Email is already registered. Sign in?',
    },
    {
      patterns: [
        'terms',
        'term and condition',
        'terms and conditions',
        't&c',
      ],
      userMessage: 'You must agree to terms and conditions',
    },
    {
      patterns: [
        'incomplete',
        'required field',
        'missing field',
        'form incomplete',
        'validation',
      ],
      userMessage: 'Please complete the form',
    },
  ],

  otpRequest: [
    {
      patterns: [
        'invalid phone',
        'phone number format',
        'wrong phone',
        'phone number is invalid',
        'invalid format',
      ],
      userMessage: 'Please input a valid phone number',
    },
    {
      patterns: [
        'already registered',
        'phone number already',
        'phone already',
        'duplicate phone',
      ],
      userMessage: 'Phone number is already registered. Sign in?',
    },
    {
      patterns: [
        'too many',
        'rate limit',
        'request more than',
        'cooldown',
      ],
      userMessage:
        'Too many requests. Please wait before requesting another link.',
    },
  ],

  createOrder: [
    {
      patterns: ['sold out', 'ticket sold out', 'ticket type is sold'],
      userMessage: 'This ticket type is sold out',
    },
    {
      patterns: ['maximum capacity', 'exceeded', 'quantity exceeded'],
      userMessage: 'This event has reached maximum capacity',
    },
    {
      patterns: ['event sold out', 'event is sold out'],
      userMessage: 'This event is sold out',
    },
    {
      patterns: [
        'sales.*ended',
        'sales period',
        'sale ended',
        'sales date',
      ],
      userMessage: 'Sales period is ended',
    },
    {
      patterns: [
        'incomplete',
        'required field',
        'missing field',
        'form incomplete',
      ],
      userMessage: 'Please complete the form',
    },
  ],

  checkout: [
    {
      patterns: ['event sold out', 'event is sold out', 'sold out'],
      userMessage: 'This event is sold out',
    },
    {
      patterns: [
        'sales.*ended',
        'sales period',
        'sale ended',
        'sales date',
      ],
      userMessage: 'Sales period is ended',
    },
    {
      patterns: ['ticket sold out', 'ticket type is sold'],
      userMessage: 'This ticket type is sold out',
    },
  ],

  payment: [
    {
      patterns: ['unpaid', 'pending payment', 'complete.*transaction'],
      userMessage: 'Please complete the transaction',
    },
  ],

  eventsSubmission: [
    {
      patterns: [
        'incomplete',
        'required field',
        'missing field',
        'form incomplete',
        'validation',
      ],
      userMessage: 'Please complete the form',
    },
  ],

  createTicket: [
    {
      patterns: [
        'incomplete',
        'required field',
        'missing field',
        'form incomplete',
        'validation',
      ],
      userMessage: 'Please complete the form',
    },
  ],

  createAdditionalForm: [
    {
      patterns: [
        'incomplete',
        'required field',
        'missing field',
        'form incomplete',
        'validation',
      ],
      userMessage: 'Please complete the form',
    },
  ],

  uploadAsset: [
    {
      patterns: [
        'unsupported',
        'invalid format',
        'format not allowed',
        'file type',
        'invalid file',
      ],
      userMessage:
        'Invalid format. Please ensure your file is in a supported format',
    },
  ],
};

// ---------------------------------------------------------------------------
// HTTP-status-based global fallbacks (applied regardless of URL)
// ---------------------------------------------------------------------------

const statusCodeFallbacks: Record<number, string> = {
  401: 'Session expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timeout. Please try again.',
  413: 'File size too large. Please ensure your files are less than 2MB and try again.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'An unexpected error occurred. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Service unavailable. Please try again later.',
  504: 'Request timeout. Please try again.',
};

// ---------------------------------------------------------------------------
// Core mapping function
// ---------------------------------------------------------------------------

/**
 * Determine which "function" category a URL belongs to.
 * Returns the matching key from `errorMappings`, or `null` if no match.
 */
function detectFunction(url: string): string | null {
  for (const [key, matcher] of Object.entries(urlMatchers)) {
    if (matcher(url)) return key;
  }
  return null;
}

/**
 * Check if a backend message matches any of the given patterns.
 */
function matchesPatterns(
  message: string,
  patterns: (string | RegExp)[]
): boolean {
  const lowerMessage = message.toLowerCase();
  return patterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(lowerMessage);
    }
    return lowerMessage.includes(pattern.toLowerCase());
  });
}

/**
 * Map a backend error response to a user-friendly error message.
 *
 * @param context - Information about the error (status, message, url, etc.)
 * @returns The mapped user-friendly message, or `null` if no mapping was found
 *          (in which case the caller should fall back to its own default).
 */
export function mapErrorMessage(context: ErrorContext): string | null {
  const { status, backendMessage, url, responseData } = context;

  // 1. Extract a raw message from the response data if not provided directly
  const rawMessage =
    backendMessage ||
    responseData?.message ||
    responseData?.error ||
    (Array.isArray(responseData?.details)
      ? responseData.details.join(', ')
      : null) ||
    '';

  // 2. If we have a URL, try function-specific mappings first
  if (url && rawMessage) {
    const fnKey = detectFunction(url);
    if (fnKey && errorMappings[fnKey]) {
      for (const mapping of errorMappings[fnKey]) {
        if (matchesPatterns(rawMessage, mapping.patterns)) {
          return mapping.userMessage;
        }
      }
    }
  }

  // 3. Try global pattern matching (raw message contains the dynamic cooldown)
  if (rawMessage) {
    const lowerMsg = rawMessage.toLowerCase();

    // Dynamic cooldown message — extract time from backend
    const cooldownMatch = lowerMsg.match(
      /(?:wait|cooldown).*?(\d+)\s*(second|minute|hour|min|sec|hr)/i
    );
    if (cooldownMatch) {
      const value = cooldownMatch[1];
      const unit = cooldownMatch[2].toLowerCase();
      const unitLabel =
        unit.startsWith('min') ? 'minutes' :
        unit.startsWith('sec') ? 'seconds' :
        unit.startsWith('hr') || unit.startsWith('hour') ? 'hours' :
        unit;
      return `Too many requests. Please wait for ${value} ${unitLabel} to try again.`;
    }
  }

  // 4. Fall back to status-code-based message
  if (status && statusCodeFallbacks[status]) {
    return statusCodeFallbacks[status];
  }

  // 5. No mapping found — let the caller handle the default
  return null;
}

export { errorMappings, statusCodeFallbacks, urlMatchers };
export type { ErrorContext, ErrorMapping };
