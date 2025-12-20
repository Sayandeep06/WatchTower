export const ERROR_MESSAGES = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  SESSION_EXPIRED: 'Session has expired',
  ACCOUNT_LOCKED: 'Account has been locked due to multiple failed login attempts',

  // User Errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  EMAIL_ALREADY_VERIFIED: 'Email is already verified',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  INVALID_EMAIL: 'Invalid email address',
  WEAK_PASSWORD: 'Password does not meet security requirements',

  // Validation Errors
  VALIDATION_FAILED: 'Validation failed',
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',

  // Permission Errors
  FORBIDDEN: 'You do not have permission to perform this action',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',

  // Server Errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',

  // MFA Errors
  MFA_REQUIRED: 'Multi-factor authentication required',
  INVALID_MFA_CODE: 'Invalid verification code',
  MFA_NOT_ENABLED: 'MFA is not enabled for this account',
  MFA_ALREADY_ENABLED: 'MFA is already enabled for this account',

  // Session Errors
  SESSION_NOT_FOUND: 'Session not found',
  INVALID_SESSION: 'Invalid session',
  MAX_SESSIONS_REACHED: 'Maximum number of active sessions reached',
};

export const ERROR_CODES = {
  // Authentication (1000-1999)
  INVALID_CREDENTIALS: 1001,
  TOKEN_EXPIRED: 1002,
  TOKEN_INVALID: 1003,
  SESSION_EXPIRED: 1004,
  ACCOUNT_LOCKED: 1005,

  // User (2000-2999)
  USER_NOT_FOUND: 2001,
  USER_ALREADY_EXISTS: 2002,
  EMAIL_NOT_VERIFIED: 2003,

  // Validation (3000-3999)
  VALIDATION_FAILED: 3001,
  REQUIRED_FIELD: 3002,

  // Permission (4000-4999)
  FORBIDDEN: 4001,
  INSUFFICIENT_PERMISSIONS: 4002,

  // Server (5000-5999)
  INTERNAL_SERVER_ERROR: 5001,
  DATABASE_ERROR: 5002,
};
